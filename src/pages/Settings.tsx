import { AppSidebar } from "@/components/layout/AppSidebar";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import ApiKeyModal from "@/components/onboarding/ApiKeyModal";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import {
  Settings as SettingsIcon,
  Key,
  Mail,
  Brain,
  Shield,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const PROVIDER_OPTIONS = [
  {
    label: "Gemini (Gratis)",
    value: "gemini",
    desc: "AI Google, hanya chat (tidak bisa VN)",
    icon: "🤖",
    color: "from-blue-500 to-cyan-500",
  },
  {
    label: "OpenAI (Berbayar)",
    value: "openai",
    desc: "GPT, bisa chat & VN",
    icon: "⚡",
    color: "from-green-500 to-emerald-500",
  },
];

const SettingsPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [provider, setProvider] = useState<string>("gemini");
  const [apiKey, setApiKey] = useState<string>("");
  const { enabled, enableEmailNotifications, disableEmailNotifications } =
    useNotifications();

  useEffect(() => {
    // Ambil provider & apiKey saat awal
    setProvider(localStorage.getItem("ssai_provider") || "gemini");
    setApiKey(localStorage.getItem("ssai_apiKey") || "");
  }, []);

  const handleProviderChange = (value: string) => {
    setProvider(value);
    localStorage.setItem("ssai_provider", value);
    toast({
      title: `Provider diubah ke ${value === "gemini" ? "Gemini" : "OpenAI"}`,
    });
    // Check API key sesuai provider ini
    const key = localStorage.getItem("ssai_apiKey") || "";
    if (
      (value === "openai" && (!key || !key.startsWith("sk-"))) ||
      (value === "gemini" && (!key || !key.startsWith("AI")))
    ) {
      setModalOpen(true);
    }
  };

  const handleEmailNotificationToggle = (checked: boolean) => {
    if (checked) {
      enableEmailNotifications();
      toast({
        title: "Notifikasi Email Diaktifkan",
        description:
          "Anda akan menerima email pengingat untuk jadwal yang akan datang",
      });
    } else {
      disableEmailNotifications();
      toast({
        title: "Notifikasi Email Dinonaktifkan",
        description: "Anda tidak akan menerima email pengingat lagi",
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppSidebar />
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-3 rounded-2xl shadow-lg">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Pengaturan
              </h1>
              <p className="text-muted-foreground text-lg">
                Kelola preferensi dan konfigurasi aplikasi
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl space-y-8">
          {/* AI Provider Settings */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold">Provider AI</h2>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground mb-4">
                Pilih provider AI yang akan digunakan untuk mengatur jadwal Anda
              </p>

              <RadioGroup
                value={provider}
                onValueChange={handleProviderChange}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {PROVIDER_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`relative flex items-start gap-4 p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      provider === option.value
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    <RadioGroupItem value={option.value} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{option.icon}</span>
                        <span className="font-semibold text-lg">
                          {option.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {option.desc}
                      </p>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full bg-gradient-to-r ${option.color}`}
                    ></div>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Email Notification Settings */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-xl">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold">Notifikasi Email</h2>
            </div>

            <div className="flex items-center justify-between p-6 bg-gray-50/50 dark:bg-gray-700/50 rounded-2xl">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  Notifikasi Email Pengingat
                </h3>
                <p className="text-muted-foreground text-sm">
                  Aktifkan untuk mendapatkan email pengingat sebelum jadwal
                  dimulai
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Anda akan menerima email 15 menit dan 5 menit sebelum jadwal
                  dimulai, serta saat jadwal dimulai
                </p>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={handleEmailNotificationToggle}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-600 data-[state=checked]:to-blue-600"
              />
            </div>
          </div>

          {/* API Key Settings */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                <Key className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold">API Key</h2>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground">
                Kelola API key untuk provider AI yang dipilih
              </p>

              <div className="flex items-center justify-between p-6 bg-gray-50/50 dark:bg-gray-700/50 rounded-2xl">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    API Key {provider === "gemini" ? "Gemini" : "OpenAI"}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {apiKey ? (
                      <span className="text-green-600 dark:text-green-400 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        API Key sudah dikonfigurasi
                      </span>
                    ) : (
                      <span className="text-orange-600 dark:text-orange-400">
                        API Key belum dikonfigurasi
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 hover:from-purple-700 hover:to-pink-700"
                >
                  {apiKey ? "Ganti API Key" : "Atur API Key"}
                </Button>
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Keamanan Data</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              API key Anda disimpan secara aman di browser lokal dan tidak
              pernah dikirim ke server kami. Semua komunikasi dengan provider AI
              menggunakan protokol HTTPS yang terenkripsi. Notifikasi email akan
              dikirim ke alamat email yang terdaftar di akun Anda.
            </p>
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
