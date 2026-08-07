import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "my" | "en";

type Dict = Record<string, { my: string; en: string }>;

export const dict: Dict = {
  brand: { my: "SNW ADVANCE SERVER SHOP", en: "SNW ADVANCE SERVER SHOP" },
  nav_shop: { my: "ဈေးဆိုင်", en: "Shop" },
  nav_orders: { my: "ကျွန်ုပ်၏ အော်ဒါများ", en: "My Orders" },
  nav_contact: { my: "ဆက်သွယ်ရန်", en: "Contact Us" },
  nav_admin: { my: "အက်ဒမင်", en: "Admin" },
  nav_login: { my: "ဝင်ရောက်ရန်", en: "Sign in" },
  nav_logout: { my: "ထွက်ရန်", en: "Sign out" },

  hero_title: { my: "Advance Server တွေကိုယုံကြည်စိတ်ချစွာလာရောက်ဝယ်ယူလို့ရပါပြီး", en: "Advance Server တွေကိုယုံကြည်စိတ်ချစွာလာရောက်ဝယ်ယူလို့ရပါပြီး" },
  hero_sub: {
    my: "အမျိုးအစားတွေကိုစိတ်ကြိုက်ရွေးချယ်ဝယ်ယူလို့ရပါပြီး Diamond တွေ Free ဂုံးဆင်ချင်သူတွေအတွက် မရှိမဖြစ်ဖောက်သင့်သော Advance Server တွေရနေပါပြီးဗျာ",
    en: "အမျိုးအစားတွေကိုစိတ်ကြိုက်ရွေးချယ်ဝယ်ယူလို့ရပါပြီး Diamond တွေ Free ဂုံးဆင်ချင်သူတွေအတွက် မရှိမဖြစ်ဖောက်သင့်သော Advance Server တွေရနေပါပြီးဗျာ",
  },
  hero_cta: { my: "Shop Now / အခုပဲ ဝယ်ယူပါ", en: "Shop Now / အခုပဲ ဝယ်ယူပါ" },

  gate_title: { my: "ဈေးဆိုင်ကိုကြည့်ရန် အကောင့်ဝင်ပါ", en: "Sign in to view the store" },
  gate_desc: {
    my: "Advance Server အကောင့်များကို ကြည့်ရှုဝယ်ယူရန် အကောင့်ဖွင့်ခြင်း (သို့) အကောင့်ဝင်ခြင်း ပြုလုပ်ပါ။",
    en: "Create an account or sign in to browse and buy Advance Server accounts.",
  },
  gate_cta: { my: "Sign Up / Login", en: "Sign Up / Login" },

  plans_title: { my: "ဈေးနှုန်း အစီအစဉ်များ", en: "Pricing Plans" },
  plans_sub: { my: "သင့်အတွက် သင့်တော်တဲ့ Plan ကို ရွေးချယ်လိုက်ပါ", en: "Choose the plan that fits you" },
  popular: { my: "အရောင်းရဆုံး", en: "Most Popular" },
  view_details: { my: "အသေးစိတ်ကြည့်မည် / View Details", en: "View Details / အသေးစိတ်ကြည့်မည်" },
  buy_now: { my: "အခုပဲဝယ်မည် / Buy Now", en: "Buy Now" },
  overview_label: { my: "အကောင့်အကြောင်းအရာ", en: "အကောင့်အကြောင်းအရာ (Overview)" },
  warning_label: { my: "အရေးကြီးမှတ်ချက်", en: "အရေးကြီးမှတ်ချက် (Warning)" },
  required_label: { my: "လိုအပ်သောအချက်အလက်များ", en: "လိုအပ်သောအချက်အလက်များ (Required Items)" },
  duration_label: { my: "ကြာချိန်", en: "ကြာချိန် (Duration)" },
  duration_value: { my: "၅ မိနစ်ခန့်", en: "၅ မိနစ်ခန့်" },

  checkout_title: { my: "အော်ဒါတင်ရန်", en: "Checkout" },
  f_name: { my: "အမည်အပြည့်အစုံထည့်ပါ", en: "အမည်အပြည့်အစုံထည့်ပါ" },
  f_phone: { my: "ဖုန်းနံပါတ်ထည့်ပါ", en: "ဖုန်းနံပါတ်ထည့်ပါ" },
  f_gmail: { my: "Advancer Server နဲ့ချိတ်ဆက်မယ့် Gmail ထည့်ပါ ( Gmail Password မလို)", en: "Advancer Server နဲ့ချိတ်ဆက်မယ့် Gmail ထည့်ပါ ( Gmail Password မလို)" },
  f_gmail_help: {
    my: "မှတ်ချက် အခုပို့မယ့် Gmail က Mlbb နဲ့ လုံးဝ(လုံးဝ) ချိတ်မထားတဲ့ Gmail ဖြစ်ဖို့အရေးကြီးပါတယ်",
    en: "မှတ်ချက် အခုပို့မယ့် Gmail က Mlbb နဲ့ လုံးဝ(လုံးဝ) ချိတ်မထားတဲ့ Gmail ဖြစ်ဖို့အရေးကြီးပါတယ်",
  },
  f_ign: { my: "Advance Server မှာထည့်ချင်တဲ့ Name ( နာမည် ) ထည့်ပါ", en: "Advance Server မှာထည့်ချင်တဲ့ Name ( နာမည် ) ထည့်ပါ" },
  f_telegram: { my: "Telegram Username ထည့်ပါ (ဥပမာ @username)", en: "Telegram Username (e.g. @username)" },
  f_receipt: { my: "ငွေလွှဲပြေစာ Screenshot တင်ပေးပါ", en: "Upload Payment Screenshot (ငွေလွှဲပြေစာ Screenshot တင်ပေးပါ)" },
  pay_title: { my: "ငွေပေးချေရန် အကောင့်များ", en: "Payment Accounts" },
  acc_name: { my: "အကောင့်အမည်", en: "Account Name" },
  copy: { my: "ကူးယူရန်", en: "Copy" },
  copied: { my: "ကူးယူပြီးပါပြီ", en: "Copied" },
  submit_order: { my: "အော်ဒါတင်မည်", en: "Submit Order" },
  submitting: { my: "ပို့နေသည်...", en: "Submitting..." },

  order_done_title: { my: "အော်ဒါ အောင်မြင်စွာ ပို့ပြီးပါပြီ", en: "Order submitted successfully" },
  order_done_desc: {
    my: "ကျွန်ုပ်တို့ အတည်ပြုပြီးပါက ချက်ချင်း ဆက်သွယ်ပေးပါမည်။ မြန်ဆန်စေရန် Telegram မှ ဆက်သွယ်နိုင်ပါသည်။",
    en: "We will contact you as soon as your payment is confirmed. For faster service, contact us on Telegram.",
  },
  telegram_cta: { my: "Admin ကို Telegram မှ ဆက်သွယ်ရန်", en: "Contact Admin on Telegram" },

  orders_title: { my: "ကျွန်ုပ်၏ အော်ဒါများ", en: "My Orders" },
  orders_empty: { my: "အော်ဒါ မရှိသေးပါ။", en: "No orders yet." },
  status: { my: "အခြေအနေ", en: "Status" },
  st_pending: { my: "စောင့်ဆိုင်းဆဲ", en: "Pending" },
  st_processing: { my: "ဆောင်ရွက်နေဆဲ", en: "Processing" },
  st_completed: { my: "ပြီးစီးပြီး", en: "Completed" },
  st_rejected: { my: "ငြင်းပယ်ထားသည်", en: "Rejected" },

  admin_title: { my: "အက်ဒမင် ဒက်ရှ်ဘုတ်", en: "Admin Dashboard" },
  admin_denied: { my: "သင့်တွင် အက်ဒမင်ခွင့်ပြုချက် မရှိပါ။", en: "You do not have admin access." },
  view_receipt: { my: "ပြေစာကြည့်ရန်", en: "View receipt" },

  auth_login: { my: "အကောင့်ဝင်ရန်", en: "Login" },
  auth_signup: { my: "အကောင့်ဖွင့်ရန်", en: "Sign Up" },
  email: { my: "အီးမေးလ်", en: "Email" },
  password: { my: "စကားဝှက်", en: "Password" },
  display_name: { my: "အမည်", en: "Name" },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: keyof typeof dict) => string };

const LangContext = createContext<Ctx>({ lang: "my", setLang: () => {}, t: (k) => dict[k]?.my ?? String(k) });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("my");

  useEffect(() => {
    const stored = window.localStorage.getItem("snw-lang");
    if (stored === "en" || stored === "my") setLangState(stored);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("snw-lang", l);
  }, []);

  const t = useCallback((k: keyof typeof dict) => dict[k]?.[lang] ?? String(k), [lang]);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
