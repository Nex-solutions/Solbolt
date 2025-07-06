import chalk from 'chalk';
import inquirer from 'inquirer';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { SolBolt } from '@solbolt/sdk';
import { OffChainVoucher } from '@solbolt/sdk';
import { lamportsToSol, solToLamports } from '@solbolt/sdk';

interface DemoConfig {
  network: string;
  transactionCount: number;
}

interface DemoState {
  alice: Keypair;
  bob: Keypair;
  channelId?: PublicKey;
  aliceBalance: number;
  bobBalance: number;
  nonce: number;
  transactions: Array<{
    from: string;
    to: string;
    amount: number;
    nonce: number;
  }>;
}

export class DemoRunner {
  private config: DemoConfig;
  private state: DemoState;
  private connection: Connection;
  private solbolt: SolBolt;

  constructor(config: DemoConfig) {
    this.config = config;
    this.state = {
      alice: Keypair.generate(),
      bob: Keypair.generate(),
      aliceBalance: 0,
      bobBalance: 0,
      nonce: 0,
      transactions: [],
    };
    
    // Initialize connection based on network
    const rpcEndpoint = this.getRpcEndpoint(config.network);
    this.connection = new Connection(rpcEndpoint);
    
    // Initialize SolBolt SDK
    this.solbolt = new SolBolt({
      connection: this.connection,
      wallet: this.state.alice,
    });
  }

  async run(): Promise<void> {
    try {
      await this.showWelcome();
      await this.setupParties();
      await this.openChannel();
      await this.conductOffChainTransactions();
      await this.closeChannel();
      await this.showSummary();
    } catch (error) {
      console.error(chalk.red('Demo failed:'), error);
    }
  }

  private async showWelcome(): Promise<void> {
    console.log(chalk.blue.bold('Welcome to SolBolt! 🚀\n'));
    console.log(chalk.white('This demo will show you how payment channels work:'));
    console.log(chalk.gray('1. Two parties open a payment channel'));
    console.log(chalk.gray('2. They conduct multiple off-chain transactions'));
    console.log(chalk.gray('3. They close the channel with a single on-chain settlement'));
    console.log(chalk.gray('4. Only 2 on-chain transactions total!'));
    
    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Ready to start the demo?',
        default: true,
      },
    ]);

    if (!proceed) {
      console.log(chalk.yellow('Demo cancelled. Run "solbolt demo" to try again.'));
      process.exit(0);
    }
  }

  private async setupParties(): Promise<void> {
    console.log(chalk.blue.bold('\n👥 Setting up parties...\n'));
    
    console.log(chalk.green('Alice (Channel Opener):'));
    console.log(chalk.gray(`  Public Key: ${this.state.alice.publicKey.toString()}`));
    console.log(chalk.gray(`  Private Key: ${Buffer.from(this.state.alice.secretKey).toString('hex')}`));
    
    console.log(chalk.green('\nBob (Channel Participant):'));
    console.log(chalk.gray(`  Public Key: ${this.state.bob.publicKey.toString()}`));
    console.log(chalk.gray(`  Private Key: ${Buffer.from(this.state.bob.secretKey).toString('hex')}`));
    
    const { deposit } = await inquirer.prompt([
      {
        type: 'number',
        name: 'deposit',
        message: 'How much SOL should Alice deposit?',
        default: 1,
        validate: (value) => value > 0 ? true : 'Deposit must be greater than 0',
      },
    ]);

    this.state.aliceBalance = solToLamports(deposit);
    this.state.bobBalance = 0;
    
    console.log(chalk.green(`\n✅ Initial setup complete!`));
    console.log(chalk.gray(`Alice will deposit ${deposit} SOL to open the channel.`));
  }

  private async openChannel(): Promise<void> {
    console.log(chalk.blue.bold('\n📺 Opening payment channel...\n'));
    
    console.log(chalk.yellow('Step 1: Creating channel on Solana blockchain...'));
    
    // Simulate channel opening (in real demo, this would be an actual transaction)
    const channelId = Keypair.generate().publicKey;
    this.state.channelId = channelId;
    
    console.log(chalk.green('✅ Channel opened successfully!'));
    console.log(chalk.gray(`Channel ID: ${channelId.toString()}`));
    console.log(chalk.gray(`Initial balance - Alice: ${lamportsToSol(this.state.aliceBalance)} SOL, Bob: ${lamportsToSol(this.state.bobBalance)} SOL`));
    
    const { continueDemo } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continueDemo',
        message: 'Continue to off-chain transactions?',
        default: true,
      },
    ]);

    if (!continueDemo) {
      console.log(chalk.yellow('Demo ended early.'));
      process.exit(0);
    }
  }

  private async conductOffChainTransactions(): Promise<void> {
    console.log(chalk.blue.bold('\n💸 Conducting off-chain transactions...\n'));
    
    console.log(chalk.yellow(`Step 2: Simulating ${this.config.transactionCount} off-chain micropayments...`));
    console.log(chalk.gray('These transactions happen instantly without blockchain fees!\n'));
    
    for (let i = 0; i < this.config.transactionCount; i++) {
      this.state.nonce++;
      
      // Simulate Alice sending 0.1 SOL to Bob
      const paymentAmount = solToLamports(0.1);
      this.state.aliceBalance -= paymentAmount;
      this.state.bobBalance += paymentAmount;
      
      // Create and sign voucher
      const voucher = this.solbolt.createVoucher(
        this.state.channelId!,
        this.state.aliceBalance,
        this.state.bobBalance,
        this.state.nonce
      );
      
      // Sign with both parties (simulated)
      const aliceSignature = voucher.sign(this.state.alice.secretKey);
      const bobSignature = voucher.sign(this.state.bob.secretKey);
      
      voucher.addSignature(aliceSignature, true);
      voucher.addSignature(bobSignature, false);
      
      // Record transaction
      this.state.transactions.push({
        from: 'Alice',
        to: 'Bob',
        amount: 0.1,
        nonce: this.state.nonce,
      });
      
      console.log(chalk.green(`Transaction ${i + 1}: Alice → Bob (0.1 SOL)`));
      console.log(chalk.gray(`  Nonce: ${this.state.nonce}`));
      console.log(chalk.gray(`  Alice: ${lamportsToSol(this.state.aliceBalance)} SOL`));
      console.log(chalk.gray(`  Bob: ${lamportsToSol(this.state.bobBalance)} SOL`));
      
      // Add small delay for demo effect
      await this.delay(500);
    }
    
    console.log(chalk.green(`\n✅ Completed ${this.config.transactionCount} off-chain transactions!`));
    console.log(chalk.gray('Total saved: ~$0.50 in transaction fees (at $0.05 per transaction)'));
  }

  private async closeChannel(): Promise<void> {
    console.log(chalk.blue.bold('\n🔒 Closing payment channel...\n'));
    
    console.log(chalk.yellow('Step 3: Settling final balances on Solana blockchain...'));
    
    // Create final voucher
    const finalVoucher = this.solbolt.createVoucher(
      this.state.channelId!,
      this.state.aliceBalance,
      this.state.bobBalance,
      this.state.nonce
    );
    
    // Sign with both parties
    const aliceSignature = finalVoucher.sign(this.state.alice.secretKey);
    const bobSignature = finalVoucher.sign(this.state.bob.secretKey);
    
    finalVoucher.addSignature(aliceSignature, true);
    finalVoucher.addSignature(bobSignature, false);
    
    console.log(chalk.green('✅ Channel closed successfully!'));
    console.log(chalk.gray(`Final balance - Alice: ${lamportsToSol(this.state.aliceBalance)} SOL, Bob: ${lamportsToSol(this.state.bobBalance)} SOL`));
  }

  private async showSummary(): Promise<void> {
    console.log(chalk.blue.bold('\n📊 Demo Summary\n'));
    
    const totalTransactions = this.state.transactions.length;
    const totalAmount = totalTransactions * 0.1;
    const savedFees = totalTransactions * 0.05; // Estimated $0.05 per transaction
    
    console.log(chalk.green('🎯 Results:'));
    console.log(chalk.white(`  • Total transactions: ${totalTransactions}`));
    console.log(chalk.white(`  • Total amount transferred: ${totalAmount} SOL`));
    console.log(chalk.white(`  • On-chain transactions: 2 (open + close)`));
    console.log(chalk.white(`  • Off-chain transactions: ${totalTransactions}`));
    console.log(chalk.white(`  • Estimated fees saved: $${savedFees.toFixed(2)}`));
    
    console.log(chalk.green('\n⚡ Benefits:'));
    console.log(chalk.white('  • Instant micropayments'));
    console.log(chalk.white('  • Dramatically reduced fees'));
    console.log(chalk.white('  • No network congestion'));
    console.log(chalk.white('  • Scalable microtransactions'));
    
    console.log(chalk.green('\n🔗 Next Steps:'));
    console.log(chalk.white('  • Integrate SolBolt into your dApp'));
    console.log(chalk.white('  • Use the TypeScript SDK'));
    console.log(chalk.white('  • Deploy to mainnet'));
    
    console.log(chalk.blue.bold('\n🚀 Thanks for trying SolBolt!\n'));
  }

  private getRpcEndpoint(network: string): string {
    switch (network) {
      case 'devnet':
        return 'https://api.devnet.solana.com';
      case 'testnet':
        return 'https://api.testnet.solana.com';
      case 'localhost':
        return 'http://localhost:8899';
      default:
        return 'https://api.devnet.solana.com';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 