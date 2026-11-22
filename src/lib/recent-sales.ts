import { getInventoryPlanKey } from "./inventory-plan";
import { PLANS } from "./plans";
import { FLASH_PLANS } from "./flash-sale";

export type RecentSale = { plan_key: string; purchased_at: string };
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function getRecentSales(rows: RecentSale[], now: number) {
  return rows.filter((row) => {
    const age = now - Date.parse(row.purchased_at);
    return Number.isFinite(age) && age >= 0 && age <= WEEK_MS &&
      PLANS.some((plan) => plan.key === getInventoryPlanKey(row.plan_key));
  }).sort((a, b) => Date.parse(b.purchased_at) - Date.parse(a.purchased_at)).slice(0, 10);
}

export function recentSalePlanName(key: string) {
  return PLANS.find((plan) => plan.key === getInventoryPlanKey(key))?.nameMy;
}

export function recentSaleTime(purchasedAt: string, now: number) {
  const minutes = Math.floor(Math.max(0, now - Date.parse(purchasedAt)) / 60_000);
  const number = (value: number) => value.toLocaleString("my-MM");
  if (minutes < 1) return "ယခုလေးတင်";
  if (minutes < 60) return `လွန်ခဲ့သော ${number(minutes)} မိနစ်က`;
  if (minutes < 1440) return `လွန်ခဲ့သော ${number(Math.floor(minutes / 60))} နာရီက`;
  return `လွန်ခဲ့သော ${number(Math.floor(minutes / 1440))} ရက်က`;
}
export function recentSalePrice(key: string) {
  return [...PLANS, ...FLASH_PLANS].find((plan) => plan.key === key)?.priceLabel;
}
