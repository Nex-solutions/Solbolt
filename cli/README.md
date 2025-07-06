# SolBolt CLI

A command-line interface for SolBolt payment channels, providing an interactive demo and channel management tools.

## 🚀 Features

- **Interactive Demo**: Step-by-step payment channel demonstration
- **Channel Management**: Open, close, and check channel status
- **Colorful Output**: Beautiful terminal interface with Chalk
- **User-Friendly**: Interactive prompts with Inquirer
- **Network Support**: Devnet, testnet, and localhost support

## 📦 Installation

```bash
# Install dependencies
npm install

# Build the CLI
npm run build

# Make it globally available (optional)
npm link
```

## 🎯 Usage

### Interactive Demo

Run the complete payment channel demo:

```bash
# Basic demo with default settings
solbolt demo

# Custom demo with specific network and transaction count
solbolt demo --network devnet --transactions 20
```

**Demo Features:**
- Generates test keypairs for Alice and Bob
- Opens a payment channel with configurable deposit
- Simulates multiple off-chain micropayments
- Shows real-time balance updates and nonce increments
- Closes the channel with final settlement
- Provides detailed summary with fee savings

### Channel Management

#### Open a Channel

```bash
solbolt channel open --party <PUBLIC_KEY> --deposit <AMOUNT>
```

Example:
```bash
solbolt channel open --party 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU --deposit 2.5
```

#### Check Channel Status

```bash
solbolt channel status --channel <CHANNEL_PUBLIC_KEY>
```

Example:
```bash
solbolt channel status --channel 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
```

#### Close a Channel

```bash
solbolt channel close --channel <CHANNEL_PUBLIC_KEY>
```

Example:
```bash
solbolt channel close --channel 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
```

### Information

Show SolBolt information and available commands:

```bash
solbolt info
```

## 🎨 Demo Walkthrough

When you run `solbolt demo`, you'll experience:

1. **Welcome Screen**: Introduction to payment channels
2. **Party Setup**: Generate Alice and Bob keypairs
3. **Channel Opening**: Create payment channel on Solana
4. **Off-Chain Transactions**: Simulate instant micropayments
5. **Channel Closing**: Settle final balances on-chain
6. **Summary**: Show total savings and benefits

### Example Demo Output

```
🚀 SolBolt Payment Channel Demo

Welcome to SolBolt! 🚀

This demo will show you how payment channels work:
1. Two parties open a payment channel
2. They conduct multiple off-chain transactions
3. They close the channel with a single on-chain settlement
4. Only 2 on-chain transactions total!

👥 Setting up parties...

Alice (Channel Opener):
  Public Key: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
  Private Key: 4f7c8b9a...

Bob (Channel Participant):
  Public Key: 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
  Private Key: 1a2b3c4d...

📺 Opening payment channel...

Step 1: Creating channel on Solana blockchain...
✅ Channel opened successfully!
Channel ID: 5xLmNpQrStUvWxYzA1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
Initial balance - Alice: 1.0 SOL, Bob: 0.0 SOL

💸 Conducting off-chain transactions...

Step 2: Simulating 10 off-chain micropayments...
These transactions happen instantly without blockchain fees!

Transaction 1: Alice → Bob (0.1 SOL)
  Nonce: 1
  Alice: 0.9 SOL
  Bob: 0.1 SOL

Transaction 2: Alice → Bob (0.1 SOL)
  Nonce: 2
  Alice: 0.8 SOL
  Bob: 0.2 SOL

...

🔒 Closing payment channel...

Step 3: Settling final balances on Solana blockchain...
✅ Channel closed successfully!
Final balance - Alice: 0.0 SOL, Bob: 1.0 SOL

📊 Demo Summary

🎯 Results:
  • Total transactions: 10
  • Total amount transferred: 1.0 SOL
  • On-chain transactions: 2 (open + close)
  • Off-chain transactions: 10
  • Estimated fees saved: $0.50

⚡ Benefits:
  • Instant micropayments
  • Dramatically reduced fees
  • No network congestion
  • Scalable microtransactions

🚀 Thanks for trying SolBolt!
```

## 🔧 Development

### Building

```bash
# Build TypeScript to JavaScript
npm run build

# Watch mode for development
npm run dev
```

### Testing

```bash
# Run tests
npm test

# Run specific test file
npm test -- demo-runner.test.ts
```

### Project Structure

```
cli/
├── src/
│   ├── index.ts          # Main CLI entry point
│   ├── demo-runner.ts    # Interactive demo logic
│   ├── channel-manager.ts # Channel management
│   └── test-cli.ts       # CLI test file
├── dist/                 # Compiled JavaScript
├── tests/                # Test files
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## 🌐 Network Support

The CLI supports multiple Solana networks:

- **devnet**: `https://api.devnet.solana.com` (default)
- **testnet**: `https://api.testnet.solana.com`
- **localhost**: `http://localhost:8899`

Use the `--network` flag to specify:

```bash
solbolt demo --network testnet
```

## 🔒 Security Notes

- The demo uses generated keypairs for demonstration purposes
- In production, use real wallets with proper key management
- Channel operations require signatures from both parties
- Always verify transaction details before confirming

## 📚 Related

- [SolBolt SDK](../sdk/) - TypeScript SDK for developers
- [SolBolt Program](../program/) - Solana smart contract
- [Examples](../examples/) - Usage examples and tutorials

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details. 