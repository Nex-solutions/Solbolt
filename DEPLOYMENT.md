# Testnet Deployment Guide

This guide covers deploying SolBolt to Solana testnet for testing and development.

## Prerequisites

- Solana CLI 1.18+
- Anchor 0.29+
- Node.js 18+
- ~2 SOL on testnet for deployment

## Deployment Steps

### 1. Build the Program

```bash
cd program
anchor build
```

### 2. Get Program ID

```bash
solana address -k target/deploy/solbolt-keypair.json
```

Copy this program ID for the next step.

### 3. Update Program ID

Edit `program/src/lib.rs`:

```rust
declare_id!("YOUR_PROGRAM_ID_HERE");
```

Rebuild:

```bash
anchor build
```

### 4. Configure Testnet

```bash
# Set cluster
solana config set --url testnet

# Create or use existing wallet
solana-keygen new -o ~/testnet-deployer.json
solana config set --keypair ~/testnet-deployer.json

# Verify configuration
solana config get
```

### 5. Fund Your Wallet

**Option A: Web Faucet**
1. Visit https://faucet.solana.com/
2. Enter your wallet address: `solana address`
3. Select "Testnet"
4. Request 2 SOL

**Option B: CLI**
```bash
solana airdrop 2
```

Verify balance:
```bash
solana balance
```

### 6. Deploy to Testnet

```bash
anchor deploy --provider.cluster testnet
```

Save the deployment transaction signature.

### 7. Update SDK Configuration

Edit `sdk/src/solbolt.ts`:

```typescript
const TESTNET_PROGRAM_ID = new PublicKey('YOUR_DEPLOYED_PROGRAM_ID');

export class SolBolt {
  constructor(config: SolBoltConfig) {
    this.programId = config.programId || TESTNET_PROGRAM_ID;
    // ...
  }
}
```

### 8. Build SDK and CLI

```bash
# From project root
npm run build
```

### 9. Test Deployment

```bash
cd cli
node dist/index.js real-demo --network testnet
```

## Verification

### Check Program Status

```bash
# View program info
solana program show YOUR_PROGRAM_ID

# Check program account
solana account YOUR_PROGRAM_ID --output json
```

### Monitor Program Logs

```bash
solana logs YOUR_PROGRAM_ID
```

## Configuration

### Network Endpoints

The CLI supports multiple networks:

```bash
# Testnet
node dist/index.js real-demo --network testnet

# Devnet  
node dist/index.js real-demo --network devnet
```

### RPC Configuration

Default endpoints:
- Testnet: `https://api.testnet.solana.com`
- Devnet: `https://api.devnet.solana.com`

For custom RPC endpoints, update `cli/src/real-funds-demo.ts`:

```typescript
private getRpcEndpoint(network: string): string {
  if (network === 'testnet') {
    return process.env.TESTNET_RPC || 'https://api.testnet.solana.com';
  }
  // ...
}
```

## Testing

### Basic Testing

```bash
# Run with minimal deposit
cd cli
node dist/index.js real-demo --network testnet

# Use 0.1 SOL for initial tests
# Conduct 5-10 off-chain transactions
# Verify settlement works correctly
```

### Advanced Testing

Test different scenarios:
- Various deposit amounts
- Different transaction counts
- Multiple channels simultaneously
- Edge cases (minimum/maximum values)

## Troubleshooting

### Deployment Issues

**Airdrop rate limited**
```bash
# Wait 5-10 minutes between requests
# Or use web faucet at faucet.solana.com
```

**Insufficient funds**
```bash
# Check balance
solana balance

# Request more SOL
solana airdrop 2
```

**Build errors**
```bash
# Clean and rebuild
anchor clean
anchor build
```

### Runtime Issues

**Program not found**
```bash
# Verify program is deployed
solana program show YOUR_PROGRAM_ID

# Check you're on correct network
solana config get
```

**Transaction failures**
```bash
# Check recent logs
solana logs YOUR_PROGRAM_ID

# Verify account balances
solana balance
```

**RPC connection issues**
```bash
# Try alternative RPC endpoint
solana config set --url https://testnet.rpcpool.com
```

## Updating Deployment

To update the program:

```bash
# Make changes to program code
# Rebuild
anchor build

# Upgrade (preserves program ID)
anchor upgrade --provider.cluster testnet target/deploy/solbolt.so --program-id YOUR_PROGRAM_ID
```

## Monitoring

### Transaction History

```bash
# View wallet transactions
solana transaction-history YOUR_WALLET_ADDRESS

# Check specific transaction
solana confirm TRANSACTION_SIGNATURE -v
```

### Program Activity

```bash
# Watch program logs in real-time
solana logs YOUR_PROGRAM_ID

# View program data account
solana account YOUR_PROGRAM_ID
```

## Best Practices

### Development Workflow

1. Test thoroughly on devnet first
2. Deploy to testnet for broader testing
3. Monitor for issues
4. Iterate based on feedback
5. Prepare for mainnet after audit

### Testing Guidelines

- Start with small deposits (0.01-0.1 SOL)
- Test all operations (open, transact, close)
- Try error scenarios
- Monitor gas costs
- Document any issues

### Security During Testing

- Keep deployment keys secure
- Monitor program usage
- Track all transactions
- Back up important data
- Be responsive to issues

## Cleanup

To close the program and recover rent:

```bash
solana program close YOUR_PROGRAM_ID --bypass-warning
```

Note: This recovers rent but doesn't delete program data.

## Next Steps

After successful testnet deployment:

1. Conduct thorough testing
2. Gather user feedback
3. Implement remaining security features
4. Schedule security audit
5. Prepare mainnet deployment plan

## Resources

- [Solana Testnet Status](https://status.solana.com/)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana CLI Reference](https://docs.solana.com/cli)

## Support

For deployment issues:
- GitHub Issues: Technical problems
- Documentation: Check README and API docs
- Community: Discord/Telegram discussions

---

**Testnet is for testing. Deploy responsibly and monitor actively.**