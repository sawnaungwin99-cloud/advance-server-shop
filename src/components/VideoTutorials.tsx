import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VIDEO_LOGIN_URL, VIDEO_ORDER_URL } from "@/lib/videos";

function VideoFrame({ src, title }: { src: string; title: string }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border/70 bg-background/60 pt-[56.25%] shadow-lg">
      <iframe
        src={src}
        title={title}
        allow="autoplay; fullscreen"
        allowFullScreen
        loading="lazy"
        className="absolute inset-0 size-full rounded-2xl"
      />
    </div>
  );
}

export function VideoTutorials() {
  return (
    <section id="guides" className="mx-auto max-w-4xl px-4 pb-20">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gradient sm:text-3xl">
          📺 အသုံးပြုနည်း လမ်းညွှန်များ (Video Guides)
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-loose text-muted-foreground">
          SNW Advance Server ဝယ်ယူနည်းနှင့် ဝယ်ထားတဲ့အကောင့် Login ဝင်နည်းများကို အောက်ပါ
          ဗီဒီယိုများတွင် အသေးစိတ် ကြည့်ရှုနိုင်ပါသည်။
        </p>
      </div>

      <div className="metal-card rounded-3xl p-4 sm:p-6">
        <Tabs defaultValue="order">
          <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-secondary/40 p-1.5 sm:grid-cols-2">
            <TabsTrigger value="order" className="whitespace-normal py-2 text-xs sm:text-sm">
              🛒 အော်ဒါတင်နည်း (How to Order)
            </TabsTrigger>
            <TabsTrigger value="login" className="whitespace-normal py-2 text-xs sm:text-sm">
              🔑 ဝယ်ထားတဲ့အကောင့် Login ဝင်နည်း (How to Login)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="order" className="mt-4 animate-in fade-in-50">
            <VideoFrame src={VIDEO_ORDER_URL} title="How to Order" />
          </TabsContent>
          <TabsContent value="login" className="mt-4 animate-in fade-in-50">
            <VideoFrame src={VIDEO_LOGIN_URL} title="How to Login" />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
