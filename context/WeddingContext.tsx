import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { WeddingData, Guest, CoupleItems, MusicSong, WeddingTask, BudgetItem, Gift, SeatingTable } from '../types';
import { DEFAULT_WEDDING_DATA, INITIAL_TASKS, INITIAL_BUDGET, INITIAL_SONGS, INITIAL_GIFTS } from '../constants';
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
  addBudgetItem: (item: BudgetItem) => Promise<void>;
  removeBudgetItem: (budgetId: string) => Promise<void>;
  updateCoupleItems: (items: CoupleItems) => Promise<void>;
  addSong: (song: MusicSong) => Promise<void>;
  removeSong: (songId: string) => Promise<void>;
  addGift: (gift: Gift) => Promise<void>;
  removeGift: (giftId: string) => Promise<void>;
  updateGift: (giftId: string, updates: Partial<Gift>) => Promise<void>;
  updateSeatingTables: (tables: SeatingTable[]) => Promise<void>;
  createWedding: (data: Partial<WeddingData>) => Promise<void>;
  updateWedding: (updates: Partial<WeddingData>) => Promise<void>;
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export const WeddingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [weddingData, setWeddingData] = useState<WeddingData>(DEFAULT_WEDDING_DATA);
  const [loadingData, setLoadingData] = useState(true);
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

        const [
          { data: guests },
          { data: tasks },
          { data: budgetItems },
          { data: songs },
          { data: gifts },
          { data: seatingTables }
        ] = await Promise.all([
          supabase.from('guests').select('*').eq('wedding_id', weddings.id),
          supabase.from('tasks').select('*').eq('wedding_id', weddings.id),
          supabase.from('budget_items').select('*').eq('wedding_id', weddings.id).order('id', { ascending: false }),
          supabase.from('songs').select('*').eq('wedding_id', weddings.id),
          supabase.from('gifts').select('*').eq('wedding_id', weddings.id),
          supabase.from('seating_tables').select('*').eq('wedding_id', weddings.id)
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
          budgetItems: (budgetItems || []).map((item: any) => {
            // Se o campo category contém o delimitador, separamos
            if (item.category && item.category.includes(' ::: ')) {
              const [cat, desc] = item.category.split(' ::: ');
              return { ...item, category: cat, description: desc };
            }
            // Caso contrário, mantemos como está (retrocompatibilidade)
            return { ...item, description: item.description || item.category };
          }),
          vendors: DEFAULT_WEDDING_DATA.vendors, // Not in DB yet
          coupleItems: typeof weddings.couple_items === 'string' ? JSON.parse(weddings.couple_items as string) : (weddings.couple_items || DEFAULT_WEDDING_DATA.coupleItems),
          songs: songs || [],
          gifts: (gifts || []).map(g => ({ ...g, imageUrl: g.image_url })),
          giftPhone: weddings.gift_phone,
          seatingTables: (seatingTables || []).map((st: any) => ({ id: st.id, name: st.name, guestIds: typeof st.guest_ids === 'string' ? JSON.parse(st.guest_ids) : (st.guest_ids || []) })),
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

      // Sementear dados iniciais
      await Promise.all([
        supabase.from('tasks').insert(
          INITIAL_TASKS.map(t => ({
            wedding_id: newWedding.id,
            title: t.title,
            category: t.category,
            status: t.status,
            subtasks: JSON.stringify(t.subtasks || [])
          }))
        ),
        supabase.from('budget_items').insert(
          INITIAL_BUDGET.map(b => ({
            wedding_id: newWedding.id,
            category: b.description ? `${b.category} ::: ${b.description}` : b.category,
            planned: b.planned,
            spent: b.spent
          }))
        ),
        supabase.from('songs').insert(
          INITIAL_SONGS.map(s => ({
            wedding_id: newWedding.id,
            title: s.title,
            url: s.url,
            moment: s.moment
          }))
        ),
        supabase.from('gifts').insert(
          INITIAL_GIFTS.map(g => ({
            wedding_id: newWedding.id,
            name: g.name,
            description: g.description,
            price: g.price,
            image_url: g.imageUrl,
            status: g.status
          }))
        )
      ]);

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
    if (updates.giftPhone !== undefined) dbUpdates.gift_phone = updates.giftPhone;

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
      const dbUpdates: any = {};

      // Se estamos atualizando spent ou description/category, precisamos lidar com o merge
      if (updates.category || updates.description) {
        const currentItem = weddingData.budgetItems.find(b => b.id === budgetId);
        const newCat = updates.category || currentItem?.category || '';
        const newDesc = updates.description !== undefined ? updates.description : (currentItem?.description || '');
        dbUpdates.category = `${newCat} ::: ${newDesc} `;
      }

      if (updates.planned !== undefined) dbUpdates.planned = updates.planned;
      if (updates.spent !== undefined) dbUpdates.spent = updates.spent;

      await supabase.from('budget_items').update(dbUpdates).eq('id', budgetId);
    }
  };

  const addBudgetItem = async (item: BudgetItem) => {
    setWeddingData(prev => ({
      ...prev,
      budgetItems: [item, ...prev.budgetItems]
    }));

    if (weddingId) {
      // Salvamos concatenado para evitar erros caso a coluna 'description' não exista no banco
      const dbCategory = item.description
        ? `${item.category} ::: ${item.description} `
        : item.category;

      const { data: newItem, error } = await supabase.from('budget_items').insert({
        wedding_id: weddingId,
        category: dbCategory,
        planned: item.planned,
        spent: item.spent
      }).select().single();

      if (error) {
        console.error('Critical error saving budget item:', error);
      } else if (newItem) {
        setWeddingData(prev => ({
          ...prev,
          budgetItems: prev.budgetItems.map(b => b.id === item.id ? { ...b, id: newItem.id } : b)
        }));
      }
    }
  };

  const removeBudgetItem = async (budgetId: string) => {
    setWeddingData(prev => ({
      ...prev,
      budgetItems: prev.budgetItems.filter(b => b.id !== budgetId)
    }));

    if (weddingId) {
      await supabase.from('budget_items').delete().eq('id', budgetId);
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

  const addGift = async (gift: Gift) => {
    setWeddingData(prev => ({ ...prev, gifts: [gift, ...prev.gifts] }));
    if (weddingId) {
      const { data: newGift } = await supabase.from('gifts').insert({
        wedding_id: weddingId,
        name: gift.name,
        description: gift.description,
        price: gift.price,
        image_url: gift.imageUrl,
        status: gift.status
      }).select().single();

      if (newGift) {
        setWeddingData(prev => ({
          ...prev,
          gifts: prev.gifts.map(g => g.id === gift.id ? { ...g, id: newGift.id } : g)
        }));
      }
    }
  };

  const removeGift = async (giftId: string) => {
    setWeddingData(prev => ({ ...prev, gifts: prev.gifts.filter(g => g.id !== giftId) }));
    if (weddingId) await supabase.from('gifts').delete().eq('id', giftId);
  };

  const updateGift = async (giftId: string, updates: Partial<Gift>) => {
    setWeddingData(prev => ({
      ...prev,
      gifts: prev.gifts.map(g => g.id === giftId ? { ...g, ...updates } : g)
    }));

    if (weddingId) {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
      if (updates.status) dbUpdates.status = updates.status;

      await supabase.from('gifts').update(dbUpdates).eq('id', giftId);
    }
  };

  const updateSeatingTables = async (tables: SeatingTable[]) => {
    setWeddingData(prev => ({ ...prev, seatingTables: tables }));

    if (weddingId) {
      // Delete all existing seating tables for this wedding
      await supabase.from('seating_tables').delete().eq('wedding_id', weddingId);

      // Insert new ones if any
      if (tables.length > 0) {
        const { error } = await supabase.from('seating_tables').insert(
          tables.map(t => ({
            wedding_id: weddingId,
            name: t.name,
            guest_ids: t.guestIds
          }))
        );
        if (error) {
          console.error('Error saving seating tables:', error);
          await refreshData();
        } else {
          // Refresh to get real IDs
          await refreshData();
        }
      }
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
      addBudgetItem,
      removeBudgetItem,
      updateCoupleItems,
      addSong,
      removeSong,
      addGift,
      removeGift,
      updateGift,
      updateSeatingTables,
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
