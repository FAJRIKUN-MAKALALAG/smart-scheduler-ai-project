
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ApiKeyModal from "@/components/onboarding/ApiKeyModal";

const SettingsPage = () => {
  const [notif, setNotif] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <main className="flex-1 px-6 py-8">
        <h2 className="text-2xl font-bold mb-8">⚙️ Pengaturan</h2>
        <div className="max-w-lg space-y-8">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold">Notifikasi Reminder</div>
                <div className="text-muted-foreground text-sm">Aktifkan agar dapat reminder sebelum event!</div>
              </div>
              <Switch checked={notif} onCheckedChange={setNotif} aria-label="Aktifkan reminder" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold">API Key</div>
                <div className="text-muted-foreground text-sm">Edit API key kamu untuk AI provider.</div>
              </div>
              <Button variant="outline" onClick={() => setModalOpen(true)}>
                Ganti API Key
              </Button>
            </div>
          </div>
        </div>
        <ApiKeyModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </main>
    </div>
  );
};

export default SettingsPage;
