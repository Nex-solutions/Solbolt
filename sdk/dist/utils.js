"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySignature = verifySignature;
exports.createSignature = createSignature;
exports.toBN = toBN;
exports.fromBN = fromBN;
exports.findChannelPDA = findChannelPDA;
exports.isValidPublicKey = isValidPublicKey;
exports.lamportsToSol = lamportsToSol;
exports.solToLamports = solToLamports;
exports.generateNonce = generateNonce;
exports.calculateTimeout = calculateTimeout;
exports.hasTimedOut = hasTimedOut;
exports.formatBalance = formatBalance;
const web3_js_1 = require("@solana/web3.js");
const nacl = __importStar(require("tweetnacl"));
const bn_js_1 = __importDefault(require("bn.js"));
/**
 * Verify a signature against a public key and message
 */
function verifySignature(message, signature, publicKey) {
    try {
        return nacl.sign.detached.verify(message, signature, publicKey);
    }
    catch (error) {
        return false;
    }
}
/**
 * Create a signature for a message using a private key
 */
function createSignature(message, privateKey) {
    return nacl.sign.detached(message, privateKey);
}
/**
 * Convert a number to BN (Big Number) for Solana transactions
 */
function toBN(value) {
    return new bn_js_1.default(value);
}
/**
 * Convert BN back to number
 */
function fromBN(bn) {
    return bn.toNumber();
}
/**
 * Find the PDA (Program Derived Address) for a channel
 */
function findChannelPDA(partyA, partyB, programId) {
    // Ensure party order (lexicographic)
    const [first, second] = partyA.toBuffer().compare(partyB.toBuffer()) < 0
        ? [partyA, partyB]
        : [partyB, partyA];
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from('channel'),
        first.toBuffer(),
        second.toBuffer(),
    ], programId);
}
/**
 * Validate a public key string
 */
function isValidPublicKey(key) {
    try {
        new web3_js_1.PublicKey(key);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Convert lamports to SOL
 */
function lamportsToSol(lamports) {
    return lamports / 1e9;
}
/**
 * Convert SOL to lamports
 */
function solToLamports(sol) {
    return Math.floor(sol * 1e9);
}
/**
 * Generate a random nonce
 */
function generateNonce() {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}
/**
 * Calculate timeout timestamp
 */
function calculateTimeout(seconds = 24 * 60 * 60) {
    return Math.floor(Date.now() / 1000) + seconds;
}
/**
 * Check if a timestamp has passed
 */
function hasTimedOut(timestamp) {
    return Math.floor(Date.now() / 1000) >= timestamp;
}
/**
 * Format balance for display
 */
function formatBalance(lamports, decimals = 9) {
    const sol = lamports / Math.pow(10, decimals);
    return sol.toFixed(decimals);
}
//# sourceMappingURL=utils.js.map