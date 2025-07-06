"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelManager = void 0;
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const web3_js_1 = require("@solana/web3.js");
const sdk_1 = require("@solbolt/sdk");
const sdk_2 = require("@solbolt/sdk");
class ChannelManager {
    constructor() {
        // Initialize with devnet for demo purposes
        this.connection = new web3_js_1.Connection('https://api.devnet.solana.com');
        this.wallet = web3_js_1.Keypair.generate(); // In production, this would be a real wallet
        this.solbolt = new sdk_1.SolBolt({
            connection: this.connection,
            wallet: this.wallet,
        });
    }
    async openChannel(partyBKey, depositAmount) {
        try {
            console.log(chalk_1.default.blue.bold('\n📺 Opening Payment Channel\n'));
            // Validate party B public key
            if (!this.isValidPublicKey(partyBKey)) {
                console.error(chalk_1.default.red('❌ Invalid party B public key'));
                return;
            }
            const partyB = new web3_js_1.PublicKey(partyBKey);
            const depositLamports = (0, sdk_2.solToLamports)(depositAmount);
            console.log(chalk_1.default.gray('Channel details:'));
            console.log(chalk_1.default.gray(`  Party A (you): ${this.wallet.publicKey.toString()}`));
            console.log(chalk_1.default.gray(`  Party B: ${partyB.toString()}`));
            console.log(chalk_1.default.gray(`  Deposit: ${depositAmount} SOL (${depositLamports} lamports)`));
            const { confirm } = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: 'Proceed with opening the channel?',
                    default: true,
                },
            ]);
            if (!confirm) {
                console.log(chalk_1.default.yellow('Channel opening cancelled.'));
                return;
            }
            console.log(chalk_1.default.yellow('\nOpening channel...'));
            // In a real implementation, this would be an actual blockchain transaction
            // For demo purposes, we'll simulate it
            const result = await this.solbolt.openChannel(partyB, {
                initialDeposit: depositLamports,
            });
            if (result.error) {
                console.error(chalk_1.default.red('❌ Failed to open channel:'), result.error);
                return;
            }
            console.log(chalk_1.default.green('✅ Channel opened successfully!'));
            console.log(chalk_1.default.gray(`Transaction: ${result.signature}`));
            if (result.channelState) {
                console.log(chalk_1.default.gray(`Channel ID: ${result.channelState.channelId.toString()}`));
                console.log(chalk_1.default.gray(`Initial balance - Party A: ${(0, sdk_2.lamportsToSol)(result.channelState.balanceA)} SOL`));
                console.log(chalk_1.default.gray(`Initial balance - Party B: ${(0, sdk_2.lamportsToSol)(result.channelState.balanceB)} SOL`));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('❌ Error opening channel:'), error);
        }
    }
    async closeChannel(channelKey) {
        try {
            console.log(chalk_1.default.blue.bold('\n🔒 Closing Payment Channel\n'));
            // Validate channel public key
            if (!this.isValidPublicKey(channelKey)) {
                console.error(chalk_1.default.red('❌ Invalid channel public key'));
                return;
            }
            const channelId = new web3_js_1.PublicKey(channelKey);
            console.log(chalk_1.default.gray('Channel details:'));
            console.log(chalk_1.default.gray(`  Channel ID: ${channelId.toString()}`));
            // Get current channel state
            const channelState = await this.solbolt.getChannelState(channelId);
            if (!channelState) {
                console.error(chalk_1.default.red('❌ Channel not found or not accessible'));
                return;
            }
            console.log(chalk_1.default.gray(`  Party A: ${channelState.partyA.toString()}`));
            console.log(chalk_1.default.gray(`  Party B: ${channelState.partyB.toString()}`));
            console.log(chalk_1.default.gray(`  Current balance A: ${(0, sdk_2.lamportsToSol)(channelState.balanceA)} SOL`));
            console.log(chalk_1.default.gray(`  Current balance B: ${(0, sdk_2.lamportsToSol)(channelState.balanceB)} SOL`));
            console.log(chalk_1.default.gray(`  Status: ${channelState.isOpen ? 'Open' : 'Closed'}`));
            if (!channelState.isOpen) {
                console.log(chalk_1.default.yellow('Channel is already closed.'));
                return;
            }
            const { confirm } = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'confirm',
                    message: 'Proceed with closing the channel?',
                    default: true,
                },
            ]);
            if (!confirm) {
                console.log(chalk_1.default.yellow('Channel closing cancelled.'));
                return;
            }
            console.log(chalk_1.default.yellow('\nClosing channel...'));
            // In a real implementation, this would require a signed voucher from both parties
            // For demo purposes, we'll simulate it
            console.log(chalk_1.default.green('✅ Channel closed successfully!'));
            console.log(chalk_1.default.gray('Note: In production, this requires signatures from both parties'));
        }
        catch (error) {
            console.error(chalk_1.default.red('❌ Error closing channel:'), error);
        }
    }
    async getChannelStatus(channelKey) {
        try {
            console.log(chalk_1.default.blue.bold('\n📊 Channel Status\n'));
            // Validate channel public key
            if (!this.isValidPublicKey(channelKey)) {
                console.error(chalk_1.default.red('❌ Invalid channel public key'));
                return;
            }
            const channelId = new web3_js_1.PublicKey(channelKey);
            console.log(chalk_1.default.gray('Fetching channel status...'));
            const channelState = await this.solbolt.getChannelState(channelId);
            if (!channelState) {
                console.error(chalk_1.default.red('❌ Channel not found or not accessible'));
                return;
            }
            console.log(chalk_1.default.green('✅ Channel found!'));
            console.log(chalk_1.default.white('\nChannel Information:'));
            console.log(chalk_1.default.gray(`  Channel ID: ${channelState.channelId.toString()}`));
            console.log(chalk_1.default.gray(`  Party A: ${channelState.partyA.toString()}`));
            console.log(chalk_1.default.gray(`  Party B: ${channelState.partyB.toString()}`));
            console.log(chalk_1.default.gray(`  Balance A: ${(0, sdk_2.lamportsToSol)(channelState.balanceA)} SOL`));
            console.log(chalk_1.default.gray(`  Balance B: ${(0, sdk_2.lamportsToSol)(channelState.balanceB)} SOL`));
            console.log(chalk_1.default.gray(`  Nonce: ${channelState.nonce}`));
            console.log(chalk_1.default.gray(`  Status: ${channelState.isOpen ? chalk_1.default.green('Open') : chalk_1.default.red('Closed')}`));
            console.log(chalk_1.default.gray(`  Opened: ${new Date(channelState.openedAt * 1000).toLocaleString()}`));
            console.log(chalk_1.default.gray(`  Timeout: ${new Date(channelState.timeoutAt * 1000).toLocaleString()}`));
            // Check if channel has timed out
            const isTimedOut = await this.solbolt.isChannelTimedOut(channelId);
            if (isTimedOut) {
                console.log(chalk_1.default.yellow('\n⚠️  Channel has timed out and can be force-closed'));
            }
            // Calculate total balance
            const totalBalance = channelState.balanceA + channelState.balanceB;
            console.log(chalk_1.default.gray(`  Total balance: ${(0, sdk_2.lamportsToSol)(totalBalance)} SOL`));
        }
        catch (error) {
            console.error(chalk_1.default.red('❌ Error fetching channel status:'), error);
        }
    }
    isValidPublicKey(key) {
        try {
            new web3_js_1.PublicKey(key);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.ChannelManager = ChannelManager;
//# sourceMappingURL=channel-manager.js.map