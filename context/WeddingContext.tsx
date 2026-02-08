
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { WeddingData, Guest, CoupleItems, MusicSong, WeddingTask, BudgetItem } from '../types';
import { DEFAULT_WEDDING_DATA } from '../constants';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface WeddingContextType {
  weddingData: WeddingData;
  setWeddingData: React.Dispatch<React.SetStateAction<WeddingData>>;
  loadingData: boolean;
  refreshData: () => Promise<void>;
  updateGuest: (guestId: string, updates: Partial<Guest>) => Promise<void>;
  addGuest: (guest: Guest) => Promise<void>;
  addGuests: (guests: Guest[]) => Promise<void>;
  removeGuest: (guestId: string) => Promise<void>;
  removeGuests: (guestIds: string[]) => Promise<void>;
  addTask: (task: WeddingTask) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<WeddingTask>) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
  updateBudget: (budgetId: string, updates: Partial<BudgetItem>) => Promise<void>;
  updateCoupleItems: (items: CoupleItems) => Promise<void>;
  addSong: (song: MusicSong) => Promise<void>;
  removeSong: (songId: string) => Promise<void>;
  createWedding: (data: Partial<WeddingData>) => Promise<void>;
  updateWedding: (updates: Partial<WeddingData>) => Promise<void>;
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export const WeddingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [weddingData, setWeddingData] = useState<WeddingData>(DEFAULT_WEDDING_DATA);
  const [loadingData, setLoadingData] = useState(false);
  const [weddingId, setWeddingId] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    if (!user) {
      setWeddingData(DEFAULT_WEDDING_DATA);
      return;
    }

    setLoadingData(true);
    try {
      // Fetch wedding details
      const { data: weddings, error: weddingError } = await supabase
        .from('weddings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (weddingError && weddingError.code !== 'PGRST116') {
        console.error('Error fetching wedding:', weddingError);
      }

      if (weddings) {
        setWeddingId(weddings.id);

        // Fetch related data in parallel
        const [
          { data: guests },
          { data: tasks },
          { data: budgetItems },
          { data: songs }
        ] = await Promise.all([
          supabase.from('guests').select('*').eq('wedding_id', weddings.id),
          supabase.from('tasks').select('*').eq('wedding_id', weddings.id),
          supabase.from('budget_items').select('*').eq('wedding_id', weddings.id),
          supabase.from('songs').select('*').eq('wedding_id', weddings.id)
        ]);

        // Normalize data to match app state structure
        const normalizedTasks = (tasks || []).map(t => ({
          ...t,
          subtasks: typeof t.subtasks === 'string' ? JSON.parse(t.subtasks) : t.subtasks
        }));

        setWeddingData({
          coupleName: weddings.couple_name,
          weddingDate: weddings.wedding_date,
          budget: Number(weddings.budget),
          guestCount: weddings.guest_count,
          ceremonyType: 'Religiosa', // Default or fetch if added to schema
          onboarded: true,
          categories: DEFAULT_WEDDING_DATA.categories, // Static for now, or fetch if dynamic
          tasks: normalizedTasks,
          guests: (guests || []).map(g => ({ ...g, rsvpStatus: g.rsvp_status, isGodparent: g.is_godparent, plusOnes: g.plus_ones })),
          budgetItems: budgetItems || DEFAULT_WEDDING_DATA.budgetItems,
          vendors: DEFAULT_WEDDING_DATA.vendors, // Not in DB yet
          coupleItems: typeof weddings.couple_items === 'string' ? JSON.parse(weddings.couple_items as string) : (weddings.couple_items || DEFAULT_WEDDING_DATA.coupleItems),
          songs: songs || [],
        });
      } else {
        // No wedding found, user needs to onboarding
        setWeddingData({ ...DEFAULT_WEDDING_DATA, onboarded: false });
      }
    } catch (error) {
      console.error('Error in refreshData:', error);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // --- Actions ---

  const createWedding = async (data: Partial<WeddingData>) => {
    if (!user) return;

    const { data: newWedding, error } = await supabase.from('weddings').insert({
      user_id: user.id,
      couple_name: data.coupleName,
      wedding_date: data.weddingDate,
      budget: data.budget,
      guest_count: data.guestCount,
      couple_items: DEFAULT_WEDDING_DATA.coupleItems
    }).select().single();

    if (error) throw error;
    if (newWedding) {
      setWeddingId(newWedding.id);
      await refreshData();
    }
  };

  const updateWedding = async (updates: Partial<WeddingData>) => {
    if (!user || !weddingId) return;

    // Optimistically update local state
    setWeddingData(prev => ({ ...prev, ...updates }));

    const dbUpdates: any = {};
    if (updates.coupleName !== undefined) dbUpdates.couple_name = updates.coupleName;
    if (updates.weddingDate !== undefined) dbUpdates.wedding_date = updates.weddingDate;
    if (updates.budget !== undefined) dbUpdates.budget = updates.budget;
    if (updates.guestCount !== undefined) dbUpdates.guest_count = updates.guestCount;

    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase
        .from('weddings')
        .update(dbUpdates)
        .eq('id', weddingId);

      if (error) {
        console.error('Error updating wedding:', error);
        // Revert on error if necessary, or just refresh
        await refreshData();
        throw error;
      }
    }
  };

  const addGuest = async (guest: Guest) => {
    // Optimistic update
    setWeddingData(prev => ({ ...prev, guests: [guest, ...prev.guests] }));

    if (weddingId) {
      const { data: newGuest } = await supabase.from('guests').insert({
        wedding_id: weddingId,
        name: guest.name,
        rsvp_status: guest.rsvpStatus,
        type: guest.type,
        is_godparent: guest.isGodparent,
        plus_ones: guest.plusOnes
      }).select().single();

      if (newGuest) {
        // Update local ID with DB ID to allow future updates/deletes
        setWeddingData(prev => ({
          ...prev,
          guests: prev.guests.map(g => g.id === guest.id ? { ...g, id: newGuest.id } : g)
        }));
      }
    }
  };

  const addGuests = async (guestsToAdd: Guest[]) => {
    // Optimistic update
    setWeddingData(prev => ({ ...prev, guests: [...guestsToAdd, ...prev.guests] }));

    if (weddingId) {
      const { data: newGuests, error } = await supabase.from('guests').insert(
        guestsToAdd.map(g => ({
          wedding_id: weddingId,
          name: g.name,
          rsvp_status: g.rsvpStatus,
          type: g.type,
          is_godparent: g.isGodparent,
          plus_ones: g.plusOnes
        }))
      ).select();

      if (error) {
        console.error('Error adding bulk guests:', error);
        await refreshData();
        return;
      }

      if (newGuests) {
        // Map temp IDs to real IDs
        setWeddingData(prev => ({
          ...prev,
          guests: prev.guests.map(g => {
            const matched = newGuests.find(ng => ng.name === g.name && !guestsToAdd.some(ta => ta.id === ng.id)); // Simple matching logic
            // Note: Since we don't have a perfect match for bulk names without unique temp keys, 
            // a refresh is safer after bulk insert if we need IDs immediately.
            return g;
          })
        }));
        await refreshData(); // Sync IDs reliably
      }
    }
  };

  const updateGuest = async (guestId: string, updates: Partial<Guest>) => {
    setWeddingData(prev => ({
      ...prev,
      guests: prev.guests.map(g => g.id === guestId ? { ...g, ...updates } : g)
    }));

    if (weddingId) {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.rsvpStatus) dbUpdates.rsvp_status = updates.rsvpStatus;
      if (updates.type) dbUpdates.type = updates.type;
      if (updates.isGodparent !== undefined) dbUpdates.is_godparent = updates.isGodparent;
      if (updates.plusOnes !== undefined) dbUpdates.plus_ones = updates.plusOnes;

      // Ensure we are updating based on UUID. If guestId is temporary, this wont work until refresh/insert return.
      await supabase.from('guests').update(dbUpdates).eq('id', guestId);
    }
  };

  const removeGuest = async (guestId: string) => {
    setWeddingData(prev => ({
      ...prev,
      guests: prev.guests.filter(g => g.id !== guestId)
    }));
    if (weddingId) await supabase.from('guests').delete().eq('id', guestId);
  };

  const removeGuests = async (guestIds: string[]) => {
    setWeddingData(prev => ({
      ...prev,
      guests: prev.guests.filter(g => !guestIds.includes(g.id))
    }));
    if (weddingId) {
      await supabase.from('guests').delete().in('id', guestIds);
    }
  };

  const addTask = async (task: WeddingTask) => {
    setWeddingData(prev => ({ ...prev, tasks: [task, ...prev.tasks] }));
    if (weddingId) {
      const { data: newTask } = await supabase.from('tasks').insert({
        wedding_id: weddingId,
        title: task.title,
        category: task.category,
        status: task.status,
        subtasks: JSON.stringify(task.subtasks)
      }).select().single();

      if (newTask) {
        setWeddingData(prev => ({
          ...prev,
          tasks: prev.tasks.map(t => t.id === task.id ? { ...t, id: newTask.id } : t)
        }));
      }
    }
  };

  const updateTask = async (taskId: string, updates: Partial<WeddingTask>) => {
    setWeddingData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    }));
    if (weddingId) {
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.category) dbUpdates.category = updates.category;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.subtasks) dbUpdates.subtasks = JSON.stringify(updates.subtasks);

      await supabase.from('tasks').update(dbUpdates).eq('id', taskId);
    }
  };

  const removeTask = async (taskId: string) => {
    setWeddingData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) }));
    if (weddingId) await supabase.from('tasks').delete().eq('id', taskId);
  };

  const updateBudget = async (budgetId: string, updates: Partial<BudgetItem>) => {
    setWeddingData(prev => ({
      ...prev,
      budgetItems: prev.budgetItems.map(b => b.id === budgetId ? { ...b, ...updates } : b)
    }));
    if (weddingId) {
      // To fully implement, we need to know if it's an insert or update. 
      // For now, let's assume update and suppress error if not found? 
      // Or better, standard budget items should probably serve as templates.
    }
  };

  const updateCoupleItems = async (items: CoupleItems) => {
    setWeddingData(prev => ({ ...prev, coupleItems: items }));
    if (weddingId) {
      await supabase.from('weddings').update({ couple_items: JSON.stringify(items) }).eq('id', weddingId);
    }
  };

  const addSong = async (song: MusicSong) => {
    setWeddingData(prev => ({ ...prev, songs: [song, ...prev.songs] }));
    if (weddingId) {
      const { data: newSong } = await supabase.from('songs').insert({
        wedding_id: weddingId,
        title: song.title,
        url: song.url,
        moment: song.moment
      }).select().single();

      if (newSong) {
        setWeddingData(prev => ({
          ...prev,
          songs: prev.songs.map(s => s.id === song.id ? { ...s, id: newSong.id } : s)
        }));
      }
    }
  };

  const removeSong = async (songId: string) => {
    setWeddingData(prev => ({ ...prev, songs: prev.songs.filter(s => s.id !== songId) }));
    if (weddingId) {
      await supabase.from('songs').delete().eq('id', songId);
    }
  };

  return (
    <WeddingContext.Provider value={{
      weddingData,
      setWeddingData,
      loadingData,
      refreshData,
      updateGuest,
      addGuest,
      addGuests,
      removeGuest,
      removeGuests,
      addTask,
      updateTask,
      removeTask,
      updateBudget,
      updateCoupleItems,
      addSong,
      removeSong,
      createWedding,
      updateWedding
    }}>
      {children}
    </WeddingContext.Provider>
  );
};

export const useWedding = () => {
  const context = useContext(WeddingContext);
  if (context === undefined) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
};
