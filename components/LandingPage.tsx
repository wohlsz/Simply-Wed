
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStart = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-wedding-nude">
      {/* Navigation */}
      <nav className="p-8 flex flex-col sm:flex-row justify-between items-center bg-transparent absolute w-full z-10 gap-6 sm:gap-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-wedding-gold rounded-full flex items-center justify-center">
            <Heart className="text-white fill-white" size={20} />
          </div>
          <span className="text-2xl font-serif font-bold text-slate-800 tracking-tight">Simply Wed</span>
        </div>
        <button
          onClick={handleStart}
          className="bg-white text-wedding-gold border border-wedding-gold px-8 py-2.5 rounded-full font-bold hover:bg-wedding-gold hover:text-white transition-all shadow-sm"
        >
          {user ? 'Ir para o Painel' : 'Entrar'}
        </button>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col md:flex-row items-center justify-center px-6 pt-48 md:pt-32 pb-20 gap-16 max-w-7xl mx-auto">
        <div className="max-w-2xl text-center md:text-left space-y-8 animate-fadeIn">
          <div className="inline-block px-4 py-1 rounded-full bg-wedding-gold/10 text-wedding-gold font-bold text-sm uppercase tracking-widest">
            Organização Premium de Casamentos
          </div>
          <h1 className="text-6xl md:text-8xl font-serif text-slate-800 leading-[1.1]">
            Planeje seu <br />
            <span className="italic text-wedding-gold">grande dia</span> <br />
            em um só lugar.
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed max-w-lg">
            Reduza o estresse do planejamento com nossa plataforma intuitiva. Checklists, convidados, financeiro e muito mais.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start pt-4">
            <button
              onClick={handleStart}
              className="bg-wedding-gold text-white px-10 py-5 rounded-2xl text-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-wedding-gold/30 flex items-center gap-3 justify-center"
            >
              Começar planejamento
              <ArrowRight size={20} />
            </button>
            <button className="bg-white border-2 border-slate-100 text-slate-600 px-10 py-5 rounded-2xl text-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-3 justify-center">
              Ver demonstração
            </button>
          </div>
        </div>

        <div className="relative group flex-1">
          <div className="absolute -inset-4 bg-gradient-to-tr from-wedding-gold/20 to-pink-100/30 rounded-[3rem] blur-2xl opacity-50"></div>
          <div className="relative bg-white p-4 rounded-[2.5rem] shadow-2xl border border-white/50 transform md:rotate-2 group-hover:rotate-0 transition-transform duration-700">
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800"
              alt="Casamento Elegante"
              className="rounded-[2rem] shadow-inner"
            />
            {/* Floating UI Elements for decoration */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl animate-bounce-slow border border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tarefa Concluída</p>
                  <p className="text-sm font-bold text-slate-700">Contratar Buffet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-12 md:gap-24 opacity-60">
          <StatItem label="Casais Felizes" value="12.000+" />
          <StatItem label="Tarefas Concluídas" value="450k+" />
          <StatItem label="RSVPs Gerados" value="1.2M+" />
          <StatItem label="Avaliação Média" value="4.9/5" />
        </div>
      </section>

      <footer className="py-12 text-center text-slate-400 text-sm border-t border-slate-100">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="text-wedding-gold fill-wedding-gold" size={16} />
          <span className="font-serif font-bold text-slate-800">Simply Wed</span>
        </div>
        &copy; 2026 Simply Wed - Criado com amor para o seu grande dia.
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 1s ease-out; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>
    </div>
  );
};

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="text-center">
    <p className="text-3xl font-bold text-slate-800">{value}</p>
    <p className="text-sm font-medium text-slate-400">{label}</p>
  </div>
);

export default LandingPage;
