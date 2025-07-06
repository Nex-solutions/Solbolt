import { PublicKey } from '@solana/web3.js';
/**
 * Configuration for opening a payment channel
 */
export interface ChannelConfig {
    /** Initial deposit amount in lamports */
    initialDeposit: number;
    /** Timeout period in seconds (default: 24 hours) */
    timeoutSeconds?: number;
    /** Whether to enable force close after timeout */
    enableForceClose?: boolean;
}
/**
 * Current state of a payment channel
 */
export interface ChannelState {
    /** Channel account public key */
    channelId: PublicKey;
    /** Party A's public key */
    partyA: PublicKey;
    /** Party B's public key */
    partyB: PublicKey;
    /** Party A's current balance */
    balanceA: number;
    /** Party B's current balance */
    balanceB: number;
    /** Current nonce */
    nonce: number;
    /** Whether the channel is open */
    isOpen: boolean;
    /** Timestamp when channel was opened */
    openedAt: number;
    /** Timestamp when channel can be force-closed */
    timeoutAt: number;
}
/**
 * Off-chain voucher for state updates
 */
export interface VoucherData {
    /** Channel account public key */
    channelId: PublicKey;
    /** Party A's balance */
    balanceA: number;
    /** Party B's balance */
    balanceB: number;
    /** Nonce for this state update */
    nonce: number;
    /** Party A's signature */
    signatureA?: Uint8Array;
    /** Party B's signature */
    signatureB?: Uint8Array;
}
/**
 * Options for signing a voucher
 */
export interface SignOptions {
    /** Private key for signing */
    privateKey: Uint8Array;
    /** Whether to include signature in voucher */
    includeSignature?: boolean;
}
/**
 * Result of a channel operation
 */
export interface ChannelResult {
    /** Transaction signature */
    signature: string;
    /** Channel state after operation */
    channelState?: ChannelState | null;
    /** Error message if operation failed */
    error?: string;
}
/**
 * Configuration for the SolBolt SDK
 */
export interface SolBoltConfig {
    /** Solana connection */
    connection: any;
    /** Wallet for signing transactions */
    wallet: any;
    /** Program ID for the SolBolt contract */
    programId?: PublicKey;
    /** RPC endpoint */
    rpcEndpoint?: string;
}
//# sourceMappingURL=types.d.ts.map