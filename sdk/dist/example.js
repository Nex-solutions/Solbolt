"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const solbolt_1 = require("./solbolt");
const utils_1 = require("./utils");
/**
 * Example usage of the SolBolt SDK
 */
async function example() {
    // Initialize connection (replace with your RPC endpoint)
    const connection = new web3_js_1.Connection('https://api.devnet.solana.com');
    // Create keypairs for demo (in production, use real wallets)
    const alice = web3_js_1.Keypair.generate();
    const bob = web3_js_1.Keypair.generate();
    console.log('🔑 Generated keypairs:');
    console.log('Alice:', alice.publicKey.toString());
    console.log('Bob:', bob.publicKey.toString());
    // Initialize SolBolt SDK
    const solbolt = new solbolt_1.SolBolt({
        connection,
        wallet: alice, // Alice will be the channel opener
    });
    // Open a payment channel
    console.log('\n📺 Opening payment channel...');
    const initialDeposit = (0, utils_1.solToLamports)(1); // 1 SOL
    const result = await solbolt.openChannel(bob.publicKey, {
        initialDeposit,
    });
    if (result.error) {
        console.error('❌ Failed to open channel:', result.error);
        return;
    }
    console.log('✅ Channel opened!');
    console.log('Transaction:', result.signature);
    if (result.channelState) {
        console.log('Channel state:', {
            channelId: result.channelState.channelId.toString(),
            balanceA: (0, utils_1.lamportsToSol)(result.channelState.balanceA),
            balanceB: (0, utils_1.lamportsToSol)(result.channelState.balanceB),
            nonce: result.channelState.nonce,
        });
    }
    // Create off-chain vouchers for micropayments
    console.log('\n💸 Conducting off-chain transactions...');
    let currentNonce = 1;
    let aliceBalance = initialDeposit;
    let bobBalance = 0;
    // Simulate 5 micropayments of 0.1 SOL each
    for (let i = 0; i < 5; i++) {
        const paymentAmount = (0, utils_1.solToLamports)(0.1);
        aliceBalance -= paymentAmount;
        bobBalance += paymentAmount;
        currentNonce++;
        // Create voucher for this state update
        const voucher = solbolt.createVoucher(result.channelState.channelId, aliceBalance, bobBalance, currentNonce);
        // Sign the voucher (in real app, both parties would sign)
        const aliceSignature = voucher.sign(alice.secretKey);
        const bobSignature = voucher.sign(bob.secretKey);
        voucher.addSignature(aliceSignature, true);
        voucher.addSignature(bobSignature, false);
        console.log(`Transaction ${i + 1}: Alice sends 0.1 SOL to Bob`);
        console.log(`  Alice balance: ${(0, utils_1.lamportsToSol)(aliceBalance)} SOL`);
        console.log(`  Bob balance: ${(0, utils_1.lamportsToSol)(bobBalance)} SOL`);
        console.log(`  Nonce: ${currentNonce}`);
    }
    // Close the channel
    console.log('\n🔒 Closing payment channel...');
    const finalVoucher = solbolt.createVoucher(result.channelState.channelId, aliceBalance, bobBalance, currentNonce);
    const finalAliceSignature = finalVoucher.sign(alice.secretKey);
    const finalBobSignature = finalVoucher.sign(bob.secretKey);
    finalVoucher.addSignature(finalAliceSignature, true);
    finalVoucher.addSignature(finalBobSignature, false);
    const closeResult = await solbolt.closeChannel(finalVoucher);
    if (closeResult.error) {
        console.error('❌ Failed to close channel:', closeResult.error);
        return;
    }
    console.log('✅ Channel closed successfully!');
    console.log('Final transaction:', closeResult.signature);
    console.log('Final balances:');
    console.log(`  Alice: ${(0, utils_1.lamportsToSol)(aliceBalance)} SOL`);
    console.log(`  Bob: ${(0, utils_1.lamportsToSol)(bobBalance)} SOL`);
}
// Run the example
example().catch(console.error);
//# sourceMappingURL=example.js.map