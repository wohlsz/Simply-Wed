
import React, { useState } from 'react';
import { Guest } from '../types';
import { Star, Plus, Heart, Sparkles, Trash2, X, Search, Check } from 'lucide-react';

interface Props {
  guests: Guest[];
  setGuests: (update: Guest[] | ((prev: Guest[]) => Guest[])) => void;
}

const Godparents: React.FC<Props> = ({ guests, setGuests }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [addSide, setAddSide] = useState<'bride' | 'groom'>('bride');
  const [newName, setNewName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const brideGodparents = guests.filter(g => g.type === 'bride' && g.isGodparent);
  const groomGodparents = guests.filter(g => g.type === 'groom' && g.isGodparent);

  // Convidados que ainda não são padrinhos
  const availableGuests = guests.filter(g => !g.isGodparent && g.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleGodparent = (id: string) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, isGodparent: !g.isGodparent } : g));
  };

  const addNewGodparent = () => {
    if (!newName.trim()) return;
    const newGp: Guest = {
      id: Math.random().toString(36).substr(2, 9),
      name: newName.trim(),
      rsvpStatus: 'pending',
      type: addSide,
      plusOnes: 0,
      isGodparent: true
    };
    setGuests(prev => [...prev, newGp]);
    setNewName('');
    setIsAdding(false);
  };

  const openAddPanel = (side: 'bride' | 'groom') => {
    setAddSide(side);
    setIsAdding(true);
  };

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-800">Padrinhos & Madrinhas</h1>
          <p className="text-slate-500 mt-1">Defina as pessoas especiais que estarão ao lado de vocês no altar.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openAddPanel('bride')}
            className="bg-pink-100 text-pink-600 px-6 py-3 rounded-2xl border border-pink-200 shadow-sm hover:shadow-md transition-all font-bold flex items-center gap-2"
          >
            <Plus size={20} /> Padrinho Noiva
          </button>
          <button
            onClick={() => openAddPanel('groom')}
            className="bg-blue-100 text-blue-600 px-6 py-3 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md transition-all font-bold flex items-center gap-2"
          >
            <Plus size={20} /> Padrinho Noivo
          </button>
        </div>
      </header>

      {/* Modal / Painel de Adição */}
      {isAdding && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-wedding-gold/10 animate-fadeIn ring-4 ring-wedding-nude">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-serif font-bold text-slate-800 flex items-center gap-2">
              Adicionar Padrinho {addSide === 'bride' ? 'da Noiva' : 'do Noivo'}
              <Sparkles className="text-wedding-gold" size={20} />
            </h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-300 hover:text-slate-500 transition">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Adicionar Novo */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Criar Novo Padrinho</label>
              <div className="flex gap-2">
                <input
                  autoFocus
                  className="flex-1 px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-wedding-gold focus:bg-white text-lg"
                  placeholder="Nome completo..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addNewGodparent()}
                />
                <button
                  onClick={addNewGodparent}
                  className="bg-wedding-gold text-white px-6 py-4 rounded-2xl font-bold shadow-lg"
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* Selecionar da Lista de Convidados */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Selecionar da lista de convidados</label>
              <div className="relative mb-2">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 rounded-xl outline-none focus:ring-1 focus:ring-wedding-gold"
                  placeholder="Filtrar convidados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {availableGuests.length > 0 ? availableGuests.map(guest => (
                  <button
                    key={guest.id}
                    onClick={() => {
                      // Se selecionar um convidado que era do outro lado, atualiza o lado também
                      setGuests(prev => prev.map(g => g.id === guest.id ? { ...g, isGodparent: true, group: addSide } : g));
                      setIsAdding(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 hover:border-wedding-gold hover:bg-wedding-nude/30 transition-all text-left"
                  >
                    <span className="font-medium text-slate-700">{guest.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase font-bold">Lado: {guest.type === 'bride' ? 'Noiva' : 'Noivo'}</span>
                  </button>
                )) : (
                  <p className="text-center text-slate-400 text-sm italic py-4">Nenhum convidado disponível.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Principal dos Padrinhos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Lado da Noiva */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-pink-600 flex items-center gap-3">
              <Heart className="fill-pink-500 text-pink-500" size={24} />
              Lado da Noiva
            </h2>
            <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">{brideGodparents.length} pessoas</span>
          </div>

          <div className="space-y-4">
            {brideGodparents.length > 0 ? brideGodparents.map(gp => (
              <GodparentCard key={gp.id} godparent={gp} onRemove={() => toggleGodparent(gp.id)} sideColor="pink" />
            )) : (
              <EmptyState side="noiva" onAdd={() => openAddPanel('bride')} />
            )}
          </div>
        </div>

        {/* Lado do Noivo */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-blue-600 flex items-center gap-3">
              <Heart className="fill-blue-500 text-blue-500" size={24} />
              Lado do Noivo
            </h2>
            <span className="text-sm font-bold text-slate-300 uppercase tracking-widest">{groomGodparents.length} pessoas</span>
          </div>

          <div className="space-y-4">
            {groomGodparents.length > 0 ? groomGodparents.map(gp => (
              <GodparentCard key={gp.id} godparent={gp} onRemove={() => toggleGodparent(gp.id)} sideColor="blue" />
            )) : (
              <EmptyState side="noivo" onAdd={() => openAddPanel('groom')} />
            )}
          </div>
        </div>

      </div>

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

// Fix: Explicitly type GodparentCard as React.FC to resolve key prop and children typing issues
const GodparentCard: React.FC<{ godparent: Guest, onRemove: () => void, sideColor: 'pink' | 'blue' }> = ({ godparent, onRemove, sideColor }) => (
  <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
    <div className="flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${sideColor === 'pink' ? 'bg-pink-50 text-pink-500' : 'bg-blue-50 text-blue-500'}`}>
        {godparent.name.charAt(0)}
      </div>
      <div>
        <p className="font-bold text-lg text-slate-800">{godparent.name}</p>
        <div className="flex items-center gap-2">
          <Star size={12} className="text-wedding-gold fill-wedding-gold" />
          <span className="text-[10px] font-bold text-wedding-gold uppercase tracking-widest">Padrinho Oficial</span>
        </div>
      </div>
    </div>
    <button
      onClick={onRemove}
      className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
      title="Remover título de padrinho"
    >
      <Trash2 size={20} />
    </button>
  </div>
);

// Fix: Explicitly type EmptyState as React.FC to resolve React component typing issues
const EmptyState: React.FC<{ side: string, onAdd: () => void }> = ({ side, onAdd }) => (
  <div className="py-12 px-6 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center space-y-4">
    <p className="text-slate-400 italic">Nenhum padrinho definido para a {side}.</p>
    <button
      onClick={onAdd}
      className="text-wedding-gold font-bold text-sm flex items-center gap-1 mx-auto hover:underline"
    >
      <Plus size={16} /> Adicionar agora
    </button>
  </div>
);

export default Godparents;
