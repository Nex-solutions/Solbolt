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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OffChainVoucher = void 0;
const nacl = __importStar(require("tweetnacl"));
/**
 * Off-chain voucher for payment channel state updates
 * This allows parties to conduct transactions off-chain and settle later
 */
class OffChainVoucher {
    constructor(data) {
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
    static create(channelId, balanceA, balanceB, nonce) {
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
    sign(privateKey) {
        const message = this.serialize();
        return nacl.sign.detached(message, privateKey);
    }
    /**
     * Verify a signature against a public key
     */
    verifySignature(signature, publicKey) {
        const message = this.serialize();
        return nacl.sign.detached.verify(message, signature, publicKey);
    }
    /**
     * Add a signature to the voucher
     */
    addSignature(signature, isPartyA) {
        if (isPartyA) {
            this.signatureA = signature;
        }
        else {
            this.signatureB = signature;
        }
    }
    /**
     * Check if both parties have signed the voucher
     */
    isFullySigned() {
        return !!(this.signatureA && this.signatureB);
    }
    /**
     * Validate the voucher data
     */
    validate() {
        return (this.balanceA >= 0 &&
            this.balanceB >= 0 &&
            this.nonce > 0 &&
            this.channelId !== undefined);
    }
    /**
     * Get the total balance in the channel
     */
    getTotalBalance() {
        return this.balanceA + this.balanceB;
    }
    /**
     * Serialize the voucher data for signing
     */
    serialize() {
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
    toJSON() {
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
    static fromJSON(data) {
        return new OffChainVoucher(data);
    }
}
exports.OffChainVoucher = OffChainVoucher;
//# sourceMappingURL=voucher.js.map