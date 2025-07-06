import { PublicKey } from '@solana/web3.js';
import * as nacl from 'tweetnacl';
import BN from 'bn.js';

/**
 * Verify a signature against a public key and message
 */
export function verifySignature(
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): boolean {
  try {
    return nacl.sign.detached.verify(message, signature, publicKey);
  } catch (error) {
    return false;
  }
}

/**
 * Create a signature for a message using a private key
 */
export function createSignature(
  message: Uint8Array,
  privateKey: Uint8Array
): Uint8Array {
  return nacl.sign.detached(message, privateKey);
}

/**
 * Convert a number to BN (Big Number) for Solana transactions
 */
export function toBN(value: number): BN {
  return new BN(value);
}

/**
 * Convert BN back to number
 */
export function fromBN(bn: BN): number {
  return bn.toNumber();
}

/**
 * Find the PDA (Program Derived Address) for a channel
 */
export function findChannelPDA(
  partyA: PublicKey,
  partyB: PublicKey,
  programId: PublicKey
): [PublicKey, number] {
  // Ensure party order (lexicographic)
  const [first, second] = partyA.toBuffer().compare(partyB.toBuffer()) < 0 
    ? [partyA, partyB] 
    : [partyB, partyA];

  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('channel'),
      first.toBuffer(),
      second.toBuffer(),
    ],
    programId
  );
}

/**
 * Validate a public key string
 */
export function isValidPublicKey(key: string): boolean {
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / 1e9;
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * 1e9);
}

/**
 * Generate a random nonce
 */
export function generateNonce(): number {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

/**
 * Calculate timeout timestamp
 */
export function calculateTimeout(seconds: number = 24 * 60 * 60): number {
  return Math.floor(Date.now() / 1000) + seconds;
}

/**
 * Check if a timestamp has passed
 */
export function hasTimedOut(timestamp: number): boolean {
  return Math.floor(Date.now() / 1000) >= timestamp;
}

/**
 * Format balance for display
 */
export function formatBalance(lamports: number, decimals: number = 9): string {
  const sol = lamports / Math.pow(10, decimals);
  return sol.toFixed(decimals);
} 