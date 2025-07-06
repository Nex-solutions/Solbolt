interface DemoConfig {
    network: string;
    transactionCount: number;
}
export declare class DemoRunner {
    private config;
    private state;
    private connection;
    private solbolt;
    constructor(config: DemoConfig);
    run(): Promise<void>;
    private showWelcome;
    private setupParties;
    private openChannel;
    private conductOffChainTransactions;
    private closeChannel;
    private showSummary;
    private getRpcEndpoint;
    private delay;
}
export {};
//# sourceMappingURL=demo-runner.d.ts.map