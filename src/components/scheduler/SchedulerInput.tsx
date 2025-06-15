
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Ganti endpoint ke model Gemini yang sesuai guide terbaru
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

type SchedulerInputProps = {
  onResult: (s: string) => void;
};

const SchedulerInput = ({ onResult }: SchedulerInputProps) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text) return;

    // Ambil API key Gemini dari localStorage
    const apiKey = localStorage.getItem("ssai_apiKey") || "";
    const provider = localStorage.getItem("ssai_provider") || "";
    if (!apiKey || provider !== "gemini") {
      toast({
        title: "API Key Gemini belum diatur.",
        description:
          "Silakan pilih provider Gemini dan pastikan API key sudah tersimpan di onboarding.",
      });
      return;
    }

    setLoading(true);
    onResult(""); // clear previous

    try {
      // Request ke API Gemini Google (endpoint sudah benar sekarang)
      const res = await fetch(
        `${GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Kamu adalah asisten AI untuk menyusun jadwal harian yang rapi. Tolong buatkan jadwal dengan format waktu dan aktivitas berdasarkan permintaan berikut (gunakan bahasa Indonesia yang sopan):
${text}
Contoh format output:
07:00 - Bangun tidur
08:00 - Olahraga
09:00 - Mulai kuliah
13:00 - Istirahat/makan siang
...`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.5,
              topK: 1,
              topP: 1,
              maxOutputTokens: 300,
              stopSequences: [],
              candidateCount: 1,
            },
          }),
        }
      );
      if (!res.ok) {
        throw new Error("Gagal fetch dari Gemini");
      }
      const data = await res.json();
      // Cek hasil Gemini
      const answer =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        data.candidates?.[0]?.content?.parts?.[0] ||
        "Tidak ada jadwal yang didapatkan dari AI";
      onResult(answer.trim());
    } catch (err: any) {
      toast({
        title: "Gagal meminta jadwal ke Gemini",
        description: err?.message || "Terjadi kesalahan saat fetch.",
      });
      onResult("Gagal menghubungi AI Gemini. Coba ulangi.");
    }
    setLoading(false);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-2xl">
      <Input
        placeholder="Tulis aktivitas yang diinginkan (atau rekam VN)..."
        value={text}
        disabled={loading}
        onChange={(e) => setText(e.target.value)}
      />
      <Button type="submit" disabled={!text || loading}>
        {loading ? "Memproses..." : "Kirim"}
      </Button>
      <Button type="button" variant="outline" className="gap-2" disabled>
        <Mic /> VN
      </Button>
    </form>
  );
};

export default SchedulerInput;
