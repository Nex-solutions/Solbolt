# SolBolt Examples

This directory contains practical examples demonstrating how to use SolBolt payment channels in various scenarios.

## 📁 Examples Overview

### 1. Basic Usage (`basic-usage.ts`)
**Perfect for beginners** - Shows the fundamental workflow:
- Opening a payment channel
- Conducting off-chain transactions
- Closing the channel cooperatively

**Key Concepts:**
- Simple two-party channel setup
- Basic voucher creation and signing
- Error handling
- Transaction flow

### 2. Advanced Usage (`advanced-usage.ts`)
**For experienced developers** - Demonstrates complex scenarios:
- Multiple channel management
- Batch transaction processing
- Timeout monitoring and force closing
- Error recovery strategies

**Key Concepts:**
- Channel state monitoring
- Force close after timeout
- Multiple channel coordination
- Advanced error handling

## 🚀 Getting Started

### Prerequisites
```bash
# Install dependencies
npm install

# Build the SDK
cd ../sdk && npm run build

# Return to examples
cd ../examples
```

### Running Examples

#### Basic Usage Example
```bash
# Run with ts-node
npx ts-node basic-usage.ts

# Or compile and run
npx tsc basic-usage.ts
node basic-usage.js
```

#### Advanced Usage Example
```bash
# Run with ts-node
npx ts-node advanced-usage.ts

# Or compile and run
npx tsc advanced-usage.ts
node advanced-usage.js
```

## 📖 Example Walkthroughs

### Basic Usage Walkthrough

1. **Setup**: Initialize connection and generate keypairs
2. **Open Channel**: Create payment channel with 1 SOL deposit
3. **Off-Chain Transactions**: Conduct 3 micropayments of 0.1 SOL each
4. **Close Channel**: Settle final balances on-chain

**Expected Output:**
```
🚀 SolBolt Basic Usage Example

Generated keypairs:
Alice: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
Bob: 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM

📺 Step 1: Opening payment channel...
✅ Channel opened successfully!
Channel ID: 5xLmNpQrStUvWxYzA1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

💸 Step 2: Conducting off-chain transactions...
Transaction 1: Alice → Bob (0.1 SOL)
  Alice: 0.9 SOL
  Bob: 0.1 SOL
  Nonce: 1

Transaction 2: Alice → Bob (0.1 SOL)
  Alice: 0.8 SOL
  Bob: 0.2 SOL
  Nonce: 2

Transaction 3: Alice → Bob (0.1 SOL)
  Alice: 0.7 SOL
  Bob: 0.3 SOL
  Nonce: 3

🔒 Step 3: Closing payment channel...
✅ Channel closed successfully!

📊 Summary:
Total transactions: 3
Total amount transferred: 0.3 SOL
On-chain transactions: 2 (open + close)
Off-chain transactions: 3
Final balance - Alice: 0.7 SOL
Final balance - Bob: 0.3 SOL
```

### Advanced Usage Walkthrough

1. **Multi-Channel Setup**: Open 3 payment channels simultaneously
2. **Batch Transactions**: Process multiple transactions across channels
3. **Timeout Monitoring**: Check for channels that need force closing
4. **Channel Management**: Close all channels cooperatively

**Key Features Demonstrated:**
- Channel state tracking
- Error recovery
- Batch operations
- Timeout handling

## 🔧 Customization

### Modifying Examples

#### Change Network
```typescript
// Use testnet instead of devnet
const connection = new Connection('https://api.testnet.solana.com');
```

#### Adjust Transaction Count
```typescript
// Conduct more transactions
for (let i = 0; i < 10; i++) { // Changed from 3 to 10
  // ... transaction logic
}
```

#### Modify Deposit Amount
```typescript
// Use different deposit amounts
const initialDeposit = solToLamports(2.5); // Changed from 1 to 2.5
```

### Adding Your Own Examples

1. **Create new file**: `my-example.ts`
2. **Import dependencies**:
```typescript
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { SolBolt } from '@solbolt/sdk';
import { lamportsToSol, solToLamports } from '@solbolt/sdk';
```

3. **Follow the pattern**:
```typescript
async function myExample() {
  // Setup
  const connection = new Connection('https://api.devnet.solana.com');
  const wallet = Keypair.generate();
  const solbolt = new SolBolt({ connection, wallet });
  
  // Your logic here
  // ...
}

myExample().catch(console.error);
```

## 🛠️ Development Tips

### Error Handling
```typescript
try {
  const result = await solbolt.openChannel(partyB, { initialDeposit });
  if (result.error) {
    console.error('Channel opening failed:', result.error);
    return;
  }
} catch (error) {
  console.error('Unexpected error:', error);
}
```

### Voucher Management
```typescript
// Create voucher
const voucher = solbolt.createVoucher(channelId, balanceA, balanceB, nonce);

// Sign voucher
const signature = voucher.sign(privateKey);
voucher.addSignature(signature, isPartyA);

// Verify voucher
if (voucher.isFullySigned()) {
  // Ready for on-chain update
}
```

### Channel State Monitoring
```typescript
// Check if channel is open
const state = await solbolt.getChannelState(channelId);
if (state && state.isOpen) {
  // Channel is active
}

// Check for timeout
const isTimedOut = await solbolt.isChannelTimedOut(channelId);
if (isTimedOut) {
  // Can force close
}
```

## 🔒 Security Considerations

### Production Usage
- **Never use generated keypairs** in production
- **Use real wallets** with proper key management
- **Verify all transactions** before signing
- **Implement proper error handling**
- **Monitor channel timeouts**

### Testing
- **Use devnet** for testing
- **Start with small amounts**
- **Test error scenarios**
- **Validate all signatures**

## 📚 Related Documentation

- [SolBolt SDK Documentation](../sdk/README.md)
- [Smart Contract Documentation](../program/README.md)
- [CLI Tool Documentation](../cli/README.md)
- [Main Project README](../README.md)

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Add your example**
4. **Update this README**
5. **Submit a pull request**

### Example Guidelines
- **Clear comments** explaining each step
- **Error handling** for all operations
- **Realistic scenarios** that developers might encounter
- **Comprehensive documentation** in the code

## 📄 License

MIT License - see [LICENSE](../../LICENSE) for details. 