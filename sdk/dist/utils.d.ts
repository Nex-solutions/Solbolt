import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
/**
 * Verify a signature against a public key and message
 */
export declare function verifySignature(message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): boolean;
/**
 * Create a signature for a message using a private key
 */
export declare function createSignature(message: Uint8Array, privateKey: Uint8Array): Uint8Array;
/**
 * Convert a number to BN (Big Number) for Solana transactions
 */
export declare function toBN(value: number): BN;
/**
 * Convert BN back to number
 */
export declare function fromBN(bn: BN): number;
/**
 * Find the PDA (Program Derived Address) for a channel
 */
export declare function findChannelPDA(partyA: PublicKey, partyB: PublicKey, programId: PublicKey): [PublicKey, number];
/**
 * Validate a public key string
 */
export declare function isValidPublicKey(key: string): boolean;
/**
 * Convert lamports to SOL
 */
export declare function lamportsToSol(lamports: number): number;
/**
 * Convert SOL to lamports
 */
export declare function solToLamports(sol: number): number;
/**
 * Generate a random nonce
 */
export declare function generateNonce(): number;
/**
 * Calculate timeout timestamp
 */
export declare function calculateTimeout(seconds?: number): number;
/**
 * Check if a timestamp has passed
 */
export declare function hasTimedOut(timestamp: number): boolean;
/**
 * Format balance for display
 */
export declare function formatBalance(lamports: number, decimals?: number): string;
//# sourceMappingURL=utils.d.ts.map