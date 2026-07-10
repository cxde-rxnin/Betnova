import { WalletService } from "../services/WalletService";

export class MockBlockchainProvider {
  /**
   * Simulates the blockchain network confirming a deposit.
   * For the MVP/development phase, we automatically approve pending deposits after a delay.
   */
  static async simulateDepositConfirmation(transactionId: string) {
    // Wait for a simulated 5 seconds block time
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    try {
      await WalletService.processDeposit(transactionId);
      console.log(`[MOCK BLOCKCHAIN] Deposit ${transactionId} confirmed and ledger updated.`);
    } catch (e) {
      console.error(`[MOCK BLOCKCHAIN] Failed to process deposit ${transactionId}`, e);
    }
  }

  /**
   * Simulates an admin processing a withdrawal and broadcasting it.
   */
  static async simulateWithdrawalProcessing(transactionId: string) {
    await new Promise(resolve => setTimeout(resolve, 8000));
    // In reality, this would transition from PENDING -> PROCESSING -> COMPLETED
    // And would unlock the funds from clearing and send them out.
    console.log(`[MOCK BLOCKCHAIN] Withdrawal ${transactionId} broadcasted to network.`);
  }
}
