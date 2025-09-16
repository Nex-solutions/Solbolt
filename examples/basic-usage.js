"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var web3_js_1 = require("@solana/web3.js");
var sdk_1 = require("@solbolt/sdk");
var sdk_2 = require("@solbolt/sdk");
var fs = require("fs");
/**
 * Basic SolBolt Usage Example
 *
 * This example demonstrates the core workflow:
 * 1. Open a payment channel
 * 2. Conduct off-chain transactions
 * 3. Close the channel
 */
function basicUsage() {
    return __awaiter(this, void 0, void 0, function () {
        var connection, alice, bob, solbolt, initialDeposit, openResult, channelId, currentNonce, aliceBalance, bobBalance, i, paymentAmount, voucher, aliceSignature, bobSignature, finalVoucher, finalAliceSignature, finalBobSignature, closeResult, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🚀 SolBolt Basic Usage Example\n');
                    connection = new web3_js_1.Connection('https://api.devnet.solana.com');
                    try {
                        alice = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync('alice-keypair.json', 'utf-8'))));
                    }
                    catch (_b) {
                        alice = web3_js_1.Keypair.generate();
                    }
                    try {
                        bob = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync('bob-keypair.json', 'utf-8'))));
                    }
                    catch (_c) {
                        bob = web3_js_1.Keypair.generate();
                    }
                    console.log('Generated keypairs:');
                    console.log('Alice:', alice.publicKey.toString());
                    console.log('Bob:', bob.publicKey.toString());
                    solbolt = new sdk_1.SolBolt({
                        connection: connection,
                        wallet: alice, // Alice will be the channel opener
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    // Step 1: Open a payment channel
                    console.log('\n📺 Step 1: Opening payment channel...');
                    initialDeposit = (0, sdk_2.solToLamports)(1);
                    return [4 /*yield*/, solbolt.openChannel(bob.publicKey, {
                            initialDeposit: initialDeposit,
                        })];
                case 2:
                    openResult = _a.sent();
                    if (openResult.error) {
                        throw new Error("Failed to open channel: ".concat(openResult.error));
                    }
                    console.log('✅ Channel opened successfully!');
                    console.log('Transaction:', openResult.signature);
                    if (!openResult.channelState) {
                        throw new Error('No channel state returned');
                    }
                    channelId = openResult.channelState.channelId;
                    console.log('Channel ID:', channelId.toString());
                    // Step 2: Conduct off-chain transactions
                    console.log('\n💸 Step 2: Conducting off-chain transactions...');
                    currentNonce = 1;
                    aliceBalance = initialDeposit;
                    bobBalance = 0;
                    // Simulate 3 micropayments
                    for (i = 0; i < 3; i++) {
                        paymentAmount = (0, sdk_2.solToLamports)(0.1);
                        aliceBalance -= paymentAmount;
                        bobBalance += paymentAmount;
                        currentNonce++;
                        voucher = solbolt.createVoucher(channelId, aliceBalance, bobBalance, currentNonce);
                        aliceSignature = voucher.sign(alice.secretKey);
                        bobSignature = voucher.sign(bob.secretKey);
                        voucher.addSignature(aliceSignature, true);
                        voucher.addSignature(bobSignature, false);
                        console.log("Transaction ".concat(i + 1, ": Alice \u2192 Bob (0.1 SOL)"));
                        console.log("  Alice: ".concat((0, sdk_2.lamportsToSol)(aliceBalance), " SOL"));
                        console.log("  Bob: ".concat((0, sdk_2.lamportsToSol)(bobBalance), " SOL"));
                        console.log("  Nonce: ".concat(currentNonce));
                        // In a real application, you might update the channel state here
                        // await solbolt.updateChannel(voucher);
                    }
                    // Step 3: Close the channel
                    console.log('\n🔒 Step 3: Closing payment channel...');
                    finalVoucher = solbolt.createVoucher(channelId, aliceBalance, bobBalance, currentNonce);
                    finalAliceSignature = finalVoucher.sign(alice.secretKey);
                    finalBobSignature = finalVoucher.sign(bob.secretKey);
                    finalVoucher.addSignature(finalAliceSignature, true);
                    finalVoucher.addSignature(finalBobSignature, false);
                    return [4 /*yield*/, solbolt.closeChannel(finalVoucher)];
                case 3:
                    closeResult = _a.sent();
                    if (closeResult.error) {
                        throw new Error("Failed to close channel: ".concat(closeResult.error));
                    }
                    console.log('✅ Channel closed successfully!');
                    console.log('Transaction:', closeResult.signature);
                    // Summary
                    console.log('\n📊 Summary:');
                    console.log("Total transactions: 3");
                    console.log("Total amount transferred: 0.3 SOL");
                    console.log("On-chain transactions: 2 (open + close)");
                    console.log("Off-chain transactions: 3");
                    console.log("Final balance - Alice: ".concat((0, sdk_2.lamportsToSol)(aliceBalance), " SOL"));
                    console.log("Final balance - Bob: ".concat((0, sdk_2.lamportsToSol)(bobBalance), " SOL"));
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('❌ Error:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Run the example
basicUsage().catch(console.error);
