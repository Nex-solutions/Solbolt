# SolBolt ⚡ (STILL ON DEVNET)

An open-source developer toolkit enabling off-chain payment channels on Solana — allowing two parties to conduct thousands of micropayments off-chain, then settle with a single on-chain transaction.

## 🚀 What is SolBolt?

SolBolt is inspired by Bitcoin's Lightning Network and enables:
- **Off-chain micropayments** with instant settlement
- **Dramatically reduced fees** by batching transactions
- **Scalable microtransactions** for use cases like tips, in-game purchases, and pay-per-click services
- **Single on-chain settlement** after hundreds of off-chain transactions

## ✅ Current Status

**All components are working and ready for use:**
- ✅ **Smart Contract**: Rust/Anchor program compiles successfully
- ✅ **TypeScript SDK**: Built and tested with full functionality
- ✅ **CLI Tool**: Interactive demo and channel management working
- ✅ **Examples**: Basic and advanced usage examples included

## 📁 Project Structure

```
solbolt/
├── program/          # Solana smart contract (Rust/Anchor)
│   ├── src/
│   │   ├── lib.rs              # Main program entry point
│   │   ├── state/mod.rs        # Payment channel state
│   │   ├── errors/mod.rs       # Custom error types
│   │   └── instructions/       # Instruction handlers
│   └── Cargo.toml              # Rust dependencies
├── sdk/             # TypeScript SDK for developers
│   ├── src/
│   │   ├── index.ts            # SDK exports
│   │   ├── solbolt.ts          # Main SDK class
│   │   ├── voucher.ts          # Off-chain voucher system
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── utils.ts            # Utility functions
│   └── package.json            # NPM package configuration
├── cli/             # Command-line demo tool
│   ├── src/
│   │   ├── index.ts            # CLI entry point
│   │   ├── demo-runner.ts      # Interactive demo
│   │   └── channel-manager.ts  # Channel management
│   └── package.json            # CLI dependencies
├── examples/        # Usage examples and tutorials
│   ├── basic-usage.ts          # Beginner-friendly example
│   ├── advanced-usage.ts       # Complex scenarios
│   └── README.md               # Examples documentation
└── tests/           # Test suite
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+ (20+ recommended for latest Solana packages)
- Rust 1.70+
- Solana CLI 1.18+
- Anchor Framework 0.29+

### Setup
```bash
# Clone the repository
git clone https://github.com/your-org/solbolt.git
cd solbolt

# Install all dependencies (SDK + CLI)
npm install

# Build everything
npm run build

# Build the smart contract
cd program
cargo build
```

## 🎯 Quick Start

### Using the CLI Demo
```bash
# Run the payment channel demo
cd cli
node dist/index.js demo

# Or with custom settings
node dist/index.js demo --network devnet --transactions 10

# Show available commands
node dist/index.js --help

# Show SolBolt information
node dist/index.js info
```

### Using the SDK
```typescript
import { SolBolt } from '@solbolt/sdk';

const solbolt = new SolBolt({
  connection: new Connection('https://api.devnet.solana.com'),
  wallet: yourWallet,
});

const result = await solbolt.openChannel(partyB, {
  initialDeposit: 1000000000, // 1 SOL in lamports
});
```

### Running Examples
```bash
# Basic usage example
npm run examples

# Advanced usage example
npm run examples:advanced
```

## 🔧 Development

### Available Scripts

```bash
# Installation
npm install                 # Install all dependencies

# Building
npm run build               # Build SDK and CLI
npm run build:sdk           # Build SDK only
npm run build:cli           # Build CLI only

# Testing
npm test                    # Run all tests
npm run test:sdk            # Test SDK only
npm run test:cli            # Test CLI only

# Development
npm run dev                 # Start dev mode for SDK + CLI
npm run dev:sdk             # Dev mode for SDK only
npm run dev:cli             # Dev mode for CLI only

# CLI Usage
cd cli
node dist/index.js demo     # Run interactive demo
node dist/index.js info     # Show SolBolt information
node dist/index.js channel  # Manage payment channels

# Examples
npm run examples            # Run basic usage example
npm run examples:advanced   # Run advanced usage example

# Utilities
npm run clean               # Clean all build artifacts
npm run format              # Format code with Prettier
npm run format:check        # Check code formatting
```

### Smart Contract
```bash
cd program
cargo build
cargo test
```

### SDK
```bash
npm run dev:sdk
npm run test:sdk
```

### CLI
```bash
npm run dev:cli
npm run test:cli
```

### All Components
```bash
# Build everything
npm run build

# Run all tests
npm test

# Development mode (SDK + CLI)
npm run dev
```

## 📚 Documentation

- [Smart Contract API](./program/README.md)
- [SDK Documentation](./sdk/README.md)
- [CLI Usage](./cli/README.md)
- [Examples](./examples/README.md)
- [Deployment Guide](./DEPLOYMENT.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- [Website](https://solbolt.dev)
- [Documentation](https://docs.solbolt.dev)
- [Discord](https://discord.gg/solbolt)
- [Twitter](https://twitter.com/solbolt) 
