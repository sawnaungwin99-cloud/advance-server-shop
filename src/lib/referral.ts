export const REFERRAL_GOAL = 5;

/** Dynamic discount based on the plan's original price. */
export const DISCOUNT_BY_PRICE: Record<number, number> = {
  8000: 500,
  15000: 1000,
  25000: 2000,
};

export function discountForPrice(price: number) {
  return DISCOUNT_BY_PRICE[price] ?? 0;
}

export const mmk = (n: number) => `${n.toLocaleString("en-US")} ကျပ်`;

export const REFERRAL_GUIDE_TITLE = "Advance Server အကောင့်ကို အခမဲ့ ရယူလိုပါသလား?";

export const REFERRAL_GUIDE_INTRO =
  "SNW Game Rentals မှာ သူငယ်ချင်းတွေကို ဖိတ်ခေါ်ပြီး Advance Server အကောင့်ကို အလကား ရယူနိုင်မယ့် အစီအစဉ်သစ် စတင်လိုက်ပါပြီ!";

export const REFERRAL_GUIDE_STEPS = [
  "၁။ Promo Code ယူပါ - မိမိ Website အကောင့်ထဲက 'သူငယ်ချင်းဖိတ်ခေါ်မှု' (Referral) နေရာမှာ မိမိအတွက် သီးသန့်ထုတ်ပေးထားတဲ့ Promo Code ကို ရယူပါ။",
  "၂။ သူငယ်ချင်းကို မျှဝေပါ - အကောင့်ဝယ်ချင်နေတဲ့ သူငယ်ချင်းတွေကို မိမိရဲ့ Promo Code ပေးပြီး Website မှာ လာဝယ်ခိုင်းပါ။",
  "၃။ သူငယ်ချင်းအတွက် ငွေသက်သာမည် - သူငယ်ချင်းက ငွေရှင်းတဲ့နေရာမှာ သင့်ရဲ့ Promo Code ကို ထည့်သွင်းလိုက်တာနဲ့ ဝယ်ယူမယ့် Plan ပေါ်မူတည်ပြီး (၈,၀၀၀ ကျပ်တန်အတွက် ၅၀၀ ကျပ်၊ ၁၅,၀၀၀ ကျပ်တန်အတွက် ၁,၀၀၀ ကျပ်၊ ၂၅,၀၀၀ ကျပ်တန်အတွက် ၂,၀၀၀ ကျပ်) ကျသင့်ငွေထဲကနေ ချက်ချင်း လျော့သွားပါမယ် (ဒါကြောင့် သူငယ်ချင်းတွေကို ဆွဲဆောင်ဖို့ အရမ်းလွယ်ကူပါတယ်)။",
  "၄။ အမှတ်စုဆောင်းပါ - သူငယ်ချင်းရဲ့ အော်ဒါ အောင်မြင်စွာ ပြီးဆုံးသွားတာနဲ့ (Completed ဖြစ်တာနဲ့) သင့်အတွက် '၁ မှတ်' ရရှိပါမယ်။",
  "၅။ အခမဲ့ အကောင့်ရယူပါ - အော်ဒါအောင်မြင်တဲ့ သူငယ်ချင်း ၅ ယောက် ပြည့်သွားတာနဲ့ (၅ မှတ်ရတာနဲ့) 'Advance Server အကောင့် တောင်းဆိုရန်' ခလုတ်ကို နှိပ်ပြီး အခမဲ့ ချက်ချင်း ထုတ်ယူနိုင်ပါပြီ!",
];

export const REFERRAL_GUIDE_WARNING =
  "⚠️ အထူးသတိပြုရန် - မိမိရဲ့ ကိုယ်ပိုင် Promo Code ကို မိမိကိုယ်တိုင် ပြန်လည်အသုံးပြု၍ မရပါ။ အကောင့်အတုများဖြင့် အလွဲသုံးစားလုပ်ပါက ပယ်ဖျက်ခံရပါမည်။";

export const SELF_REFERRAL_ERROR = "မိမိကိုယ်ပိုင် Promo Code ကို ပြန်လည်အသုံးပြု၍မရပါ";
