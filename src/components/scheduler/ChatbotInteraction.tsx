
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Bot, User, Calendar, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Message = {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  action?: "clear_schedule" | "suggest_alternative";
};

type ChatbotInteractionProps = {
  onScheduleUpdate: (schedule: string) => void;
  currentSchedule: string | null;
};

const ChatbotInteraction = ({ onScheduleUpdate, currentSchedule }: ChatbotInteractionProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: "Halo! Saya bisa membantu mengatur jadwal Anda. Coba katakan 'kosongkan jadwal hari senin' atau minta saya buatkan jadwal baru.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const detectScheduleCommand = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Deteksi perintah kosongkan jadwal
    if (lowerText.includes("kosongkan") && (lowerText.includes("jadwal") || lowerText.includes("schedule"))) {
      return "clear_schedule";
    }
    
    return "normal";
  };

  const generateAlternativeSchedule = async () => {
    const apiKey = localStorage.getItem("ssai_apiKey") || "";
    const provider = localStorage.getItem("ssai_provider") || "";
    
    if (!apiKey || provider !== "gemini") {
      return "Maaf, saya perlu API key Gemini untuk memberikan saran jadwal alternatif.";
    }

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
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
                    text: `Buatkan jadwal alternatif yang produktif untuk hari senin. Format dengan waktu dan aktivitas:
                    
Contoh format:
07:00 - Bangun tidur dan olahraga ringan
08:00 - Sarapan sehat
09:00 - Mulai pekerjaan/kuliah
12:00 - Istirahat makan siang
...

Fokus pada produktivitas dan keseimbangan hidup.`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 250,
            },
          }),
        }
      );
      
      if (!res.ok) throw new Error("Gagal generate jadwal");
      
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Gagal membuat jadwal alternatif.";
    } catch (error) {
      return "Maaf, terjadi kesalahan saat membuat jadwal alternatif.";
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    
    const command = detectScheduleCommand(input);
    let botResponse = "";
    let action: Message["action"] = undefined;

    if (command === "clear_schedule") {
      // Kosongkan jadwal
      onScheduleUpdate("");
      botResponse = "✅ Jadwal Anda telah dikosongkan!\n\nApakah Anda ingin saya buatkan jadwal alternatif yang produktif untuk hari tersebut?";
      action = "suggest_alternative";
      
      toast({
        title: "Jadwal dikosongkan",
        description: "Jadwal Anda telah berhasil dikosongkan.",
      });
    } else {
      // Proses normal dengan AI
      const apiKey = localStorage.getItem("ssai_apiKey") || "";
      const provider = localStorage.getItem("ssai_provider") || "";
      
      if (!apiKey || provider !== "gemini") {
        botResponse = "Maaf, saya perlu API key Gemini untuk membantu Anda. Silakan atur di pengaturan.";
      } else {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
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
                        text: `Kamu adalah asisten jadwal yang membantu mengatur aktivitas harian. Jawab pertanyaan atau permintaan berikut dengan ramah dan informatif:

${input}

Jika diminta membuat jadwal, gunakan format:
07:00 - Aktivitas
08:00 - Aktivitas lain
...`,
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.6,
                  maxOutputTokens: 300,
                },
              }),
            }
          );
          
          if (!res.ok) throw new Error("Gagal berkomunikasi dengan AI");
          
          const data = await res.json();
          botResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak bisa memahami permintaan Anda.";
        } catch (error) {
          botResponse = "Maaf, terjadi kesalahan saat memproses permintaan Anda.";
        }
      }
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: "bot",
      content: botResponse,
      timestamp: new Date(),
      action,
    };

    setMessages(prev => [...prev, botMessage]);
    setInput("");
    setLoading(false);
  };

  const handleSuggestAlternative = async () => {
    setLoading(true);
    const alternativeSchedule = await generateAlternativeSchedule();
    
    const suggestionMessage: Message = {
      id: Date.now().toString(),
      type: "bot",
      content: `Berikut saran jadwal alternatif untuk Anda:\n\n${alternativeSchedule}`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, suggestionMessage]);
    onScheduleUpdate(alternativeSchedule);
    setLoading(false);

    toast({
      title: "Jadwal alternatif dibuat",
      description: "Saya telah membuatkan jadwal alternatif untuk Anda.",
    });
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold">Chat dengan AI Scheduler</h3>
      </div>
      
      {/* Messages */}
      <div className="h-64 overflow-y-auto mb-4 space-y-3 border rounded-lg p-3 bg-background/50">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-2 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex gap-2 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === "user" ? "bg-primary" : "bg-secondary"
              }`}>
                {message.type === "user" ? (
                  <User className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <Bot className="w-4 h-4 text-secondary-foreground" />
                )}
              </div>
              <div className={`p-3 rounded-lg ${
                message.type === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted"
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.action === "suggest_alternative" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-2"
                    onClick={handleSuggestAlternative}
                    disabled={loading}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Ya, buatkan jadwal alternatif
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <Bot className="w-4 h-4 text-secondary-foreground" />
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">Sedang mengetik...</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          placeholder="Ketik pesan Anda... (coba: 'kosongkan jadwal hari senin')"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !loading && handleSendMessage()}
          disabled={loading}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={!input.trim() || loading}
        >
          Kirim
        </Button>
      </div>
    </div>
  );
};

export default ChatbotInteraction;
