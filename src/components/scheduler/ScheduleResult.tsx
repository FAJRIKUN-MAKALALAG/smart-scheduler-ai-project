
type ScheduleResultProps = {
  schedule: string | null;
};

export default function ScheduleResult({ schedule }: ScheduleResultProps) {
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
        <pre className="whitespace-pre-wrap text-base font-mono text-foreground leading-snug">
          {schedule}
        </pre>
      </div>
      <div className="mt-5 flex gap-4">
        <button className="px-5 py-2 rounded-lg bg-primary text-primary-foreground shadow hover:bg-primary/90 transition font-semibold">
          Simpan
        </button>
        <button className="px-5 py-2 rounded-lg bg-yellow-100 text-yellow-800 font-semibold border border-yellow-300 shadow hover:bg-yellow-200 transition">
          Revisi/Jelaskan
        </button>
      </div>
    </div>
  );
}
