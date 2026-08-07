export type Plan = {
  key: string;
  price: number;
  priceLabel: string;
  titleMy: string;
  nameMy: string;
  nameEn: string;
  popular?: boolean;
  overview: string;
  warning: string;
  required: string[];
  features: string[];
};

export const FEATURES_MY = [
  "Diamond တွေ Free ရခြင်း",
  "Heros အသစ်တွေကြိုတင်ကိုင်ရခြင်း",
  "Event အသစ်တွေကြိုသိရခြင်း",
  "Buff & Nerf များ ကြိုသိခြင်း",
];

export const REQUIRED_ITEMS_MY = [
  "အမည်အပြည့်အစုံ",
  "ဖုန်းနံပါတ်",
  "Advance Server နဲ့ချိတ်ဆက်မယ့် Gmail ( Gmail Password မလို)",
  "Advance Server မှာထည့်ချင်တဲ့ Name ( နာမည် )",
  "ငွေလွှဲပြေစာ Screenshot",
];

export const TELEGRAM_URL = "https://t.me/ssnnww2025";

export const PAYMENTS = [
  { key: "kbzpay", label: "KBZPay", number: "09980080069", name: "May Su Aung" },
  { key: "wavepay", label: "WavePay", number: "09980080069", name: "May Su Aung" },
];

export const PLANS: Plan[] = [
  {
    key: "basic-8000",
    price: 8000,
    priceLabel: "8,000 ကျပ်",
    titleMy: "၈,၀၀၀ ကျပ် Plan",
    nameMy: "Basic Advance Server",
    nameEn: "Basic Advance Server",
    overview:
      "Advance Server သီးသန့်ပါဝင်သော အကောင့်ဖြစ်ပြီး ဈေးနှုန်းမှာ ၈,၀၀၀ ကျပ် ဖြစ်ပါသည်။ ကျွန်တော်ပေးအပ်သော Moonton Account ဖြင့် Login ဝင်လိုက်ရုံဖြင့် Advance Server ကို တိုက်ရိုက်ရောက်ရှိသွားမည်ဖြစ်ပါသည်။",
    warning:
      "အကောင့်အသစ်ချိတ်လိုက်ပါက လက်ရှိဆော့နေသော Main အကောင့်မှ ထွက်သွားမည်ဖြစ်ပါသည်။ ထို့ကြောင့် Main အကောင့်ကို ပြန်လည်ဝင်ရောက်တတ်ရန် လိုအပ်ပါသည်။ အကောင့်ဖွင့်ပြီးပါက မိတ်ဆွေ၏ Gmail နှင့် အပိုင်ချိတ်ပေးမည်ဖြစ်သောကြောင့် Password ကို စိတ်ကြိုက်ပြောင်းလဲနိုင်ပါသည်။",
    required: REQUIRED_ITEMS_MY,
    features: [
      "Advance Server တစ်ခုပဲပါတယ်",
      "Diamond လဲလို့ရပါတယ်",
      "Weekly လဲလို့ရပါတယ်",
      "အကောင့်ချိတ်လို့ရပါတယ်",
      "Error လုံးဝမရှိပါ",
    ],
  },
  {
    key: "dual-15000",
    price: 15000,
    priceLabel: "15,000 ကျပ်",
    titleMy: "၁၅,၀၀၀ ကျပ် Plan",
    nameMy: "Dual Server Account",
    nameEn: "Dual Server Account",
    popular: true,
    overview:
      "သူကတော့ ကျနော်ပေးတဲ့ Moonton အကောင့်နဲ့ Login ဝင်လိုက်တာနဲ့ရပါပြီ။ အကောင့်တစ်ခုတည်းမှာ Normal Server ရော Advance Server ရောနှစ်ခုလုံး အကောင့်အသစ်တွေကို တွဲလျက်ပါမှာပါ။ Switch Server နဲ့ Server ပြောင်းဆော့ရုံပါပဲ။",
    warning:
      "Bro အခုလက်ရှိဆော့နေတဲ့အကောင့်ကနေ ထွက်သွားပါမည်။ ကျနော်ပေးတဲ့ Moonton အကောင့်နဲ့ဝင်ပြီး Advance Server ကိုတန်းဆော့လို့ရပါပြီ (Bro ရဲ့ Main အကောင့်ကနေထွက်သွားမှာဖြစ်လို့ Main အကောင့်ကိုပြန်ဝင်တတ်ဖို့တော့ လိုပါမည်)။ အကောင့်ဖောက်ပြီးရင် Bro ရဲ့ Gmail နဲ့အပိုင်ချိတ်ပေးလိုက်မှာဖြစ်လို့ Password လည်း စိတ်ကြိုက်ပြောင်းလဲနိုင်ပါမည်။",
    required: REQUIRED_ITEMS_MY,
    features: [
      "Advance Server နဲ့ Normal Server နှစ်ခုပါ",
      "Server စုစုပေါင်းနှစ်ခုပါမယ်",
      "Diamond လဲလို့ရပါတယ်",
      "Weekly လဲလို့ရပါတယ်",
      "အကောင့်ချိတ်လို့ရပါတယ်",
      "Error လုံးဝမရှိပါ",
    ],
  },
  {
    key: "ultimate-25000",
    price: 25000,
    priceLabel: "25,000 ကျပ်",
    titleMy: "၂၅,၀၀၀ ကျပ် Plan",
    nameMy: "Ultimate Multi-Server Account",
    nameEn: "Ultimate Multi-Server Account",
    overview:
      "Advance Server နဲ့ Normal Server တွဲလျက်ပါပါမည်။ Normal 1 ခု + Advance 5 ခု စုစုပေါင်း Server 6 ခုပါဝင်ပါမည်။ Switch Server နဲ့ ပြောင်းဆော့ရုံပါပဲ။",
    warning:
      "အကောင့်အသစ်ချိတ်လိုက်ပါက လက်ရှိဆော့နေသော Main အကောင့်မှ ထွက်သွားမည်ဖြစ်ပါသည်။ ထို့ကြောင့် Main အကောင့်ကို ပြန်လည်ဝင်ရောက်တတ်ရန် လိုအပ်ပါသည်။ အကောင့်ဖွင့်ပြီးပါက မိတ်ဆွေ၏ Gmail နှင့် အပိုင်ချိတ်ပေးမည်ဖြစ်သောကြောင့် Password ကို စိတ်ကြိုက်ပြောင်းလဲနိုင်ပါသည်။",
    required: REQUIRED_ITEMS_MY,
    features: [
      "Normal 1 ခု + Advance Server 5 ခုပါမယ်",
      "Server စုစုပေါင်း 6 ခုပါမယ်",
      "Diamond လဲလို့ရပါတယ်",
      "Weekly လဲလို့ရပါတယ်",
      "အကောင့်ချိတ်လို့ရပါတယ်",
      "Error လုံးဝမရှိပါ",
    ],
  },
];
