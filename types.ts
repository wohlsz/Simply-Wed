
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface WeddingTask {
  id: string;
  title: string;
  category: string;
  status: TaskStatus;
  dueDate?: string;
  notes?: string;
  subtasks?: SubTask[];
}

export interface BudgetItem {
  id: string;
  category: string;
  description?: string;
  planned: number;
  spent: number;
}

export interface Vendor {
  id: string;
  name: string;
  service: string;
  contact: string;
  cost: number;
  status: 'contacted' | 'negotiating' | 'booked';
  rating?: number;
}

export interface PersonalItem {
  id: string;
  name: string;
  completed: boolean;
  notes?: string;
}

export interface CoupleItems {
  bride: PersonalItem[];
  groom: PersonalItem[];
}

export interface Guest {
  id: string;
  name: string;
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  plusOnes: number;
  type: 'bride' | 'groom';
  isGodparent?: boolean;
}

export interface MusicSong {
  id: string;
  title: string;
  url: string;
  youtubeId: string;
  moment: string; // Ex: Cerimônia, Festa, Primeira Dança
}

export interface Gift {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  status: 'available' | 'reserved' | 'received';
}

export interface WeddingData {
  coupleName: string;
  weddingDate: string;
  budget: number;
  ceremonyType: string;
  guestCount: number;
  tasks: WeddingTask[];
  categories: string[];
  budgetItems: BudgetItem[];
  vendors: Vendor[];
  guests: Guest[];
  coupleItems: CoupleItems;
  songs: MusicSong[];
  gifts: Gift[];
  giftPhone?: string;
  onboarded: boolean;
}
