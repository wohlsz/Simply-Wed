
import { WeddingData, WeddingTask, BudgetItem, CoupleItems, MusicSong } from './types';

export const INITIAL_CATEGORIES = [
  'Cerimônia',
  'Festa',
  'Documentação',
  'Vestuário',
  'Fotografia',
  'Decoração',
  'Convidados',
  'Lua de Mel'
];

export const INITIAL_TASKS: WeddingTask[] = [
  { id: '1', title: 'Definir lista de convidados inicial', category: 'Convidados', status: 'completed' },
  { id: '2', title: 'Reservar local da cerimônia', category: 'Cerimônia', status: 'in_progress' },
  { id: '3', title: 'Contratar fotógrafo', category: 'Fotografia', status: 'pending' },
  { id: '4', title: 'Escolher o vestido/terno', category: 'Vestuário', status: 'pending' },
  { id: '5', title: 'Planejar lua de mel', category: 'Lua de Mel', status: 'pending' },
];

export const INITIAL_BUDGET: BudgetItem[] = [
  { id: 'b1', category: 'Buffet', planned: 0, spent: 0 },
  { id: 'b2', category: 'Local', planned: 0, spent: 5000 },
  { id: 'b3', category: 'Decoração', planned: 0, spent: 0 },
  { id: 'b4', category: 'Vestuário', planned: 0, spent: 1200 },
];

export const INITIAL_COUPLE_ITEMS: CoupleItems = {
  bride: [
    { id: 'br1', name: 'Cabelo e make', completed: false },
    { id: 'br2', name: 'Vestido', completed: false },
    { id: 'br3', name: 'Sapato', completed: false },
    { id: 'br4', name: 'Perfume', completed: false },
    { id: 'br5', name: 'Bouquet', completed: false },
    { id: 'br6', name: 'Unha', completed: false },
    { id: 'br7', name: 'Sobrancelha', completed: false },
    { id: 'br8', name: 'Lingerie', completed: false },
  ],
  groom: [
    { id: 'gr1', name: 'Cabelo', completed: false },
    { id: 'gr2', name: 'Barba', completed: false },
    { id: 'gr3', name: 'Terno', completed: false },
    { id: 'gr4', name: 'Gravata', completed: false },
    { id: 'gr5', name: 'Sapato', completed: false },
    { id: 'gr6', name: 'Perfume', completed: false },
  ]
};

export const DEFAULT_WEDDING_DATA: WeddingData = {
  coupleName: '',
  weddingDate: '',
  budget: 0,
  ceremonyType: 'Religiosa',
  guestCount: 0,
  tasks: INITIAL_TASKS,
  categories: INITIAL_CATEGORIES,
  budgetItems: INITIAL_BUDGET,
  vendors: [],
  guests: [],
  coupleItems: INITIAL_COUPLE_ITEMS,
  songs: [],
  onboarded: false,
};
