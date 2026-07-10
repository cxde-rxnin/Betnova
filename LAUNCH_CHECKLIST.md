# Betnova Launch Checklist

## Security & Access
- [ ] NextAuth secrets are randomly generated and securely stored.
- [ ] `CRON_SECRET` is configured and restricted.
- [ ] Default `SUPER_ADMIN` account password has been changed.
- [ ] Database credentials (MongoDB URI) are using a dedicated production user with restricted network access (IP Whitelisting).
- [ ] Rate Limiters are enabled in `middleware.ts`.

## Financial Safety
- [ ] `RiskConfig` has realistic `minStake`, `maxStake`, and `maxPayout` limits set.
- [ ] `fraudAlertStakeThreshold` is configured to catch unusually large bets.
- [ ] Double-entry `LedgerService` unit tests are passing.
- [ ] System Accounts (e.g. `SETTLEMENT`, `DEPOSIT_CLEARING`) have been seeded in the production database.

## Operations
- [ ] A Cron scheduler (like Vercel Cron) is actively pinging `/api/cron/all` every minute.
- [ ] `ReconciliationWorker` is scheduled to run at least once every 24 hours.
- [ ] Datadog / Sentry / Logging platform is actively receiving stdout JSON logs from the Next.js server.
- [ ] The `RUNBOOK.md` has been shared with the Operations team.

## Infrastructure
- [ ] Domain DNS is properly pointing to the production deployment.
- [ ] SSL/HTTPS is enforced.
- [ ] Database automated backups are enabled with at least a 7-day retention period.
