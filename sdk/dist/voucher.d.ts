import { PublicKey } from '@solana/web3.js';
import { VoucherData } from './types';
/**
 * Off-chain voucher for payment channel state updates
 * This allows parties to conduct transactions off-chain and settle later
 */
export declare class OffChainVoucher {
    channelId: PublicKey;
    balanceA: number;
    balanceB: number;
    nonce: number;
    signatureA?: Uint8Array;
    signatureB?: Uint8Array;
    constructor(data: VoucherData);
    /**
     * Create a new voucher for a state update
     */
    static create(channelId: PublicKey, balanceA: number, balanceB: number, nonce: number): OffChainVoucher;
    /**
     * Sign the voucher with a private key
     */
    sign(privateKey: Uint8Array): Uint8Array;
    /**
     * Verify a signature against a public key
     */
    verifySignature(signature: Uint8Array, publicKey: Uint8Array): boolean;
    /**
     * Add a signature to the voucher
     */
    addSignature(signature: Uint8Array, isPartyA: boolean): void;
    /**
     * Check if both parties have signed the voucher
     */
    isFullySigned(): boolean;
    /**
     * Validate the voucher data
     */
    validate(): boolean;
    /**
     * Get the total balance in the channel
     */
    getTotalBalance(): number;
    /**
     * Serialize the voucher data for signing
     */
    private serialize;
    /**
     * Convert voucher to JSON for storage/transmission
     */
    toJSON(): VoucherData;
    /**
     * Create voucher from JSON data
     */
    static fromJSON(data: VoucherData): OffChainVoucher;
}
//# sourceMappingURL=voucher.d.ts.map