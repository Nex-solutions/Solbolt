# SolBolt Deployment Guide

This guide covers deploying and using SolBolt on different Solana networks.

## 📋 Prerequisites

Before deploying, ensure you have:

- **Solana CLI** (v1.18+): [Installation Guide](https://docs.solana.com/cli/install-solana-cli-tools)
- **Anchor Framework** (v0.29+): [Installation Guide](https://www.anchor-lang.com/docs/installation)
- **Node.js** (v18+, v20+ recommended): [Download](https://nodejs.org/)
- **Rust** (v1.70+): [Installation Guide](https://rustup.rs/)

## 🔧 Smart Contract Deployment

### 1. Build the Program

```bash
cd program
cargo build
```

### 2. Generate Program ID

```bash
# Generate a new keypair for your program
solana-keygen new -o target/deploy/solbolt-keypair.json

# Get the program ID
solana-keygen pubkey target/deploy/solbolt-keypair.json
```

### 3. Update Program ID

Update the `declare_id!()` in `program/src/lib.rs` with your generated program ID:

```rust
declare_id!("YOUR_PROGRAM_ID_HERE");
```

### 4. Build for Deployment

```bash
# Build the program for deployment
anchor build

# The program will be built to target/deploy/solbolt.so
```

### 5. Deploy to Network

#### Devnet (Recommended for Testing)
```bash
# Set cluster to devnet
solana config set --url devnet

# Airdrop SOL for deployment
solana airdrop 2

# Deploy the program
solana program deploy target/deploy/solbolt.so
```

#### Testnet
```bash
# Set cluster to testnet
solana config set --url testnet

# Deploy the program
solana program deploy target/deploy/solbolt.so
```

#### Mainnet
```bash
# Set cluster to mainnet
solana config set --url mainnet-beta

# Deploy the program (ensure you have sufficient SOL)
solana program deploy target/deploy/solbolt.so
```

### 6. Verify Deployment

```bash
# Check program info
solana program show <PROGRAM_ID>

# Verify the program is deployed
solana program dump <PROGRAM_ID> program.so
```

## 📦 SDK Setup

### 1. Install SDK

```bash
# From the project root
npm install

# Or install SDK separately
cd sdk
npm install
npm run build
```

### 2. Configure SDK

```typescript
import { SolBolt } from '@solbolt/sdk';
import { Connection, Keypair } from '@solana/web3.js';

// Initialize SolBolt with your deployed program
const solbolt = new SolBolt({
  connection: new Connection('https://api.devnet.solana.com'),
  wallet: yourWallet,
  programId: 'YOUR_PROGRAM_ID_HERE', // Your deployed program ID
});
```

### 3. Basic Usage

```typescript
// Open a payment channel
const result = await solbolt.openChannel(partyBPublicKey, {
  initialDeposit: 1000000000, // 1 SOL in lamports
});

// Update channel state
const updateResult = await solbolt.updateChannel(channelId, {
  balanceA: 600000000,  // 0.6 SOL
  balanceB: 400000000,  // 0.4 SOL
  nonce: 1,
  signatureA: signatureA,
  signatureB: signatureB,
});

// Close channel
const closeResult = await solbolt.closeChannel(channelId, {
  balanceA: 600000000,
  balanceB: 400000000,
  nonce: 1,
  signatureA: signatureA,
  signatureB: signatureB,
});
```

## 🖥️ CLI Setup

### 1. Build CLI

```bash
cd cli
npm install
npm run build
```

### 2. Run CLI Commands

```bash
# Show help
node dist/index.js --help

# Run interactive demo
node dist/index.js demo

# Run demo on specific network
node dist/index.js demo --network devnet --transactions 10

# Show SolBolt information
node dist/index.js info

# Manage channels
node dist/index.js channel open --party <PUBLIC_KEY> --deposit 1
node dist/index.js channel status --channel <CHANNEL_ID>
node dist/index.js channel close --channel <CHANNEL_ID>
```

### 3. Install CLI Globally (Optional)

```bash
cd cli
npm install -g .

# Now you can use solbolt from anywhere
solbolt info
solbolt demo
solbolt channel open --party <PUBLIC_KEY> --deposit 1
```

## 🌐 Network Configuration

### Devnet (Recommended for Development)

```bash
# Solana CLI
solana config set --url devnet

# SDK Configuration
const connection = new Connection('https://api.devnet.solana.com');

# CLI Configuration
node dist/index.js demo --network devnet
```

### Testnet

```bash
# Solana CLI
solana config set --url testnet

# SDK Configuration
const connection = new Connection('https://api.testnet.solana.com');

# CLI Configuration
node dist/index.js demo --network testnet
```

### Mainnet

```bash
# Solana CLI
solana config set --url mainnet-beta

# SDK Configuration
const connection = new Connection('https://api.mainnet-beta.solana.com');

# CLI Configuration
node dist/index.js demo --network mainnet
```

## 🔐 Security Considerations

### 1. Key Management

- **Never commit private keys** to version control
- Use environment variables for sensitive data
- Consider using hardware wallets for mainnet

### 2. Program Upgrades

- Solana programs are immutable once deployed
- Plan your program carefully before mainnet deployment
- Test thoroughly on devnet/testnet first

### 3. Channel Security

- Verify all signatures before accepting channel updates
- Implement proper timeout mechanisms
- Monitor channel states regularly

## 🧪 Testing

### 1. Unit Tests

```bash
# Test smart contract
cd program
cargo test

# Test SDK
cd ../sdk
npm test

# Test CLI
cd ../cli
npm test
```

### 2. Integration Tests

```bash
# Run full integration test
npm run test:integration

# Test on devnet
npm run test:devnet
```

### 3. Manual Testing

```bash
# Run CLI demo
cd cli
node dist/index.js demo

# Test channel operations
node dist/index.js channel open --party <TEST_PUBLIC_KEY> --deposit 0.1
```

## 📊 Monitoring

### 1. Program Monitoring

```bash
# Monitor program logs
solana logs <PROGRAM_ID>

# Check program account
solana account <PROGRAM_ID>
```

### 2. Channel Monitoring

```typescript
// Monitor channel state changes
const channelState = await solbolt.getChannelState(channelId);
console.log('Channel state:', channelState);
```

### 3. Transaction Monitoring

```bash
# Monitor recent transactions
solana transaction-history <WALLET_ADDRESS>

# Check transaction status
solana confirm <TRANSACTION_SIGNATURE>
```

## 🚀 Production Checklist

Before deploying to mainnet:

- [ ] **Smart Contract**
  - [ ] All tests passing
  - [ ] Security audit completed
  - [ ] Program ID configured
  - [ ] Build successful

- [ ] **SDK**
  - [ ] All functions tested
  - [ ] Error handling implemented
  - [ ] TypeScript types complete
  - [ ] Documentation updated

- [ ] **CLI**
  - [ ] All commands working
  - [ ] Error handling robust
  - [ ] User experience polished
  - [ ] Help documentation complete

- [ ] **Deployment**
  - [ ] Devnet testing complete
  - [ ] Testnet validation done
  - [ ] Mainnet deployment tested
  - [ ] Monitoring setup ready

## 🆘 Troubleshooting

### Common Issues

1. **Program deployment fails**
   - Check SOL balance
   - Verify program ID is correct
   - Ensure build is successful

2. **SDK connection errors**
   - Verify RPC endpoint
   - Check network configuration
   - Ensure wallet is connected

3. **CLI command not found**
   - Build the CLI first: `npm run build`
   - Use full path: `node dist/index.js <command>`
   - Install globally: `npm install -g .`

4. **Channel operations fail**
   - Verify program ID in SDK
   - Check account permissions
   - Ensure sufficient SOL for fees

### Getting Help

- Check the [README](./README.md) for basic usage
- Review [examples](./examples/) for code samples
- Open an issue on GitHub for bugs
- Join our Discord for community support

## 📚 Additional Resources

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [SolBolt Examples](./examples/)

---

**Happy building with SolBolt! ⚡** 