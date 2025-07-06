"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoRunner = void 0;
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const web3_js_1 = require("@solana/web3.js");
const sdk_1 = require("@solbolt/sdk");
const sdk_2 = require("@solbolt/sdk");
class DemoRunner {
    constructor(config) {
        this.config = config;
        this.state = {
            alice: web3_js_1.Keypair.generate(),
            bob: web3_js_1.Keypair.generate(),
            aliceBalance: 0,
            bobBalance: 0,
            nonce: 0,
            transactions: [],
        };
        // Initialize connection based on network
        const rpcEndpoint = this.getRpcEndpoint(config.network);
        this.connection = new web3_js_1.Connection(rpcEndpoint);
        // Initialize SolBolt SDK
        this.solbolt = new sdk_1.SolBolt({
            connection: this.connection,
            wallet: this.state.alice,
        });
    }
    async run() {
        try {
            await this.showWelcome();
            await this.setupParties();
            await this.openChannel();
            await this.conductOffChainTransactions();
            await this.closeChannel();
            await this.showSummary();
        }
        catch (error) {
            console.error(chalk_1.default.red('Demo failed:'), error);
        }
    }
    async showWelcome() {
        console.log(chalk_1.default.blue.bold('Welcome to SolBolt! 🚀\n'));
        console.log(chalk_1.default.white('This demo will show you how payment channels work:'));
        console.log(chalk_1.default.gray('1. Two parties open a payment channel'));
        console.log(chalk_1.default.gray('2. They conduct multiple off-chain transactions'));
        console.log(chalk_1.default.gray('3. They close the channel with a single on-chain settlement'));
        console.log(chalk_1.default.gray('4. Only 2 on-chain transactions total!'));
        const { proceed } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'proceed',
                message: 'Ready to start the demo?',
                default: true,
            },
        ]);
        if (!proceed) {
            console.log(chalk_1.default.yellow('Demo cancelled. Run "solbolt demo" to try again.'));
            process.exit(0);
        }
    }
    async setupParties() {
        console.log(chalk_1.default.blue.bold('\n👥 Setting up parties...\n'));
        console.log(chalk_1.default.green('Alice (Channel Opener):'));
        console.log(chalk_1.default.gray(`  Public Key: ${this.state.alice.publicKey.toString()}`));
        console.log(chalk_1.default.gray(`  Private Key: ${Buffer.from(this.state.alice.secretKey).toString('hex')}`));
        console.log(chalk_1.default.green('\nBob (Channel Participant):'));
        console.log(chalk_1.default.gray(`  Public Key: ${this.state.bob.publicKey.toString()}`));
        console.log(chalk_1.default.gray(`  Private Key: ${Buffer.from(this.state.bob.secretKey).toString('hex')}`));
        const { deposit } = await inquirer_1.default.prompt([
            {
                type: 'number',
                name: 'deposit',
                message: 'How much SOL should Alice deposit?',
                default: 1,
                validate: (value) => value > 0 ? true : 'Deposit must be greater than 0',
            },
        ]);
        this.state.aliceBalance = (0, sdk_2.solToLamports)(deposit);
        this.state.bobBalance = 0;
        console.log(chalk_1.default.green(`\n✅ Initial setup complete!`));
        console.log(chalk_1.default.gray(`Alice will deposit ${deposit} SOL to open the channel.`));
    }
    async openChannel() {
        console.log(chalk_1.default.blue.bold('\n📺 Opening payment channel...\n'));
        console.log(chalk_1.default.yellow('Step 1: Creating channel on Solana blockchain...'));
        // Simulate channel opening (in real demo, this would be an actual transaction)
        const channelId = web3_js_1.Keypair.generate().publicKey;
        this.state.channelId = channelId;
        console.log(chalk_1.default.green('✅ Channel opened successfully!'));
        console.log(chalk_1.default.gray(`Channel ID: ${channelId.toString()}`));
        console.log(chalk_1.default.gray(`Initial balance - Alice: ${(0, sdk_2.lamportsToSol)(this.state.aliceBalance)} SOL, Bob: ${(0, sdk_2.lamportsToSol)(this.state.bobBalance)} SOL`));
        const { continueDemo } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'continueDemo',
                message: 'Continue to off-chain transactions?',
                default: true,
            },
        ]);
        if (!continueDemo) {
            console.log(chalk_1.default.yellow('Demo ended early.'));
            process.exit(0);
        }
    }
    async conductOffChainTransactions() {
        console.log(chalk_1.default.blue.bold('\n💸 Conducting off-chain transactions...\n'));
        console.log(chalk_1.default.yellow(`Step 2: Simulating ${this.config.transactionCount} off-chain micropayments...`));
        console.log(chalk_1.default.gray('These transactions happen instantly without blockchain fees!\n'));
        for (let i = 0; i < this.config.transactionCount; i++) {
            this.state.nonce++;
            // Simulate Alice sending 0.1 SOL to Bob
            const paymentAmount = (0, sdk_2.solToLamports)(0.1);
            this.state.aliceBalance -= paymentAmount;
            this.state.bobBalance += paymentAmount;
            // Create and sign voucher
            const voucher = this.solbolt.createVoucher(this.state.channelId, this.state.aliceBalance, this.state.bobBalance, this.state.nonce);
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
            console.log(chalk_1.default.green(`Transaction ${i + 1}: Alice → Bob (0.1 SOL)`));
            console.log(chalk_1.default.gray(`  Nonce: ${this.state.nonce}`));
            console.log(chalk_1.default.gray(`  Alice: ${(0, sdk_2.lamportsToSol)(this.state.aliceBalance)} SOL`));
            console.log(chalk_1.default.gray(`  Bob: ${(0, sdk_2.lamportsToSol)(this.state.bobBalance)} SOL`));
            // Add small delay for demo effect
            await this.delay(500);
        }
        console.log(chalk_1.default.green(`\n✅ Completed ${this.config.transactionCount} off-chain transactions!`));
        console.log(chalk_1.default.gray('Total saved: ~$0.50 in transaction fees (at $0.05 per transaction)'));
    }
    async closeChannel() {
        console.log(chalk_1.default.blue.bold('\n🔒 Closing payment channel...\n'));
        console.log(chalk_1.default.yellow('Step 3: Settling final balances on Solana blockchain...'));
        // Create final voucher
        const finalVoucher = this.solbolt.createVoucher(this.state.channelId, this.state.aliceBalance, this.state.bobBalance, this.state.nonce);
        // Sign with both parties
        const aliceSignature = finalVoucher.sign(this.state.alice.secretKey);
        const bobSignature = finalVoucher.sign(this.state.bob.secretKey);
        finalVoucher.addSignature(aliceSignature, true);
        finalVoucher.addSignature(bobSignature, false);
        console.log(chalk_1.default.green('✅ Channel closed successfully!'));
        console.log(chalk_1.default.gray(`Final balance - Alice: ${(0, sdk_2.lamportsToSol)(this.state.aliceBalance)} SOL, Bob: ${(0, sdk_2.lamportsToSol)(this.state.bobBalance)} SOL`));
    }
    async showSummary() {
        console.log(chalk_1.default.blue.bold('\n📊 Demo Summary\n'));
        const totalTransactions = this.state.transactions.length;
        const totalAmount = totalTransactions * 0.1;
        const savedFees = totalTransactions * 0.05; // Estimated $0.05 per transaction
        console.log(chalk_1.default.green('🎯 Results:'));
        console.log(chalk_1.default.white(`  • Total transactions: ${totalTransactions}`));
        console.log(chalk_1.default.white(`  • Total amount transferred: ${totalAmount} SOL`));
        console.log(chalk_1.default.white(`  • On-chain transactions: 2 (open + close)`));
        console.log(chalk_1.default.white(`  • Off-chain transactions: ${totalTransactions}`));
        console.log(chalk_1.default.white(`  • Estimated fees saved: $${savedFees.toFixed(2)}`));
        console.log(chalk_1.default.green('\n⚡ Benefits:'));
        console.log(chalk_1.default.white('  • Instant micropayments'));
        console.log(chalk_1.default.white('  • Dramatically reduced fees'));
        console.log(chalk_1.default.white('  • No network congestion'));
        console.log(chalk_1.default.white('  • Scalable microtransactions'));
        console.log(chalk_1.default.green('\n🔗 Next Steps:'));
        console.log(chalk_1.default.white('  • Integrate SolBolt into your dApp'));
        console.log(chalk_1.default.white('  • Use the TypeScript SDK'));
        console.log(chalk_1.default.white('  • Deploy to mainnet'));
        console.log(chalk_1.default.blue.bold('\n🚀 Thanks for trying SolBolt!\n'));
    }
    getRpcEndpoint(network) {
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
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.DemoRunner = DemoRunner;
//# sourceMappingURL=demo-runner.js.map