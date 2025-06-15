
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
import { Wand2, PencilLine } from "lucide-react";

// Hanya bold, italic (markdown simpel)
function simpleMarkdown(str: string) {
  let txt = str
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g, "<i>$1</i>");
  return txt;
}

// Wrapper icon untuk aktivitas
function ActivityIcon() {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary/80 mr-2">
      <Wand2 size={16} />
    </span>
  );
}

function renderSchedule(schedule: string) {
  if (!schedule) return null;
  const lines = schedule.trim().split("\n").filter(Boolean);

  // List berdasarkan jam (07:00 - Aktivitas)
  const isTimeLine = (line: string) => /^\s*\d{1,2}[:.]\d{2}\s*[-–]\s*/.test(line);
  const timeCount = lines.filter(isTimeLine).length;
  if (timeCount >= 2) {
    return (
      <ul className="pl-0 flex flex-col gap-2 mt-1">
        {lines.map((line, idx) => {
          const match = line.match(/^\s*(\d{1,2}[:.]\d{2})\s*[-–]\s*(.*)$/);
          if (!match) {
            return (
              <li key={idx} className="text-foreground font-mono pl-9">
                <span dangerouslySetInnerHTML={{ __html: simpleMarkdown(line) }} />
              </li>
            );
          }
          const [, time, activity] = match;
          return (
            <li
              key={idx}
              className="group flex gap-3 items-center border border-primary/10 bg-background/95 rounded-xl px-3 py-2 shadow-sm hover:border-primary/30 animate-fade-in"
            >
              <div className="flex flex-col items-center min-w-[48px]">
                <div className="font-bold text-primary text-base tracking-wide leading-5 bg-primary/10 px-2 py-1 rounded-md shadow-sm">
                  {time}
                </div>
                {idx !== lines.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/10 to-transparent mt-1 mb-1" />
                )}
              </div>
              <div className="flex-1 flex items-center">
                <ActivityIcon />
                <span
                  className="text-base md:text-lg font-medium text-foreground"
                  dangerouslySetInnerHTML={{ __html: simpleMarkdown(activity) }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  // Markdown bullet list & judul
  if (lines.filter(l => /^\s*[\*\-]\s+/.test(l)).length >= 2) {
    return (
      <ul className="list-none pl-0 flex flex-col gap-2 mt-1">
        {lines.map((line, idx) => {
          const listMatch = line.match(/^\s*[\*\-]\s+(.*)$/);
          if (listMatch) {
            return (
              <li
                className="flex gap-2 items-center bg-muted/70 border border-muted/40 rounded-md px-3 py-2"
                key={idx}
              >
                <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2 mt-1" />
                <span dangerouslySetInnerHTML={{ __html: simpleMarkdown(listMatch[1]) }} />
              </li>
            );
          }
          // Heading markdown
          if (/^\s*#+\s+/.test(line)) {
            return (
              <li key={idx} className="text-lg font-bold pt-4 pb-1 text-primary">
                <span dangerouslySetInnerHTML={{ __html: simpleMarkdown(line.replace(/^#+\s+/, "")) }} />
              </li>
            );
          }
          // Default
          return (
            <li key={idx} className="text-base pl-6">
              <span dangerouslySetInnerHTML={{ __html: simpleMarkdown(line) }} />
            </li>
          );
        })}
      </ul>
    );
  }

  // Judul markdown ##/**/plain judul atas
  if (
    lines[0] &&
    (lines[0].startsWith("#") ||
      lines[0].startsWith("**") ||
      /^[A-Z][\w\s\-:]{2,}$/.test(lines[0]))
  ) {
    return (
      <div className="flex flex-col gap-2">
        <div className="mb-1 text-xl md:text-2xl font-extrabold text-primary drop-shadow animate-fade-in">
          <span dangerouslySetInnerHTML={{ __html: simpleMarkdown(lines[0].replace(/^#+\s*/, "")) }} />
        </div>
        <div className="flex flex-col gap-1">
          {lines.slice(1).map((l, i) => (
            <div
              key={i}
              className="text-base md:text-lg px-2 py-1 animate-fade-in"
              dangerouslySetInnerHTML={{ __html: simpleMarkdown(l) }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Fallback: tampilkan apa adanya dengan monospace
  return (
    <pre className="whitespace-pre-wrap text-base font-mono text-foreground leading-snug bg-background/80 rounded-lg px-4 py-3 border border-muted mt-2">
      {schedule}
    </pre>
  );
}

export default function ScheduleResult({ schedule }: { schedule: string | null }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);

  if (!schedule) {
    return (
      <div className="w-full rounded-2xl bg-muted/80 p-8 text-muted-foreground flex items-center justify-center text-center text-base min-h-[140px] border border-muted shadow animate-fade-in">
        Jadwal AI akan tampil di sini setelah kamu submit permintaan.
      </div>
    );
  }

  return (
    <div
      className="border-2 border-primary/10 bg-gradient-to-br from-background via-muted/40 to-background/90 rounded-3xl shadow-xl p-6 md:p-8 max-w-2xl mx-auto animate-fade-in relative overflow-hidden"
      style={{ boxShadow: "0 6px 36px 0 rgb(58 70 104 / 18%)" }}
    >
      <div className="font-extrabold text-2xl md:text-3xl text-primary mb-3 tracking-tight flex items-center gap-2 animate-fade-in">
        <Wand2 className="w-7 h-7 text-primary/70 mb-1" /> Jadwal dari AI
      </div>
      <div className="bg-background/70 rounded-2xl p-4 md:p-6 text-left border border-muted/50 shadow-inner min-h-[110px] animate-fade-in">
        {renderSchedule(schedule)}
      </div>
      <div className="mt-7 flex flex-wrap gap-4">
        <Button className="px-6 py-2 rounded-lg shadow font-semibold">
          Simpan
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="px-6 py-2 rounded-lg border-yellow-300 text-yellow-900 font-semibold bg-gradient-to-r from-yellow-100 to-yellow-50 hover:from-yellow-200 hover:to-yellow-100 shadow hover:shadow-md flex gap-2"
              onClick={() => setOpen(true)}
            >
              <PencilLine className="w-4 h-4" />
              Revisi/Jelaskan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
                <PencilLine className="w-5 h-5 text-yellow-700" />
                Revisi/Jelaskan Jadwal AI
              </DialogTitle>
              <DialogDescription>
                Tulis revisi, penjelasan, atau permintaan tambahan terkait jadwal AI dengan detail agar hasil AI makin akurat.
              </DialogDescription>
            </DialogHeader>
            {!sent ? (
              <>
                <textarea
                  className="w-full border border-muted rounded-lg p-3 mt-4 resize-none text-base min-h-[96px] bg-background focus:ring-2 focus:ring-primary/40 transition"
                  placeholder="Tulis permintaan revisi atau penjelasan di sini..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
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
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => {
                      // Placeholder: kirim permintaan revisi ke AI di sini.
                      setSent(true);
                      setTimeout(() => {
                        setOpen(false);
                        setSent(false);
                        setReason("");
                      }, 1500);
                    }}
                  >
                    Kirim
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <div className="text-center py-8 text-lg font-medium text-green-700 animate-fade-in">
                Permintaan revisi sudah dikirim!<br />Tunggu AI membalas/jadwal diupdate.
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
