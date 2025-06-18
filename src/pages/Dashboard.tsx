import { AppSidebar } from "@/components/layout/AppSidebar";
import SchedulerInput from "@/components/scheduler/SchedulerInput";
import ScheduleResult from "@/components/scheduler/ScheduleResult";
import { useSchedules } from "@/hooks/useSchedules";
import { useNotifications } from "@/hooks/useNotifications";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  MailX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [schedule, setSchedule] = useState<string | null>(null);
  const { schedules, refetch, toggleCompletion } = useSchedules();
  const {
    enabled,
    enableEmailNotifications,
    disableEmailNotifications,
    scheduleEmailNotifications,
  } = useNotifications();

  // Get today's schedules
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaySchedules = schedules.filter((s) => {
    const scheduleDate = new Date(s.start_time);
    return scheduleDate >= today && scheduleDate < tomorrow;
  });

  const upcomingSchedules = todaySchedules.filter(
    (s) => new Date(s.start_time) > new Date() && !s.completed
  );
  const completedSchedules = todaySchedules.filter((s) => s.completed);
  const currentSchedules = todaySchedules.filter((s) => {
    const now = new Date();
    const start = new Date(s.start_time);
    const end = new Date(s.end_time);
    return now >= start && now <= end && !s.completed;
  });

  // Schedule email notifications for upcoming schedules
  useEffect(() => {
    if (enabled) {
      upcomingSchedules.forEach((schedule) => {
        scheduleEmailNotifications(schedule);
      });
    }
  }, [upcomingSchedules, enabled, scheduleEmailNotifications]);

  const handleToggleCompletion = async (scheduleId: string) => {
    try {
      await toggleCompletion(scheduleId);
    } catch (error) {
      console.error("Error toggling completion:", error);
    }
  };

  const handleToggleEmailNotifications = () => {
    if (enabled) {
      disableEmailNotifications();
      toast({
        title: "Notifikasi Email Dinonaktifkan",
        description: "Anda tidak akan menerima email pengingat lagi",
      });
    } else {
      enableEmailNotifications();
      toast({
        title: "Notifikasi Email Diaktifkan",
        description:
          "Anda akan menerima email pengingat untuk jadwal yang akan datang",
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AppSidebar />
      <main className="flex-1 flex flex-col p-4 lg:p-8 animate-fade-in pb-20 md:pb-8">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Smart Scheduler AI
                </h1>
                <p className="text-sm md:text-lg text-muted-foreground">
                  Kelola jadwal Anda dengan bantuan AI yang pintar
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleToggleEmailNotifications}
                variant="outline"
                size="sm"
                className={`gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 hover:bg-white dark:hover:bg-gray-800 ${
                  enabled
                    ? "border-green-500 text-green-600"
                    : "border-gray-400 text-gray-600"
                }`}
              >
                {enabled ? (
                  <Mail className="w-4 h-4" />
                ) : (
                  <MailX className="w-4 h-4" />
                )}
                <span className="hidden md:inline">
                  {enabled ? "Email Aktif" : "Email Nonaktif"}
                </span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-white/20">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Hari Ini
                  </p>
                  <p className="text-lg md:text-2xl font-bold">
                    {todaySchedules.length} Jadwal
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-white/20">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Selesai
                  </p>
                  <p className="text-lg md:text-2xl font-bold">
                    {completedSchedules.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-white/20">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                  <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Berikutnya
                  </p>
                  <p className="text-lg md:text-2xl font-bold">
                    {upcomingSchedules.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-white/20">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <Mail className="w-4 h-4 md:w-5 md:h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Email
                  </p>
                  <p className="text-lg md:text-2xl font-bold">
                    {enabled ? "Aktif" : "Nonaktif"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="ai-scheduler" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 shadow-lg">
            <TabsTrigger
              value="ai-scheduler"
              className="gap-2 text-sm md:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Brain className="w-4 h-4" />
              <span className="hidden md:inline">AI Scheduler</span>
              <span className="md:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger
              value="today"
              className="gap-2 text-sm md:text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden md:inline">Hari Ini</span>
              <span className="md:hidden">Hari Ini</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-scheduler" className="space-y-6 mt-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Generator Jadwal AI</h3>
              </div>
              <SchedulerInput onResult={setSchedule} />
            </div>

            <ScheduleResult schedule={schedule} />
          </TabsContent>

          <TabsContent value="today" className="space-y-6 mt-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-green-600 to-blue-600 p-2 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Jadwal Hari Ini</h3>
              </div>

              {todaySchedules.length > 0 ? (
                <div className="space-y-4">
                  {currentSchedules.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Sedang Berlangsung
                      </h4>
                      <div className="space-y-3">
                        {currentSchedules.map((schedule) => (
                          <div
                            key={schedule.id}
                            className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Checkbox
                                    checked={schedule.completed}
                                    onCheckedChange={() =>
                                      handleToggleCompletion(schedule.id)
                                    }
                                    className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                                  />
                                  <h4 className="font-semibold text-lg">
                                    {schedule.title}
                                  </h4>
                                  <Badge
                                    variant="secondary"
                                    className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                                  >
                                    Sedang Berlangsung
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {new Date(
                                    schedule.start_time
                                  ).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  -{" "}
                                  {new Date(
                                    schedule.end_time
                                  ).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                {schedule.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {schedule.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {upcomingSchedules.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Jadwal Berikutnya
                      </h4>
                      <div className="space-y-3">
                        {upcomingSchedules.map((schedule) => (
                          <div
                            key={schedule.id}
                            className="bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Checkbox
                                    checked={schedule.completed}
                                    onCheckedChange={() =>
                                      handleToggleCompletion(schedule.id)
                                    }
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                  />
                                  <h4 className="font-semibold text-lg">
                                    {schedule.title}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                  >
                                    Upcoming
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {new Date(
                                    schedule.start_time
                                  ).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  -{" "}
                                  {new Date(
                                    schedule.end_time
                                  ).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                {schedule.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {schedule.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {completedSchedules.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Selesai
                      </h4>
                      <div className="space-y-3">
                        {completedSchedules.map((schedule) => (
                          <div
                            key={schedule.id}
                            className="bg-gray-50/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-600 rounded-2xl p-6 opacity-75"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Checkbox
                                    checked={schedule.completed}
                                    onCheckedChange={() =>
                                      handleToggleCompletion(schedule.id)
                                    }
                                    className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                  />
                                  <h4 className="font-semibold text-lg line-through">
                                    {schedule.title}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                  >
                                    Selesai
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {new Date(
                                    schedule.start_time
                                  ).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}{" "}
                                  -{" "}
                                  {new Date(
                                    schedule.end_time
                                  ).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                                {schedule.description && (
                                  <p className="text-sm text-muted-foreground">
                                    {schedule.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Tidak ada jadwal hari ini
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Gunakan AI Scheduler untuk membuat jadwal baru
                  </p>
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl inline-block font-medium">
                    Mulai Buat Jadwal
                  </div>
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
