import { PLANS, REQUIRED_ITEMS_MY, type Plan } from "@/lib/plans";

const dual = PLANS.find((p) => p.key === "dual-15000");
const ultimate = PLANS.find((p) => p.key === "ultimate-25000");

export const FLASH_PLANS: Plan[] = [
  {
    key: "dual-flash-8000",
    price: 8000,
    priceLabel: "8,000 MMK",
    titleMy: "DUAL SERVER ACCOUNT (SPECIAL PROMO)",
    nameMy: "Dual Server (Flash Sale)",
    nameEn: "Dual Server (Flash Sale)",
    isFlashSale: true,
    originalPrice: 15000,
    originalPriceLabel: "15,000 MMK",
    overview: dual?.overview ?? "",
    warning: dual?.warning ?? "",
    required: REQUIRED_ITEMS_MY,
    features: dual?.features ?? [],
  },
  {
    key: "ultimate-flash-15000",
    price: 15000,
    priceLabel: "15,000 MMK",
    titleMy: "ULTIMATE MULTI-SERVER (SPECIAL PROMO)",
    nameMy: "Ultimate Multi-Server (Flash Sale)",
    nameEn: "Ultimate Multi-Server (Flash Sale)",
    isFlashSale: true,
    originalPrice: 25000,
    originalPriceLabel: "25,000 MMK",
    overview: ultimate?.overview ?? "",
    warning: ultimate?.warning ?? "",
    required: REQUIRED_ITEMS_MY,
    features: ultimate?.features ?? [],
  },
];

export type Countdown = { days: number; hours: number; minutes: number; seconds: number; done: boolean };

export function countdownFrom(endsAt: string | null | undefined, now: number): Countdown {
  const end = endsAt ? new Date(endsAt).getTime() : 0;
  const diff = end - now;
  if (!end || diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: false,
  };
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
