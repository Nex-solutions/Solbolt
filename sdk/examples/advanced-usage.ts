import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { SolBolt } from '@solbolt/sdk';
import { OffChainVoucher } from '@solbolt/sdk';
import { lamportsToSol, solToLamports, hasTimedOut } from '@solbolt/sdk';

/**
 * Advanced SolBolt Usage Example
 * 
 * This example demonstrates advanced features:
 * - Force closing channels after timeout
 * - Error handling and recovery
 * - Channel state monitoring
 * - Multiple channel management
 */

interface ChannelInfo {
  channelId: PublicKey;
  partyA: PublicKey;
  partyB: PublicKey;
  balanceA: number;
  balanceB: number;
  nonce: number;
  isOpen: boolean;
  openedAt: number;
  timeoutAt: number;
}

class AdvancedSolBoltManager {
  private solbolt: SolBolt;
  private channels: Map<string, ChannelInfo> = new Map();

  constructor(connection: Connection, wallet: Keypair) {
    this.solbolt = new SolBolt({
      connection,
      wallet,
    });
  }

  /**
   * Open multiple channels and manage them
   */
  async openMultipleChannels(parties: PublicKey[], depositAmount: number): Promise<void> {
    console.log(`\n📺 Opening ${parties.length} payment channels...`);

    for (let i = 0; i < parties.length; i++) {
      const partyB = parties[i];
      console.log(`\nOpening channel ${i + 1}/${parties.length} with ${partyB.toString()}`);

      try {
        const result = await this.solbolt.openChannel(partyB, {
          initialDeposit: solToLamports(depositAmount),
        });

        if (result.error) {
          console.error(`❌ Failed to open channel ${i + 1}:`, result.error);
          continue;
        }

        if (result.channelState) {
          const channelInfo: ChannelInfo = {
            channelId: result.channelState.channelId,
            partyA: result.channelState.partyA,
            partyB: result.channelState.partyB,
            balanceA: result.channelState.balanceA,
            balanceB: result.channelState.balanceB,
            nonce: result.channelState.nonce,
            isOpen: result.channelState.isOpen,
            openedAt: result.channelState.openedAt,
            timeoutAt: result.channelState.timeoutAt,
          };

          this.channels.set(channelInfo.channelId.toString(), channelInfo);
          console.log(`✅ Channel ${i + 1} opened: ${channelInfo.channelId.toString()}`);
        }
      } catch (error) {
        console.error(`❌ Error opening channel ${i + 1}:`, error);
      }
    }

    console.log(`\n📊 Total channels opened: ${this.channels.size}`);
  }

  /**
   * Conduct off-chain transactions across multiple channels
   */
  async conductBatchTransactions(transactions: Array<{
    channelId: string;
    from: 'A' | 'B';
    to: 'A' | 'B';
    amount: number;
  }>): Promise<void> {
    console.log(`\n💸 Conducting ${transactions.length} batch transactions...`);

    for (const tx of transactions) {
      const channelInfo = this.channels.get(tx.channelId);
      if (!channelInfo) {
        console.error(`❌ Channel not found: ${tx.channelId}`);
        continue;
      }

      if (!channelInfo.isOpen) {
        console.error(`❌ Channel is closed: ${tx.channelId}`);
        continue;
      }

      // Update balances
      const amountLamports = solToLamports(tx.amount);
      if (tx.from === 'A' && tx.to === 'B') {
        channelInfo.balanceA -= amountLamports;
        channelInfo.balanceB += amountLamports;
      } else if (tx.from === 'B' && tx.to === 'A') {
        channelInfo.balanceB -= amountLamports;
        channelInfo.balanceA += amountLamports;
      }

      channelInfo.nonce++;

      // Create and sign voucher
      const voucher = this.solbolt.createVoucher(
        channelInfo.channelId,
        channelInfo.balanceA,
        channelInfo.balanceB,
        channelInfo.nonce
      );

      console.log(`Transaction: ${tx.from} → ${tx.to} (${tx.amount} SOL) in channel ${tx.channelId}`);
      console.log(`  Nonce: ${channelInfo.nonce}`);
      console.log(`  Balance A: ${lamportsToSol(channelInfo.balanceA)} SOL`);
      console.log(`  Balance B: ${lamportsToSol(channelInfo.balanceB)} SOL`);
    }
  }

  /**
   * Monitor channels for timeouts and force close if needed
   */
  async monitorAndForceClose(): Promise<void> {
    console.log('\n⏰ Monitoring channels for timeouts...');

    const currentTime = Math.floor(Date.now() / 1000);
    const channelsToClose: string[] = [];

    for (const [channelId, channelInfo] of this.channels) {
      if (channelInfo.isOpen && hasTimedOut(channelInfo.timeoutAt)) {
        console.log(`⚠️  Channel ${channelId} has timed out`);
        channelsToClose.push(channelId);
      }
    }

    if (channelsToClose.length === 0) {
      console.log('✅ No channels need force closing');
      return;
    }

    console.log(`\n🔒 Force closing ${channelsToClose.length} timed-out channels...`);

    for (const channelId of channelsToClose) {
      try {
        const result = await this.solbolt.forceCloseChannel(new PublicKey(channelId));
        
        if (result.error) {
          console.error(`❌ Failed to force close ${channelId}:`, result.error);
        } else {
          console.log(`✅ Force closed channel: ${channelId}`);
          const channelInfo = this.channels.get(channelId);
          if (channelInfo) {
            channelInfo.isOpen = false;
          }
        }
      } catch (error) {
        console.error(`❌ Error force closing ${channelId}:`, error);
      }
    }
  }

  /**
   * Close all open channels cooperatively
   */
  async closeAllChannels(): Promise<void> {
    console.log('\n🔒 Closing all open channels cooperatively...');

    const openChannels = Array.from(this.channels.values()).filter(ch => ch.isOpen);
    
    if (openChannels.length === 0) {
      console.log('✅ No open channels to close');
      return;
    }

    console.log(`Found ${openChannels.length} open channels to close`);

    for (const channelInfo of openChannels) {
      try {
        // Create final voucher with current balances
        const finalVoucher = this.solbolt.createVoucher(
          channelInfo.channelId,
          channelInfo.balanceA,
          channelInfo.balanceB,
          channelInfo.nonce
        );

        const result = await this.solbolt.closeChannel(finalVoucher);
        
        if (result.error) {
          console.error(`❌ Failed to close ${channelInfo.channelId}:`, result.error);
        } else {
          console.log(`✅ Closed channel: ${channelInfo.channelId}`);
          channelInfo.isOpen = false;
        }
      } catch (error) {
        console.error(`❌ Error closing ${channelInfo.channelId}:`, error);
      }
    }
  }

  /**
   * Get summary of all channels
   */
  getChannelSummary(): void {
    console.log('\n📊 Channel Summary:');
    
    const openChannels = Array.from(this.channels.values()).filter(ch => ch.isOpen);
    const closedChannels = Array.from(this.channels.values()).filter(ch => !ch.isOpen);
    
    console.log(`Total channels: ${this.channels.size}`);
    console.log(`Open channels: ${openChannels.length}`);
    console.log(`Closed channels: ${closedChannels.length}`);
    
    let totalBalance = 0;
    for (const channel of this.channels.values()) {
      totalBalance += channel.balanceA + channel.balanceB;
    }
    
    console.log(`Total balance across all channels: ${lamportsToSol(totalBalance)} SOL`);
  }
}

async function advancedUsage() {
  console.log('🚀 SolBolt Advanced Usage Example\n');

  const connection = new Connection('https://api.devnet.solana.com');
  const alice = Keypair.generate();
  
  // Create multiple parties for demonstration
  const parties = [
    Keypair.generate().publicKey,
    Keypair.generate().publicKey,
    Keypair.generate().publicKey,
  ];

  console.log('Alice (Channel Manager):', alice.publicKey.toString());
  console.log('Parties:', parties.map(p => p.toString()));

  const manager = new AdvancedSolBoltManager(connection, alice);

  try {
    // Step 1: Open multiple channels
    await manager.openMultipleChannels(parties, 0.5); // 0.5 SOL each

    // Step 2: Conduct batch transactions
    const transactions = [
      { channelId: Array.from(manager['channels'].keys())[0], from: 'A' as const, to: 'B' as const, amount: 0.1 },
      { channelId: Array.from(manager['channels'].keys())[1], from: 'A' as const, to: 'B' as const, amount: 0.05 },
      { channelId: Array.from(manager['channels'].keys())[2], from: 'B' as const, to: 'A' as const, amount: 0.02 },
    ];

    await manager.conductBatchTransactions(transactions);

    // Step 3: Monitor for timeouts (simulated)
    await manager.monitorAndForceClose();

    // Step 4: Get summary
    manager.getChannelSummary();

    // Step 5: Close all channels
    await manager.closeAllChannels();

    console.log('\n✅ Advanced usage example completed!');

  } catch (error) {
    console.error('❌ Error in advanced usage:', error);
  }
}

// Run the example
advancedUsage().catch(console.error); 