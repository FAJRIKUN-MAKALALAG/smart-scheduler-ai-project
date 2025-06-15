
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ScheduleResultProps = {
  schedule: string | null;
};

function renderSchedule(schedule: string) {
  // Pisah jadwal per baris
  const lines = schedule.trim().split("\n").filter(Boolean);
  // Cek apakah mayoritas baris berformat waktu HH:MM - aktivitas
  const isTimeFormat = (line: string) =>
    /^\d{1,2}:\d{2}\s*-\s*/.test(line);

  const validCount = lines.filter(isTimeFormat).length;
  // Jika paling sedikit 2 baris pakai format waktu, kita tampilkan sebagai daftar yang rapi
  if (validCount >= 2) {
    return (
      <ul className="space-y-2 pl-2">
        {lines.map((line, idx) => {
          const match = line.match(/^(\d{1,2}:\d{2})\s*-\s*(.*)$/);
          if (!match) {
            return (
              <li key={idx} className="text-foreground font-mono">
                {line}
              </li>
            );
          }
          const [, time, activity] = match;
          return (
            <li
              key={idx}
              className="flex gap-4 items-baseline border-l-4 border-primary/40 pl-3 py-1 bg-background/70 rounded"
            >
              <div className="font-bold tracking-wide min-w-[60px] text-sm text-primary">{time}</div>
              <div className="text-base font-medium">{activity}</div>
            </li>
          );
        })}
      </ul>
    );
  }
  // fallback default: tampilkan apa adanya
  return (
    <pre className="whitespace-pre-wrap text-base font-mono text-foreground leading-snug">
      {schedule}
    </pre>
  );
}

export default function ScheduleResult({ schedule }: ScheduleResultProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  if (!schedule) {
    return (
      <div className="w-full rounded-xl bg-muted/80 p-7 text-muted-foreground flex items-center justify-center text-center text-base min-h-[120px] border border-muted">
        Jadwal akan tampil di sini setelah kamu submit.
      </div>
    );
  }
  return (
    <div className="border bg-card rounded-2xl shadow-lg p-6 max-w-2xl mx-auto animate-fade-in">
      <div className="font-extrabold text-xl text-primary mb-2 tracking-tight">
        Jadwal dari AI
      </div>
      <div className="bg-muted/80 rounded-lg p-4 text-left">
        {renderSchedule(schedule)}
      </div>
      <div className="mt-5 flex gap-4">
        <Button className="px-5 py-2 rounded-lg shadow font-semibold">
          Simpan
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              className="px-5 py-2 rounded-lg bg-yellow-100 text-yellow-800 font-semibold border border-yellow-300 shadow hover:bg-yellow-200 transition"
              onClick={() => setOpen(true)}
            >
              Revisi/Jelaskan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revisi/Jelaskan Jadwal AI</DialogTitle>
              <DialogDescription>
                Tulis revisi, penjelasan, atau permintaan tambahan terkait jadwal.
              </DialogDescription>
            </DialogHeader>
            <textarea
              className="w-full border rounded-lg p-2 mt-2 resize-none text-base min-h-[80px] bg-background"
              placeholder="Tulis permintaan revisi atau penjelasan di sini..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setReason("")}
                >
                  Batal
                </Button>
              </DialogClose>
              <Button
                type="button"
                disabled={!reason.trim()}
                onClick={() => {
                  // Placeholder: nanti bisa dihubungkan ke AI/kirim prompt revisi
                  setOpen(false);
                  setReason("");
                }}
              >
                Kirim
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
