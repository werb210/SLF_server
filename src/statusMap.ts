export function normalizeStatus(raw: string) {
  if (!raw) return "new";

  const s = raw.toLowerCase();

  if (s.includes("approved")) return "approved";
  if (s.includes("declined")) return "declined";
  if (s.includes("funded")) return "funded";
  if (s.includes("pending")) return "pending";
  if (s.includes("review")) return "under_review";

  return "new";
}
