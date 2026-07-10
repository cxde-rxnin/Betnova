# Operations Runbook

## Queue Stuck / Jobs Not Processing
**Symptom:** The `/admin/jobs` dashboard shows a continuously growing "Pending" list, and 0 "Processing".
**Action:**
1. Check the Liveness of the Worker Service.
2. If using `MongoQueueProvider`, ensure the `/api/cron/all` endpoint is being hit regularly by your external cron scheduler (e.g. Vercel Cron or UptimeRobot).
3. Check the Vercel/Server logs for the Cron endpoint to see if it is failing due to database connection limits.

## Reconciliation Discrepancy Alert
**Symptom:** A `CRITICAL` Platform Alert is generated saying "Wallet X mismatch! Expected: Y, Actual: Z".
**Action:**
1. DO NOT manually edit the wallet balance.
2. Go to MongoDB and query the `LedgerEntry` collection for all entries where `creditAccountId = Wallet._id` or `debitAccountId = Wallet._id`.
3. Sum the amounts manually.
4. If the Ledger is correct but the Wallet is wrong, a database transaction likely failed mid-flight. Update the Wallet `availableBalance` to match the Ledger sum. 
5. Add an `AuditLog` explaining the correction.

## Failed Bet Settlement
**Symptom:** A match finished hours ago, but bets remain in `PENDING` status.
**Action:**
1. Ensure the `SettlementWorker` is running.
2. Verify The Odds API is returning results for that specific `fixtureId`.
3. If The Odds API is missing the result, manually settle the bet via the Operations Dashboard (`/admin/finances`) -> "Manual Settle" using official sportsbook reference data.
