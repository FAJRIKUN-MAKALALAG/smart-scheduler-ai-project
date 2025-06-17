
import { AppSidebar } from "@/components/layout/AppSidebar";
import SchedulerInput from "@/components/scheduler/SchedulerInput";
import ScheduleResult from "@/components/scheduler/ScheduleResult";
import ChatbotInteraction from "@/components/scheduler/ChatbotInteraction";
import { useState } from "react";

const Dashboard = () => {
  const [schedule, setSchedule] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <main className="flex-1 flex flex-col p-8 bg-background animate-fade-in">
        <h2 className="text-2xl font-semibold mb-4">🧠 Jadwal AI Kamu</h2>
        
        {/* Original Scheduler Input */}
        <SchedulerInput onResult={setSchedule} />
        
        {/* Schedule Result */}
        <div className="mt-8">
          <ScheduleResult schedule={schedule} />
        </div>

        {/* Interactive Chatbot */}
        <div className="mt-8">
          <ChatbotInteraction 
            onScheduleUpdate={setSchedule}
            currentSchedule={schedule}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
