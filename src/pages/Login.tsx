
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    navigate("/dashboard");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Berhasil",
        description: "Login berhasil!",
      });
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="m-auto w-full max-w-md p-8 bg-card rounded-xl shadow-lg animate-fade-in flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-primary/10 rounded-full p-2 mb-2">
            <LogIn className="text-primary" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-center">Masuk ke Smart Scheduler AI</h2>
          <p className="text-muted-foreground text-sm">Masukkan email & password Anda untuk login.</p>
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
              placeholder="••••••••" 
              required 
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="mt-2 w-full" size="lg" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
        <div className="text-sm text-center text-muted-foreground">
          Belum punya akun?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Daftar sekarang
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
