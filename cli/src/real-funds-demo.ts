import chalk from 'chalk';
import inquirer from 'inquirer';
import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SolBolt, lamportsToSol, solToLamports, findChannelPDA } from '@solbolt/sdk';
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
  walletBalance?: number;
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
    
    const rpcEndpoint = this.getRpcEndpoint(config.network);
    this.connection = new Connection(rpcEndpoint);
    
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
      let keyBytes: Uint8Array;

      try {
        keyBytes = bs58.decode(privateKeyInput);
      } catch {
        keyBytes = Uint8Array.from(Buffer.from(privateKeyInput, 'hex'));
      }

      console.log("Input bytes length:", keyBytes.length);

      let keypair: Keypair;

      if (keyBytes.length === 32) {
        keypair = Keypair.fromSeed(keyBytes);
        console.log("✅ Detected 32-byte seed. Generated full keypair.");
      } else if (keyBytes.length === 64) {
        keypair = Keypair.fromSecretKey(keyBytes);
        console.log("✅ Detected 64-byte secret key.");
      } else {
        throw new Error(`Invalid secret key size: ${keyBytes.length}. Must be 32 or 64 bytes.`);
      }

      this.state.userWallet = keypair;

      console.log(chalk.green('✅ Wallet loaded successfully!'));
      console.log(chalk.gray(`Public Key: ${this.state.userWallet.publicKey.toString()}`));

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
      
      this.state.walletBalance = balanceSol;
      
      if (balanceSol < 0.01) {
        console.error(chalk.red(`❌ Insufficient balance! You need at least 0.01 SOL for fees`));
        console.log(chalk.yellow('Please fund your wallet and try again.'));
        process.exit(1);
      }
      
      console.log(chalk.green('✅ Wallet funded!'));
      
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

      this.state.bobWallet = {
        publicKey: new PublicKey(partyBAddress),
        secretKey: new Uint8Array(64),
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
    console.log(chalk.gray(`Network: ${this.config.network}`));
    
    const { depositAmount } = await inquirer.prompt([
      {
        type: 'number',
        name: 'depositAmount',
        message: 'Enter deposit amount (SOL):',
        default: this.config.depositAmount,
        validate: (input) => {
          if (input <= 0) {
            return 'Deposit amount must be greater than 0';
          }
          if (input > 100) {
            return 'Deposit amount seems too high. Please enter a reasonable amount.';
          }
          const requiredBalance = input + 0.01;
          if (this.state.walletBalance && requiredBalance > this.state.walletBalance) {
            return `Insufficient balance! You have ${this.state.walletBalance} SOL but need ${requiredBalance} SOL (${input} deposit + 0.01 for fees)`;
          }
          return true;
        },
      },
    ]);

    console.log(chalk.gray(`\nDeposit amount: ${depositAmount} SOL`));
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Confirm opening channel with ${depositAmount} SOL deposit?`,
        default: false,
      },
    ]);

    if (!confirm) {
      console.log(chalk.yellow('Channel opening cancelled.'));
      process.exit(0);
    }

    try {
      const depositLamports = solToLamports(depositAmount);
      
      const [channelPda] = findChannelPDA(
        this.state.userWallet.publicKey,
        this.state.bobWallet.publicKey,
        this.solbolt.programId
      );
      
      this.state.channelId = channelPda;
      
      console.log(chalk.yellow('\nSending transaction to open channel...'));
      
      const result = await this.solbolt.openChannel(
        this.state.userWallet,
        this.state.bobWallet.publicKey,
        {
          initialDeposit: depositLamports,
        }
      );

      if (result.error) {
        console.error(chalk.red('❌ Failed to open channel:'), result.error);
        process.exit(1);
      }

      this.state.userBalance = depositLamports;
      this.state.bobBalance = 0;
      
      console.log(chalk.green('✅ Channel opened successfully!'));
      console.log(chalk.gray(`Transaction: ${result.signature}`));
      console.log(chalk.gray(`Channel ID: ${this.state.channelId.toString()}`));
      console.log(chalk.gray(`Initial balance - You: ${lamportsToSol(this.state.userBalance)} SOL, Bob: ${lamportsToSol(this.state.bobBalance)} SOL`));
      
    } catch (error) {
      console.error(chalk.red('❌ Failed to open channel:'), error);
      process.exit(1);
    }
  }

  private async conductOffChainTransactions(): Promise<void> {
    console.log(chalk.blue.bold('\n💸 Conducting off-chain transactions...\n'));
    
    const { totalToSend } = await inquirer.prompt([
      {
        type: 'number',
        name: 'totalToSend',
        message: 'How much SOL do you want to send to Bob?',
        default: 0.05,
        validate: (input) => {
          if (input <= 0) {
            return 'Amount must be greater than 0';
          }
          if (input > this.state.userBalance / LAMPORTS_PER_SOL) {
            return `You only have ${lamportsToSol(this.state.userBalance)} SOL in the channel`;
          }
          return true;
        },
      },
    ]);

    const totalToSendLamports = solToLamports(totalToSend);
    const paymentAmount = Math.floor(totalToSendLamports / this.config.transactionCount);
    const paymentAmountSol = lamportsToSol(paymentAmount);
    
    console.log(chalk.yellow(`Step 2: Sending ${totalToSend} SOL to Bob through ${this.config.transactionCount} off-chain micropayments...`));
    console.log(chalk.gray(`Each payment: ~${paymentAmountSol} SOL`));
    console.log(chalk.gray('These transactions happen instantly without blockchain fees!\n'));
    
    for (let i = 0; i < this.config.transactionCount; i++) {
      this.state.nonce++;
      
      this.state.userBalance -= paymentAmount;
      this.state.bobBalance += paymentAmount;
      
      const voucher = this.solbolt.createVoucher(
        this.state.channelId!,
        this.state.userBalance,
        this.state.bobBalance,
        this.state.nonce
      );
      
      const userSignature = voucher.sign(this.state.userWallet.secretKey);
      
      let bobSignature: Uint8Array;
      if (this.state.bobWallet.secretKey.length === 64 && this.state.bobWallet.secretKey.some(byte => byte !== 0)) {
        bobSignature = voucher.sign(this.state.bobWallet.secretKey);
      } else {
        bobSignature = new Uint8Array(64);
        console.log(chalk.yellow(`  Note: Party B signature simulated.`));
      }
      
      voucher.addSignature(userSignature, true);
      voucher.addSignature(bobSignature, false);
      
      this.state.transactions.push({
        from: 'You',
        to: 'Bob',
        amount: paymentAmountSol,
        nonce: this.state.nonce,
      });
      
      console.log(chalk.green(`Transaction ${i + 1}: You → Bob (${paymentAmountSol} SOL)`));
      console.log(chalk.gray(`  Nonce: ${this.state.nonce}`));
      console.log(chalk.gray(`  You: ${lamportsToSol(this.state.userBalance)} SOL`));
      console.log(chalk.gray(`  Bob: ${lamportsToSol(this.state.bobBalance)} SOL`));
      
      await this.delay(500);
    }
    
    console.log(chalk.green(`\n✅ Sent ${totalToSend} SOL to Bob through ${this.config.transactionCount} off-chain transactions!`));
    console.log(chalk.gray(`Total fees saved: ~$${(this.config.transactionCount * 0.00025).toFixed(4)} (compared to ${this.config.transactionCount} on-chain transactions)`));
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
      if (!this.state.userWallet || !this.state.bobWallet || !this.state.channelId) {
        throw new Error('Missing required wallet or channel data');
      }

      console.log(chalk.gray(`Channel ID: ${this.state.channelId.toString()}`));
      console.log(chalk.gray(`Party A: ${this.state.userWallet.publicKey.toString()}`));
      console.log(chalk.gray(`Party B: ${this.state.bobWallet.publicKey.toString()}`));

      const finalVoucher = this.solbolt.createVoucher(
        this.state.channelId,
        this.state.userBalance,
        this.state.bobBalance,
        this.state.nonce
      );
      
      const userSignature = finalVoucher.sign(this.state.userWallet.secretKey);
      
      let bobSignature: Uint8Array;
      if (this.state.bobWallet.secretKey.length === 64 && 
          this.state.bobWallet.secretKey.some(byte => byte !== 0)) {
        bobSignature = finalVoucher.sign(this.state.bobWallet.secretKey);
      } else {
        bobSignature = new Uint8Array(64);
        console.log(chalk.yellow(`  Note: Party B signature simulated.`));
      }
      
      finalVoucher.addSignature(userSignature, true);
      finalVoucher.addSignature(bobSignature, false);
      
      console.log(chalk.yellow('\nSending transaction to close channel...'));
      
      const result = await this.solbolt.closeChannel(
        finalVoucher,
        this.state.userWallet,
        this.state.bobWallet.publicKey
      );
      
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
    console.log(chalk.blue.bold('\n📊 Demo Summary\n'));
    
    const totalAmount = this.state.transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const savedFees = this.state.transactions.length * 0.00025;
    
    console.log(chalk.green('🎯 Results:'));
    console.log(chalk.white(`  • Total transactions: ${this.state.transactions.length}`));
    console.log(chalk.white(`  • Total amount transferred: ${totalAmount.toFixed(4)} SOL`));
    console.log(chalk.white(`  • On-chain transactions: 2 (open + close)`));
    console.log(chalk.white(`  • Off-chain transactions: ${this.state.transactions.length}`));
    console.log(chalk.white(`  • Actual fees saved: $${savedFees.toFixed(4)}`));
    
    console.log(chalk.green('\n⚡ Benefits Demonstrated:'));
    console.log(chalk.white('  • Instant micropayments'));
    console.log(chalk.white('  • Reduced on-chain congestion'));
    console.log(chalk.white('  • Scalable microtransactions'));
    
    console.log(chalk.blue.bold('\n🚀 Thanks for testing SolBolt!\n'));
  }

  private getRpcEndpoint(network: string): string {
    switch (network) {
      case 'devnet':
        return 'https://api.devnet.solana.com';
      case 'testnet':
        return 'https://api.testnet.solana.com';
      default:
        return 'https://api.devnet.solana.com';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}