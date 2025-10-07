import chalk from 'chalk';
import inquirer from 'inquirer';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { SolBolt } from '@solbolt/sdk';
import { solToLamports, lamportsToSol } from '@solbolt/sdk';

export class ChannelManager {
  private connection: Connection;
  private solbolt: SolBolt;
  private wallet: Keypair;

  constructor() {
    // Initialize with devnet for demo purposes
    this.connection = new Connection('https://api.devnet.solana.com');
    this.wallet = Keypair.generate(); // In production, this would be a real wallet
    this.solbolt = new SolBolt({
      connection: this.connection,
      wallet: this.wallet,
    });
  }

  async openChannel(partyBKey: string, depositAmount: number): Promise<void> {
    try {
      console.log(chalk.blue.bold('\n📺 Opening Payment Channel\n'));

      // Validate party B public key
      if (!this.isValidPublicKey(partyBKey)) {
        console.error(chalk.red('❌ Invalid party B public key'));
        return;
      }

      const partyB = new PublicKey(partyBKey);
      const depositLamports = solToLamports(depositAmount);

      console.log(chalk.gray('Channel details:'));
      console.log(chalk.gray(`  Party A (you): ${this.wallet.publicKey.toString()}`));
      console.log(chalk.gray(`  Party B: ${partyB.toString()}`));
      console.log(chalk.gray(`  Deposit: ${depositAmount} SOL (${depositLamports} lamports)`));

      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Proceed with opening the channel?',
          default: true,
        },
      ]);

      if (!confirm) {
        console.log(chalk.yellow('Channel opening cancelled.'));
        return;
      }

      console.log(chalk.yellow('\nOpening channel...'));
      
      // In a real implementation, this would be an actual blockchain transaction
      // For demo purposes, we'll simulate it
      const result = await this.solbolt.openChannel(
        this.wallet,  // Add the wallet/keypair as first argument
        partyB,
        {
          initialDeposit: depositLamports,
        }
      );

      if (result.error) {
        console.error(chalk.red('❌ Failed to open channel:'), result.error);
        return;
      }

      console.log(chalk.green('✅ Channel opened successfully!'));
      console.log(chalk.gray(`Transaction: ${result.signature}`));
      
      if (result.channelState) {
        console.log(chalk.gray(`Channel ID: ${result.channelState.channelId.toString()}`));
        console.log(chalk.gray(`Initial balance - Party A: ${lamportsToSol(result.channelState.balanceA)} SOL`));
        console.log(chalk.gray(`Initial balance - Party B: ${lamportsToSol(result.channelState.balanceB)} SOL`));
      }

    } catch (error) {
      console.error(chalk.red('❌ Error opening channel:'), error);
    }
  }

  async closeChannel(channelKey: string): Promise<void> {
    try {
      console.log(chalk.blue.bold('\n🔒 Closing Payment Channel\n'));

      // Validate channel public key
      if (!this.isValidPublicKey(channelKey)) {
        console.error(chalk.red('❌ Invalid channel public key'));
        return;
      }

      const channelId = new PublicKey(channelKey);

      console.log(chalk.gray('Channel details:'));
      console.log(chalk.gray(`  Channel ID: ${channelId.toString()}`));

      // Get current channel state
      const channelState = await this.solbolt.getChannelState(channelId);
      
      if (!channelState) {
        console.error(chalk.red('❌ Channel not found or not accessible'));
        return;
      }

      console.log(chalk.gray(`  Party A: ${channelState.partyA.toString()}`));
      console.log(chalk.gray(`  Party B: ${channelState.partyB.toString()}`));
      console.log(chalk.gray(`  Current balance A: ${lamportsToSol(channelState.balanceA)} SOL`));
      console.log(chalk.gray(`  Current balance B: ${lamportsToSol(channelState.balanceB)} SOL`));
      console.log(chalk.gray(`  Status: ${channelState.isOpen ? 'Open' : 'Closed'}`));

      if (!channelState.isOpen) {
        console.log(chalk.yellow('Channel is already closed.'));
        return;
      }

      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Proceed with closing the channel?',
          default: true,
        },
      ]);

      if (!confirm) {
        console.log(chalk.yellow('Channel closing cancelled.'));
        return;
      }

      console.log(chalk.yellow('\nClosing channel...'));
      
      // In a real implementation, this would require a signed voucher from both parties
      // For demo purposes, we'll simulate it
      console.log(chalk.green('✅ Channel closed successfully!'));
      console.log(chalk.gray('Note: In production, this requires signatures from both parties'));

    } catch (error) {
      console.error(chalk.red('❌ Error closing channel:'), error);
    }
  }

  async getChannelStatus(channelKey: string): Promise<void> {
    try {
      console.log(chalk.blue.bold('\n📊 Channel Status\n'));

      // Validate channel public key
      if (!this.isValidPublicKey(channelKey)) {
        console.error(chalk.red('❌ Invalid channel public key'));
        return;
      }

      const channelId = new PublicKey(channelKey);

      console.log(chalk.gray('Fetching channel status...'));
      
      const channelState = await this.solbolt.getChannelState(channelId);
      
      if (!channelState) {
        console.error(chalk.red('❌ Channel not found or not accessible'));
        return;
      }

      console.log(chalk.green('✅ Channel found!'));
      console.log(chalk.white('\nChannel Information:'));
      console.log(chalk.gray(`  Channel ID: ${channelState.channelId.toString()}`));
      console.log(chalk.gray(`  Party A: ${channelState.partyA.toString()}`));
      console.log(chalk.gray(`  Party B: ${channelState.partyB.toString()}`));
      console.log(chalk.gray(`  Balance A: ${lamportsToSol(channelState.balanceA)} SOL`));
      console.log(chalk.gray(`  Balance B: ${lamportsToSol(channelState.balanceB)} SOL`));
      console.log(chalk.gray(`  Nonce: ${channelState.nonce}`));
      console.log(chalk.gray(`  Status: ${channelState.isOpen ? chalk.green('Open') : chalk.red('Closed')}`));
      console.log(chalk.gray(`  Opened: ${new Date(channelState.openedAt * 1000).toLocaleString()}`));
      console.log(chalk.gray(`  Timeout: ${new Date(channelState.timeoutAt * 1000).toLocaleString()}`));

      // Check if channel has timed out
      const isTimedOut = await this.solbolt.isChannelTimedOut(channelId);
      if (isTimedOut) {
        console.log(chalk.yellow('\n⚠️  Channel has timed out and can be force-closed'));
      }

      // Calculate total balance
      const totalBalance = channelState.balanceA + channelState.balanceB;
      console.log(chalk.gray(`  Total balance: ${lamportsToSol(totalBalance)} SOL`));

    } catch (error) {
      console.error(chalk.red('❌ Error fetching channel status:'), error);
    }
  }

  private isValidPublicKey(key: string): boolean {
    try {
      new PublicKey(key);
      return true;
    } catch {
      return false;
    }
  }
} 