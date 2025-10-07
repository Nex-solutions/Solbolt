// import { Keypair, PublicKey } from "@solana/web3.js";

// // Alice's secret key (the array you provided)
// const aliceSecret = Uint8Array.from([
//   213,210,160,21,180,243,205,189,77,48,182,172,57,77,118,232,
//   37,26,32,231,76,58,155,175,172,211,49,63,138,49,90,242,220,
//   45,79,153,228,52,210,23,162,242,220,210,21,138,248,33,176,171,
//   26,0,5,83,154,51,242,111,46,27,27,169,229,37
// ]);

// // Recreate Alice's Keypair
// const aliceKeypair = Keypair.fromSecretKey(aliceSecret);

// console.log("Alice Public Key:", aliceKeypair.publicKey.toBase58());

// // Generate Bob's new Keypair
// const bobKeypair = Keypair.generate();
// console.log("Bob Public Key:", bobKeypair.publicKey.toBase58());
// console.log("Bob Secret Key:", Array.from(bobKeypair.secretKey));

import { Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';

// Suppose seed is your 32-byte Uint8Array
const seed = Uint8Array.from([
  156, 78, 53, 136, 75, 143, 122, 116, 15, 253, 255, 203, 237, 105, 135, 126,
  233, 118, 74, 90, 155, 17, 241, 86, 76, 147, 171, 11, 42, 42, 82, 7
]);

const keypair = Keypair.fromSeed(seed);
console.log('Public key:', keypair.publicKey.toBase58());
console.log('Secret key (64 bytes):', keypair.secretKey);
