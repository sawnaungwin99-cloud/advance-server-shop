import { getInventoryPlanKey } from "@/lib/inventory-plan";
import { type Plan } from "@/lib/plans";

export function groupPlanSales(rows: { plan_key: string; sold: number | string }[]) {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const key = getInventoryPlanKey(row.plan_key);
    counts[key] = (counts[key] ?? 0) + Number(row.sold);
  }
  return counts;
}

export function getBestSellerKey(plans: Plan[], counts: Record<string, number>) {
  const featured = plans.find((plan) => plan.popular) ?? plans[0];
  if (!featured) return undefined;
  // Prefer the featured package on ties; only one package receives the badge.
  return plans.reduce((winner, plan) =>
    (counts[plan.key] ?? 0) > (counts[winner.key] ?? 0) ? plan : winner,
  featured).key;
}