import { PublicKey } from '@solana/web3.js';
import { ChannelState, ChannelConfig, ChannelResult, SolBoltConfig } from './types';
import { OffChainVoucher } from './voucher';
/**
 * Main SolBolt SDK class for payment channel operations
 */
export declare class SolBolt {
    private connection;
    private wallet;
    private program;
    private programId;
    constructor(config: SolBoltConfig);
    /**
     * Open a new payment channel with another party
     */
    openChannel(partyB: PublicKey, config: ChannelConfig): Promise<ChannelResult>;
    /**
     * Update channel state with a signed voucher
     */
    updateChannel(voucher: OffChainVoucher): Promise<ChannelResult>;
    /**
     * Close a payment channel cooperatively
     */
    closeChannel(voucher: OffChainVoucher): Promise<ChannelResult>;
    /**
     * Force close a channel after timeout
     */
    forceCloseChannel(channelId: PublicKey): Promise<ChannelResult>;
    /**
     * Get the current state of a channel
     */
    getChannelState(channelId: PublicKey): Promise<ChannelState | null>;
    /**
     * Create a new voucher for off-chain state update
     */
    createVoucher(channelId: PublicKey, balanceA: number, balanceB: number, nonce: number): OffChainVoucher;
    /**
     * Check if a channel has timed out
     */
    isChannelTimedOut(channelId: PublicKey): Promise<boolean>;
    /**
     * Get all channels for the current wallet
     */
    getMyChannels(): Promise<ChannelState[]>;
}
//# sourceMappingURL=solbolt.d.ts.map