
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar as LucideCalendar, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useSchedules } from "@/hooks/useSchedules";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScheduleChatbot } from "@/components/scheduler/ScheduleChatbot";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [newSchedule, setNewSchedule] = useState({
    title: "",
    description: "",
    time: "09:00"
  });

  const { schedules, loading, addSchedule, updateSchedule, deleteSchedule, refetch } = useSchedules();

  // Filter schedules for selected date
  const selectedDateSchedules = schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.start_time);
    return scheduleDate.toDateString() === selectedDate.toDateString();
  });

  // Get dates that have schedules for calendar highlighting
  const scheduleDates = schedules.map(schedule => new Date(schedule.start_time));

  const handleAddSchedule = async () => {
    try {
      const [hours, minutes] = newSchedule.time.split(':');
      const startTime = new Date(selectedDate);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1); // Default 1 hour duration

      await addSchedule({
        title: newSchedule.title,
        description: newSchedule.description,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
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
      const [hours, minutes] = newSchedule.time.split(':');
      const startTime = new Date(selectedDate);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      await updateSchedule(editingSchedule.id, {
        title: newSchedule.title,
        description: newSchedule.description,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
      });

      setIsEditDialogOpen(false);
      setEditingSchedule(null);
      setNewSchedule({ title: "", description: "", time: "09:00" });
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  const openEditDialog = (schedule: any) => {
    setEditingSchedule(schedule);
    setNewSchedule({
      title: schedule.title,
      description: schedule.description || "",
      time: new Date(schedule.start_time).toTimeString().slice(0, 5)
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
      await deleteSchedule(scheduleId);
    }
  };

  return (
    <div className="min-h-screen flex">
      <AppSidebar />
      <main className="flex-1 px-4 md:px-8 py-8 bg-background">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <LucideCalendar className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Kalender Jadwal</h2>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Tambah Jadwal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Jadwal Baru</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Judul</label>
                  <Input
                    value={newSchedule.title}
                    onChange={(e) => setNewSchedule(prev => ({...prev, title: e.target.value}))}
                    placeholder="Masukkan judul jadwal"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Waktu</label>
                  <Input
                    type="time"
                    value={newSchedule.time}
                    onChange={(e) => setNewSchedule(prev => ({...prev, time: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Deskripsi</label>
                  <Textarea
                    value={newSchedule.description}
                    onChange={(e) => setNewSchedule(prev => ({...prev, description: e.target.value}))}
                    placeholder="Deskripsi jadwal (opsional)"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Tanggal: {selectedDate.toLocaleDateString('id-ID')}
                </div>
                <Button onClick={handleAddSchedule} className="w-full">
                  Tambah Jadwal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar">Kalender & Jadwal</TabsTrigger>
            <TabsTrigger value="chatbot">Asisten AI</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar Component */}
              <div className="bg-card rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Pilih Tanggal</h3>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border w-full"
                  modifiers={{
                    hasSchedule: scheduleDates
                  }}
                  modifiersStyles={{
                    hasSchedule: { 
                      backgroundColor: 'hsl(var(--primary))', 
                      color: 'hsl(var(--primary-foreground))',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </div>

              {/* Schedule List */}
              <div className="bg-card rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Jadwal - {selectedDate.toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Memuat jadwal...</p>
                  </div>
                ) : selectedDateSchedules.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateSchedules.map((schedule) => (
                      <div key={schedule.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
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
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(schedule)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <LucideCalendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada jadwal pada tanggal ini</p>
                    <p className="text-sm">Klik "Tambah Jadwal" untuk menambah jadwal baru</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chatbot">
            <ScheduleChatbot onScheduleChange={refetch} />
          </TabsContent>
        </Tabs>

        {/* Edit Schedule Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Jadwal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Judul</label>
                <Input
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule(prev => ({...prev, title: e.target.value}))}
                  placeholder="Masukkan judul jadwal"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Waktu</label>
                <Input
                  type="time"
                  value={newSchedule.time}
                  onChange={(e) => setNewSchedule(prev => ({...prev, time: e.target.value}))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Deskripsi</label>
                <Textarea
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule(prev => ({...prev, description: e.target.value}))}
                  placeholder="Deskripsi jadwal (opsional)"
                />
              </div>
              <Button onClick={handleEditSchedule} className="w-full">
                Simpan Perubahan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default CalendarPage;
