
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
  Save,
  Heart
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

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    data.budgetItems.forEach(item => {
      if (item.spent > 0) {
        categories[item.category] = (categories[item.category] || 0) + item.spent;
      }
    });

    const chartData = Object.entries(categories).map(([name, value]) => ({ name, value }));

    // If no spending, show a placeholder
    if (chartData.length === 0) {
      return [{ name: 'Sem gastos', value: 1 }];
    }

    return chartData.sort((a, b) => b.value - a.value);
  }, [data.budgetItems]);

  const CATEGORY_COLORS = ['#C5A059', '#E5D5B7', '#A38A5E', '#D4AF37', '#8B7355', '#C0C0C0'];

  return (
    <div className="space-y-8 pb-12">
      <header className="relative bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-wedding-gold/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-wedding-gold/10 transition-colors duration-700" />

        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-wedding-gold/10 text-wedding-gold rounded-full text-[9px] font-bold uppercase tracking-[0.2em]">
              <Heart size={10} className="fill-wedding-gold" />
              Sua Jornada até o Sim
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 leading-tight">
                Olá, {data.coupleName || 'Noivos'}!
              </h1>
              <button
                onClick={handleOpenNameEdit}
                className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-wedding-gold hover:bg-wedding-gold/10 transition-all opacity-0 group-hover:opacity-100"
              >
                <Edit2 size={18} />
              </button>
            </div>
            <p className="text-slate-500 text-sm max-w-md">
              Faltam <span className="text-wedding-gold font-bold">{daysLeft} dias</span> para o seu dia. Planejamento {progressPercent}% pronto.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-wedding-nude/50 rounded-[2rem] border border-white shadow-inner min-w-[160px] hover:scale-105 transition-transform cursor-pointer" onClick={handleOpenDateEdit}>
            <div className="text-4xl font-serif font-bold text-wedding-gold mb-1">{daysLeft}</div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Dias Restantes</div>
            <div className="mt-3 flex items-center gap-2 text-slate-400 hover:text-wedding-gold transition-colors">
              <Calendar size={12} />
              <span className="text-[10px] font-bold">{data.weddingDate ? new Date(data.weddingDate).toLocaleDateString('pt-BR') : 'Definir Data'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <NavLink to="/dashboard/checklist" className="block outline-none focus:ring-2 focus:ring-wedding-gold rounded-3xl transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <StatCard
            icon={<CheckCircle className="text-green-500" />}
            label="Checklist"
            value={`${completedTasks}/${data.tasks.length}`}
            subtext="Tarefas concluídas"
          />
        </NavLink>
        <NavLink to="/dashboard/budget" className="block outline-none focus:ring-2 focus:ring-wedding-gold rounded-3xl transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <StatCard
            icon={<DollarSign className="text-blue-500" />}
            label="Orçamento"
            value={`R$ ${totalSpent.toLocaleString('pt-BR')}`}
            subtext={`de R$ ${data.budget.toLocaleString('pt-BR')}`}
          />
        </NavLink>
        <NavLink to="/dashboard/guests" className="block outline-none focus:ring-2 focus:ring-wedding-gold rounded-3xl transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <StatCard
            icon={<Users className="text-purple-500" />}
            label="Convidados"
            value={data.guestCount.toString()}
            subtext={`Confirmados: ${data.guests.filter(g => g.rsvpStatus === 'confirmed').length}`}
          />
        </NavLink>
        <div className="block cursor-default">
          <StatCard
            icon={<Clock className="text-orange-500" />}
            label="Próximo Prazo"
            value="Contrato Local" // TODO: Implement logic to find next deadline
            subtext="Em 3 dias"
          />
        </div>
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
              <BarChart data={categoryData.filter(d => d.name !== 'Sem gastos')}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Gasto']}
                />
                <Bar dataKey="value" fill="#C5A059" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Progress Pie */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
          <h3 className="text-xl font-serif font-bold text-slate-800 mb-6 text-center">Distribuição de Gastos</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [`R$ ${value.toLocaleString('pt-BR')}`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 w-full h-[150px] overflow-y-auto custom-scrollbar pr-2">
            {categoryData.length > 0 && categoryData[0].name !== 'Sem gastos' ? (
              <div className="space-y-2">
                {categoryData.map((item, index) => (
                  <div key={item.name} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} />
                      <span className="text-slate-600 font-medium truncate max-w-[100px]">{item.name}</span>
                    </div>
                    <span className="text-slate-400 font-bold">
                      {totalSpent > 0 ? Math.round((item.value / totalSpent) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-400 text-sm mt-8">Nenhum gasto registrado</div>
            )}
          </div>
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
