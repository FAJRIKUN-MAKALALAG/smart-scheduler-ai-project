
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

type ApiKeyModalProps = {
  open: boolean;
  onClose: () => void;
  onKeyEntered?: (key: string) => void;
  provider?: string;
};

const DUMMY_VALID = (provider: string, key: string): boolean => {
  if (provider === "openai") return key.startsWith("sk-") && key.length > 20;
  if (provider === "gemini") return key.startsWith("AI") && key.length > 5;
  return false;
};

const ApiKeyModal = ({ open, onClose, onKeyEntered, provider = "openai" }: ApiKeyModalProps) => {
  const [key, setKey] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    setChecking(true);
    setError(null);

    if (!DUMMY_VALID(provider, key)) {
      setError("Format API key tidak sesuai.");
      setChecking(false);
      return;
    }

    setTimeout(() => {
      // Simulasi validasi sukses
      if (onKeyEntered) onKeyEntered(key);
      localStorage.setItem("ssai_apiKey", key);
      onClose();
      setChecking(false);
      toast({ title: "API Key valid & tersimpan" });
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Masukkan API Key</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          <Input
            type="text"
            placeholder={provider === "openai" ? "sk-..." : "AI..."}
            value={key}
            autoFocus
            disabled={checking}
            onChange={e => setKey(e.target.value)}
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button onClick={handleCheck} disabled={!key || checking}>
            {checking ? "Validasi..." : "Simpan"}
          </Button>
          <div className="text-xs mt-2 text-muted-foreground">
            <span>
              API key{" "}
              <a
                className="text-primary underline"
                href={
                  provider === "openai"
                    ? "https://platform.openai.com/api-keys"
                    : "https://aistudio.google.com/app/apikey"
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                {provider === "openai" ? "OpenAI" : "Gemini"}
              </a>{" "}
              {provider === "openai" ? " (berbayar)" : " (gratis)"}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
