import cron from 'node-cron';
import { pool } from '../db';
import { calculateCurrentCommission } from '../services/commission.service';

cron.schedule('0 0 1 * *', async () => {
  const summary = await calculateCurrentCommission();
  const month = new Date().toISOString().slice(0, 7);

  await pool.query(
    `INSERT INTO slf_monthly_commission_snapshots
    (month, total_submitted, total_funded, close_rate, tier_applied, funded_volume, commission_amount)
    VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      month,
      summary.totalSubmitted,
      summary.totalFunded,
      summary.closeRate,
      summary.tier,
      summary.fundedVolume,
      summary.commissionAmount,
    ]
  );
});
