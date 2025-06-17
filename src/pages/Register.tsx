
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    navigate("/dashboard");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(email, password);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Akun berhasil dibuat! Silakan cek email untuk verifikasi.",
      });
      navigate("/login");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="m-auto w-full max-w-md p-8 bg-card rounded-xl shadow-lg animate-fade-in flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-primary/10 rounded-full p-2 mb-2">
            <UserPlus className="text-primary" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-center">Daftar Smart Scheduler AI</h2>
          <p className="text-muted-foreground text-sm">Buat akun baru untuk mulai mengatur jadwal otomatis!</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="nama@email.com" 
              required 
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Minimal 6 karakter" 
              required 
              minLength={6} 
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="mt-2 w-full" size="lg" disabled={loading}>
            {loading ? "Memproses..." : "Daftar"}
          </Button>
        </form>
        <div className="text-sm text-center text-muted-foreground">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
