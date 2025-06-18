import { AppSidebar } from "@/components/layout/AppSidebar";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Clock,
  CalendarDays,
  CheckCircle,
  AlertCircle,
  Mail,
  MailX,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSchedules, Schedule } from "@/hooks/useSchedules";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    title: "",
    description: "",
    time: "09:00",
  });
  const [view, setView] = useState("day");
  const [date, setDate] = useState<Date>(new Date());

  const {
    schedules,
    loading,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    toggleCompletion,
    refetch,
  } = useSchedules();

  const {
    enabled,
    enableEmailNotifications,
    disableEmailNotifications,
    scheduleEmailNotifications,
  } = useNotifications();

  // Highlight tanggal yang ada jadwal
  const scheduleDates = schedules.map((schedule) =>
    new Date(schedule.start_time).toDateString()
  );

  // Filter jadwal untuk tanggal yang dipilih
  const selectedDateSchedules = schedules.filter((schedule) => {
    const scheduleDate = new Date(schedule.start_time);
    return scheduleDate.toDateString() === selectedDate.toDateString();
  });

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

  const handleAddSchedule = async () => {
    try {
      const [hours, minutes] = newSchedule.time.split(":");
      const startTime = new Date(selectedDate);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1); // Default 1 hour duration

      await addSchedule({
        title: newSchedule.title,
        description: newSchedule.description,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      });

      setNewSchedule({ title: "", description: "", time: "09:00" });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding schedule:", error);
    }
  };

  const handleEditSchedule = async () => {
    if (!editingSchedule) return;

    try {
      const [hours, minutes] = newSchedule.time.split(":");
      const startTime = new Date(selectedDate);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      await updateSchedule(editingSchedule.id, {
        title: newSchedule.title,
        description: newSchedule.description,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      });

      setIsEditDialogOpen(false);
      setEditingSchedule(null);
      setNewSchedule({ title: "", description: "", time: "09:00" });
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  const openEditDialog = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setNewSchedule({
      title: schedule.title,
      description: schedule.description || "",
      time: new Date(schedule.start_time).toTimeString().slice(0, 5),
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
      await deleteSchedule(scheduleId);
    }
  };

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
      <main className="flex-1 p-4 lg:p-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-2xl shadow-lg">
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Kalender Jadwal
              </h1>
              <p className="text-sm md:text-lg text-muted-foreground">
                Kelola dan lihat semua jadwal Anda
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView("month")}
              className={cn(
                "bg-white/80 dark:bg-gray-800/80",
                view === "month" &&
                  "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Tampilan Bulan</span>
              <span className="md:hidden">Bulan</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView("week")}
              className={cn(
                "bg-white/80 dark:bg-gray-800/80",
                view === "week" &&
                  "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Tampilan Minggu</span>
              <span className="md:hidden">Minggu</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView("day")}
              className={cn(
                "bg-white/80 dark:bg-gray-800/80",
                view === "day" &&
                  "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Tampilan Hari</span>
              <span className="md:hidden">Hari</span>
            </Button>
          </div>
        </div>

        {/* Calendar Container */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-3 md:p-6 shadow-lg border border-white/20">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="w-full md:w-64">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow"
              />
            </div>
            <div className="flex-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-semibold">
                    Jadwal{" "}
                    {date
                      ? format(date, "dd MMMM yyyy", { locale: id })
                      : "Hari Ini"}
                  </h2>
                </div>
                <div className="space-y-2">
                  {selectedDateSchedules.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Tidak ada jadwal untuk tanggal ini
                    </div>
                  ) : (
                    selectedDateSchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={
                                schedule.completed ? "success" : "default"
                              }
                              className="text-xs"
                            >
                              {schedule.completed ? "Selesai" : "Belum Selesai"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(schedule.start_time), "HH:mm", {
                                locale: id,
                              })}
                              {" - "}
                              {format(new Date(schedule.end_time), "HH:mm", {
                                locale: id,
                              })}
                            </span>
                          </div>
                          <p className="font-medium">{schedule.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {schedule.description}
                          </p>
                        </div>
                        <Checkbox
                          checked={schedule.completed}
                          onCheckedChange={() =>
                            handleToggleCompletion(schedule.id)
                          }
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
