
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Schedule {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
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
        .from('schedules')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal memuat jadwal",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSchedule = async (schedule: Omit<Schedule, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .insert([{
          ...schedule,
          user_id: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      setSchedules(prev => [...prev, data]);
      toast({
        title: "Berhasil",
        description: "Jadwal berhasil ditambahkan"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menambah jadwal",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateSchedule = async (id: string, updates: Partial<Schedule>) => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setSchedules(prev => prev.map(schedule => 
        schedule.id === id ? data : schedule
      ));
      
      toast({
        title: "Berhasil",
        description: "Jadwal berhasil diupdate"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal mengupdate jadwal",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSchedules(prev => prev.filter(schedule => schedule.id !== id));
      toast({
        title: "Berhasil",
        description: "Jadwal berhasil dihapus"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menghapus jadwal",
        variant: "destructive"
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
    refetch: fetchSchedules
  };
}
