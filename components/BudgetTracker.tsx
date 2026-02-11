
import React, { useState } from 'react';
import { useWedding } from '../context/WeddingContext';
import { BudgetItem } from '../types';
import { DollarSign, Plus, Wallet, ArrowDownRight, Trash2, PieChart, X, Check, Edit2, Save } from 'lucide-react';
import clsx from 'clsx';

const BudgetTracker: React.FC = () => {
  const { weddingData, updateBudget, addBudgetItem, removeBudgetItem, setWeddingData } = useWedding();
  const budgetItems = weddingData.budgetItems;
  const totalBudget = weddingData.budget;

  const [isAdding, setIsAdding] = useState(false);
  const [newItemCategory, setNewItemCategory] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [editedBudget, setEditedBudget] = useState(totalBudget);
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  const { updateWedding } = useWedding();

  const totalSpent = budgetItems.reduce((acc, curr) => acc + (curr.spent || 0), 0);
  const remaining = totalBudget - totalSpent;
  const usagePercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const addItem = async () => {
    if (!newItemCategory.trim()) return;
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      category: newItemCategory.trim(),
      planned: 0,
      spent: 0
    };
    await addBudgetItem(newItem);
    setIsAdding(false);
    setNewItemCategory('');
  };

  const updateSpent = (id: string, value: number) => {
    updateBudget(id, { spent: value });
  };

  const performDelete = async (id: string) => {
    await removeBudgetItem(id);
    setConfirmDeleteId(null);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBudget(true);
    try {
      await updateWedding({ budget: editedBudget });
      setIsEditingBudget(false);
    } catch (error) {
      console.error('Failed to update total budget:', error);
    } finally {
      setIsSavingBudget(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-800">Financeiro</h1>
          <p className="text-slate-500 mt-1">Controle seus gastos reais e veja o saldo disponível.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-wedding-gold text-white px-6 py-3 rounded-2xl shadow-lg shadow-wedding-gold/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all font-bold"
        >
          <Plus size={20} />
          <span>Novo Lançamento</span>
        </button>
      </header>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="p-2 bg-slate-50 rounded-lg"><Wallet size={18} /></div>
              <p className="text-xs font-bold uppercase tracking-widest">Orçamento Total</p>
            </div>
            <button
              onClick={() => {
                setEditedBudget(totalBudget);
                setIsEditingBudget(true);
              }}
              className="p-2 text-slate-300 hover:text-wedding-gold hover:bg-wedding-gold/5 rounded-full transition-colors group-hover:opacity-100 md:opacity-0"
              title="Editar orçamento total"
            >
              <Edit2 size={16} />
            </button>
          </div>
          <p className="text-3xl font-bold text-slate-800">R$ {totalBudget.toLocaleString('pt-BR')}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 text-wedding-gold mb-3">
            <div className="p-2 bg-wedding-nude rounded-lg"><ArrowDownRight size={18} /></div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Gasto</p>
          </div>
          <p className="text-3xl font-bold text-slate-800">R$ {totalSpent.toLocaleString('pt-BR')}</p>
          <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={clsx("h-full transition-all duration-1000", usagePercentage > 100 ? 'bg-red-500' : 'bg-wedding-gold')}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className={clsx("p-6 rounded-[2rem] border shadow-sm transition-all", remaining < 0 ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100')}>
          <div className={clsx("flex items-center gap-3 mb-3", remaining < 0 ? 'text-red-500' : 'text-green-500')}>
            <div className={clsx("p-2 rounded-lg", remaining < 0 ? 'bg-red-100' : 'bg-green-50')}><DollarSign size={18} /></div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Saldo Disponível</p>
          </div>
          <p className={clsx("text-3xl font-bold", remaining < 0 ? 'text-red-600' : 'text-green-600')}>
            R$ {remaining.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-wedding-gold/10 animate-fadeIn ring-4 ring-wedding-nude">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-serif font-bold text-slate-800">Nova Categoria de Gasto</h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-300 hover:text-slate-500 transition">
              <Plus size={24} className="rotate-45" />
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              autoFocus
              className="flex-1 px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-wedding-gold focus:bg-white transition-all text-lg"
              placeholder="Ex: Aluguel do Espaço, Buffet, Vestido..."
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />
            <button
              onClick={addItem}
              className="bg-wedding-gold text-white px-10 py-4 rounded-2xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              Criar Categoria
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-[0.2em]">
              <th className="p-8 font-bold">Serviço / Categoria</th>
              <th className="p-8 font-bold text-center">Valor Gasto (R$)</th>
              <th className="p-8 font-bold text-right">Status</th>
              <th className="p-8 font-bold text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {budgetItems.length > 0 ? budgetItems.map(item => (
              <tr key={item.id} className="hover:bg-wedding-nude/30 transition-colors group">
                <td className="p-8">
                  <p className="font-bold text-slate-800 text-lg">{item.category}</p>
                </td>
                <td className="p-8">
                  <div className="relative max-w-[200px] mx-auto">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold">R$</span>
                    <input
                      type="number"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl text-lg font-bold text-slate-700 focus:bg-white focus:border-wedding-gold outline-none transition-all"
                      value={item.spent || ''}
                      placeholder="0,00"
                      onChange={(e) => updateSpent(item.id, Number(e.target.value))}
                    />
                  </div>
                </td>
                <td className="p-8 text-right">
                  {item.spent > 0 ? (
                    <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Lançado</span>
                  ) : (
                    <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">A pagar</span>
                  )}
                </td>
                <td className="p-8 text-center">
                  <div className="flex justify-center">
                    {confirmDeleteId === item.id ? (
                      <div className="flex items-center gap-1 animate-fadeIn bg-red-50 p-1 rounded-xl border border-red-100">
                        <button
                          onClick={() => performDelete(item.id)}
                          className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-red-600 shadow-md flex items-center gap-1"
                        >
                          <Check size={12} strokeWidth={3} />
                          Confirmar
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-slate-400 p-1.5 hover:text-slate-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Excluir categoria"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="p-20 text-center">
                  <div className="w-16 h-16 bg-wedding-nude rounded-full flex items-center justify-center mx-auto mb-4">
                    <PieChart className="text-slate-200" size={32} />
                  </div>
                  <p className="text-slate-400 italic">Comece adicionando seus gastos!</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Edit Budget Modal */}
      {isEditingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsEditingBudget(false)} />
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-lg relative z-10 shadow-2xl border border-white animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-serif font-bold text-slate-800">Editar Orçamento Total</h3>
              <button
                onClick={() => setIsEditingBudget(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">VALOR TOTAL ESTIMADO (R$)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-xl">R$</span>
                  <input
                    type="number"
                    required
                    autoFocus
                    className="w-full pl-16 pr-6 py-5 rounded-3xl border border-slate-100 outline-none text-2xl font-bold bg-slate-50 focus:bg-white focus:ring-4 focus:ring-wedding-gold/10 focus:border-wedding-gold/30 transition-all"
                    value={editedBudget}
                    onChange={(e) => setEditedBudget(Number(e.target.value))}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingBudget}
                className="w-full bg-wedding-gold text-white py-5 rounded-3xl text-xl font-bold shadow-xl shadow-wedding-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
              >
                {isSavingBudget ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={20} />
                    Salvar Alterações
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetTracker;
