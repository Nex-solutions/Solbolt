export declare class ChannelManager {
    private connection;
    private solbolt;
    private wallet;
    constructor();
    openChannel(partyBKey: string, depositAmount: number): Promise<void>;
    closeChannel(channelKey: string): Promise<void>;
    getChannelStatus(channelKey: string): Promise<void>;
    private isValidPublicKey;
}
//# sourceMappingURL=channel-manager.d.ts.map