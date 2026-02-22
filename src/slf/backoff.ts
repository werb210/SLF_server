export function calculateBackoff(failures: number): number {
  const base = 60_000; // 1 minute
  const max = 15 * 60_000; // 15 minutes cap
  return Math.min(base * Math.pow(2, failures), max);
}
