#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { DemoRunner } from './demo-runner';
import { ChannelManager } from './channel-manager';
import { RealFundsDemo } from './real-funds-demo';

const program = new Command();

// Set up program information
program
    .name('solbolt')
    .description('SolBolt - Off-chain payment channels for Solana')
    .version('0.1.0')
    .addHelpCommand();

// Add commands
program
  .command('demo')
  .description('Run the interactive payment channel demo (simulation)')
  .option('-n, --network <network>', 'Network to use (devnet, testnet, localhost)', 'devnet')
  .option('-t, --transactions <number>', 'Number of transactions to simulate', '10')
  .action(async (options) => {
    console.log(chalk.blue.bold('\n🚀 SolBolt Payment Channel Demo (Simulation)\n'));
    
    const demo = new DemoRunner({
      network: options.network,
      transactionCount: parseInt(options.transactions),
    });
    
    await demo.run();
  });

program
  .command('real-demo')
  .description('Run the payment channel demo with real funds (requires private key)')
  .option('-n, --network <network>', 'Network to use (devnet, testnet, mainnet)', 'devnet')
  .option('-t, --transactions <number>', 'Number of transactions to simulate', '5')
  .option('-d, --deposit <amount>', 'Initial deposit in SOL', '0.01')
  .action(async (options) => {
    console.log(chalk.blue.bold('\n💰 SolBolt Real Funds Demo\n'));
    console.log(chalk.yellow('⚠️  WARNING: This will use real SOL from your wallet!\n'));
    
    const demo = new RealFundsDemo({
      network: options.network,
      transactionCount: parseInt(options.transactions),
      depositAmount: parseFloat(options.deposit),
    });
    
    await demo.run();
  });

program
  .command('channel')
  .description('Manage payment channels')
  .addCommand(
    new Command('open')
      .description('Open a new payment channel')
      .option('-p, --party <publicKey>', 'Party B public key')
      .option('-d, --deposit <amount>', 'Initial deposit in SOL', '1')
      .action(async (options) => {
        const manager = new ChannelManager();
        await manager.openChannel(options.party, parseFloat(options.deposit));
      })
  )
  .addCommand(
    new Command('close')
      .description('Close a payment channel')
      .option('-c, --channel <publicKey>', 'Channel public key')
      .action(async (options) => {
        const manager = new ChannelManager();
        await manager.closeChannel(options.channel);
      })
  )
  .addCommand(
    new Command('status')
      .description('Check channel status')
      .option('-c, --channel <publicKey>', 'Channel public key')
      .action(async (options) => {
        const manager = new ChannelManager();
        await manager.getChannelStatus(options.channel);
      })
  );

program
  .command('info')
  .description('Show SolBolt information')
  .action(() => {
    console.log(chalk.blue.bold('\n⚡ SolBolt - Lightning Network for Solana\n'));
    console.log(chalk.green('Features:'));
    console.log('  • Off-chain micropayments');
    console.log('  • Instant transaction settlement');
    console.log('  • Dramatically reduced fees');
    console.log('  • Scalable microtransactions');
    console.log('\n' + chalk.yellow('Use Cases:'));
    console.log('  • Micro-tips and donations');
    console.log('  • In-game purchases');
    console.log('  • Pay-per-click services');
    console.log('  • Content monetization');
    console.log('\n' + chalk.cyan('Commands:'));
    console.log('  solbolt demo     - Run interactive demo');
    console.log('  solbolt channel  - Manage payment channels');
    console.log('  solbolt info     - Show this information');
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red('Error: Unknown command'));
  program.help();
});

// Parse arguments
program.parse(); 