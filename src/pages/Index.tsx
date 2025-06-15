import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Mic, Settings } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulasi simple auth check (replace with Supabase/auth actual)
    const hasAuth = localStorage.getItem("ssai_hasAuth") === "1";
    if (!hasAuth) {
      navigate("/onboarding");
    } else {
      navigate("/dashboard");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col gap-4 items-center text-center animate-fade-in">
        <h1 className="text-4xl font-bold mb-2">Smart Scheduler AI</h1>
        <p className="max-w-xl text-muted-foreground text-lg mb-6">
          Atur jadwal harianmu otomatis dengan AI & voice note. Cukup bicara atau ketik, biarkan AI menyusun rutinitas efisien untukmu!
        </p>
        <div className="flex gap-4">
          <Button onClick={() => navigate("/onboarding")} size="lg" className="animate-scale-in">
            <Settings className="mr-2" /> Mulai Onboarding
          </Button>
          <Button variant="outline" onClick={() => navigate("/login")} size="lg" className="animate-scale-in">
            <span className="mr-2">👤</span> Login / Daftar
          </Button>
        </div>
        <div className="mt-6 text-sm text-muted-foreground opacity-70">
          &copy; 2025 — Dibuat dengan ❤️ oleh Fajrikun
        </div>
      </div>
    </div>
  );
};

export default Index;
