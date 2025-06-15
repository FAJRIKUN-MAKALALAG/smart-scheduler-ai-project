
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Calendar as LucideCalendar } from "lucide-react";
import { useState } from "react";

const dummyEvents = [
  {
    time: "07:00",
    activity: "Olahraga pagi",
  },
  {
    time: "09:00",
    activity: "Rapat tim kerja",
  },
  {
    time: "13:00",
    activity: "Makan siang & istirahat",
  },
  {
    time: "15:00",
    activity: "Mengerjakan tugas kuliah",
  },
];

const CalendarPage = () => {
  const [selectedDate] = useState(new Date());

  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <main className="flex-1 px-4 md:px-8 py-8 bg-background">
        <div className="flex items-center gap-3 mb-4">
          <LucideCalendar className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Kalender Jadwalmu</h2>
        </div>
        <div className="bg-card rounded-2xl shadow-lg px-0 md:px-6 py-6 min-h-[350px] flex flex-col gap-4">
          <h3 className="text-lg font-bold px-6 mb-2">Jadwal Hari Ini</h3>
          <div className="w-full flex-1">
            <ul className="flex flex-col gap-0">
              {dummyEvents.map((ev, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-4 px-6 py-4 border-b last:border-b-0 hover:bg-muted/60 transition-colors group"
                >
                  <div className="flex flex-col items-center">
                    <span className="font-mono font-semibold text-base text-primary mb-1">
                      {ev.time}
                    </span>
                    <div className="w-1 h-5 bg-primary/10 rounded" />
                  </div>
                  <div className="flex-1">
                    <span className="block font-semibold text-base sm:text-lg text-foreground mb-1">
                      {ev.activity}
                    </span>
                    <span className="text-xs text-muted-foreground opacity-80">
                      {/* Bisa dikembangkan dengan detail, sekarang kosong */}
                    </span>
                  </div>
                  {/* Aksi atau status bisa di sini nanti */}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-2 text-muted-foreground text-xs opacity-80 px-6">
            * Integrasi kalender penuh siap di tahap sprint!
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;

