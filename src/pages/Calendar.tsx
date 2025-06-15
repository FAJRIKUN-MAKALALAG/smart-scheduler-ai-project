
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
      <main className="flex-1 px-8 py-8">
        <div className="flex items-center gap-3 mb-4">
          <LucideCalendar className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Kalender Jadwalmu</h2>
        </div>
        <div className="bg-card rounded-xl shadow-lg p-6 min-h-[350px]">
          {/* Sederhana, mingguan: */}
          <h3 className="text-lg font-semibold mb-3">Jadwal Hari Ini</h3>
          <ul className="space-y-2">
            {dummyEvents.map((ev, idx) => (
              <li key={idx} className="flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                <span className="font-mono w-16">{ev.time}</span>
                <span>{ev.activity}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-muted-foreground text-sm opacity-80">
            * Integrasi kalender penuh siap di tahap sprint!
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
