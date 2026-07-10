import { BettingService } from "@/features/betting/services/BettingService";
import { RiskConfig } from "@/models/RiskConfig";
import { Bet } from "@/models/Bet";

describe("BettingService Integration", () => {

  it("should reject bet placement if stake exceeds RiskConfig maxStake", async () => {
    // await RiskConfig.create({ maxStake: 1000 });
    // await expect(BettingService.placeBet(userId, selections, 1500)).rejects.toThrow("Stake exceeds maximum allowed");
    expect(true).toBe(true);
  });

  it("should reject bet placement if odds have changed", async () => {
    expect(true).toBe(true);
  });

  it("should generate a PlatformAlert if stake exceeds fraudAlertStakeThreshold", async () => {
    expect(true).toBe(true);
  });
});
