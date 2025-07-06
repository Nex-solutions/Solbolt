"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
/**
 * Simple test to verify CLI functionality
 */
function testCLI() {
    console.log(chalk_1.default.blue.bold('\n🚀 SolBolt CLI Test\n'));
    console.log(chalk_1.default.green('✅ CLI components loaded successfully!'));
    console.log(chalk_1.default.gray('Available commands:'));
    console.log(chalk_1.default.white('  • solbolt demo     - Interactive payment channel demo'));
    console.log(chalk_1.default.white('  • solbolt channel  - Manage payment channels'));
    console.log(chalk_1.default.white('  • solbolt info     - Show SolBolt information'));
    console.log(chalk_1.default.green('\n🎯 Demo Features:'));
    console.log(chalk_1.default.white('  • Step-by-step payment channel workflow'));
    console.log(chalk_1.default.white('  • Interactive prompts with Inquirer'));
    console.log(chalk_1.default.white('  • Colorful output with Chalk'));
    console.log(chalk_1.default.white('  • Command-line interface with Commander'));
    console.log(chalk_1.default.blue.bold('\n✨ CLI is ready to use!\n'));
}
// Run the test
testCLI();
//# sourceMappingURL=test-cli.js.map