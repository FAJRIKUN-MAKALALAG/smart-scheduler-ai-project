
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSchedules } from "@/hooks/useSchedules";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

type SchedulerInputProps = {
  onResult: (s: string) => void;
};

const SchedulerInput = ({ onResult }: SchedulerInputProps) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const { schedules, addSchedule } = useSchedules();

  const parseAndAddSchedule = async (aiResponse: string, userInput: string) => {
    // Try to extract schedule information from AI response
    const titleMatch = aiResponse.match(/(?:judul|title)[:\s]*"?([^"\n]+)"?/i);
    const timeMatch = aiResponse.match(/(?:waktu|jam|time)[:\s]*(\d{1,2})[:.:](\d{2})/i);
    const dateMatch = aiResponse.match(/(?:tanggal|date)[:\s]*(\d{1,2})[\/\-](\d{1,2})[\/\-]?(\d{2,4})?/i);
    
    if (titleMatch && timeMatch) {
      try {
        const title = titleMatch[1].trim();
        const hour = parseInt(timeMatch[1]);
        const minute = parseInt(timeMatch[2]);
        
        // Use today if no date specified
        const startTime = new Date();
        if (dateMatch) {
          const day = parseInt(dateMatch[1]);
          const month = parseInt(dateMatch[2]) - 1; // Month is 0-indexed
          let year = dateMatch[3] ? parseInt(dateMatch[3]) : startTime.getFullYear();
          if (year < 100) year += 2000;
          startTime.setFullYear(year, month, day);
        }
        
        startTime.setHours(hour, minute, 0, 0);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

        await addSchedule({
          title,
          description: `Dijadwalkan melalui AI: ${userInput}`,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString()
        });

        return `${aiResponse}\n\n✅ Jadwal "${title}" telah ditambahkan ke kalender Anda!`;
      } catch (error) {
        console.error("Error adding schedule:", error);
        return `${aiResponse}\n\n❌ Gagal menambahkan ke kalender, silakan tambahkan manual.`;
      }
    }
    
    return aiResponse;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text) return;

    const apiKey = localStorage.getItem("ssai_apiKey") || "";
    const provider = localStorage.getItem("ssai_provider") || "";
    if (!apiKey || provider !== "gemini") {
      toast({
        title: "API Key Gemini belum diatur.",
        description: "Silakan pilih provider Gemini dan pastikan API key sudah tersimpan di onboarding.",
      });
      return;
    }

    setLoading(true);
    onResult("");

    try {
      // Get current schedules context
      const scheduleContext = schedules.length > 0 
        ? `Jadwal saat ini: ${schedules.map(s => `${s.title} pada ${new Date(s.start_time).toLocaleString('id-ID')}`).join(', ')}`
        : 'Belum ada jadwal tersimpan.';

      const prompt = `Kamu adalah asisten AI untuk menyusun jadwal harian yang rapi dan dapat otomatis menambahkan jadwal ke database. 

${scheduleContext}

Berdasarkan permintaan berikut, buatkan jadwal dengan format yang rapi dan jika memungkinkan, sertakan informasi yang bisa dijadwalkan otomatis:

"${text}"

Jika permintaan ini bisa dijadwalkan (ada judul dan waktu yang jelas), format responmu seperti ini:
- Berikan penjelasan jadwal
- Tambahkan baris: "JADWAL_DATA: judul: [judul jadwal] waktu: [HH:MM] tanggal: [DD/MM/YYYY]" (jika tanggal tidak disebutkan, gunakan hari ini)

Contoh format output yang baik:
08:00 - Olahraga pagi (30 menit)
09:00 - Sarapan dan persiapan kerja
10:00 - Mulai kerja/kuliah
...

Gunakan bahasa Indonesia yang sopan dan ramah.`;

      const res = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.5,
            topK: 1,
            topP: 1,
            maxOutputTokens: 400,
            stopSequences: [],
            candidateCount: 1,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Gagal fetch dari Gemini");
      }

      const data = await res.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Tidak ada jadwal yang didapatkan dari AI";
      
      // Try to parse and add schedule automatically
      const finalResponse = await parseAndAddSchedule(aiResponse.trim(), text);
      onResult(finalResponse);

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
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-4">
        <p className="text-sm text-muted-foreground mb-2">
          💡 <strong>Tips:</strong> AI sekarang dapat otomatis menambahkan jadwal ke kalender Anda! 
          Contoh: "Buatkan jadwal meeting tim besok jam 2 siang"
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-2xl">
        <Input
          placeholder="Tulis aktivitas yang diinginkan atau minta bantuan AI untuk mengelola jadwal..."
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
    </div>
  );
};

export default SchedulerInput;
