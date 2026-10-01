const DUAL_FLASH_PLAN_KEYS = new Set(["dual-flash-8000"]);
const ULTIMATE_FLASH_PLAN_KEYS = new Set(["ultimate-flash-15000"]);

export function getInventoryPlanKey(orderPlanKey: string): string {
  const normalized = orderPlanKey.trim().toLowerCase();
  const isFlashPlan = normalized.includes("flash");

  if (DUAL_FLASH_PLAN_KEYS.has(normalized) || (isFlashPlan && normalized.includes("dual"))) {
    return "dual-15000";
  }

  if (
    ULTIMATE_FLASH_PLAN_KEYS.has(normalized) ||
    (isFlashPlan && normalized.includes("ultimate"))
  ) {
    return "ultimate-25000";
  }

  return orderPlanKey;
}