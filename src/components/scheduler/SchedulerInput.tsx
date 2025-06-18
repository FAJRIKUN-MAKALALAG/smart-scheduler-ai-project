import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSchedules } from "@/hooks/useSchedules";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

type SchedulerInputProps = {
  onResult: (s: string) => void;
};

const SchedulerInput = ({ onResult }: SchedulerInputProps) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const { schedules, addSchedule, updateSchedule } = useSchedules();

  // Helper function to get tomorrow's date in DD/MM/YYYY format
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const day = tomorrow.getDate().toString().padStart(2, "0");
    const month = (tomorrow.getMonth() + 1).toString().padStart(2, "0");
    const year = tomorrow.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to get today's date in DD/MM/YYYY format
  const getTodayDate = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, "0");
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseAndAddSchedule = async (aiResponse: string, userInput: string) => {
    console.log("AI Response:", aiResponse); // Debug log

    // Try multiple patterns to extract schedule information
    let title = "";
    let time = "";
    let date = "";

    // Pattern 1: Look for JADWAL_DATA format (most reliable)
    const jadwalDataMatch = aiResponse.match(
      /JADWAL_DATA:\s*judul:\s*([^\n]+)\s+waktu:\s*(\d{1,2}:\d{2})\s+tanggal:\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i
    );
    if (jadwalDataMatch) {
      title = jadwalDataMatch[1].trim();
      time = jadwalDataMatch[2];
      date = jadwalDataMatch[3];
      console.log("Found JADWAL_DATA format:", { title, time, date });
    } else {
      // Pattern 2: Look for time-based format (HH:MM - Activity)
      const timeLineMatch = aiResponse.match(
        /^(\d{1,2}[:.]\d{2})\s*[-–]\s*(.+)$/m
      );
      if (timeLineMatch) {
        time = timeLineMatch[1].replace(".", ":");
        title = timeLineMatch[2].trim();

        // Extract date from user input or use today
        const dateMatch = userInput.match(
          /(?:besok|tomorrow|hari ini|today|tanggal|tgl)\s*(\d{1,2})[/-](\d{1,2})[/-]?(\d{2,4})?/i
        );
        if (dateMatch) {
          const day = parseInt(dateMatch[1]);
          const month = parseInt(dateMatch[2]);
          const year = dateMatch[3]
            ? parseInt(dateMatch[3])
            : new Date().getFullYear();
          date = `${day}/${month}/${year}`;
        }
        console.log("Found time-based format:", { title, time, date });
      } else {
        // Pattern 3: Look for explicit title and time mentions
        const titleMatch = aiResponse.match(
          /(?:judul|title|jadwal)[:\s]*"?([^"\n]+)"?/i
        );
        const timeMatch = aiResponse.match(
          /(?:waktu|jam|time|pukul)[:\s]*(\d{1,2})[:.:](\d{2})/i
        );

        if (titleMatch) title = titleMatch[1].trim();
        if (timeMatch) time = `${timeMatch[1]}:${timeMatch[2]}`;

        // Extract date from user input
        const dateMatch = userInput.match(
          /(?:besok|tomorrow|hari ini|today|tanggal|tgl)\s*(\d{1,2})[/-](\d{1,2})[/-]?(\d{2,4})?/i
        );
        if (dateMatch) {
          const day = parseInt(dateMatch[1]);
          const month = parseInt(dateMatch[2]);
          const year = dateMatch[3]
            ? parseInt(dateMatch[3])
            : new Date().getFullYear();
          date = `${day}/${month}/${year}`;
        }
        console.log("Found explicit mentions:", { title, time, date });
      }
    }

    console.log("Final parsed data:", { title, time, date }); // Debug log

    if (title && time) {
      try {
        // Parse time
        const [hours, minutes] = time.split(":").map(Number);

        // Parse date or use today
        let startTime = new Date();
        if (date) {
          const [day, month, year] = date.split("/").map(Number);
          startTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
        } else {
          // Check if user mentioned "besok" or "tomorrow"
          if (
            userInput.toLowerCase().includes("besok") ||
            userInput.toLowerCase().includes("tomorrow")
          ) {
            startTime.setDate(startTime.getDate() + 1);
          }
          startTime.setHours(hours, minutes, 0, 0);
        }

        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

        console.log("Saving schedule:", { title, startTime, endTime }); // Debug log

        await addSchedule({
          title,
          description: `Dijadwalkan melalui AI: ${userInput}`,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
        });

        return `${aiResponse}\n\n✅ Jadwal "${title}" telah ditambahkan ke kalender Anda!`;
      } catch (error) {
        console.error("Error adding schedule:", error);
        return `${aiResponse}\n\n❌ Gagal menambahkan ke kalender: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Silakan tambahkan manual.`;
      }
    }

    console.log("No schedule data found in AI response"); // Debug log
    return `${aiResponse}\n\n⚠️ AI tidak dapat mendeteksi jadwal yang dapat disimpan. Silakan tambahkan manual atau coba dengan format yang lebih spesifik.`;
  };

  const parseAndAddMultipleSchedules = async (
    aiResponse: string,
    userInput: string
  ) => {
    console.log("=== START PARSING AI RESPONSE ===");
    console.log("AI Response:", aiResponse);
    console.log("User Input:", userInput);

    const schedulesToSave = [];
    const lines = aiResponse.split("\n");

    console.log("Total lines to process:", lines.length);

    // First, try to parse JADWAL_DATA format from AI response
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      console.log(`Processing line ${i + 1}:`, JSON.stringify(line));

      // More flexible regex pattern for JADWAL_DATA
      const jadwalDataPattern =
        /JADWAL_DATA:\s*judul:\s*([^\n]+?)\s+waktu:\s*(\d{1,2}:\d{2})\s+tanggal:\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i;
      const match = line.match(jadwalDataPattern);

      console.log("Regex match result:", match);

      if (match) {
        const title = match[1].trim();
        const time = match[2];
        const date = match[3];
        console.log("✅ Found JADWAL_DATA format:", { title, time, date });

        try {
          // Parse time
          const [hours, minutes] = time.split(":").map(Number);
          console.log("Parsed time:", { hours, minutes });

          // Parse date
          const [day, month, year] = date.split(/[/-]/).map(Number);
          console.log("Parsed date:", { day, month, year });

          const startTime = new Date(
            year,
            month - 1,
            day,
            hours,
            minutes,
            0,
            0
          );
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

          console.log("✅ Parsed schedule:", {
            title,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
          });

          schedulesToSave.push({
            title,
            startTime,
            endTime,
          });
        } catch (error) {
          console.error(`❌ Error parsing schedule "${title}":`, error);
        }
      } else {
        // Try alternative pattern with asterisks
        const altPattern =
          /\*\*JADWAL_DATA:\*\*\s*judul:\s*([^\n]+?)\s+waktu:\s*(\d{1,2}:\d{2})\s+tanggal:\s*(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i;
        const altMatch = line.match(altPattern);

        if (altMatch) {
          const title = altMatch[1].trim();
          const time = altMatch[2];
          const date = altMatch[3];
          console.log("✅ Found JADWAL_DATA format (with asterisks):", {
            title,
            time,
            date,
          });

          try {
            // Parse time
            const [hours, minutes] = time.split(":").map(Number);
            console.log("Parsed time:", { hours, minutes });

            // Parse date
            const [day, month, year] = date.split(/[/-]/).map(Number);
            console.log("Parsed date:", { day, month, year });

            const startTime = new Date(
              year,
              month - 1,
              day,
              hours,
              minutes,
              0,
              0
            );
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

            console.log("✅ Parsed schedule:", {
              title,
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
            });

            schedulesToSave.push({
              title,
              startTime,
              endTime,
            });
          } catch (error) {
            console.error(`❌ Error parsing schedule "${title}":`, error);
          }
        } else {
          console.log("❌ No JADWAL_DATA pattern found in this line");
        }
      }
    }

    console.log(
      "Total schedules found from JADWAL_DATA:",
      schedulesToSave.length
    );

    // If no JADWAL_DATA found, try to parse from user input directly
    if (schedulesToSave.length === 0) {
      console.log(
        "No JADWAL_DATA found, trying to parse from user input directly"
      );
      const detectedSchedules = detectSchedulesFromInput(userInput);
      for (const detected of detectedSchedules) {
        schedulesToSave.push({
          title: detected.title,
          startTime: new Date(detected.start_time),
          endTime: new Date(detected.end_time),
        });
      }
      console.log("Schedules found from user input:", detectedSchedules.length);
    }

    if (schedulesToSave.length > 0) {
      try {
        console.log(
          "Attempting to save/update",
          schedulesToSave.length,
          "schedules"
        );
        let updatedCount = 0;
        let insertedCount = 0;

        for (let i = 0; i < schedulesToSave.length; i++) {
          const schedule = schedulesToSave[i];
          console.log(`Processing schedule ${i + 1}:`, schedule);

          // Check if there's an existing schedule with the same start_time (same date and time)
          const existing = schedules.find((s) => {
            const existingTime = new Date(s.start_time).toISOString();
            const newTime = schedule.startTime.toISOString();
            return existingTime === newTime;
          });

          if (existing) {
            // Update existing schedule
            console.log(
              `🔄 Updating existing schedule: ${existing.title} -> ${schedule.title}`
            );
            await updateSchedule(existing.id, {
              title: schedule.title,
              description: schedule.description || "",
              start_time: schedule.startTime.toISOString(),
              end_time: schedule.endTime.toISOString(),
            });
            updatedCount++;
            console.log(`✅ Schedule ${i + 1} updated successfully`);
          } else {
            // Insert new schedule
            console.log(`➕ Inserting new schedule: ${schedule.title}`);
            await addSchedule({
              title: schedule.title,
              description: "",
              start_time: schedule.startTime.toISOString(),
              end_time: schedule.endTime.toISOString(),
            });
            insertedCount++;
            console.log(`✅ Schedule ${i + 1} inserted successfully`);
          }
        }

        console.log("=== ALL SCHEDULES PROCESSED SUCCESSFULLY ===");
        console.log(`Updated: ${updatedCount}, Inserted: ${insertedCount}`);

        let resultMessage = "";
        if (insertedCount > 0 && updatedCount > 0) {
          resultMessage = `✅ ${insertedCount} jadwal baru ditambahkan, ${updatedCount} jadwal diupdate!`;
        } else if (insertedCount > 0) {
          resultMessage = `✅ ${insertedCount} jadwal baru berhasil ditambahkan ke kalender Anda!`;
        } else if (updatedCount > 0) {
          resultMessage = `✅ ${updatedCount} jadwal berhasil diupdate!`;
        }

        return `${aiResponse}\n\n${resultMessage}`;
      } catch (error) {
        console.error("❌ Error adding/updating schedules:", error);
        return `${aiResponse}\n\n❌ Gagal menambahkan/mengupdate jadwal: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Silakan tambahkan manual.`;
      }
    }

    console.log("❌ No schedule data found in AI response");
    console.log("=== END PARSING ===");
    return `${aiResponse}\n\n⚠️ AI tidak dapat mendeteksi jadwal yang dapat disimpan. Silakan tambahkan manual atau coba dengan format yang lebih spesifik.`;
  };

  // Function to detect schedules directly from user input
  const detectSchedulesFromInput = (input: string) => {
    const schedules = [];
    const lowerInput = input.toLowerCase();

    // Determine target date
    const targetDate = new Date();
    if (lowerInput.includes("besok") || lowerInput.includes("tomorrow")) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    // Multiple patterns to match different formats
    const patterns = [
      // Pattern 1: "jam X untuk [activity]"
      /jam\s+(\d{1,2})(?::(\d{2}))?\s+untuk\s+([^dan]+?)(?:\s+dan\s+|\s+dan\s+jam\s+|$)/gi,
      // Pattern 2: "jam X [activity]"
      /jam\s+(\d{1,2})(?::(\d{2}))?\s+([^dan]+?)(?:\s+dan\s+|\s+dan\s+jam\s+|$)/gi,
      // Pattern 3: "jadwal jam X [activity]"
      /jadwal\s+jam\s+(\d{1,2})(?::(\d{2}))?\s+([^dan]+?)(?:\s+dan\s+|\s+dan\s+jam\s+|$)/gi,
      // Pattern 4: "jam X malam/pagi/siang [activity]"
      /jam\s+(\d{1,2})(?::(\d{2}))?\s+(malam|pagi|siang|sore)\s+([^dan]+?)(?:\s+dan\s+|\s+dan\s+jam\s+|$)/gi,
      // Pattern 5: "untuk [activity] jam X"
      /untuk\s+([^dan]+?)\s+jam\s+(\d{1,2})(?::(\d{2}))?(?:\s+dan\s+|\s+dan\s+jam\s+|$)/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(input)) !== null) {
        let hour, minute, activity;

        if (
          pattern.source.includes("untuk") &&
          pattern.source.includes("jam")
        ) {
          // Pattern 5: "untuk [activity] jam X"
          activity = match[1].trim();
          hour = parseInt(match[2]);
          minute = match[3] ? parseInt(match[3]) : 0;
        } else if (pattern.source.includes("malam|pagi|siang|sore")) {
          // Pattern 4: "jam X malam/pagi/siang [activity]"
          hour = parseInt(match[1]);
          minute = match[2] ? parseInt(match[2]) : 0;
          const timeOfDay = match[3];
          activity = match[4].trim();

          // Convert to 24-hour format
          if (timeOfDay === "malam" && hour < 12) {
            hour += 12;
          } else if (timeOfDay === "siang" && hour < 12) {
            hour += 12;
          } else if (timeOfDay === "sore" && hour < 12) {
            hour += 12;
          }
        } else {
          // Patterns 1-3: "jam X [activity]"
          hour = parseInt(match[1]);
          minute = match[2] ? parseInt(match[2]) : 0;
          activity = match[3].trim();
        }

        // Clean up activity name
        const cleanActivity = activity
          .replace(/^dan\s+/i, "") // Remove leading "dan"
          .replace(/\s+dan\s+.*$/i, "") // Remove trailing "dan ..."
          .trim();

        if (
          cleanActivity &&
          hour >= 0 &&
          hour <= 23 &&
          cleanActivity.length > 1
        ) {
          const startTime = new Date(targetDate);
          startTime.setHours(hour, minute, 0, 0);
          const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

          schedules.push({
            title: cleanActivity,
            description: "",
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
          });

          console.log("Detected schedule from input:", {
            cleanActivity,
            hour,
            minute,
            startTime,
          });
        }
      }
    }

    // Remove duplicates based on title and time
    const uniqueSchedules = schedules.filter(
      (schedule, index, self) =>
        index ===
        self.findIndex(
          (s) =>
            s.title === schedule.title && s.start_time === schedule.start_time
        )
    );

    return uniqueSchedules;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text) return;

    const apiKey = localStorage.getItem("ssai_apiKey") || "";
    let provider = localStorage.getItem("ssai_provider") || "";
    if (!provider) provider = "gemini";
    if (!apiKey || provider !== "gemini") {
      toast({
        title: "API Key Gemini belum diatur.",
        description: "Silakan atur API key Gemini di halaman pengaturan.",
      });
      return;
    }

    setLoading(true);
    onResult("");

    try {
      // Get current schedules context
      const scheduleContext =
        schedules.length > 0
          ? `Jadwal saat ini: ${schedules
              .map(
                (s) =>
                  `${s.title} pada ${new Date(s.start_time).toLocaleString(
                    "id-ID"
                  )}`
              )
              .join(", ")}`
          : "Belum ada jadwal tersimpan.";

      const prompt = `Kamu adalah asisten AI untuk menyusun jadwal harian yang rapi dan dapat otomatis menambahkan jadwal ke database. 

${scheduleContext}

Berdasarkan permintaan berikut, buatkan jadwal dengan format yang rapi dan HARUS sertakan format JADWAL_DATA untuk setiap jadwal:

"${text}"

PENTING: Setiap jadwal yang bisa dijadwalkan HARUS memiliki baris JADWAL_DATA terpisah di akhir respons.

Format output yang HARUS diikuti:
1. Berikan penjelasan jadwal yang rapi
2. Di akhir, tambahkan JADWAL_DATA untuk setiap jadwal (TANPA TANDA BINTANG)

Contoh format yang benar:
Berikut jadwal untuk hari ini:

08:00 - Sarapan dan persiapan
09:00 - Kelas
12:00 - Makan siang
15:00 - Jalan-jalan dengan teman
18:00 - Istirahat

JADWAL_DATA: judul: Kelas waktu: 09:00 tanggal: ${getTodayDate()}
JADWAL_DATA: judul: Makan siang waktu: 12:00 tanggal: ${getTodayDate()}
JADWAL_DATA: judul: Jalan-jalan dengan teman waktu: 15:00 tanggal: ${getTodayDate()}

Aturan:
- Jika user bilang "besok", gunakan tanggal besok (${getTomorrowDate()})
- Jika user bilang "hari ini", gunakan tanggal hari ini (${getTodayDate()})
- Jika tidak ada keterangan waktu, gunakan tanggal hari ini (${getTodayDate()})
- Setiap jadwal harus ada JADWAL_DATA terpisah
- Deteksi semua jadwal yang disebutkan user
- Gunakan bahasa Indonesia yang sopan dan ramah
- PENTING: JADWAL_DATA TANPA TANDA BINTANG (**) di depan atau belakang

PENTING: Jangan lupa menambahkan JADWAL_DATA untuk setiap jadwal di akhir respons!`;

      console.log("Sending prompt to AI:", prompt); // Debug log

      const res = await fetch(
        `${GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.5,
              topK: 1,
              topP: 1,
              maxOutputTokens: 600,
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
      const aiResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Tidak ada jadwal yang didapatkan dari AI";

      console.log("Raw AI Response:", aiResponse); // Debug log

      // Try to parse and add schedule automatically
      const finalResponse = await parseAndAddMultipleSchedules(
        aiResponse.trim(),
        text
      );
      onResult(finalResponse);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Terjadi kesalahan saat fetch.";
      toast({
        title: "Gagal meminta jadwal ke Gemini",
        description: errorMessage,
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
          💡 <strong>Tips:</strong> AI sekarang dapat otomatis menambahkan
          jadwal ke kalender Anda! Contoh: "Buatkan jadwal meeting tim besok jam
          2 siang"
        </p>
        <p className="text-sm text-muted-foreground">
          🔧 <strong>Debug:</strong> Jika AI tidak menyimpan jadwal, coba tombol
          test di bawah untuk memastikan database berfungsi.
        </p>
        <p className="text-sm text-muted-foreground">
          📝 <strong>Format yang didukung:</strong>
        </p>
        <ul className="text-sm text-muted-foreground ml-4 space-y-1">
          <li>
            • "saya besok ada jadwal jam 9 untuk kelas dan jam 12 untuk makan
            siang"
          </li>
          <li>• "jadwalkan meeting jam 14:00 dan rapat jam 16:00"</li>
          <li>• "besok jam 8 olahraga, jam 10 kerja, jam 15 jalan-jalan"</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-2">
          🎯 <strong>Fitur:</strong> Sistem akan otomatis mendeteksi tanggal
          (hari ini/besok) dan menyimpan semua jadwal yang ditemukan!
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

      {/* Debug buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          onClick={async () => {
            try {
              const testSchedule = {
                title: "Test Jadwal AI",
                description: "Jadwal test untuk debugging",
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
              };
              console.log("Testing database with:", testSchedule);
              await addSchedule(testSchedule);
              console.log("Test schedule added successfully");
              toast({
                title: "Test Berhasil",
                description: "Database berfungsi dengan baik",
              });
            } catch (error) {
              console.error("Test failed:", error);
              toast({
                title: "Test Gagal",
                description:
                  error instanceof Error ? error.message : "Unknown error",
                variant: "destructive",
              });
            }
          }}
        >
          Test Database
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const apiKey = localStorage.getItem("ssai_apiKey");
            const provider = localStorage.getItem("ssai_provider");
            console.log("API Key exists:", !!apiKey);
            console.log("Provider:", provider);
            toast({
              title: "Debug Info",
              description: `API Key: ${
                apiKey ? "Ada" : "Tidak ada"
              }, Provider: ${provider || "Tidak ada"}`,
            });
          }}
        >
          Check API Key
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const testResponse = `Berikut jadwal untuk hari ini:

08:00 - Sarapan dan persiapan
09:00 - Kelas
12:00 - Makan siang
15:00 - Jalan-jalan dengan teman
18:00 - Istirahat

JADWAL_DATA: judul: Kelas waktu: 09:00 tanggal: ${getTodayDate()}
JADWAL_DATA: judul: Makan siang waktu: 12:00 tanggal: ${getTodayDate()}
JADWAL_DATA: judul: Jalan-jalan dengan teman waktu: 15:00 tanggal: ${getTodayDate()}`;

            console.log("Testing JADWAL_DATA parsing with:", testResponse);
            parseAndAddMultipleSchedules(testResponse, "test input");
            toast({
              title: "Test Parsing",
              description:
                "Testing JADWAL_DATA parsing - check console for results",
            });
          }}
        >
          Test JADWAL_DATA Parsing
        </Button>
      </div>
    </div>
  );
};

export default SchedulerInput;
