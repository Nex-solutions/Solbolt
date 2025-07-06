interface RealFundsDemoConfig {
    network: string;
    transactionCount: number;
    depositAmount: number;
}
export declare class RealFundsDemo {
    private config;
    private state;
    private connection;
    private solbolt;
    constructor(config: RealFundsDemoConfig);
    run(): Promise<void>;
    private showWelcome;
    private setupWallet;
    private checkBalance;
    private setupBob;
    private openChannel;
    private conductOffChainTransactions;
    private closeChannel;
    private showSummary;
    private getRpcEndpoint;
    private delay;
}
export {};
//# sourceMappingURL=real-funds-demo.d.ts.map