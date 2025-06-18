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
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-2xl shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Kalender Jadwal
              </h1>
              <p className="text-muted-foreground text-lg">
                Kelola dan lihat semua jadwal Anda
              </p>
            </div>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Plus className="w-4 h-4" />
                Tambah Jadwal
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-white/20 rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  Tambah Jadwal Baru
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Judul Jadwal</label>
                  <Input
                    value={newSchedule.title}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Masukkan judul jadwal"
                    className="h-12 rounded-2xl border-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Waktu</label>
                  <Input
                    type="time"
                    value={newSchedule.time}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        time: e.target.value,
                      }))
                    }
                    className="h-12 rounded-2xl border-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Deskripsi</label>
                  <Textarea
                    value={newSchedule.description}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Deskripsi jadwal (opsional)"
                    className="rounded-2xl border-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                    rows={3}
                  />
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Tanggal:{" "}
                    {selectedDate.toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Button
                  onClick={handleAddSchedule}
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Tambah Jadwal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Kalender di bagian atas halaman */}
        <div className="mb-8 flex flex-col items-center">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{
              hasSchedule: (date) =>
                scheduleDates.includes(date.toDateString()),
            }}
            modifiersClassNames={{
              hasSchedule:
                "bg-blue-200 dark:bg-blue-700 text-blue-900 dark:text-white font-bold",
            }}
          />
          {/* Daftar jadwal pada tanggal yang dipilih */}
          <div className="w-full max-w-xl mt-6">
            <div className="font-semibold mb-2 text-primary text-center">
              Jadwal pada{" "}
              {selectedDate.toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            {selectedDateSchedules.length > 0 ? (
              <ul className="space-y-2">
                {selectedDateSchedules.map((s) => (
                  <li
                    key={s.id}
                    className="bg-blue-50 dark:bg-blue-900/30 rounded-lg px-3 py-2 text-sm flex flex-col gap-1"
                  >
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(s.start_time).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {s.description && <span> - {s.description}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-muted-foreground text-center">
                Tidak ada jadwal pada tanggal ini.
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 shadow-lg">
            <TabsTrigger
              value="today"
              className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <Calendar className="w-4 h-4" />
              Jadwal Hari Ini
            </TabsTrigger>
          </TabsList>

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
                  <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Tidak ada jadwal hari ini
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Jadwal Anda akan muncul di sini setelah dibuat
                  </p>
                  <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-2xl inline-block font-medium">
                    Buat Jadwal Pertama
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Schedule Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-white/20 rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Edit Jadwal
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Judul Jadwal</label>
                <Input
                  value={newSchedule.title}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Masukkan judul jadwal"
                  className="h-12 rounded-2xl border-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Waktu</label>
                <Input
                  type="time"
                  value={newSchedule.time}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({
                      ...prev,
                      time: e.target.value,
                    }))
                  }
                  className="h-12 rounded-2xl border-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Deskripsi</label>
                <Textarea
                  value={newSchedule.description}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Deskripsi jadwal (opsional)"
                  className="rounded-2xl border-2 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  rows={3}
                />
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Tanggal:{" "}
                  {selectedDate.toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleEditSchedule}
                  className="flex-1 h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Update Jadwal
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="h-12 rounded-2xl border-2 hover:border-gray-400 transition-all duration-300"
                >
                  Batal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default CalendarPage;
