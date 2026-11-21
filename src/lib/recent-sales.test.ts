import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { getRecentSales, recentSalePlanName, recentSaleTime } from "./recent-sales";

const now = Date.parse("2026-11-21T04:35:00Z");
const sale = (age: number, key = "dual-15000") => ({
  plan_key: key, purchased_at: new Date(now - age).toISOString(),
});

describe("recent purchase feed", () => {
  test("keeps genuine recent times and rejects old, future and invalid dates", () => {
    const recent = sale(180_000);
    assert.deepEqual(getRecentSales([sale(8 * 86400_000), sale(-60_000), { ...recent, purchased_at: "invalid" }, recent], now), [recent]);
  });
  test("returns at most ten purchases newest first", () => {
    const rows = Array.from({ length: 12 }, (_, index) => sale(index * 60_000)).reverse();
    const result = getRecentSales(rows, now);
    assert.equal(result.length, 10);
    assert.deepEqual(result[0], sale(0));
    assert.deepEqual(result[9], sale(9 * 60_000));
  });
  test("sale packages use the matching regular package name", () => {
    assert.equal(recentSalePlanName("dual-flash-8000"), "Dual Server Account");
    assert.equal(recentSalePlanName("ultimate-flash-15000"), "Ultimate Multi-Server Account");
  });
  test("never substitutes a package for an unknown purchase", () => {
    assert.deepEqual(getRecentSales([sale(1000, "unknown")], now), []);
  });
  test("uses the real three-minute purchase age", () => {
    assert.equal(recentSaleTime(sale(180_000).purchased_at, now), "လွန်ခဲ့သော ၃ မိနစ်က");
    assert.equal(recentSaleTime(sale(2 * 86400_000).purchased_at, now), "လွန်ခဲ့သော ၂ ရက်က");
  });
});