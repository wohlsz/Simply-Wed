
import React, { useState } from 'react';
import { useWedding } from '../context/WeddingContext';
import { PersonalItem } from '../types';
import { Heart, CheckCircle, Circle, Sparkles, Scissors, Shirt, ShoppingBag, Wind, Plus, X, Check, Trash2 } from 'lucide-react';

const CoupleArea: React.FC = () => {
  const { weddingData, updateCoupleItems } = useWedding();
  const coupleItems = weddingData.coupleItems;

  const [activeSubTab, setActiveSubTab] = useState<'bride' | 'groom'>('bride');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const toggleItem = (side: 'bride' | 'groom', itemId: string) => {
    const updatedItems = { ...coupleItems };
    updatedItems[side] = updatedItems[side].map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    updateCoupleItems(updatedItems);
  };

  const removeItem = (side: 'bride' | 'groom', itemId: string) => {
    const updatedItems = { ...coupleItems };
    updatedItems[side] = updatedItems[side].filter(item => item.id !== itemId);
    updateCoupleItems(updatedItems);
    setConfirmDeleteId(null);
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    const newItem: PersonalItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItemName.trim(),
      completed: false
    };

    const updatedItems = { ...coupleItems };
    // Adiciona no início da lista da sub-tab ativa
    updatedItems[activeSubTab] = [newItem, ...updatedItems[activeSubTab]];

    updateCoupleItems(updatedItems);
    setNewItemName('');
    setIsAddingItem(false);
  };

  const getIcon = (itemName: string) => {
    const name = itemName.toLowerCase();
    if (name.includes('cabelo') || name.includes('make') || name.includes('barba')) return <Scissors size={18} />;
    if (name.includes('vestido') || name.includes('terno') || name.includes('lingerie') || name.includes('gravata')) return <Shirt size={18} />;
    if (name.includes('sapato')) return <ShoppingBag size={18} />;
    if (name.includes('perfume')) return <Wind size={18} />;
    return <Sparkles size={18} />;
  };

  const brideProgress = coupleItems.bride.length > 0
    ? Math.round((coupleItems.bride.filter(i => i.completed).length / coupleItems.bride.length) * 100)
    : 0;

  const groomProgress = coupleItems.groom.length > 0
    ? Math.round((coupleItems.groom.filter(i => i.completed).length / coupleItems.groom.length) * 100)
    : 0;

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-800">Espaço dos Noivos</h1>
          <p className="text-slate-500 mt-1">O checklist pessoal para o seu dia perfeito.</p>
        </div>
      </header>

      {/* Selector Tabs */}
      <div className="flex bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 max-w-md mx-auto">
        <button
          onClick={() => { setActiveSubTab('bride'); setIsAddingItem(false); setConfirmDeleteId(null); }}
          className={`flex-1 py-4 rounded-[1.5rem] font-bold text-lg flex items-center justify-center gap-2 transition-all ${activeSubTab === 'bride' ? 'bg-pink-50 text-pink-600 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Heart size={20} className={activeSubTab === 'bride' ? 'fill-pink-600' : ''} />
          Noiva
        </button>
        <button
          onClick={() => { setActiveSubTab('groom'); setIsAddingItem(false); setConfirmDeleteId(null); }}
          className={`flex-1 py-4 rounded-[1.5rem] font-bold text-lg flex items-center justify-center gap-2 transition-all ${activeSubTab === 'groom' ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Scissors size={20} />
          Noivo
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 animate-fadeIn">
        {activeSubTab === 'bride' ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between px-2 gap-4">
              <h2 className="text-2xl font-serif font-bold text-pink-600">Checklist da Noiva</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-bold text-pink-400">
                  <span>{brideProgress}% concluído</span>
                  <div className="w-24 h-2 bg-pink-100 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500 transition-all duration-700" style={{ width: `${brideProgress}%` }} />
                  </div>
                </div>
                <button
                  onClick={() => setIsAddingItem(!isAddingItem)}
                  className="flex items-center gap-2 bg-pink-100 text-pink-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-pink-200 transition-all"
                >
                  {isAddingItem ? <X size={16} /> : <Plus size={16} />}
                  {isAddingItem ? 'Cancelar' : 'Adicionar Item'}
                </button>
              </div>
            </div>

            {isAddingItem && (
              <div className="bg-white p-6 rounded-[2rem] border-2 border-pink-100 shadow-lg animate-slideDown flex gap-4">
                <input
                  autoFocus
                  className="flex-1 px-5 py-3 rounded-xl border border-pink-50 bg-pink-50/30 outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all"
                  placeholder="Ex: Comprar acessórios, Prova do vestido..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                />
                <button
                  onClick={handleAddItem}
                  className="bg-pink-500 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-pink-600 transition-all flex items-center gap-2"
                >
                  <Check size={18} />
                  Salvar
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupleItems.bride.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onToggle={() => toggleItem('bride', item.id)}
                  onRemove={() => removeItem('bride', item.id)}
                  isConfirmingDelete={confirmDeleteId === item.id}
                  setConfirmDeleteId={setConfirmDeleteId}
                  accentColor="pink"
                  icon={getIcon(item.name)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between px-2 gap-4">
              <h2 className="text-2xl font-serif font-bold text-blue-600">Checklist do Noivo</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-400">
                  <span>{groomProgress}% concluído</span>
                  <div className="w-24 h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-700" style={{ width: `${groomProgress}%` }} />
                  </div>
                </div>
                <button
                  onClick={() => setIsAddingItem(!isAddingItem)}
                  className="flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-200 transition-all"
                >
                  {isAddingItem ? <X size={16} /> : <Plus size={16} />}
                  {isAddingItem ? 'Cancelar' : 'Adicionar Item'}
                </button>
              </div>
            </div>

            {isAddingItem && (
              <div className="bg-white p-6 rounded-[2rem] border-2 border-blue-100 shadow-lg animate-slideDown flex gap-4">
                <input
                  autoFocus
                  className="flex-1 px-5 py-3 rounded-xl border border-blue-50 bg-blue-50/30 outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                  placeholder="Ex: Aluguel do carro, Ajustar terno..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                />
                <button
                  onClick={handleAddItem}
                  className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-blue-600 transition-all flex items-center gap-2"
                >
                  <Check size={18} />
                  Salvar
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupleItems.groom.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onToggle={() => toggleItem('groom', item.id)}
                  onRemove={() => removeItem('groom', item.id)}
                  isConfirmingDelete={confirmDeleteId === item.id}
                  setConfirmDeleteId={setConfirmDeleteId}
                  accentColor="blue"
                  icon={getIcon(item.name)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: scale(0.95) translateY(-10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
};

const ItemCard: React.FC<{
  item: PersonalItem,
  onToggle: () => void,
  onRemove: () => void,
  isConfirmingDelete: boolean,
  setConfirmDeleteId: (id: string | null) => void,
  accentColor: 'pink' | 'blue',
  icon: React.ReactNode
}> = ({ item, onToggle, onRemove, isConfirmingDelete, setConfirmDeleteId, accentColor, icon }) => {
  const isCompleted = item.completed;

  const colors = {
    pink: {
      bg: isCompleted ? 'bg-pink-50' : 'bg-white',
      border: isCompleted ? 'border-pink-200' : 'border-slate-100',
      text: isCompleted ? 'text-pink-600' : 'text-slate-700',
      icon: isCompleted ? 'text-pink-400' : 'text-slate-300',
      check: 'text-pink-500',
      trash: 'text-pink-200 hover:text-red-500 hover:bg-red-50'
    },
    blue: {
      bg: isCompleted ? 'bg-blue-50' : 'bg-white',
      border: isCompleted ? 'border-blue-200' : 'border-slate-100',
      text: isCompleted ? 'text-blue-600' : 'text-slate-700',
      icon: isCompleted ? 'text-blue-400' : 'text-slate-300',
      check: 'text-blue-500',
      trash: 'text-blue-200 hover:text-red-500 hover:bg-red-50'
    }
  };

  const theme = colors[accentColor];

  return (
    <div
      className={`relative p-6 rounded-[2rem] border-2 transition-all flex items-center justify-between group hover:shadow-md ${theme.bg} ${theme.border}`}
    >
      <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={onToggle}>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isCompleted ? 'bg-white' : 'bg-slate-50'} ${theme.icon}`}>
          {icon}
        </div>
        <p className={`text-lg font-bold transition-all ${isCompleted ? 'line-through opacity-70' : ''} ${theme.text}`}>
          {item.name}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex items-center">
          {isConfirmingDelete ? (
            <div className="flex items-center gap-1 animate-fadeIn bg-red-50 p-1 rounded-xl border border-red-100 z-10">
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-red-600 shadow-sm transition-all"
              >
                <Check size={12} strokeWidth={3} />
                Confirmar
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                className="text-slate-400 p-1.5 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(item.id); }}
              className={`p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${theme.trash}`}
              title="Remover tarefa"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>

        <div
          onClick={onToggle}
          className={`cursor-pointer transition-transform group-active:scale-90 ${theme.check}`}
        >
          {isCompleted ? <CheckCircle size={28} /> : <Circle size={28} className="text-slate-100 group-hover:text-slate-200" />}
        </div>
      </div>
    </div>
  );
};

export default CoupleArea;
