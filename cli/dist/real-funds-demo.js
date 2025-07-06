"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealFundsDemo = void 0;
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const web3_js_1 = require("@solana/web3.js");
const sdk_1 = require("@solbolt/sdk");
const sdk_2 = require("@solbolt/sdk");
const bs58_1 = __importDefault(require("bs58"));
class RealFundsDemo {
    constructor(config) {
        this.config = config;
        this.state = {
            userWallet: web3_js_1.Keypair.generate(),
            bobWallet: web3_js_1.Keypair.generate(),
            userBalance: 0,
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
            wallet: this.state.userWallet,
        });
    }
    async run() {
        try {
            await this.showWelcome();
            await this.setupWallet();
            await this.checkBalance();
            await this.setupBob();
            await this.openChannel();
            await this.conductOffChainTransactions();
            await this.closeChannel();
            await this.showSummary();
        }
        catch (error) {
            console.error(chalk_1.default.red('Real funds demo failed:'), error);
        }
    }
    async showWelcome() {
        console.log(chalk_1.default.blue.bold('Welcome to SolBolt Real Funds Demo! 💰\n'));
        console.log(chalk_1.default.white('This demo will use REAL SOL from your wallet:'));
        console.log(chalk_1.default.gray('1. You will provide your private key'));
        console.log(chalk_1.default.gray('2. We will open a payment channel with real SOL'));
        console.log(chalk_1.default.gray('3. Conduct off-chain transactions'));
        console.log(chalk_1.default.gray('4. Close the channel and settle on-chain'));
        console.log(chalk_1.default.red('\n⚠️  WARNING: This will spend real SOL!'));
        console.log(chalk_1.default.red('   Make sure you understand the risks.\n'));
        const { proceed } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'proceed',
                message: 'Do you want to proceed with real funds?',
                default: false,
            },
        ]);
        if (!proceed) {
            console.log(chalk_1.default.yellow('Demo cancelled. Run "solbolt demo" for simulation instead.'));
            process.exit(0);
        }
    }
    async setupWallet() {
        console.log(chalk_1.default.blue.bold('\n🔑 Setting up your wallet...\n'));
        const { privateKeyInput } = await inquirer_1.default.prompt([
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
            let secretKey;
            try {
                // Try base58 first (common for Solana private keys)
                secretKey = bs58_1.default.decode(privateKeyInput);
            }
            catch {
                // If base58 fails, try hex
                try {
                    secretKey = Uint8Array.from(Buffer.from(privateKeyInput, 'hex'));
                }
                catch {
                    throw new Error('Invalid private key format. Please provide a valid base58 or hex string.');
                }
            }
            this.state.userWallet = web3_js_1.Keypair.fromSecretKey(secretKey);
            console.log(chalk_1.default.green('✅ Wallet loaded successfully!'));
            console.log(chalk_1.default.gray(`Public Key: ${this.state.userWallet.publicKey.toString()}`));
            // Update SolBolt with the real wallet
            this.solbolt = new sdk_1.SolBolt({
                connection: this.connection,
                wallet: this.state.userWallet,
            });
        }
        catch (error) {
            console.error(chalk_1.default.red('❌ Failed to load wallet:'), error);
            process.exit(1);
        }
    }
    async checkBalance() {
        console.log(chalk_1.default.blue.bold('\n💰 Checking wallet balance...\n'));
        try {
            const balance = await this.connection.getBalance(this.state.userWallet.publicKey);
            const balanceSol = (0, sdk_2.lamportsToSol)(balance);
            console.log(chalk_1.default.green(`Current balance: ${balanceSol} SOL`));
            if (balanceSol < this.config.depositAmount + 0.01) {
                console.error(chalk_1.default.red(`❌ Insufficient balance! You need at least ${this.config.depositAmount + 0.01} SOL`));
                console.log(chalk_1.default.yellow('Please fund your wallet and try again.'));
                process.exit(1);
            }
            console.log(chalk_1.default.green('✅ Sufficient balance for demo!'));
        }
        catch (error) {
            console.error(chalk_1.default.red('❌ Failed to check balance:'), error);
            process.exit(1);
        }
    }
    async setupBob() {
        console.log(chalk_1.default.blue.bold('\n👥 Setting up Party B (destination wallet)...\n'));
        const { useDemoWallet } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'useDemoWallet',
                message: 'Use a demo wallet for Party B? (or enter a real wallet address)',
                default: true,
            },
        ]);
        if (useDemoWallet) {
            // Generate a new keypair for Bob
            this.state.bobWallet = web3_js_1.Keypair.generate();
            console.log(chalk_1.default.green('Party B (Demo Wallet):'));
            console.log(chalk_1.default.gray(`  Public Key: ${this.state.bobWallet.publicKey.toString()}`));
            console.log(chalk_1.default.gray(`  Private Key: ${Buffer.from(this.state.bobWallet.secretKey).toString('hex')}`));
            console.log(chalk_1.default.yellow('\nNote: This is a demo wallet. In a real scenario, Party B would be another user.'));
        }
        else {
            const { partyBAddress } = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'partyBAddress',
                    message: 'Enter Party B wallet address:',
                    validate: (input) => {
                        try {
                            new web3_js_1.PublicKey(input);
                            return true;
                        }
                        catch {
                            return 'Please enter a valid Solana wallet address';
                        }
                    },
                },
            ]);
            // Create a placeholder keypair for the real wallet (we won't have the private key)
            this.state.bobWallet = {
                publicKey: new web3_js_1.PublicKey(partyBAddress),
                secretKey: new Uint8Array(64), // Placeholder
            };
            console.log(chalk_1.default.green('Party B (Real Wallet):'));
            console.log(chalk_1.default.gray(`  Public Key: ${this.state.bobWallet.publicKey.toString()}`));
            console.log(chalk_1.default.yellow('\nNote: You will need Party B to sign vouchers manually in a real scenario.'));
        }
        const { continueDemo } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'continueDemo',
                message: 'Continue with channel opening?',
                default: true,
            },
        ]);
        if (!continueDemo) {
            console.log(chalk_1.default.yellow('Demo cancelled.'));
            process.exit(0);
        }
    }
    async openChannel() {
        console.log(chalk_1.default.blue.bold('\n📺 Opening payment channel with real SOL...\n'));
        console.log(chalk_1.default.yellow('Step 1: Creating channel on Solana blockchain...'));
        console.log(chalk_1.default.gray(`Deposit amount: ${this.config.depositAmount} SOL`));
        console.log(chalk_1.default.gray(`Network: ${this.config.network}`));
        const { confirm } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: `Confirm opening channel with ${this.config.depositAmount} SOL deposit?`,
                default: false,
            },
        ]);
        if (!confirm) {
            console.log(chalk_1.default.yellow('Channel opening cancelled.'));
            process.exit(0);
        }
        try {
            const depositLamports = (0, sdk_2.solToLamports)(this.config.depositAmount);
            console.log(chalk_1.default.yellow('\nSending transaction to open channel...'));
            const result = await this.solbolt.openChannel(this.state.bobWallet.publicKey, {
                initialDeposit: depositLamports,
            });
            if (result.error) {
                console.error(chalk_1.default.red('❌ Failed to open channel:'), result.error);
                process.exit(1);
            }
            this.state.channelId = result.channelState?.channelId;
            this.state.userBalance = depositLamports;
            this.state.bobBalance = 0;
            console.log(chalk_1.default.green('✅ Channel opened successfully!'));
            console.log(chalk_1.default.gray(`Transaction: ${result.signature}`));
            console.log(chalk_1.default.gray(`Channel ID: ${this.state.channelId?.toString()}`));
            console.log(chalk_1.default.gray(`Initial balance - You: ${(0, sdk_2.lamportsToSol)(this.state.userBalance)} SOL, Bob: ${(0, sdk_2.lamportsToSol)(this.state.bobBalance)} SOL`));
        }
        catch (error) {
            console.error(chalk_1.default.red('❌ Failed to open channel:'), error);
            process.exit(1);
        }
    }
    async conductOffChainTransactions() {
        console.log(chalk_1.default.blue.bold('\n💸 Conducting off-chain transactions...\n'));
        console.log(chalk_1.default.yellow(`Step 2: Simulating ${this.config.transactionCount} off-chain micropayments...`));
        console.log(chalk_1.default.gray('These transactions happen instantly without blockchain fees!\n'));
        const paymentAmount = (0, sdk_2.solToLamports)(0.001); // 0.001 SOL per transaction
        for (let i = 0; i < this.config.transactionCount; i++) {
            this.state.nonce++;
            // Simulate you sending 0.001 SOL to Bob
            this.state.userBalance -= paymentAmount;
            this.state.bobBalance += paymentAmount;
            // Create and sign voucher
            const voucher = this.solbolt.createVoucher(this.state.channelId, this.state.userBalance, this.state.bobBalance, this.state.nonce);
            // Sign with both parties
            const userSignature = voucher.sign(this.state.userWallet.secretKey);
            // For demo wallet, we can sign. For real wallet, we simulate the signature
            let bobSignature;
            if (this.state.bobWallet.secretKey.length === 64 && this.state.bobWallet.secretKey.some(byte => byte !== 0)) {
                // Demo wallet - we have the private key
                bobSignature = voucher.sign(this.state.bobWallet.secretKey);
            }
            else {
                // Real wallet - simulate signature (in real scenario, Party B would sign)
                bobSignature = new Uint8Array(64); // Placeholder signature
                console.log(chalk_1.default.yellow(`  Note: Party B signature simulated. In real scenario, Party B would sign this voucher.`));
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
            console.log(chalk_1.default.green(`Transaction ${i + 1}: You → Bob (0.001 SOL)`));
            console.log(chalk_1.default.gray(`  Nonce: ${this.state.nonce}`));
            console.log(chalk_1.default.gray(`  You: ${(0, sdk_2.lamportsToSol)(this.state.userBalance)} SOL`));
            console.log(chalk_1.default.gray(`  Bob: ${(0, sdk_2.lamportsToSol)(this.state.bobBalance)} SOL`));
            // Add small delay for demo effect
            await this.delay(500);
        }
        console.log(chalk_1.default.green(`\n✅ Completed ${this.config.transactionCount} off-chain transactions!`));
        console.log(chalk_1.default.gray('Total saved: ~$0.25 in transaction fees (at $0.05 per transaction)'));
    }
    async closeChannel() {
        console.log(chalk_1.default.blue.bold('\n🔒 Closing payment channel...\n'));
        console.log(chalk_1.default.yellow('Step 3: Settling final balances on Solana blockchain...'));
        const { confirm } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Confirm closing the channel and settling balances?',
                default: true,
            },
        ]);
        if (!confirm) {
            console.log(chalk_1.default.yellow('Channel closing cancelled.'));
            console.log(chalk_1.default.yellow('Note: Your funds are still locked in the channel.'));
            process.exit(0);
        }
        try {
            // Create final voucher
            const finalVoucher = this.solbolt.createVoucher(this.state.channelId, this.state.userBalance, this.state.bobBalance, this.state.nonce);
            // Sign with both parties
            const userSignature = finalVoucher.sign(this.state.userWallet.secretKey);
            // For demo wallet, we can sign. For real wallet, we simulate the signature
            let bobSignature;
            if (this.state.bobWallet.secretKey.length === 64 && this.state.bobWallet.secretKey.some(byte => byte !== 0)) {
                // Demo wallet - we have the private key
                bobSignature = finalVoucher.sign(this.state.bobWallet.secretKey);
            }
            else {
                // Real wallet - simulate signature (in real scenario, Party B would sign)
                bobSignature = new Uint8Array(64); // Placeholder signature
                console.log(chalk_1.default.yellow(`  Note: Party B signature simulated. In real scenario, Party B would sign this voucher.`));
            }
            finalVoucher.addSignature(userSignature, true);
            finalVoucher.addSignature(bobSignature, false);
            console.log(chalk_1.default.yellow('\nSending transaction to close channel...'));
            const result = await this.solbolt.closeChannel(finalVoucher);
            if (result.error) {
                console.error(chalk_1.default.red('❌ Failed to close channel:'), result.error);
                process.exit(1);
            }
            console.log(chalk_1.default.green('✅ Channel closed successfully!'));
            console.log(chalk_1.default.gray(`Transaction: ${result.signature}`));
            console.log(chalk_1.default.gray(`Final balance - You: ${(0, sdk_2.lamportsToSol)(this.state.userBalance)} SOL, Bob: ${(0, sdk_2.lamportsToSol)(this.state.bobBalance)} SOL`));
        }
        catch (error) {
            console.error(chalk_1.default.red('❌ Failed to close channel:'), error);
            process.exit(1);
        }
    }
    async showSummary() {
        console.log(chalk_1.default.blue.bold('\n📊 Real Funds Demo Summary\n'));
        const totalTransactions = this.state.transactions.length;
        const totalAmount = totalTransactions * 0.001;
        const savedFees = totalTransactions * 0.05; // Estimated $0.05 per transaction
        console.log(chalk_1.default.green('🎯 Results:'));
        console.log(chalk_1.default.white(`  • Total transactions: ${totalTransactions}`));
        console.log(chalk_1.default.white(`  • Total amount transferred: ${totalAmount} SOL`));
        console.log(chalk_1.default.white(`  • On-chain transactions: 2 (open + close)`));
        console.log(chalk_1.default.white(`  • Off-chain transactions: ${totalTransactions}`));
        console.log(chalk_1.default.white(`  • Estimated fees saved: $${savedFees.toFixed(2)}`));
        console.log(chalk_1.default.green('\n💰 Cost Breakdown:'));
        console.log(chalk_1.default.white(`  • Channel deposit: ${this.config.depositAmount} SOL`));
        console.log(chalk_1.default.white(`  • Transferred to Bob: ${totalAmount} SOL`));
        console.log(chalk_1.default.white(`  • Transaction fees: ~0.001 SOL (2 on-chain tx)`));
        console.log(chalk_1.default.white(`  • Net cost: ~${(this.config.depositAmount - totalAmount + 0.001).toFixed(4)} SOL`));
        console.log(chalk_1.default.green('\n⚡ Benefits Demonstrated:'));
        console.log(chalk_1.default.white('  • Instant micropayments'));
        console.log(chalk_1.default.white('  • Dramatically reduced fees'));
        console.log(chalk_1.default.white('  • No network congestion'));
        console.log(chalk_1.default.white('  • Scalable microtransactions'));
        console.log(chalk_1.default.blue.bold('\n🚀 Thanks for testing SolBolt with real funds!\n'));
    }
    getRpcEndpoint(network) {
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
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.RealFundsDemo = RealFundsDemo;
//# sourceMappingURL=real-funds-demo.js.map