const mongoose = require("mongoose");
const { Wallet } = require("../models/Wallet");
const { LedgerAccount } = require("../models/LedgerAccount");

require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

async function fixBalances() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // 1. Rename all BTC/ETH wallets to USDT
  const wallets = await Wallet.find({ currency: { $ne: "USDT" } });
  for (const w of wallets) {
    console.log(`Fixing wallet ${w._id} from ${w.currency} to USDT`);
    
    // Check if user already has a USDT wallet
    const usdtWallet = await Wallet.findOne({ userId: w.userId, currency: "USDT" });
    if (usdtWallet) {
      usdtWallet.availableBalance += w.availableBalance;
      usdtWallet.lockedBalance += w.lockedBalance;
      await usdtWallet.save();
      await Wallet.findByIdAndDelete(w._id);
    } else {
      w.currency = "USDT";
      await w.save();
    }
  }

  // 2. Fix Ledger accounts
  const accounts = await LedgerAccount.find({ currency: { $ne: "USDT" } });
  for (const acc of accounts) {
    console.log(`Fixing ledger account ${acc._id} from ${acc.currency} to USDT`);
    
    const existing = await LedgerAccount.findOne({ type: acc.type, referenceId: acc.referenceId, currency: "USDT" });
    if (existing) {
      // Just delete duplicate
      await LedgerAccount.findByIdAndDelete(acc._id);
    } else {
      acc.currency = "USDT";
      await acc.save();
    }
  }
  
  console.log("Done");
  process.exit(0);
}

fixBalances();
