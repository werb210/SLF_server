import { pool } from '../db';
import { BUSINESS_UNIT } from '../config/businessUnit';

export function calculateTier(closeRate: number): number {
  if (closeRate >= 0.35) return 0.025;
  if (closeRate >= 0.2) return 0.02;
  return 0.015;
}

export async function calculateCurrentCommission() {
  const totalSubmittedResult = await pool.query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM slf_deals WHERE business_unit = $1`,
    [BUSINESS_UNIT]
  );

  const totalFundedResult = await pool.query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM slf_deals WHERE business_unit = $1 AND stage = 'FUNDED'`,
    [BUSINESS_UNIT]
  );

  const fundedVolumeResult = await pool.query<{ funded_volume: string }>(
    `SELECT COALESCE(SUM(funded_amount),0)::text AS funded_volume FROM slf_deals WHERE business_unit = $1 AND stage = 'FUNDED'`,
    [BUSINESS_UNIT]
  );

  const totalSubmitted = totalSubmittedResult.rows[0]?.count ?? 0;
  const totalFunded = totalFundedResult.rows[0]?.count ?? 0;
  const fundedVolume = Number(fundedVolumeResult.rows[0]?.funded_volume ?? 0);

  const closeRate = totalSubmitted === 0 ? 0 : totalFunded / totalSubmitted;
  const tier = calculateTier(closeRate);
  const commissionAmount = fundedVolume * tier;

  return {
    totalSubmitted,
    totalFunded,
    closeRate,
    fundedVolume,
    tier,
    commissionAmount,
  };
}
