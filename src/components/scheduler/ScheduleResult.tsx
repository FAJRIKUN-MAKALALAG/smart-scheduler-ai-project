
type ScheduleResultProps = {
  schedule: string | null;
};

export default function ScheduleResult({ schedule }: ScheduleResultProps) {
  if (!schedule) {
    return (
      <div className="w-full rounded-xl bg-muted p-6 text-muted-foreground flex items-center justify-center">
        Jadwal akan tampil di sini setelah kamu submit.
      </div>
    );
  }
  return (
    <div className="border bg-card rounded-xl shadow p-6">
      <div className="font-bold mb-2">Jadwal dari AI:</div>
      <pre className="whitespace-pre-wrap text-base">{schedule}</pre>
      <div className="mt-4 flex gap-3">
        <button className="text-primary underline hover:text-primary/80 text-sm">Simpan</button>
        <button className="text-yellow-600 underline hover:text-yellow-500 text-sm">Revisi/Jelaskan</button>
      </div>
    </div>
  );
}
