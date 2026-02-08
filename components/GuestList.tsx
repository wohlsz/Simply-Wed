
import React, { useState, useMemo } from 'react';
import { useWedding } from '../context/WeddingContext';
import { Guest } from '../types';
import { Users, UserPlus, Search, Trash2, CheckCircle, Clock, XCircle, X, Check, Star, Heart, UserCheck, Edit2, Save } from 'lucide-react';
import clsx from 'clsx';

const GuestList: React.FC = () => {
  const { weddingData, addGuest, addGuests, updateGuest, removeGuest, removeGuests, setWeddingData } = useWedding();
  const guests = weddingData.guests;

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addMode, setAddMode] = useState<'single' | 'bulk'>('single');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'bride' | 'groom' | 'godparents'>('all');

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editedGoal, setEditedGoal] = useState(weddingData.guestCount);
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const { updateWedding } = useWedding();

  const [side, setSide] = useState<'bride' | 'groom'>('bride');
  const [singleName, setSingleName] = useState('');
  const [plusOnes, setPlusOnes] = useState(0);
  const [isGodparent, setIsGodparent] = useState(false);
  const [bulkGuestList, setBulkGuestList] = useState<string[]>([]);
  const [currentBulkName, setCurrentBulkName] = useState('');

  const resetForm = () => {
    setSingleName('');
    setPlusOnes(0);
    setIsGodparent(false);
    setBulkGuestList([]);
    setCurrentBulkName('');
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGoal(true);
    try {
      await updateWedding({ guestCount: editedGoal });
      setIsEditingGoal(false);
    } catch (error) {
      console.error('Failed to update guest goal:', error);
    } finally {
      setIsSavingGoal(false);
    }
  };

  const handleAdd = () => {
    if (addMode === 'single') {
      if (!singleName.trim()) return;
      const guest: Guest = {
        id: Math.random().toString(36).substr(2, 9),
        name: singleName.trim(),
        rsvpStatus: 'pending',
        type: side,
        plusOnes: plusOnes,
        isGodparent: isGodparent
      };
      addGuest(guest);
    } else {
      if (bulkGuestList.length === 0) return;
      const newGuests: Guest[] = bulkGuestList.map(name => ({
        id: Math.random().toString(36).substr(2, 9),
        name,
        rsvpStatus: 'pending',
        type: side,
        plusOnes: 0,
        isGodparent: false
      }));

      addGuests(newGuests);
    }
    resetForm();
    setShowAddForm(false);
  };

  const addToBulkList = (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return;
    if (e) e.preventDefault();

    if (currentBulkName.trim()) {
      setBulkGuestList(prev => [...prev, currentBulkName.trim()]);
      setCurrentBulkName('');
    }
  };

  const removeFromBulkList = (index: number) => {
    setBulkGuestList(prev => prev.filter((_, i) => i !== index));
  };

  const toggleGodparentStatus = (id: string) => {
    const guest = guests.find(g => g.id === id);
    if (guest) {
      updateGuest(id, { isGodparent: !guest.isGodparent });
    }
  };

  const performDelete = (id: string) => {
    removeGuest(id);
    setConfirmDeleteId(null);
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedGuests(prev =>
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    );
  };

  const handleDeleteBulk = async () => {
    if (selectedGuests.length === 0) return;
    if (!window.confirm(`Deseja realmente excluir ${selectedGuests.length} convidados?`)) return;

    setIsDeletingBulk(true);
    try {
      await removeGuests(selectedGuests);
      setSelectedGuests([]);
    } catch (error) {
      console.error('Failed to delete guests:', error);
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedGuests.length === filteredGuests.length && filteredGuests.length > 0) {
      setSelectedGuests([]);
    } else {
      setSelectedGuests(filteredGuests.map(g => g.id));
    }
  };

  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      setSelectedGuests([]);
    }
    setIsSelectionMode(!isSelectionMode);
  };


  // Memoize filtered guests to prevent re-calculation on every render
  const filteredGuests = useMemo(() => {
    return guests.filter(g => {
      const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'bride' && g.type === 'bride') ||
        (activeFilter === 'groom' && g.type === 'groom') ||
        (activeFilter === 'godparents' && g.isGodparent);
      return matchesSearch && matchesFilter;
    });
  }, [guests, searchTerm, activeFilter]);

  const brideGodparents = useMemo(() => guests.filter(g => g.type === 'bride' && g.isGodparent), [guests]);
  const groomGodparents = useMemo(() => guests.filter(g => g.type === 'groom' && g.isGodparent), [guests]);

  const stats = useMemo(() => ({
    total: guests.reduce((acc, curr) => acc + 1 + curr.plusOnes, 0),
    bride: guests.filter(g => g.type === 'bride').reduce((acc, curr) => acc + 1 + curr.plusOnes, 0),
    groom: guests.filter(g => g.type === 'groom').reduce((acc, curr) => acc + 1 + curr.plusOnes, 0),
    godparents: guests.filter(g => g.isGodparent).length
  }), [guests]);

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-800">Convidados</h1>
          <p className="text-slate-500 mt-1">Gerencie sua lista completa e destaque seus padrinhos.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={clsx(
            "px-8 py-3 rounded-2xl shadow-lg transition-all font-bold flex items-center gap-2 border-[0.5px] border-wedding-gold/20 hover:scale-[1.02] active:scale-[0.98]",
            showAddForm ? 'bg-slate-800 text-white' : 'bg-wedding-gold text-white'
          )}
        >
          {showAddForm ? <X size={20} /> : <UserPlus size={20} />}
          {showAddForm ? 'Fechar Painel' : 'Novo Convidado'}
        </button>
      </header>

      {/* Filtros e Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveFilter('all')}
          className={clsx(
            "px-6 py-3 rounded-2xl border-[0.5px] transition-all flex items-center justify-center gap-3 font-bold shadow-sm relative group",
            activeFilter === 'all'
              ? 'bg-wedding-gold text-white border-wedding-gold shadow-lg shadow-wedding-gold/20'
              : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
          )}
        >
          <div className="flex items-center gap-3 flex-1">
            <Users size={18} />
            <span className="text-lg leading-none">{stats.total}</span>
            <span className="text-[10px] uppercase tracking-[0.15em]">Total</span>
          </div>

          <div className={clsx("h-4 w-[1px]", activeFilter === 'all' ? "bg-white/30" : "bg-slate-100")} />

          <div className="flex items-center gap-2">
            <span className={clsx("text-[10px] uppercase tracking-[0.15em]", activeFilter === 'all' ? "text-white/80" : "text-slate-300")}>Meta: {weddingData.guestCount}</span>
            <div
              onClick={(e) => {
                e.stopPropagation();
                setEditedGoal(weddingData.guestCount);
                setIsEditingGoal(true);
              }}
              className={clsx(
                "p-1 rounded-md transition-all sm:opacity-0 group-hover:opacity-100",
                activeFilter === 'all' ? "text-white hover:bg-white/20" : "text-slate-200 hover:text-wedding-gold hover:bg-wedding-gold/5"
              )}
              title="Editar meta de convidados"
            >
              <Edit2 size={14} />
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveFilter('bride')}
          className={clsx(
            "px-6 py-3 rounded-2xl border-[0.5px] transition-all flex items-center justify-center gap-3 font-bold shadow-sm",
            activeFilter === 'bride'
              ? 'bg-pink-500 text-white border-pink-400 shadow-lg shadow-pink-200'
              : 'bg-white border-slate-100 text-slate-400 hover:border-pink-300'
          )}
        >
          <Heart size={18} className={activeFilter === 'bride' ? 'fill-white' : ''} />
          <span className="text-lg leading-none">{stats.bride}</span>
          <span className="text-[10px] uppercase tracking-[0.15em]">Noiva</span>
        </button>

        <button
          onClick={() => setActiveFilter('groom')}
          className={clsx(
            "px-6 py-3 rounded-2xl border-[0.5px] transition-all flex items-center justify-center gap-3 font-bold shadow-sm",
            activeFilter === 'groom'
              ? 'bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-200'
              : 'bg-white border-slate-100 text-slate-400 hover:border-blue-300'
          )}
        >
          <Heart size={18} className={activeFilter === 'groom' ? 'fill-white' : ''} />
          <span className="text-lg leading-none">{stats.groom}</span>
          <span className="text-[10px] uppercase tracking-[0.15em]">Noivo</span>
        </button>

        <button
          onClick={() => setActiveFilter('godparents')}
          className={clsx(
            "px-6 py-3 rounded-2xl border-[0.5px] transition-all flex items-center justify-center gap-3 font-bold shadow-sm",
            activeFilter === 'godparents'
              ? 'bg-slate-800 text-white border-slate-700 shadow-lg shadow-slate-200'
              : 'bg-white border-slate-100 text-slate-400 hover:border-wedding-gold/30'
          )}
        >
          <Star size={18} className={activeFilter === 'godparents' ? 'fill-white' : ''} />
          <span className="text-lg leading-none">{stats.godparents}</span>
          <span className="text-[10px] uppercase tracking-[0.15em]">Padrinhos</span>
        </button>
      </div>

      {/* Seção de Padrinhos em Destaque */}
      {activeFilter === 'godparents' && (brideGodparents.length > 0 || groomGodparents.length > 0) && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold text-slate-800 flex items-center gap-3">
              <Star className="text-wedding-gold fill-wedding-gold" size={24} />
              Nossos Padrinhos & Madrinhas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-pink-50/50 p-6 rounded-[2.5rem] border-[0.5px] border-pink-200 shadow-sm space-y-4">
              <h3 className="text-pink-600 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                <Heart size={14} className="fill-pink-400 text-pink-400" /> Da Noiva
              </h3>
              <div className="flex flex-wrap gap-2">
                {brideGodparents.length > 0 ? brideGodparents.map(gp => (
                  <div key={gp.id} className="bg-white px-4 py-2 rounded-full border-[0.5px] border-pink-200 shadow-sm flex items-center gap-2">
                    <Star size={12} className="text-wedding-gold fill-wedding-gold" />
                    <span className="text-sm font-bold text-slate-700">{gp.name}</span>
                  </div>
                )) : (
                  <p className="text-slate-300 text-xs italic">Nenhum padrinho definido.</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50/50 p-6 rounded-[2.5rem] border-[0.5px] border-blue-200 shadow-sm space-y-4">
              <h3 className="text-blue-600 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                <Heart size={14} className="fill-blue-400 text-blue-400" /> Do Noivo
              </h3>
              <div className="flex flex-wrap gap-2">
                {groomGodparents.length > 0 ? groomGodparents.map(gp => (
                  <div key={gp.id} className="bg-white px-4 py-2 rounded-full border-[0.5px] border-blue-200 shadow-sm flex items-center gap-2">
                    <Star size={12} className="text-wedding-gold fill-wedding-gold" />
                    <span className="text-sm font-bold text-slate-700">{gp.name}</span>
                  </div>
                )) : (
                  <p className="text-slate-300 text-xs italic">Nenhum padrinho definido.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-wedding-gold/10 animate-fadeIn ring-4 ring-wedding-nude overflow-hidden">
          <div className="flex bg-slate-100 p-1 rounded-2xl w-fit mb-8">
            <button
              onClick={() => setAddMode('single')}
              className={clsx(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                addMode === 'single' ? 'bg-white text-wedding-gold shadow-sm' : 'text-slate-400'
              )}
            >
              Individual
            </button>
            <button
              onClick={() => setAddMode('bulk')}
              className={clsx(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                addMode === 'bulk' ? 'bg-white text-wedding-gold shadow-sm' : 'text-slate-400'
              )}
            >
              Em Massa
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Lado do Casal</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSide('bride')}
                    className={clsx(
                      "py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border-[0.5px] transition-all",
                      side === 'bride' ? 'bg-pink-50 border-pink-200 text-pink-600 shadow-inner' : 'bg-slate-50 border-transparent text-slate-400'
                    )}
                  >
                    {side === 'bride' && <Check size={18} />} Noiva
                  </button>
                  <button
                    onClick={() => setSide('groom')}
                    className={clsx(
                      "py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border-[0.5px] transition-all",
                      side === 'groom' ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-inner' : 'bg-slate-50 border-transparent text-slate-400'
                    )}
                  >
                    {side === 'groom' && <Check size={18} />} Noivo
                  </button>
                </div>
              </div>

              {addMode === 'single' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                    <input
                      autoFocus
                      className="w-full px-5 py-4 rounded-2xl border-[0.5px] border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-wedding-gold focus:bg-white"
                      placeholder="Ex: Pedro Silva"
                      value={singleName}
                      onChange={(e) => setSingleName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Acompanhantes</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-5 py-4 rounded-2xl border-[0.5px] border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-wedding-gold focus:bg-white"
                        value={plusOnes}
                        onChange={(e) => setPlusOnes(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">É Padrinho/Madrinha?</label>
                      <button
                        onClick={() => setIsGodparent(!isGodparent)}
                        className={clsx(
                          "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border-[0.5px] transition-all",
                          isGodparent ? 'bg-wedding-gold text-white border-wedding-gold shadow-lg' : 'bg-slate-50 border-transparent text-slate-400'
                        )}
                      >
                        {isGodparent ? <Star size={18} className="fill-white" /> : <Star size={18} />}
                        {isGodparent ? 'Sim!' : 'Não'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Adicionar por Nome (Enter)</label>
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        className="flex-1 px-5 py-4 rounded-2xl border-[0.5px] border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-wedding-gold focus:bg-white"
                        placeholder="Digite o nome e aperte Enter..."
                        value={currentBulkName}
                        onChange={(e) => setCurrentBulkName(e.target.value)}
                        onKeyDown={addToBulkList}
                      />
                      <button
                        onClick={() => addToBulkList()}
                        className="bg-wedding-gold/10 text-wedding-gold px-4 rounded-2xl hover:bg-wedding-gold/20 transition-all font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {bulkGuestList.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest ml-1">
                        LISTA PARA ADICIONAR ({bulkGuestList.length})
                      </label>
                      <div className="max-h-48 overflow-y-auto pr-2 flex flex-wrap gap-2 pb-2">
                        {bulkGuestList.map((name, index) => (
                          <div
                            key={index}
                            className="bg-white border border-slate-100 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm group animate-fadeIn"
                          >
                            <span className="text-slate-700 font-medium">{name}</span>
                            <button
                              onClick={() => removeFromBulkList(index)}
                              className="text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-wedding-nude/40 p-8 rounded-[2.5rem] border-[0.5px] border-white flex flex-col justify-center items-center text-center space-y-4">
              <h4 className="font-serif font-bold text-2xl text-slate-800">Pronto para salvar?</h4>
              <p className="text-sm text-slate-400">Você pode alterar os detalhes de cada convidado a qualquer momento.</p>
              <button
                onClick={handleAdd}
                className="w-full max-w-xs bg-wedding-gold text-white py-4 rounded-2xl font-bold shadow-lg shadow-wedding-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-[0.5px] border-wedding-gold/20"
              >
                Salvar {addMode === 'bulk' ? `Lista (${bulkGuestList.length})` : 'Convidado'}
                <UserCheck size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista Principal */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border-[0.5px] border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative max-w-md flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text" placeholder="Buscar por nome..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-wedding-gold"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isSelectionMode && selectedGuests.length > 0 && (
            <button
              onClick={handleDeleteBulk}
              disabled={isDeletingBulk}
              className="w-full sm:w-auto px-6 py-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-3 font-bold animate-fadeIn"
            >
              {isDeletingBulk ? (
                <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 size={18} />
                  Excluir {selectedGuests.length}
                </>
              )}
            </button>
          )}

          <button
            onClick={toggleSelectionMode}
            className={clsx(
              "p-3 rounded-2xl transition-all shadow-md",
              isSelectionMode
                ? "bg-slate-800 text-white shadow-slate-200"
                : "bg-white text-slate-400 hover:text-red-500 border border-slate-100"
            )}
            title={isSelectionMode ? "Sair do modo de seleção" : "Modo de exclusão múltipla"}
          >
            <Trash2 size={24} />
          </button>
        </div>

        {isSelectionMode && filteredGuests.length > 0 && (
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div
              onClick={handleSelectAll}
              className="flex items-center gap-4 cursor-pointer group"
            >
              <div className={clsx(
                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                selectedGuests.length === filteredGuests.length && filteredGuests.length > 0
                  ? "bg-wedding-gold border-wedding-gold"
                  : "border-slate-300 bg-white group-hover:border-wedding-gold/50"
              )}>
                {selectedGuests.length === filteredGuests.length && filteredGuests.length > 0 && <Check size={14} className="text-white" />}
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                {selectedGuests.length === filteredGuests.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Exibindo {filteredGuests.length} convidados
            </div>
          </div>
        )}

        <div className="divide-y divide-slate-50">
          {filteredGuests.length > 0 ? filteredGuests.map(guest => (
            <div
              key={guest.id}
              onClick={(e) => isSelectionMode ? handleToggleSelect(guest.id, e) : null}
              className={clsx(
                "p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all group relative",
                isSelectionMode ? "cursor-pointer" : "",
                selectedGuests.includes(guest.id)
                  ? "bg-[#FAF9F6] shadow-sm"
                  : "bg-white hover:bg-[#FAF9F6]/50"
              )}
            >
              {selectedGuests.includes(guest.id) && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#C5A059] z-10" />
              )}
              <div className="flex items-center gap-5">
                {isSelectionMode && (
                  <div className={clsx(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                    selectedGuests.includes(guest.id) ? "bg-wedding-gold border-wedding-gold" : "border-slate-200 bg-white"
                  )}>
                    {selectedGuests.includes(guest.id) && <Check size={14} className="text-white" />}
                  </div>
                )}

                <div className={clsx(
                  "w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg relative",
                  guest.type === 'bride' ? 'bg-pink-50 text-pink-500 border-[0.5px] border-pink-100' : 'bg-blue-50 text-blue-500 border-[0.5px] border-blue-100'
                )}>
                  {guest.name.charAt(0)}
                  {guest.isGodparent && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-wedding-gold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      <Star size={10} className="text-white fill-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    {guest.name}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleGodparentStatus(guest.id);
                      }}
                      className={clsx(
                        "p-1 rounded-md transition-all",
                        guest.isGodparent ? 'text-wedding-gold' : 'text-slate-200 hover:text-wedding-gold/50'
                      )}
                      title={guest.isGodparent ? "Remover título de padrinho" : "Marcar como padrinho"}
                    >
                      <Star size={16} className={guest.isGodparent ? 'fill-wedding-gold' : ''} />
                    </button>
                  </h4>
                  <div className="flex items-center gap-3">
                    <span className={clsx(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
                      guest.type === 'bride' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'
                    )}>
                      {guest.type === 'bride' ? 'Lado Noiva' : 'Lado Noivo'}
                    </span>
                    {guest.plusOnes > 0 && <span className="text-[10px] font-bold text-wedding-gold uppercase">+ {guest.plusOnes} {guest.plusOnes === 1 ? 'acompanhante' : 'acompanhantes'}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex bg-slate-50 p-1 rounded-2xl border-[0.5px] border-slate-100">
                  <button onClick={() => updateGuest(guest.id, { rsvpStatus: 'pending' })} className={clsx("p-2 rounded-xl transition-all", guest.rsvpStatus === 'pending' ? 'bg-wedding-gold text-white shadow-md border-[0.5px] border-wedding-gold/20' : 'text-slate-400 hover:text-slate-600')} title="Pendente"><Clock size={18} /></button>
                  <button onClick={() => updateGuest(guest.id, { rsvpStatus: 'confirmed' })} className={clsx("p-2 rounded-xl transition-all", guest.rsvpStatus === 'confirmed' ? 'bg-green-500 text-white shadow-md border-[0.5px] border-green-400/20' : 'text-slate-400 hover:text-green-500')} title="Confirmado"><CheckCircle size={18} /></button>
                  <button onClick={() => updateGuest(guest.id, { rsvpStatus: 'declined' })} className={clsx("p-2 rounded-xl transition-all", guest.rsvpStatus === 'declined' ? 'bg-red-500 text-white shadow-md border-[0.5px] border-red-400/20' : 'text-slate-400 hover:text-red-500')} title="Recusado"><XCircle size={18} /></button>
                </div>

                <div className="relative">
                  {confirmDeleteId === guest.id ? (
                    <div className="flex items-center gap-1 animate-fadeIn bg-red-50 p-1 rounded-xl border-[0.5px] border-red-100">
                      <button onClick={() => performDelete(guest.id)} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-red-600 shadow-md">
                        Confirmar
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)} className="text-slate-400 p-1.5 hover:text-slate-600"><X size={14} /></button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(guest.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="py-24 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-[0.5px] border-slate-100">
                <Users size={32} className="text-slate-200" />
              </div>
              <p className="text-slate-400 italic">Nenhum convidado encontrado nesta categoria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Guest Goal Modal */}
      {isEditingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditingGoal(false)} />
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-lg relative z-10 shadow-2xl border border-white animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-serif font-bold text-slate-800">Meta de Convidados</h3>
              <button
                onClick={() => setIsEditingGoal(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">CAPACIDADE TOTAL PLANEJADA</label>
                <div className="relative">
                  <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-wedding-gold" size={20} />
                  <input
                    type="number"
                    required
                    autoFocus
                    className="w-full pl-16 pr-6 py-5 rounded-3xl border border-slate-100 outline-none text-2xl font-bold bg-slate-50 focus:bg-white focus:ring-4 focus:ring-wedding-gold/10 focus:border-wedding-gold/30 transition-all"
                    value={editedGoal}
                    onChange={(e) => setEditedGoal(Number(e.target.value))}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingGoal}
                className="w-full bg-wedding-gold text-white py-5 rounded-3xl text-xl font-bold shadow-xl shadow-wedding-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
              >
                {isSavingGoal ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={20} />
                    Salvar Meta
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default GuestList;
