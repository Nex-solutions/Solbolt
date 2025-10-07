# SolBolt ⚡ (STILL ON TESTNET)

A payment channel implementation for Solana enabling off-chain micropayments with on-chain settlement, inspired by Bitcoin's Lightning Network.

## Overview

SolBolt provides a developer toolkit for building payment channels on Solana, allowing two parties to conduct numerous off-chain transactions and settle with a single on-chain transaction.

**Current Status:** Active development - Testnet deployment

## Features

- **Off-chain transactions** - Instant micropayments without blockchain fees
- **Cryptographic vouchers** - Secure state updates signed by both parties
- **Single settlement** - Batch hundreds of transactions into one on-chain close
- **TypeScript SDK** - Easy integration for developers
- **CLI tools** - Interactive testing and management

## Architecture

```
solbolt/
├── program/          # Solana smart contract (Rust/Anchor)
│   ├── src/
│   │   ├── lib.rs              # Program entry point
│   │   ├── state/              # Channel state management
│   │   ├── instructions/       # Open/close operations
│   │   └── errors/             # Error definitions
├── sdk/             # TypeScript SDK
│   ├── src/
│   │   ├── solbolt.ts         # Main SDK class
│   │   ├── voucher.ts         # Off-chain voucher system
│   │   └── utils/             # Helper functions
├── cli/             # Command-line interface
└── examples/        # Usage examples
```

## Quick Start

### Prerequisites
- Node.js 18+
- Rust 1.70+
- Solana CLI 1.18+
- Anchor 0.29+

### Installation

```bash
git clone https://github.com/yourusername/solbolt.git
cd solbolt
npm install
npm run build
```

### Run Demo

```bash
cd cli
npm run build
node dist/index.js real-demo
```

## Usage

### Opening a Channel

```typescript
import { SolBolt } from '@solbolt/sdk';
import { Connection, Keypair } from '@solana/web3.js';

const solbolt = new SolBolt({
  connection: new Connection('https://api.devnet.solana.com'),
  wallet: yourKeypair,
});

const result = await solbolt.openChannel(
  yourKeypair,
  counterpartyPublicKey,
  {
    initialDeposit: 1_000_000_000, // 1 SOL in lamports
  }
);
```

### Creating Off-Chain Vouchers

```typescript
const voucher = solbolt.createVoucher(
  channelId,
  newBalanceA,
  newBalanceB,
  nonce
);

const signature = voucher.sign(yourKeypair.secretKey);
voucher.addSignature(signature, true);
```

### Closing a Channel

```typescript
const result = await solbolt.closeChannel(
  finalVoucher,
  yourKeypair,
  counterpartyPublicKey
);
```

## Development Roadmap

### Current Phase - Core Protocol
- [x] Basic channel open/close
- [x] Off-chain voucher system
- [x] TypeScript SDK
- [x] CLI demo tool
- [ ] On-chain nonce verification
- [ ] Signature verification
- [ ] Dispute resolution mechanism
- [ ] Timeout protection

### Next Phase - Production Features
- [ ] Challenge period implementation
- [ ] Unidirectional channels
- [ ] Partial withdrawals
- [ ] Watchtower protocol
- [ ] Security audit
- [ ] Mainnet deployment

## Security Considerations

SolBolt is under active development. The following security features are being implemented:

- **State verification** - On-chain validation of state updates
- **Dispute resolution** - Challenge period for contested closures
- **Timeout mechanisms** - Protection against unresponsive counterparties
- **Signature verification** - Cryptographic proof of authorization

See [SECURITY.md](./SECURITY.md) for current implementation status.

## Testing

```bash
# Run tests
npm test

# Test on devnet
cd cli
node dist/index.js demo --network devnet

# Test with real funds (testnet)
node dist/index.js real-demo --network testnet
```

## Deployment

For testnet deployment instructions, see [README.md](./README.md).

Mainnet deployment will be available after security audit completion.

## Use Cases

- **Micropayments** - Sub-cent transactions for content, APIs, gaming
- **Streaming payments** - Pay-per-second for video, music, or services
- **Gaming** - Instant in-game transactions without network delays
- **IoT payments** - Machine-to-machine micropayments
- **Subscription services** - Fine-grained billing without overhead

## Performance

- **Throughput** - Unlimited off-chain transactions per second
- **Latency** - Instant voucher signing (~10ms)
- **Fees** - Only 2 on-chain transactions (open + close)
- **Scalability** - Independent of blockchain congestion

## Contributing

Contributions welcome! Areas of focus:

- Security enhancements
- Protocol improvements
- SDK features
- Documentation
- Testing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Documentation

- [API Documentation](./docs/API.md)
- [Security Status](./SECURITY.md)
- [Deployment Guide](./README.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)

## Community

- GitHub Issues: Bug reports and feature requests
- Discussions: Protocol design and improvements
- Twitter: [@solbolt](https://twitter.com/solbolt)

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

Inspired by Bitcoin's Lightning Network and Ethereum state channels. Built with Anchor framework and Solana's high-performance blockchain.

---

**Building the future of instant, low-cost payments on Solana.**