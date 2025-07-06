import { PublicKey } from '@solana/web3.js';
import * as nacl from 'tweetnacl';
import { VoucherData, SignOptions } from './types';

/**
 * Off-chain voucher for payment channel state updates
 * This allows parties to conduct transactions off-chain and settle later
 */
export class OffChainVoucher {
  public channelId: PublicKey;
  public balanceA: number;
  public balanceB: number;
  public nonce: number;
  public signatureA?: Uint8Array;
  public signatureB?: Uint8Array;

  constructor(data: VoucherData) {
    this.channelId = data.channelId;
    this.balanceA = data.balanceA;
    this.balanceB = data.balanceB;
    this.nonce = data.nonce;
    this.signatureA = data.signatureA;
    this.signatureB = data.signatureB;
  }

  /**
   * Create a new voucher for a state update
   */
  static create(
    channelId: PublicKey,
    balanceA: number,
    balanceB: number,
    nonce: number
  ): OffChainVoucher {
    return new OffChainVoucher({
      channelId,
      balanceA,
      balanceB,
      nonce,
    });
  }

  /**
   * Sign the voucher with a private key
   */
  sign(privateKey: Uint8Array): Uint8Array {
    const message = this.serialize();
    return nacl.sign.detached(message, privateKey);
  }

  /**
   * Verify a signature against a public key
   */
  verifySignature(
    signature: Uint8Array,
    publicKey: Uint8Array
  ): boolean {
    const message = this.serialize();
    return nacl.sign.detached.verify(message, signature, publicKey);
  }

  /**
   * Add a signature to the voucher
   */
  addSignature(signature: Uint8Array, isPartyA: boolean): void {
    if (isPartyA) {
      this.signatureA = signature;
    } else {
      this.signatureB = signature;
    }
  }

  /**
   * Check if both parties have signed the voucher
   */
  isFullySigned(): boolean {
    return !!(this.signatureA && this.signatureB);
  }

  /**
   * Validate the voucher data
   */
  validate(): boolean {
    return (
      this.balanceA >= 0 &&
      this.balanceB >= 0 &&
      this.nonce > 0 &&
      this.channelId !== undefined
    );
  }

  /**
   * Get the total balance in the channel
   */
  getTotalBalance(): number {
    return this.balanceA + this.balanceB;
  }

  /**
   * Serialize the voucher data for signing
   */
  private serialize(): Uint8Array {
    const buffer = Buffer.alloc(32 + 8 + 8 + 8); // channelId + balanceA + balanceB + nonce
    this.channelId.toBuffer().copy(buffer, 0);
    buffer.writeBigUInt64LE(BigInt(this.balanceA), 32);
    buffer.writeBigUInt64LE(BigInt(this.balanceB), 40);
    buffer.writeBigUInt64LE(BigInt(this.nonce), 48);
    return new Uint8Array(buffer);
  }

  /**
   * Convert voucher to JSON for storage/transmission
   */
  toJSON(): VoucherData {
    return {
      channelId: this.channelId,
      balanceA: this.balanceA,
      balanceB: this.balanceB,
      nonce: this.nonce,
      signatureA: this.signatureA,
      signatureB: this.signatureB,
    };
  }

  /**
   * Create voucher from JSON data
   */
  static fromJSON(data: VoucherData): OffChainVoucher {
    return new OffChainVoucher(data);
  }
} 