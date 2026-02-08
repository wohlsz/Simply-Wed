
import React, { useState } from 'react';
import { useWedding } from '../context/WeddingContext';
import { WeddingTask, SubTask } from '../types';
import {
  Plus,
  CheckCircle,
  Circle,
  Trash2,
  CheckSquare,
  Edit3,
  X,
  Check,
  FolderPlus,
  ChevronDown,
  ListTodo
} from 'lucide-react';
import clsx from 'clsx';

const Checklist: React.FC = () => {
  const { weddingData, addTask, updateTask, removeTask, setWeddingData } = useWedding();
  const tasks = weddingData.tasks;
  const categories = weddingData.categories;

  const [filter, setFilter] = useState<string>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [confirmDeleteTaskId, setConfirmDeleteTaskId] = useState<string | null>(null);
  const [confirmDeleteCatId, setConfirmDeleteCatId] = useState<string | null>(null);

  const [newTask, setNewTask] = useState({ title: '', category: categories[0] || '' });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubTaskTitles, setNewSubTaskTitles] = useState<Record<string, string>>({});
  const [shouldWrapCategories, setShouldWrapCategories] = useState(false);

  const toggleStatus = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      updateTask(id, { status: task.status === 'completed' ? 'pending' : 'completed' });
    }
  };

  const performRemoveTask = (id: string) => {
    removeTask(id);
    setConfirmDeleteTaskId(null);
  };

  const performAddTask = () => {
    if (!newTask.title.trim()) return;
    const task: WeddingTask = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title.trim(),
      category: newTask.category || categories[0],
      status: 'pending',
      subtasks: []
    };
    addTask(task);
    setNewTask({ ...newTask, title: '' });
    setIsAddingTask(false);
  };

  const performAddSubTask = (taskId: string) => {
    const title = newSubTaskTitles[taskId]?.trim();
    if (!title) return;

    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const subtasks = task.subtasks || [];
      const newSub: SubTask = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        completed: false
      };
      updateTask(taskId, {
        subtasks: [...subtasks, newSub],
        status: 'pending'
      });
      setNewSubTaskTitles({ ...newSubTaskTitles, [taskId]: '' });
    }
  };

  const toggleSubTask = (taskId: string, subId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const subtasks = (task.subtasks || []).map(s =>
        s.id === subId ? { ...s, completed: !s.completed } : s
      );

      const allCompleted = subtasks.length > 0 && subtasks.every(s => s.completed);
      const newStatus = allCompleted ? 'completed' : 'pending';

      updateTask(taskId, { subtasks, status: newStatus });
    }
  };

  const removeSubTask = (taskId: string, subId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const subtasks = (task.subtasks || []).filter(s => s.id !== subId);
      const allCompleted = subtasks.length > 0 && subtasks.every(s => s.completed);

      const updates: Partial<WeddingTask> = { subtasks };
      if (subtasks.length > 0) {
        updates.status = allCompleted ? 'completed' : 'pending';
      }

      updateTask(taskId, updates);
    }
  };

  const toggleExpand = (taskId: string) => {
    const next = new Set(expandedTasks);
    if (next.has(taskId)) next.delete(taskId);
    else next.add(taskId);
    setExpandedTasks(next);
  };

  const addCategory = () => {
    const name = newCategoryName.trim();
    if (!name || categories.includes(name)) return;
    // Manually updating categories via setWeddingData since we don't have a specific action for it yet in context
    setWeddingData(prev => ({
      ...prev,
      categories: [...prev.categories, name]
    }));
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const performRemoveCategory = (catName: string) => {
    setWeddingData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== catName),
      tasks: prev.tasks.filter(t => t.category !== catName)
    }));
    if (filter === catName) setFilter('all');
    setConfirmDeleteCatId(null);
  };

  const startEditing = (task: WeddingTask) => {
    setEditingId(task.id);
    setEditValue(task.title);
  };

  const saveEdit = (id: string) => {
    if (!editValue.trim()) return;
    updateTask(id, { title: editValue.trim() });
    setEditingId(null);
  };

  const filteredTasks = tasks.filter(t => filter === 'all' || t.category === filter);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20 animate-fadeIn">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-800">Checklist</h1>
          <p className="text-slate-500 mt-1">Organize cada detalhe com precisão.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsAddingCategory(true)}
            className="bg-white text-wedding-gold border border-wedding-gold/30 px-5 py-3 rounded-2xl flex items-center gap-2 hover:bg-wedding-nude transition-all font-bold text-sm"
          >
            <FolderPlus size={18} />
            Nova Lista
          </button>
          <button
            onClick={() => {
              if (categories.length === 0) {
                alert('Crie uma lista primeiro!');
                return;
              }
              setIsAddingTask(true);
            }}
            className="bg-wedding-gold text-white px-6 py-3 rounded-2xl shadow-lg shadow-wedding-gold/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all font-bold"
          >
            <Plus size={20} />
            Nova Tarefa
          </button>
        </div>
      </header>

      {/* Navegação de Categorias */}
      <div className="flex items-start gap-2">
        <div className={clsx(
          "flex-1 flex gap-2 pb-4 transition-all duration-300",
          shouldWrapCategories ? "flex-wrap" : "overflow-x-auto scrollbar-hide"
        )}>
          <button
            onClick={() => setFilter('all')}
            className={clsx(
              "px-6 py-2.5 rounded-full whitespace-nowrap transition-all text-sm font-bold border",
              filter === 'all'
                ? 'bg-wedding-gold text-white border-wedding-gold shadow-md'
                : 'bg-white text-slate-500 border-slate-100 hover:border-wedding-gold/30'
            )}
          >
            Todas ({tasks.length})
          </button>
          {categories.map(cat => (
            <div key={cat} className="relative flex items-center shrink-0 group/cat">
              <button
                onClick={() => setFilter(cat)}
                className={clsx(
                  "px-6 py-2.5 rounded-full whitespace-nowrap transition-all text-sm font-bold border pr-12",
                  filter === cat
                    ? 'bg-wedding-gold text-white border-wedding-gold shadow-md'
                    : 'bg-white text-slate-500 border-slate-100 hover:border-wedding-gold/30'
                )}
              >
                {cat}
              </button>

              <div className="absolute right-2 flex items-center">
                {confirmDeleteCatId === cat ? (
                  <div className="flex items-center gap-1 bg-white shadow-xl rounded-full p-0.5 border border-red-100 animate-fadeIn">
                    <button onClick={() => performRemoveCategory(cat)} className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors">
                      <Check size={12} strokeWidth={3} />
                    </button>
                    <button onClick={() => setConfirmDeleteCatId(null)} className="bg-slate-100 text-slate-500 p-1.5 rounded-full hover:bg-slate-200 transition-colors">
                      <X size={12} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteCatId(cat); }}
                    className={clsx(
                      "p-1.5 rounded-full transition-all",
                      filter === cat ? 'text-white/60 hover:text-white hover:bg-white/20' : 'text-slate-300 hover:text-red-500 hover:bg-red-50'
                    )}
                    title="Remover lista"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Toggle View Button - Only show if enough categories to scroll */}
        {categories.length > 3 && (
          <button
            onClick={() => setShouldWrapCategories(prev => !prev)}
            className="shrink-0 p-2.5 bg-white border border-slate-100 rounded-full text-slate-400 hover:text-wedding-gold hover:border-wedding-gold/30 transition-colors"
            title={shouldWrapCategories ? "Ver menos" : "Ver todas"}
          >
            {shouldWrapCategories ? <ChevronDown className="rotate-180" size={20} /> : <ChevronDown size={20} />}
          </button>
        )}
      </div>

      {/* Modais de Adição */}
      {isAddingCategory && (
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-wedding-gold/10 animate-fadeIn ring-4 ring-wedding-nude">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-serif font-bold text-slate-800">Criar Nova Lista</h3>
            <button onClick={() => setIsAddingCategory(false)} className="text-slate-300 hover:text-slate-500 transition">
              <X size={24} />
            </button>
          </div>
          <div className="space-y-4">
            <input
              autoFocus
              className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-wedding-gold focus:bg-white transition-all text-lg"
              placeholder="Ex: Lua de Mel, Documentação..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCategory()}
            />
            <div className="flex justify-end gap-4 mt-4">
              <button onClick={() => setIsAddingCategory(false)} className="px-6 py-2 text-slate-400 font-bold">Cancelar</button>
              <button onClick={addCategory} className="bg-wedding-gold text-white px-8 py-3 rounded-2xl font-bold shadow-lg">Criar Lista</button>
            </div>
          </div>
        </div>
      )}

      {isAddingTask && (
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl border border-wedding-gold/10 animate-fadeIn ring-4 ring-wedding-nude">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-serif font-bold text-slate-800">Nova Tarefa</h3>
            <button onClick={() => setIsAddingTask(false)} className="text-slate-300 hover:text-slate-500 transition">
              <X size={24} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Tarefa</label>
              <input
                autoFocus
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-wedding-gold focus:bg-white transition-all text-lg"
                placeholder="Ex: Contratar banda"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && performAddTask()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Lista</label>
              <select
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-wedding-gold focus:bg-white transition-all appearance-none cursor-pointer"
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-8">
            <button onClick={() => setIsAddingTask(false)} className="px-8 py-3 text-slate-400 font-bold">Cancelar</button>
            <button onClick={performAddTask} className="bg-wedding-gold text-white px-10 py-3 rounded-2xl font-bold shadow-xl">Salvar</button>
          </div>
        </div>
      )}

      {/* Lista de Tarefas */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? filteredTasks.map(task => {
          const subtasks = task.subtasks || [];
          const completedSub = subtasks.filter(s => s.completed).length;
          const isExpanded = expandedTasks.has(task.id);
          const isCompleted = task.status === 'completed';

          return (
            <div key={task.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group transition-all">
              <div className="p-6 flex items-center gap-5">
                <button onClick={() => toggleStatus(task.id)} className="shrink-0 active:scale-90 transition-transform">
                  {isCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shadow-sm transition-all animate-popIn">
                      <Check size={18} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-slate-200 hover:border-wedding-gold transition-colors" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  {editingId === task.id ? (
                    <input
                      autoFocus
                      className="w-full bg-white border border-wedding-gold/30 rounded-lg px-3 py-1 outline-none text-slate-800 font-medium"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(task.id)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(task.id)}
                    />
                  ) : (
                    <div onClick={() => toggleStatus(task.id)} className="cursor-pointer">
                      <p className={clsx("font-semibold text-lg transition-all", isCompleted ? 'text-slate-300 line-through' : 'text-slate-700')}>
                        {task.title}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.category}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleExpand(task.id)}
                    className={clsx("p-3 rounded-xl transition-all", isExpanded ? 'bg-wedding-nude text-wedding-gold' : 'text-slate-300 hover:text-wedding-gold hover:bg-slate-50')}
                    title="Sub-tarefas"
                  >
                    <ChevronDown size={20} className={clsx("transition-transform duration-300", isExpanded ? 'rotate-180' : '')} />
                  </button>
                  <button
                    onClick={() => startEditing(task)}
                    className="p-3 text-slate-300 hover:text-wedding-gold hover:bg-slate-50 rounded-xl transition-all"
                    title="Editar"
                  >
                    <Edit3 size={18} />
                  </button>

                  <div className="relative">
                    {confirmDeleteTaskId === task.id ? (
                      <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl animate-fadeIn ml-2">
                        <button
                          onClick={() => performRemoveTask(task.id)}
                          className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-red-600 shadow-md"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setConfirmDeleteTaskId(null)}
                          className="text-slate-400 p-1.5 hover:text-slate-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteTaskId(task.id)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Remover tarefa"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="bg-wedding-nude/20 border-t border-slate-50 px-8 py-6 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ListTodo size={16} className="text-wedding-gold" />
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sub-itens ({completedSub}/{subtasks.length})</h5>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {subtasks.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between bg-white/60 p-3 rounded-xl border border-white group/sub">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleSubTask(task.id, sub.id)}>
                            {sub.completed ? <CheckCircle className="text-green-500" size={18} /> : <Circle className="text-slate-300" size={18} />}
                          </button>
                          <span className={clsx("text-sm font-medium", sub.completed ? 'text-slate-300 line-through' : 'text-slate-600')}>{sub.title}</span>
                        </div>
                        <button
                          onClick={() => removeSubTask(task.id, sub.id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-all rounded-lg hover:bg-red-50"
                          title="Remover sub-item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-wedding-gold/10">
                    <input
                      className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-wedding-gold shadow-sm"
                      placeholder="Novo sub-item..."
                      value={newSubTaskTitles[task.id] || ''}
                      onChange={(e) => setNewSubTaskTitles({ ...newSubTaskTitles, [task.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && performAddSubTask(task.id)}
                    />
                    <button onClick={() => performAddSubTask(task.id)} className="bg-wedding-gold text-white p-2 rounded-xl shadow-md"><Plus size={18} /></button>
                  </div>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-100">
            <div className="w-20 h-20 bg-wedding-nude rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="text-slate-200" size={32} />
            </div>
            <p className="text-slate-400 italic">Nenhuma tarefa encontrada.</p>
          </div>
        )}
      </div>

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-popIn { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Checklist;
