
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ApiKeyModal from "./ApiKeyModal";
import { toast } from "@/hooks/use-toast";
import { Check, ArrowUp } from "lucide-react";

const aiProviders = [
  { id: "gemini", name: "Gemini (Gratis)", desc: "AI Google. Chat-only, VN harus diketik.", badge: "Free" },
  { id: "openai", name: "OpenAI (Berbayar)", desc: "AI GPT via OpenAI. Bisa chat & voice note.", badge: "Premium" },
];

export function OnboardingStepper() {
  const [step, setStep] = useState(0);
  const [provider, setProvider] = useState<string>();
  const [apiKey, setApiKey] = useState<string>("");
  const [apiModalOpen, setApiModalOpen] = useState(false);

  function complete() {
    localStorage.setItem("ssai_hasAuth", "1");
    localStorage.setItem("ssai_provider", provider!);
    localStorage.setItem("ssai_apiKey", apiKey);
    toast({ title: "Berhasil onboarding! Selamat datang 🎉" });
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  }

  return (
    <div className="min-w-[375px] w-full max-w-xl border bg-card rounded-xl shadow-xl p-8 animate-fade-in flex flex-col gap-10">
      <div>
        <div className="text-lg mb-2 font-bold">Mulai - Onboarding</div>
        <div className="flex items-center gap-6 mt-4 mb-4">
          <div className={step === 0 ? "font-bold text-primary" : ""}>1. Pilih Provider</div>
          <ArrowUp className="rotate-90 text-muted-foreground" />
          <div className={step === 1 ? "font-bold text-primary" : ""}>2. Input API Key</div>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-5">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${50 + step * 50}%` }}
          ></div>
        </div>
      </div>

      {step === 0 && (
        <div>
          <div className="mb-4 text-sm text-muted-foreground">Pilih AI Provider:</div>
          <div className="flex gap-4">
            {aiProviders.map((p) => (
              <div
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={`cursor-pointer border rounded-lg p-4 flex flex-col gap-2 w-52
                  ${provider === p.id ? "border-primary shadow-lg bg-accent/30" : "hover:border-primary/50"}`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{p.name}</span>
                  <span className={`rounded px-2 text-xs ${p.badge === "Free" ? "bg-green-200 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {p.badge}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">{p.desc}</div>
                {provider === p.id && <Check className="w-4 h-4 text-green-600 mt-2" />}
              </div>
            ))}
          </div>
          <Button className="mt-6" disabled={!provider} onClick={() => setStep(1)}>
            Lanjutkan
          </Button>
        </div>
      )}

      {step === 1 && (
        <div>
          <div className="mb-4 text-muted-foreground text-sm max-w-lg">
            {provider === "gemini"
              ? "Masukkan Gemini API Key (Google AI Studio). Format: AI... (CHAT saja, tidak support VN)."
              : "Masukkan OpenAI API Key. Format: sk-... (Support Chat & Voice Note)."}
          </div>
          <Button
            variant="outline"
            onClick={() => setApiModalOpen(true)}
            className="mb-6"
          >
            Isi API Key
          </Button>
          <div>
            <Button
              disabled={!(apiKey && apiKey.length > 6)}
              onClick={complete}
            >
              Selesai & Masuk Dashboard
            </Button>
          </div>
        </div>
      )}
      <ApiKeyModal
        open={apiModalOpen}
        onClose={() => setApiModalOpen(false)}
        onKeyEntered={(key) => {
          setApiKey(key);
          toast({ title: "API Key tersimpan & tervalidasi!" });
        }}
        provider={provider}
      />
    </div>
  );
}
