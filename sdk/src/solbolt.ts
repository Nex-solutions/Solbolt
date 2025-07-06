import { Connection, PublicKey, Transaction, Keypair, sendAndConfirmTransaction } from '@solana/web3.js';
import { Program, AnchorProvider, web3, Idl } from '@coral-xyz/anchor';
import BN from 'bn.js';
import { 
  ChannelState, 
  ChannelConfig, 
  ChannelResult, 
  SolBoltConfig,
  VoucherData 
} from './types';
import { OffChainVoucher } from './voucher';
import { 
  findChannelPDA, 
  toBN, 
  fromBN, 
  calculateTimeout,
  hasTimedOut 
} from './utils';

// Default IDL for SolBolt program
const DEFAULT_IDL: Idl = {
  "version": "0.1.0",
  "name": "solbolt",
  "instructions": [
    {
      "name": "openChannel",
      "accounts": [
        { "name": "channel", "isMut": true, "isSigner": false },
        { "name": "partyA", "isMut": true, "isSigner": true },
        { "name": "partyB", "isMut": false, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [{ "name": "initialDeposit", "type": "u64" }]
    },
    {
      "name": "updateChannel",
      "accounts": [
        { "name": "channel", "isMut": true, "isSigner": false },
        { "name": "authority", "isMut": false, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "balanceA", "type": "u64" },
        { "name": "balanceB", "type": "u64" },
        { "name": "nonce", "type": "u64" },
        { "name": "signatureA", "type": { "vec": "u8" } },
        { "name": "signatureB", "type": { "vec": "u8" } }
      ]
    },
    {
      "name": "closeChannel",
      "accounts": [
        { "name": "channel", "isMut": true, "isSigner": false },
        { "name": "partyA", "isMut": true, "isSigner": true },
        { "name": "partyB", "isMut": true, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "balanceA", "type": "u64" },
        { "name": "balanceB", "type": "u64" },
        { "name": "nonce", "type": "u64" },
        { "name": "signatureA", "type": { "vec": "u8" } },
        { "name": "signatureB", "type": { "vec": "u8" } }
      ]
    },
    {
      "name": "forceCloseChannel",
      "accounts": [
        { "name": "channel", "isMut": true, "isSigner": false },
        { "name": "authority", "isMut": true, "isSigner": true },
        { "name": "systemProgram", "isMut": false, "isSigner": false }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "PaymentChannel",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "partyA", "type": "publicKey" },
          { "name": "partyB", "type": "publicKey" },
          { "name": "balanceA", "type": "u64" },
          { "name": "balanceB", "type": "u64" },
          { "name": "nonce", "type": "u64" },
          { "name": "isOpen", "type": "bool" },
          { "name": "openedAt", "type": "i64" },
          { "name": "timeoutAt", "type": "i64" },
          { "name": "bump", "type": "u8" }
        ]
      }
    }
  ],
  "errors": [
    { "code": 6000, "name": "InvalidDepositAmount", "msg": "Initial deposit must be greater than 0" },
    { "code": 6001, "name": "InvalidPartyOrder", "msg": "Party A must be lexicographically smaller than Party B" },
    { "code": 6002, "name": "ChannelNotOpen", "msg": "Channel is not open" },
    { "code": 6003, "name": "InvalidNonce", "msg": "Nonce must be greater than current nonce" },
    { "code": 6004, "name": "InvalidBalance", "msg": "Invalid balance amounts" },
    { "code": 6005, "name": "InvalidSignature", "msg": "Invalid signature" },
    { "code": 6006, "name": "ChannelNotTimedOut", "msg": "Channel has not timed out yet" },
    { "code": 6007, "name": "NotParticipant", "msg": "Not a participant in this channel" }
  ]
};

// Wallet adapter for Keypair
class KeypairWalletAdapter {
  constructor(private keypair: Keypair) {}

  get publicKey(): PublicKey {
    return this.keypair.publicKey;
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    transaction.sign(this.keypair);
    return transaction;
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    return transactions.map(tx => {
      tx.sign(this.keypair);
      return tx;
    });
  }
}

/**
 * Main SolBolt SDK class for payment channel operations
 */
export class SolBolt {
  private connection: Connection;
  private wallet: any;
  private program: Program;
  private programId: PublicKey;

  constructor(config: SolBoltConfig) {
    this.connection = config.connection;
    
    // Convert Keypair to wallet adapter if needed
    if (config.wallet instanceof Keypair) {
      this.wallet = new KeypairWalletAdapter(config.wallet);
    } else {
      this.wallet = config.wallet;
    }
    
    this.programId = config.programId || new PublicKey('F61wLbAw1hUvsEjArLDEmvzBPpMxL9oJKAxDtGsAi3VV');
    
    // Initialize Anchor provider
    const provider = new AnchorProvider(
      this.connection,
      this.wallet,
      { commitment: 'confirmed' }
    );
    
    // Initialize program with default IDL
    this.program = new Program(DEFAULT_IDL, this.programId, provider);
  }

  /**
   * Open a new payment channel with another party
   */
  async openChannel(
    partyB: PublicKey,
    config: ChannelConfig
  ): Promise<ChannelResult> {
    try {
      const [channelPda] = findChannelPDA(
        this.wallet.publicKey,
        partyB,
        this.programId
      );

      const tx = await this.program.methods
        .openChannel(toBN(config.initialDeposit))
        .accounts({
          channel: channelPda,
          partyA: this.wallet.publicKey,
          partyB: partyB,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      return {
        signature: tx,
        channelState: await this.getChannelState(channelPda),
      };
    } catch (error) {
      return {
        signature: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update channel state with a signed voucher
   */
  async updateChannel(voucher: OffChainVoucher): Promise<ChannelResult> {
    try {
      if (!voucher.isFullySigned()) {
        throw new Error('Voucher must be signed by both parties');
      }

      const [channelPda] = findChannelPDA(
        voucher.channelId,
        voucher.channelId, // This would be the actual channel PDA
        this.programId
      );

      const tx = await this.program.methods
        .updateChannel(
          toBN(voucher.balanceA),
          toBN(voucher.balanceB),
          toBN(voucher.nonce),
          voucher.signatureA!,
          voucher.signatureB!
        )
        .accounts({
          channel: channelPda,
          authority: this.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      return {
        signature: tx,
        channelState: await this.getChannelState(channelPda),
      };
    } catch (error) {
      return {
        signature: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Close a payment channel cooperatively
   */
  async closeChannel(voucher: OffChainVoucher): Promise<ChannelResult> {
    try {
      if (!voucher.isFullySigned()) {
        throw new Error('Voucher must be signed by both parties');
      }

      const [channelPda] = findChannelPDA(
        voucher.channelId,
        voucher.channelId, // This would be the actual channel PDA
        this.programId
      );

      const tx = await this.program.methods
        .closeChannel(
          toBN(voucher.balanceA),
          toBN(voucher.balanceB),
          toBN(voucher.nonce),
          voucher.signatureA!,
          voucher.signatureB!
        )
        .accounts({
          channel: channelPda,
          partyA: this.wallet.publicKey,
          partyB: voucher.channelId, // This would be the actual party B
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      return {
        signature: tx,
        channelState: await this.getChannelState(channelPda),
      };
    } catch (error) {
      return {
        signature: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Force close a channel after timeout
   */
  async forceCloseChannel(channelId: PublicKey): Promise<ChannelResult> {
    try {
      const tx = await this.program.methods
        .forceCloseChannel()
        .accounts({
          channel: channelId,
          authority: this.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      return {
        signature: tx,
        channelState: await this.getChannelState(channelId),
      };
    } catch (error) {
      return {
        signature: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get the current state of a channel
   */
  async getChannelState(channelId: PublicKey): Promise<ChannelState | null> {
    try {
      const account = await this.program.account.paymentChannel.fetch(channelId);
      
      return {
        channelId,
        partyA: account.partyA as PublicKey,
        partyB: account.partyB as PublicKey,
        balanceA: fromBN(account.balanceA as BN),
        balanceB: fromBN(account.balanceB as BN),
        nonce: fromBN(account.nonce as BN),
        isOpen: account.isOpen as boolean,
        openedAt: (account.openedAt as BN).toNumber(),
        timeoutAt: (account.timeoutAt as BN).toNumber(),
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Create a new voucher for off-chain state update
   */
  createVoucher(
    channelId: PublicKey,
    balanceA: number,
    balanceB: number,
    nonce: number
  ): OffChainVoucher {
    return OffChainVoucher.create(channelId, balanceA, balanceB, nonce);
  }

  /**
   * Check if a channel has timed out
   */
  async isChannelTimedOut(channelId: PublicKey): Promise<boolean> {
    const state = await this.getChannelState(channelId);
    if (!state) return false;
    
    return hasTimedOut(state.timeoutAt);
  }

  /**
   * Get all channels for the current wallet
   */
  async getMyChannels(): Promise<ChannelState[]> {
    // This would query all channels where the wallet is a participant
    // Implementation depends on indexing strategy
    return [];
  }
} 