
import { WeddingData, WeddingTask, BudgetItem, CoupleItems, MusicSong, Gift } from './types';

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
  { id: '2', title: 'Reservar local da cerimônia e festa', category: 'Cerimônia', status: 'completed' },
  { id: '3', title: 'Contratar fotógrafo e vídeomaker', category: 'Fotografia', status: 'in_progress' },
  { id: '4', title: 'Escolher o vestido da noiva e terno do noivo', category: 'Vestuário', status: 'pending' },
  { id: '5', title: 'Degustação e escolha do Buffet', category: 'Festa', status: 'pending' },
  { id: '6', title: 'Definir paleta de cores e decoração', category: 'Decoração', status: 'pending' },
  { id: '7', title: 'Pesquisar destinos de Lua de Mel', category: 'Lua de Mel', status: 'pending' },
];

export const INITIAL_BUDGET: BudgetItem[] = [
  { id: 'b1', category: 'Buffet', planned: 15000, spent: 2500 },
  { id: 'b2', category: 'Local', planned: 8000, spent: 5000 },
  { id: 'b3', category: 'Decoração', planned: 6000, spent: 1200 },
  { id: 'b4', category: 'Vestuário', planned: 4000, spent: 1200 },
  { id: 'b5', category: 'Fotografia', planned: 5000, spent: 2500 },
  { id: 'b6', category: 'Convites', planned: 1500, spent: 0 },
  { id: 'b7', category: 'Lua de Mel', planned: 10000, spent: 0 },
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

export const INITIAL_SONGS: MusicSong[] = [
  { id: 's1', title: 'Marcha Nupcial - Mendelssohn', moment: 'Entrada da Noiva', url: 'https://www.youtube.com/watch?v=0O2aH4XLbto', youtubeId: '0O2aH4XLbto' },
  { id: 's2', title: 'A Thousand Years - Christina Perri', moment: 'Entrada dos Padrinhos', url: 'https://www.youtube.com/watch?v=rtOvBOTyX00', youtubeId: 'rtOvBOTyX00' },
  { id: 's3', title: 'Viva La Vida - Coldplay', moment: 'Saída dos Noivos', url: 'https://www.youtube.com/watch?v=dvgZkm1xWPE', youtubeId: 'dvgZkm1xWPE' },
  { id: 's4', title: 'Marry You - Bruno Mars', moment: 'Entrada na Festa', url: 'https://www.youtube.com/watch?v=Zlv1rdcpS9M', youtubeId: 'Zlv1rdcpS9M' },
];

export const INITIAL_GIFTS: Gift[] = [
  { id: 'g1', name: 'Jogo de Panelas Antiaderentes', price: 450, description: 'Conjunto completo para nossa cozinha', status: 'available' },
  { id: 'g2', name: 'Fritadeira Elétrica Air Fryer', price: 380, description: 'Para pratos mais saudáveis', status: 'available' },
  { id: 'g3', name: 'Aspirador de Pó Robô', price: 1200, description: 'Ajuda na limpeza da nossa casa nova', status: 'available' },
  { id: 'g4', name: 'Jogo de Cama Algodão 400 fios', price: 290, description: 'Conforto para nossas noites', status: 'available' },
];

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
  songs: INITIAL_SONGS,
  gifts: INITIAL_GIFTS,
  onboarded: false,
};

export const MESSAGE_TEMPLATES = [
  {
    id: 'default',
    label: 'Padrão',
    content: 'Olá [Nome], tudo bem?\n\nEstamos muito felizes em convidá-lo para celebrar nosso casamento! Será um momento muito especial e sua presença é indispensável.\n\nCom carinho,\n[Casal]'
  },
  {
    id: 'formal',
    label: 'Formal',
    content: 'Prezado(a) [Nome],\n\nTemos a honra de convidá-lo para a celebração de nossa união matrimonial. Contamos com sua ilustre presença neste momento tão significativo de nossas vidas.\n\nAtenciosamente,\n[Casal]'
  },
  {
    id: 'casual',
    label: 'Casual',
    content: 'E aí [Nome]!\n\nVai rolar nosso casamento e queremos muito ver você lá pra comemorar com a gente! Não vai faltar festa, comida boa e alegria.\n\nTe esperamos!\n[Casal]'
  },
  {
    id: 'save_the_date',
    label: 'Save the Date',
    content: 'Olá [Nome]! \n\nReserve a data! Vamos nos casar e queremos você com a gente. Mais detalhes do nosso grande dia chegarão em breve, mas já marque no calendário!\n\nBeijos,\n[Casal]'
  }
];
