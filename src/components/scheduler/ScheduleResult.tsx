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

// Markdown sederhana: bold, italic, bullet point, judul
function simpleMarkdown(str: string) {
  let txt = str
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<i>$1</i>');
  return txt;
}

function renderSchedule(schedule: string) {
  if (!schedule) return null;

  // Bagi per baris
  const lines = schedule.trim().split("\n").filter(Boolean);
  // Cek untuk list waktu
  const isTimeLine = (line: string) =>
    /^\s*\d{1,2}[:.]\d{2}\s*[-–]\s*/.test(line);

  const timeCount = lines.filter(isTimeLine).length;
  if (timeCount >= 2) {
    // Format jam - aktivitas jadi list
    return (
      <ul className="space-y-2 pl-1">
        {lines.map((line, idx) => {
          const match = line.match(/^\s*(\d{1,2}[:.]\d{2})\s*[-–]\s*(.*)$/);
          if (!match) {
            return (
              <li key={idx} className="text-foreground font-mono">
                <span dangerouslySetInnerHTML={{ __html: simpleMarkdown(line) }} />
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
              <div className="text-base font-medium">
                <span dangerouslySetInnerHTML={{ __html: simpleMarkdown(activity) }} />
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  // Markdown unordered list & judul
  if (lines.filter(l => /^\s*[\*\-]\s+/.test(l)).length >= 2) {
    return (
      <ul className="list-disc pl-6 space-y-1">
        {lines.map((line, idx) => {
          const listMatch = line.match(/^\s*[\*\-]\s+(.*)$/);
          if (listMatch) {
            return (
              <li className="text-base" key={idx}>
                <span dangerouslySetInnerHTML={{ __html: simpleMarkdown(listMatch[1]) }} />
              </li>
            );
          }
          // Heading markdown
          if (/^\s*#+\s+/.test(line)) {
            return (
              <li key={idx} className="text-lg font-bold pt-2">
                <span dangerouslySetInnerHTML={{ __html: simpleMarkdown(line.replace(/^#+\s+/, "")) }} />
              </li>
            );
          }
          // Default
          return (
            <li key={idx} className="text-base">
              <span dangerouslySetInnerHTML={{ __html: simpleMarkdown(line) }} />
            </li>
          );
        })}
      </ul>
    );
  }

  // Judul markdown ## atau ** atau plain judul di awal
  if (
    lines[0] &&
    (lines[0].startsWith("#") ||
      lines[0].startsWith("**") ||
      /^[A-Z][\w\s\-:]{2,}$/.test(lines[0]))
  ) {
    return (
      <div className="flex flex-col gap-2">
        <div className="mb-1 text-lg font-extrabold text-primary">
          <span dangerouslySetInnerHTML={{ __html: simpleMarkdown(lines[0].replace(/^#+\s*/, "")) }} />
        </div>
        <div className="flex flex-col gap-1">
          {lines.slice(1).map((l, i) => (
            <div
              key={i}
              className="text-base"
              dangerouslySetInnerHTML={{ __html: simpleMarkdown(l) }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Fallback: tampilkan apa adanya dengan monospace
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
