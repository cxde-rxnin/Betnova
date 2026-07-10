# Disaster Recovery Plan

## 1. Database Outage / Data Corruption
**Scenario:** MongoDB cluster goes offline or data is corrupted.
**Response:**
1. **Immediate Action:** Flip the `globalBettingSuspended` switch to `true` in `/admin/risk` to stop all inbound financial liability.
2. If the DB is entirely unreachable, Vercel edge functions will begin failing. Update the Vercel Environment Variable `MAINTENANCE_MODE=true` to display a static 503 Maintenance page to users.
3. Restore the MongoDB cluster from the last automated hourly snapshot.
4. Run the `ReconciliationWorker` across ALL accounts to verify integrity post-restore.

## 2. Sports Data Provider Outage (The Odds API)
**Scenario:** The Odds API returns 500s or timeouts.
**Response:**
1. Live odds will stop updating. 
2. The `BettingService` will automatically reject bets if the cached odds are older than the `maxAge` threshold.
3. No manual action required for safety, but notify users via the Notification system that betting is temporarily paused due to upstream feed issues.

## 3. Blockchain Provider Outage
**Scenario:** External withdrawal processing provider is down.
**Response:**
1. Withdrawals will queue in `PENDING` status.
2. Add a Platform Notice alerting users to withdrawal delays.
3. Once the provider recovers, process the `PENDING` withdrawals manually or via the retry queue. DO NOT double-submit.
