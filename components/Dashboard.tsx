
import React, { useMemo } from 'react';
import { useWedding } from '../context/WeddingContext';
import {
  CheckCircle,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Edit2,
  X,
  Save
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { StatCard } from './ui/StatCard';
import { NavLink } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { weddingData: data, updateWedding } = useWedding();

  const [activeModal, setActiveModal] = React.useState<'name' | 'date' | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [editValue, setEditValue] = React.useState('');

  const handleOpenNameEdit = () => {
    setEditValue(data.coupleName);
    setActiveModal('name');
  };

  const handleOpenDateEdit = () => {
    setEditValue(data.weddingDate);
    setActiveModal('date');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (activeModal === 'name') {
        await updateWedding({ coupleName: editValue });
      } else if (activeModal === 'date') {
        await updateWedding({ weddingDate: editValue });
      }
      setActiveModal(null);
    } catch (error) {
      console.error('Failed to update wedding details:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const { completedTasks, progressPercent } = useMemo(() => {
    const completed = data.tasks.filter(t => t.status === 'completed').length;
    return {
      completedTasks: completed,
      progressPercent: data.tasks.length > 0 ? Math.round((completed / data.tasks.length) * 100) : 0
    };
  }, [data.tasks]);

  const daysLeft = useMemo(() => {
    if (!data.weddingDate) return 0;
    const weddingDate = new Date(data.weddingDate);
    const today = new Date();
    return Math.max(0, Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  }, [data.weddingDate]);

  const { totalSpent, budgetProgress } = useMemo(() => {
    const spent = data.budgetItems.reduce((acc, curr) => acc + curr.spent, 0);
    return {
      totalSpent: spent,
      budgetProgress: data.budget > 0 ? Math.round((spent / data.budget) * 100) : 0
    };
  }, [data.budgetItems, data.budget]);

  const pieData = [
    { name: 'Gasto', value: totalSpent },
    { name: 'Restante', value: Math.max(0, data.budget - totalSpent) },
  ];

  const COLORS = ['#C5A059', '#F3F0E9'];

  const [showFullDate, setShowFullDate] = React.useState(false);

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between w-full gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-serif font-bold text-slate-800">Olá, {data.coupleName || 'Noivos'}!</h1>
              <button
                onClick={handleOpenNameEdit}
                className="p-2 text-slate-400 hover:text-wedding-gold hover:bg-wedding-gold/5 rounded-full transition-colors"
                title="Editar nome do casal"
              >
                <Edit2 size={20} />
              </button>
            </div>
            <p className="text-slate-500 mt-1">Seu planejamento está {progressPercent}% concluído.</p>
          </div>
          <button
            onClick={handleOpenDateEdit}
            className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 hover:border-wedding-gold/30 hover:bg-slate-50 transition-all group"
            title="Clique para editar a data do casamento"
          >
            <Calendar className="text-wedding-gold group-hover:scale-110 transition-transform" size={20} />
            <div className="flex flex-col items-start">
              <span className="font-bold text-slate-700 leading-none">
                {data.weddingDate
                  ? (showFullDate
                    ? new Date(data.weddingDate).toLocaleDateString('pt-BR')
                    : (daysLeft > 0 ? `${daysLeft} dias restantes` : 'É hoje! 🎉'))
                  : 'Defina a data'}
              </span>
              <span className="text-[8px] uppercase tracking-widest text-slate-300 font-bold mt-1 group-hover:text-wedding-gold transition-colors">Clique para alterar</span>
            </div>
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<CheckCircle className="text-green-500" />}
          label="Checklist"
          value={`${completedTasks}/${data.tasks.length}`}
          subtext="Tarefas concluídas"
        />
        <StatCard
          icon={<DollarSign className="text-blue-500" />}
          label="Orçamento"
          value={`R$ ${totalSpent.toLocaleString('pt-BR')}`}
          subtext={`de R$ ${data.budget.toLocaleString('pt-BR')}`}
        />
        <StatCard
          icon={<Users className="text-purple-500" />}
          label="Convidados"
          value={data.guestCount.toString()}
          subtext={`Confirmados: ${data.guests.filter(g => g.rsvpStatus === 'confirmed').length}`}
        />
        <StatCard
          icon={<Clock className="text-orange-500" />}
          label="Próximo Prazo"
          value="Contrato Local" // TODO: Implement logic to find next deadline
          subtext="Em 3 dias"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Budget Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-serif font-bold text-slate-800">Evolução de Gastos</h3>
            <span className="text-sm text-slate-400">Por Categoria</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.budgetItems}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="spent" fill="#C5A059" radius={[4, 4, 0, 0]} />
                <Bar dataKey="planned" fill="#F3F0E9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Progress Pie */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
          <h3 className="text-xl font-serif font-bold text-slate-800 mb-6 text-center">Visão Geral Budget</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-3xl font-bold text-slate-800">{budgetProgress}%</p>
            <p className="text-sm text-slate-400">do orçamento utilizado</p>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-xl font-serif font-bold text-slate-800">Tarefas Pendentes</h3>
          <NavLink to="/dashboard/checklist" className="text-wedding-gold text-sm font-bold hover:underline">Ver todas</NavLink>
        </div>
        <div className="divide-y divide-slate-50">
          {data.tasks.filter(t => t.status !== 'completed').slice(0, 4).map(task => (
            <div key={task.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition">
              <div className="w-2 h-2 rounded-full bg-wedding-gold" />
              <div className="flex-1">
                <p className="text-slate-800 font-medium">{task.title}</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">{task.category}</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full">Pendente</span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-lg relative z-10 shadow-2xl border border-white animate-fadeIn">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-serif font-bold text-slate-800">
                {activeModal === 'name' ? 'Editar Nome do Casal' : 'Editar Data do Casamento'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  {activeModal === 'name' ? 'COMO DEVEMOS CHAMÁ-LOS?' : 'QUANDO SERÁ O GRANDE DIA?'}
                </label>
                <input
                  type={activeModal === 'name' ? 'text' : 'date'}
                  required
                  className="w-full px-6 py-4 rounded-2xl border border-slate-100 outline-none text-lg font-medium bg-slate-50 focus:bg-white focus:ring-4 focus:ring-wedding-gold/10 focus:border-wedding-gold/30 transition-all"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-wedding-gold text-white py-4 rounded-2xl text-lg font-bold shadow-xl shadow-wedding-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
              >
                {isSaving ? (
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

export default Dashboard;
