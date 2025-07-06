import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { SolBolt } from '@solbolt/sdk';
import { OffChainVoucher } from '@solbolt/sdk';
import { lamportsToSol, solToLamports } from '@solbolt/sdk';

/**
 * Basic SolBolt Usage Example
 * 
 * This example demonstrates the core workflow:
 * 1. Open a payment channel
 * 2. Conduct off-chain transactions
 * 3. Close the channel
 */

async function basicUsage() {
  console.log('🚀 SolBolt Basic Usage Example\n');

  // Initialize connection (use your preferred RPC endpoint)
  const connection = new Connection('https://api.devnet.solana.com');
  
  // Create keypairs for demo (in production, use real wallets)
  const alice = Keypair.generate();
  const bob = Keypair.generate();
  
  console.log('Generated keypairs:');
  console.log('Alice:', alice.publicKey.toString());
  console.log('Bob:', bob.publicKey.toString());
  
  // Initialize SolBolt SDK
  const solbolt = new SolBolt({
    connection,
    wallet: alice, // Alice will be the channel opener
  });
  
  try {
    // Step 1: Open a payment channel
    console.log('\n📺 Step 1: Opening payment channel...');
    const initialDeposit = solToLamports(1); // 1 SOL
    
    const openResult = await solbolt.openChannel(bob.publicKey, {
      initialDeposit,
    });
    
    if (openResult.error) {
      throw new Error(`Failed to open channel: ${openResult.error}`);
    }
    
    console.log('✅ Channel opened successfully!');
    console.log('Transaction:', openResult.signature);
    
    if (!openResult.channelState) {
      throw new Error('No channel state returned');
    }
    
    const channelId = openResult.channelState.channelId;
    console.log('Channel ID:', channelId.toString());
    
    // Step 2: Conduct off-chain transactions
    console.log('\n💸 Step 2: Conducting off-chain transactions...');
    
    let currentNonce = 1;
    let aliceBalance = initialDeposit;
    let bobBalance = 0;
    
    // Simulate 3 micropayments
    for (let i = 0; i < 3; i++) {
      const paymentAmount = solToLamports(0.1); // 0.1 SOL each
      aliceBalance -= paymentAmount;
      bobBalance += paymentAmount;
      currentNonce++;
      
      // Create voucher for this state update
      const voucher = solbolt.createVoucher(
        channelId,
        aliceBalance,
        bobBalance,
        currentNonce
      );
      
      // Sign with both parties (in real app, this would be done separately)
      const aliceSignature = voucher.sign(alice.secretKey);
      const bobSignature = voucher.sign(bob.secretKey);
      
      voucher.addSignature(aliceSignature, true);
      voucher.addSignature(bobSignature, false);
      
      console.log(`Transaction ${i + 1}: Alice → Bob (0.1 SOL)`);
      console.log(`  Alice: ${lamportsToSol(aliceBalance)} SOL`);
      console.log(`  Bob: ${lamportsToSol(bobBalance)} SOL`);
      console.log(`  Nonce: ${currentNonce}`);
      
      // In a real application, you might update the channel state here
      // await solbolt.updateChannel(voucher);
    }
    
    // Step 3: Close the channel
    console.log('\n🔒 Step 3: Closing payment channel...');
    
    const finalVoucher = solbolt.createVoucher(
      channelId,
      aliceBalance,
      bobBalance,
      currentNonce
    );
    
    const finalAliceSignature = finalVoucher.sign(alice.secretKey);
    const finalBobSignature = finalVoucher.sign(bob.secretKey);
    
    finalVoucher.addSignature(finalAliceSignature, true);
    finalVoucher.addSignature(finalBobSignature, false);
    
    const closeResult = await solbolt.closeChannel(finalVoucher);
    
    if (closeResult.error) {
      throw new Error(`Failed to close channel: ${closeResult.error}`);
    }
    
    console.log('✅ Channel closed successfully!');
    console.log('Transaction:', closeResult.signature);
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`Total transactions: 3`);
    console.log(`Total amount transferred: 0.3 SOL`);
    console.log(`On-chain transactions: 2 (open + close)`);
    console.log(`Off-chain transactions: 3`);
    console.log(`Final balance - Alice: ${lamportsToSol(aliceBalance)} SOL`);
    console.log(`Final balance - Bob: ${lamportsToSol(bobBalance)} SOL`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the example
basicUsage().catch(console.error); 