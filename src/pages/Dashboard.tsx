
import { AppSidebar } from "@/components/layout/AppSidebar";
import SchedulerInput from "@/components/scheduler/SchedulerInput";
import ScheduleResult from "@/components/scheduler/ScheduleResult";
import { ScheduleChatbot } from "@/components/scheduler/ScheduleChatbot";
import { useSchedules } from "@/hooks/useSchedules";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MessageCircle, Brain } from "lucide-react";

const Dashboard = () => {
  const [schedule, setSchedule] = useState<string | null>(null);
  const { schedules, refetch } = useSchedules();

  // Get today's schedules
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaySchedules = schedules.filter(s => {
    const scheduleDate = new Date(s.start_time);
    return scheduleDate >= today && scheduleDate < tomorrow;
  });

  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <main className="flex-1 flex flex-col p-8 bg-background animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">🧠 Dashboard Jadwal AI</h2>
          <p className="text-muted-foreground">
            Kelola jadwal Anda dengan bantuan AI yang pintar dan terintegrasi dengan kalender
          </p>
        </div>

        <Tabs defaultValue="ai-scheduler" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ai-scheduler" className="gap-2">
              <Brain className="w-4 h-4" />
              AI Scheduler
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              Chatbot
            </TabsTrigger>
            <TabsTrigger value="today" className="gap-2">
              <Calendar className="w-4 h-4" />
              Hari Ini
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-scheduler" className="space-y-6">
            <div className="bg-card rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Generator Jadwal AI</h3>
              <SchedulerInput onResult={setSchedule} />
            </div>
            
            <ScheduleResult schedule={schedule} />
          </TabsContent>

          <TabsContent value="chatbot">
            <ScheduleChatbot onScheduleChange={refetch} />
          </TabsContent>

          <TabsContent value="today" className="space-y-6">
            <div className="bg-card rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Jadwal Hari Ini</h3>
              
              {todaySchedules.length > 0 ? (
                <div className="space-y-3">
                  {todaySchedules.map((schedule) => (
                    <div key={schedule.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{schedule.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(schedule.start_time).toLocaleTimeString('id-ID', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} - {new Date(schedule.end_time).toLocaleTimeString('id-ID', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                          {schedule.description && (
                            <p className="text-sm text-muted-foreground mt-1">{schedule.description}</p>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(schedule.start_time) > new Date() ? '⏰ Upcoming' : '✅ Current'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Tidak ada jadwal hari ini</p>
                  <p className="text-sm">Gunakan AI Scheduler atau Chatbot untuk membuat jadwal</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
