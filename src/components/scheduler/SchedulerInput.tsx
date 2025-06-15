
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic } from "lucide-react";

type SchedulerInputProps = {
  onResult: (s: string) => void;
};

/** Dummy input; integrasi VN/chat ke backend di sprint berikut */
const SchedulerInput = ({ onResult }: SchedulerInputProps) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onResult(
        "07:00 - Bangun & olahraga\n09:00 - Briefing tim\n13:00 - Makan siang\n15:00 - Belajar React"
      );
      setLoading(false);
      setText("");
    }, 600);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-2xl">
      <Input
        placeholder="Tulis aktivitas yang diinginkan (atau rekam VN)..."
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
  );
};

export default SchedulerInput;
