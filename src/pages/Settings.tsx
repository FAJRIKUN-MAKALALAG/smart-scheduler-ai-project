
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import ApiKeyModal from "@/components/onboarding/ApiKeyModal";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";

const PROVIDER_OPTIONS = [
  {
    label: "Gemini (Gratis)",
    value: "gemini",
    desc: "AI Google, hanya chat (tidak bisa VN)",
  },
  {
    label: "OpenAI (Berbayar)",
    value: "openai",
    desc: "GPT, bisa chat & VN",
  },
];

const SettingsPage = () => {
  const [notif, setNotif] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [provider, setProvider] = useState<string>("gemini");
  const [apiKey, setApiKey] = useState<string>("");

  useEffect(() => {
    // Ambil provider & apiKey saat awal
    setProvider(localStorage.getItem("ssai_provider") || "gemini");
    setApiKey(localStorage.getItem("ssai_apiKey") || "");
  }, []);

  const handleProviderChange = (value: string) => {
    setProvider(value);
    localStorage.setItem("ssai_provider", value);
    toast({ title: `Provider diubah ke ${value === "gemini" ? "Gemini" : "OpenAI"}` });
    // Check API key sesuai provider ini
    const key = localStorage.getItem("ssai_apiKey") || "";
    if (
      (value === "openai" && (!key || !key.startsWith("sk-"))) ||
      (value === "gemini" && (!key || !key.startsWith("AI")))
    ) {
      setModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <main className="flex-1 px-6 py-8">
        <h2 className="text-2xl font-bold mb-8">⚙️ Pengaturan</h2>
        <div className="max-w-lg space-y-8">
          <div>
            <div className="font-semibold mb-2">Pilih Provider AI</div>
            <RadioGroup
              value={provider}
              onValueChange={handleProviderChange}
              className="flex gap-5"
            >
              {PROVIDER_OPTIONS.map(o => (
                <label key={o.value} className="flex items-center gap-2 p-3 rounded-lg border cursor-pointer w-fit transition-colors hover:border-primary/60">
                  <RadioGroupItem value={o.value} />
                  <div>
                    <span className="font-medium">{o.label}</span>
                    <span className="block text-xs text-muted-foreground">{o.desc}</span>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold">Notifikasi Reminder</div>
                <div className="text-muted-foreground text-sm">
                  Aktifkan agar dapat reminder sebelum event!
                </div>
              </div>
              <Switch checked={notif} onCheckedChange={setNotif} aria-label="Aktifkan reminder" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold">API Key</div>
                <div className="text-muted-foreground text-sm">
                  Edit API key kamu untuk AI provider.
                </div>
              </div>
              <Button variant="outline" onClick={() => setModalOpen(true)}>
                Ganti API Key
              </Button>
            </div>
          </div>
        </div>
        <ApiKeyModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          provider={provider}
          onKeyEntered={(key) => setApiKey(key)}
        />
      </main>
    </div>
  );
};

export default SettingsPage;

