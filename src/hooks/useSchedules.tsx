import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Schedule {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSchedules();
    }
  }, [user]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) throw error;
      const schedulesWithCompleted = (data || []).map((schedule) => ({
        ...schedule,
        completed: (schedule as any).completed ?? false,
      })) as Schedule[];
      setSchedules(schedulesWithCompleted);
    } catch (error: unknown) {
      console.error("Error fetching schedules:", error);
      toast({
        title: "Error",
        description: "Gagal memuat jadwal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSchedule = async (
    schedule: Omit<
      Schedule,
      "id" | "user_id" | "created_at" | "updated_at" | "completed"
    >
  ) => {
    try {
      if (!user?.id) {
        throw new Error(
          "User tidak terautentikasi. Silakan login terlebih dahulu."
        );
      }

      console.log("Adding schedule:", { ...schedule, user_id: user.id }); // Debug log

      const { data, error } = await supabase
        .from("schedules")
        .insert([
          {
            ...schedule,
            user_id: user.id,
            completed: false,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error); // Debug log
        throw error;
      }

      console.log("Schedule added successfully:", data); // Debug log

      const scheduleWithCompleted = {
        ...data,
        completed: (data as any).completed ?? false,
      } as Schedule;
      setSchedules((prev) => [...prev, scheduleWithCompleted]);
      toast({
        title: "Berhasil",
        description: "Jadwal berhasil ditambahkan",
      });
      return scheduleWithCompleted;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal menambah jadwal";
      console.error("Error adding schedule:", error); // Debug log
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSchedule = async (id: string, updates: Partial<Schedule>) => {
    try {
      const { data, error } = await supabase
        .from("schedules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const scheduleWithCompleted = {
        ...data,
        completed: (data as any).completed ?? false,
      } as Schedule;
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === id ? scheduleWithCompleted : schedule
        )
      );

      toast({
        title: "Berhasil",
        description: "Jadwal berhasil diupdate",
      });
      return scheduleWithCompleted;
    } catch (error: unknown) {
      console.error("Error updating schedule:", error);
      toast({
        title: "Error",
        description: "Gagal mengupdate jadwal",
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleCompletion = async (id: string) => {
    try {
      const schedule = schedules.find((s) => s.id === id);
      if (!schedule) throw new Error("Jadwal tidak ditemukan");

      const newCompletedStatus = !schedule.completed;

      const { data, error } = await supabase
        .from("schedules")
        .update({ completed: newCompletedStatus })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const scheduleWithCompleted = {
        ...data,
        completed: (data as any).completed ?? false,
      } as Schedule;
      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === id ? scheduleWithCompleted : schedule
        )
      );

      toast({
        title: newCompletedStatus ? "Jadwal Selesai!" : "Jadwal Dibatalkan",
        description: newCompletedStatus
          ? `${schedule.title} telah ditandai sebagai selesai`
          : `${schedule.title} telah dibatalkan`,
      });

      // Jika jadwal selesai, hapus otomatis setelah 1 detik
      if (newCompletedStatus) {
        setTimeout(() => {
          deleteSchedule(id);
        }, 1000);
      }

      return scheduleWithCompleted;
    } catch (error: unknown) {
      console.error("Error toggling completion:", error);
      toast({
        title: "Error",
        description: "Gagal mengubah status jadwal",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase.from("schedules").delete().eq("id", id);

      if (error) throw error;

      setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
      toast({
        title: "Berhasil",
        description: "Jadwal berhasil dihapus",
      });
    } catch (error: unknown) {
      console.error("Error deleting schedule:", error);
      toast({
        title: "Error",
        description: "Gagal menghapus jadwal",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    schedules,
    loading,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    toggleCompletion,
    refetch: fetchSchedules,
  };
}
