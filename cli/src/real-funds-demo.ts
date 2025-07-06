import chalk from 'chalk';
import inquirer from 'inquirer';
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SolBolt } from '@solbolt/sdk';
import { lamportsToSol, solToLamports } from '@solbolt/sdk';
import bs58 from 'bs58';

interface RealFundsDemoConfig {
  network: string;
  transactionCount: number;
  depositAmount: number;
}

interface RealFundsDemoState {
  userWallet: Keypair;
  bobWallet: Keypair;
  channelId?: PublicKey;
  userBalance: number;
  bobBalance: number;
  nonce: number;
  transactions: Array<{
    from: string;
    to: string;
    amount: number;
    nonce: number;
  }>;
}

export class RealFundsDemo {
  private config: RealFundsDemoConfig;
  private state: RealFundsDemoState;
  private connection: Connection;
  private solbolt: SolBolt;

  constructor(config: RealFundsDemoConfig) {
    this.config = config;
    this.state = {
      userWallet: Keypair.generate(),
      bobWallet: Keypair.generate(),
      userBalance: 0,
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
      wallet: this.state.userWallet,
    });
  }

  async run(): Promise<void> {
    try {
      await this.showWelcome();
      await this.setupWallet();
      await this.checkBalance();
      await this.setupBob();
      await this.openChannel();
      await this.conductOffChainTransactions();
      await this.closeChannel();
      await this.showSummary();
    } catch (error) {
      console.error(chalk.red('Real funds demo failed:'), error);
    }
  }

  private async showWelcome(): Promise<void> {
    console.log(chalk.blue.bold('Welcome to SolBolt Real Funds Demo! 💰\n'));
    console.log(chalk.white('This demo will use REAL SOL from your wallet:'));
    console.log(chalk.gray('1. You will provide your private key'));
    console.log(chalk.gray('2. We will open a payment channel with real SOL'));
    console.log(chalk.gray('3. Conduct off-chain transactions'));
    console.log(chalk.gray('4. Close the channel and settle on-chain'));
    console.log(chalk.red('\n⚠️  WARNING: This will spend real SOL!'));
    console.log(chalk.red('   Make sure you understand the risks.\n'));
    
    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Do you want to proceed with real funds?',
        default: false,
      },
    ]);

    if (!proceed) {
      console.log(chalk.yellow('Demo cancelled. Run "solbolt demo" for simulation instead.'));
      process.exit(0);
    }
  }

  private async setupWallet(): Promise<void> {
    console.log(chalk.blue.bold('\n🔑 Setting up your wallet...\n'));
    
    const { privateKeyInput } = await inquirer.prompt([
      {
        type: 'password',
        name: 'privateKeyInput',
        message: 'Enter your private key (base58 or hex format):',
        mask: '*',
        validate: (input) => {
          if (!input || input.length < 10) {
            return 'Private key must be at least 10 characters';
          }
          return true;
        },
      },
    ]);

    try {
      // Try to parse as base58 first, then hex
      let secretKey: Uint8Array;
      try {
        // Try base58 first (common for Solana private keys)
        secretKey = bs58.decode(privateKeyInput);
      } catch {
        // If base58 fails, try hex
        try {
          secretKey = Uint8Array.from(Buffer.from(privateKeyInput, 'hex'));
        } catch {
          throw new Error('Invalid private key format. Please provide a valid base58 or hex string.');
        }
      }

      this.state.userWallet = Keypair.fromSecretKey(secretKey);
      
      console.log(chalk.green('✅ Wallet loaded successfully!'));
      console.log(chalk.gray(`Public Key: ${this.state.userWallet.publicKey.toString()}`));
      
      // Update SolBolt with the real wallet
      this.solbolt = new SolBolt({
        connection: this.connection,
        wallet: this.state.userWallet,
      });
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to load wallet:'), error);
      process.exit(1);
    }
  }

  private async checkBalance(): Promise<void> {
    console.log(chalk.blue.bold('\n💰 Checking wallet balance...\n'));
    
    try {
      const balance = await this.connection.getBalance(this.state.userWallet.publicKey);
      const balanceSol = lamportsToSol(balance);
      
      console.log(chalk.green(`Current balance: ${balanceSol} SOL`));
      
      if (balanceSol < this.config.depositAmount + 0.01) {
        console.error(chalk.red(`❌ Insufficient balance! You need at least ${this.config.depositAmount + 0.01} SOL`));
        console.log(chalk.yellow('Please fund your wallet and try again.'));
        process.exit(1);
      }
      
      console.log(chalk.green('✅ Sufficient balance for demo!'));
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to check balance:'), error);
      process.exit(1);
    }
  }

  private async setupBob(): Promise<void> {
    console.log(chalk.blue.bold('\n👥 Setting up Party B (destination wallet)...\n'));
    
    const { useDemoWallet } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'useDemoWallet',
        message: 'Use a demo wallet for Party B? (or enter a real wallet address)',
        default: true,
      },
    ]);

    if (useDemoWallet) {
      // Generate a new keypair for Bob
      this.state.bobWallet = Keypair.generate();
      
      console.log(chalk.green('Party B (Demo Wallet):'));
      console.log(chalk.gray(`  Public Key: ${this.state.bobWallet.publicKey.toString()}`));
      console.log(chalk.gray(`  Private Key: ${Buffer.from(this.state.bobWallet.secretKey).toString('hex')}`));
      
      console.log(chalk.yellow('\nNote: This is a demo wallet. In a real scenario, Party B would be another user.'));
    } else {
      const { partyBAddress } = await inquirer.prompt([
        {
          type: 'input',
          name: 'partyBAddress',
          message: 'Enter Party B wallet address:',
          validate: (input) => {
            try {
              new PublicKey(input);
              return true;
            } catch {
              return 'Please enter a valid Solana wallet address';
            }
          },
        },
      ]);

      // Create a placeholder keypair for the real wallet (we won't have the private key)
      this.state.bobWallet = {
        publicKey: new PublicKey(partyBAddress),
        secretKey: new Uint8Array(64), // Placeholder
      } as Keypair;
      
      console.log(chalk.green('Party B (Real Wallet):'));
      console.log(chalk.gray(`  Public Key: ${this.state.bobWallet.publicKey.toString()}`));
      console.log(chalk.yellow('\nNote: You will need Party B to sign vouchers manually in a real scenario.'));
    }
    
    const { continueDemo } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continueDemo',
        message: 'Continue with channel opening?',
        default: true,
      },
    ]);

    if (!continueDemo) {
      console.log(chalk.yellow('Demo cancelled.'));
      process.exit(0);
    }
  }

  private async openChannel(): Promise<void> {
    console.log(chalk.blue.bold('\n📺 Opening payment channel with real SOL...\n'));
    
    console.log(chalk.yellow('Step 1: Creating channel on Solana blockchain...'));
    console.log(chalk.gray(`Deposit amount: ${this.config.depositAmount} SOL`));
    console.log(chalk.gray(`Network: ${this.config.network}`));
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Confirm opening channel with ${this.config.depositAmount} SOL deposit?`,
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow('Channel opening cancelled.'));
      process.exit(0);
    }

    try {
      const depositLamports = solToLamports(this.config.depositAmount);
      
      console.log(chalk.yellow('\nSending transaction to open channel...'));
      
      const result = await this.solbolt.openChannel(this.state.bobWallet.publicKey, {
        initialDeposit: depositLamports,
      });

      if (result.error) {
        console.error(chalk.red('❌ Failed to open channel:'), result.error);
        process.exit(1);
      }

      this.state.channelId = result.channelState?.channelId;
      this.state.userBalance = depositLamports;
      this.state.bobBalance = 0;
      
      console.log(chalk.green('✅ Channel opened successfully!'));
      console.log(chalk.gray(`Transaction: ${result.signature}`));
      console.log(chalk.gray(`Channel ID: ${this.state.channelId?.toString()}`));
      console.log(chalk.gray(`Initial balance - You: ${lamportsToSol(this.state.userBalance)} SOL, Bob: ${lamportsToSol(this.state.bobBalance)} SOL`));
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to open channel:'), error);
      process.exit(1);
    }
  }

  private async conductOffChainTransactions(): Promise<void> {
    console.log(chalk.blue.bold('\n💸 Conducting off-chain transactions...\n'));
    
    console.log(chalk.yellow(`Step 2: Simulating ${this.config.transactionCount} off-chain micropayments...`));
    console.log(chalk.gray('These transactions happen instantly without blockchain fees!\n'));
    
    const paymentAmount = solToLamports(0.001); // 0.001 SOL per transaction
    
    for (let i = 0; i < this.config.transactionCount; i++) {
      this.state.nonce++;
      
      // Simulate you sending 0.001 SOL to Bob
      this.state.userBalance -= paymentAmount;
      this.state.bobBalance += paymentAmount;
      
      // Create and sign voucher
      const voucher = this.solbolt.createVoucher(
        this.state.channelId!,
        this.state.userBalance,
        this.state.bobBalance,
        this.state.nonce
      );
      
      // Sign with both parties
      const userSignature = voucher.sign(this.state.userWallet.secretKey);
      
      // For demo wallet, we can sign. For real wallet, we simulate the signature
      let bobSignature: Uint8Array;
      if (this.state.bobWallet.secretKey.length === 64 && this.state.bobWallet.secretKey.some(byte => byte !== 0)) {
        // Demo wallet - we have the private key
        bobSignature = voucher.sign(this.state.bobWallet.secretKey);
      } else {
        // Real wallet - simulate signature (in real scenario, Party B would sign)
        bobSignature = new Uint8Array(64); // Placeholder signature
        console.log(chalk.yellow(`  Note: Party B signature simulated. In real scenario, Party B would sign this voucher.`));
      }
      
      voucher.addSignature(userSignature, true);
      voucher.addSignature(bobSignature, false);
      
      // Record transaction
      this.state.transactions.push({
        from: 'You',
        to: 'Bob',
        amount: 0.001,
        nonce: this.state.nonce,
      });
      
      console.log(chalk.green(`Transaction ${i + 1}: You → Bob (0.001 SOL)`));
      console.log(chalk.gray(`  Nonce: ${this.state.nonce}`));
      console.log(chalk.gray(`  You: ${lamportsToSol(this.state.userBalance)} SOL`));
      console.log(chalk.gray(`  Bob: ${lamportsToSol(this.state.bobBalance)} SOL`));
      
      // Add small delay for demo effect
      await this.delay(500);
    }
    
    console.log(chalk.green(`\n✅ Completed ${this.config.transactionCount} off-chain transactions!`));
    console.log(chalk.gray('Total saved: ~$0.25 in transaction fees (at $0.05 per transaction)'));
  }

  private async closeChannel(): Promise<void> {
    console.log(chalk.blue.bold('\n🔒 Closing payment channel...\n'));
    
    console.log(chalk.yellow('Step 3: Settling final balances on Solana blockchain...'));
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Confirm closing the channel and settling balances?',
        default: true,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow('Channel closing cancelled.'));
      console.log(chalk.yellow('Note: Your funds are still locked in the channel.'));
      process.exit(0);
    }

    try {
      // Create final voucher
      const finalVoucher = this.solbolt.createVoucher(
        this.state.channelId!,
        this.state.userBalance,
        this.state.bobBalance,
        this.state.nonce
      );
      
      // Sign with both parties
      const userSignature = finalVoucher.sign(this.state.userWallet.secretKey);
      
      // For demo wallet, we can sign. For real wallet, we simulate the signature
      let bobSignature: Uint8Array;
      if (this.state.bobWallet.secretKey.length === 64 && this.state.bobWallet.secretKey.some(byte => byte !== 0)) {
        // Demo wallet - we have the private key
        bobSignature = finalVoucher.sign(this.state.bobWallet.secretKey);
      } else {
        // Real wallet - simulate signature (in real scenario, Party B would sign)
        bobSignature = new Uint8Array(64); // Placeholder signature
        console.log(chalk.yellow(`  Note: Party B signature simulated. In real scenario, Party B would sign this voucher.`));
      }
      
      finalVoucher.addSignature(userSignature, true);
      finalVoucher.addSignature(bobSignature, false);
      
      console.log(chalk.yellow('\nSending transaction to close channel...'));
      
      const result = await this.solbolt.closeChannel(finalVoucher);
      
      if (result.error) {
        console.error(chalk.red('❌ Failed to close channel:'), result.error);
        process.exit(1);
      }
      
      console.log(chalk.green('✅ Channel closed successfully!'));
      console.log(chalk.gray(`Transaction: ${result.signature}`));
      console.log(chalk.gray(`Final balance - You: ${lamportsToSol(this.state.userBalance)} SOL, Bob: ${lamportsToSol(this.state.bobBalance)} SOL`));
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to close channel:'), error);
      process.exit(1);
    }
  }

  private async showSummary(): Promise<void> {
    console.log(chalk.blue.bold('\n📊 Real Funds Demo Summary\n'));
    
    const totalTransactions = this.state.transactions.length;
    const totalAmount = totalTransactions * 0.001;
    const savedFees = totalTransactions * 0.05; // Estimated $0.05 per transaction
    
    console.log(chalk.green('🎯 Results:'));
    console.log(chalk.white(`  • Total transactions: ${totalTransactions}`));
    console.log(chalk.white(`  • Total amount transferred: ${totalAmount} SOL`));
    console.log(chalk.white(`  • On-chain transactions: 2 (open + close)`));
    console.log(chalk.white(`  • Off-chain transactions: ${totalTransactions}`));
    console.log(chalk.white(`  • Estimated fees saved: $${savedFees.toFixed(2)}`));
    
    console.log(chalk.green('\n💰 Cost Breakdown:'));
    console.log(chalk.white(`  • Channel deposit: ${this.config.depositAmount} SOL`));
    console.log(chalk.white(`  • Transferred to Bob: ${totalAmount} SOL`));
    console.log(chalk.white(`  • Transaction fees: ~0.001 SOL (2 on-chain tx)`));
    console.log(chalk.white(`  • Net cost: ~${(this.config.depositAmount - totalAmount + 0.001).toFixed(4)} SOL`));
    
    console.log(chalk.green('\n⚡ Benefits Demonstrated:'));
    console.log(chalk.white('  • Instant micropayments'));
    console.log(chalk.white('  • Dramatically reduced fees'));
    console.log(chalk.white('  • No network congestion'));
    console.log(chalk.white('  • Scalable microtransactions'));
    
    console.log(chalk.blue.bold('\n🚀 Thanks for testing SolBolt with real funds!\n'));
  }

  private getRpcEndpoint(network: string): string {
    switch (network) {
      case 'devnet':
        return 'https://api.devnet.solana.com';
      case 'testnet':
        return 'https://api.testnet.solana.com';
      case 'mainnet':
        return 'https://api.mainnet-beta.solana.com';
      default:
        return 'https://api.devnet.solana.com';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 