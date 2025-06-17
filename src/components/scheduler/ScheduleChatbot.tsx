
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSchedules, Schedule } from "@/hooks/useSchedules";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ScheduleChatbotProps {
  onScheduleChange?: () => void;
}

export function ScheduleChatbot({ onScheduleChange }: ScheduleChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Halo! Saya adalah asisten jadwal Anda. Saya bisa membantu menambah, mengubah, menghapus, atau melihat jadwal Anda. Silakan beri tahu saya apa yang ingin Anda lakukan!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { schedules, addSchedule, updateSchedule, deleteSchedule } = useSchedules();

  const parseScheduleFromText = (text: string): Partial<Schedule> | null => {
    // Simple parsing - could be enhanced with more sophisticated NLP
    const titleMatch = text.match(/judul[:\s]*(.*?)(?:\n|waktu|mulai|tanggal|$)/i);
    const timeMatch = text.match(/(?:waktu|jam|pukul)[:\s]*(\d{1,2})[:.:](\d{2})/i);
    const dateMatch = text.match(/(?:tanggal|tgl)[:\s]*(\d{1,2})[\/\-](\d{1,2})[\/\-]?(\d{2,4})?/i);
    const descMatch = text.match(/(?:deskripsi|keterangan|detail)[:\s]*(.*?)(?:\n|$)/i);

    if (!titleMatch) return null;

    const title = titleMatch[1].trim();
    const description = descMatch ? descMatch[1].trim() : '';
    
    // Default to today if no date specified
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    
    if (dateMatch) {
      day = parseInt(dateMatch[1]);
      month = parseInt(dateMatch[2]);
      if (dateMatch[3]) {
        year = parseInt(dateMatch[3]);
        if (year < 100) year += 2000;
      }
    }

    let hour = 9; // default hour
    let minute = 0;
    
    if (timeMatch) {
      hour = parseInt(timeMatch[1]);
      minute = parseInt(timeMatch[2]);
    }

    const startTime = new Date(year, month - 1, day, hour, minute);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    return {
      title,
      description,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString()
    };
  };

  const executeScheduleAction = async (action: string, scheduleData?: any) => {
    try {
      switch (action) {
        case 'add':
          if (scheduleData) {
            await addSchedule(scheduleData);
            onScheduleChange?.();
            return `Jadwal "${scheduleData.title}" berhasil ditambahkan!`;
          }
          break;
        case 'list':
          const scheduleList = schedules.map(s => 
            `• ${s.title} - ${new Date(s.start_time).toLocaleString('id-ID')}`
          ).join('\n');
          return schedules.length > 0 
            ? `Berikut jadwal Anda:\n${scheduleList}`
            : 'Anda belum memiliki jadwal.';
        case 'delete':
          // Simple delete by title matching
          const titleToDelete = scheduleData?.title?.toLowerCase();
          const scheduleToDelete = schedules.find(s => 
            s.title.toLowerCase().includes(titleToDelete)
          );
          if (scheduleToDelete) {
            await deleteSchedule(scheduleToDelete.id);
            onScheduleChange?.();
            return `Jadwal "${scheduleToDelete.title}" berhasil dihapus!`;
          }
          return 'Jadwal tidak ditemukan.';
      }
    } catch (error) {
      return 'Maaf, terjadi kesalahan saat memproses permintaan Anda.';
    }
    return 'Maaf, saya tidak mengerti permintaan Anda.';
  };

  const processUserMessage = async (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Check for schedule management actions
    if (lowerMessage.includes('tambah') || lowerMessage.includes('buat') || lowerMessage.includes('add')) {
      const scheduleData = parseScheduleFromText(message);
      if (scheduleData && scheduleData.title) {
        return await executeScheduleAction('add', scheduleData);
      } else {
        return 'Untuk menambah jadwal, silakan berikan judul dan waktu. Contoh: "Tambah jadwal Meeting tim judul: Rapat Mingguan waktu: 14:00 tanggal: 15/6/2024"';
      }
    }
    
    if (lowerMessage.includes('lihat') || lowerMessage.includes('tampil') || lowerMessage.includes('daftar')) {
      return await executeScheduleAction('list');
    }
    
    if (lowerMessage.includes('hapus') || lowerMessage.includes('delete')) {
      const titleMatch = message.match(/hapus\s+(?:jadwal\s+)?["\']?(.*?)["\']?$/i);
      if (titleMatch) {
        return await executeScheduleAction('delete', { title: titleMatch[1] });
      }
      return 'Silakan spesifikasikan jadwal yang ingin dihapus. Contoh: "Hapus jadwal Meeting tim"';
    }

    // Fallback to AI response
    return await getAIResponse(message);
  };

  const getAIResponse = async (message: string): Promise<string> => {
    const apiKey = localStorage.getItem("ssai_apiKey") || "";
    
    if (!apiKey) {
      return "Untuk menggunakan AI chatbot, silakan atur API key Gemini di halaman onboarding.";
    }

    try {
      const scheduleContext = schedules.length > 0 
        ? `Jadwal saat ini: ${schedules.map(s => `${s.title} pada ${new Date(s.start_time).toLocaleString('id-ID')}`).join(', ')}`
        : 'Tidak ada jadwal saat ini.';

      const prompt = `Anda adalah asisten jadwal yang membantu mengelola jadwal harian. ${scheduleContext}
      
Pengguna berkata: "${message}"

Tolong berikan respons yang membantu terkait jadwal. Jika mereka ingin menambah jadwal, minta format yang jelas. Gunakan bahasa Indonesia yang ramah.`;

      const res = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
        })
      });

      if (!res.ok) throw new Error("Gagal menghubungi AI");
      
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak bisa memproses permintaan Anda saat ini.";
    } catch (error) {
      return "Maaf, terjadi kesalahan saat memproses permintaan Anda.";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await processUserMessage(input);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "Maaf, terjadi kesalahan. Silakan coba lagi.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 h-[500px] flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Asisten Jadwal AI</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              message.type === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString('id-ID', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pesan Anda... (contoh: Tambah jadwal meeting besok jam 2 siang)"
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
        />
        <Button onClick={handleSend} disabled={!input.trim() || loading}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
