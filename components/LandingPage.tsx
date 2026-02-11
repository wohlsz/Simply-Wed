import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, CheckCircle, Users, ClipboardList, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    title: "Checklist Inteligente",
    description: "Uma lista completa de tarefas organizadas por prazos para você não esquecer nenhum detalhe.",
    icon: <CheckCircle className="text-green-500" size={16} />,
    featureIcon: <ClipboardList className="text-wedding-gold" size={64} />,
    highlightTitle: "Tarefa Concluída",
    highlightDesc: "Ensaio Pré-Wedding",
    color: "bg-green-100",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Gestão de Convidados",
    description: "Controle total da sua lista, acompanhe RSVPs em tempo real e organize por grupos.",
    icon: <Users className="text-purple-500" size={16} />,
    featureIcon: <Users className="text-wedding-gold" size={64} />,
    highlightTitle: "Convidado adicionado a lista",
    highlightDesc: "Família Silva",
    color: "bg-purple-100",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800"
  },
  {
    title: "Controle Orçamentário",
    description: "Acompanhe cada centavo investido e mantenha o seu grande dia dentro do planejamento financeiro.",
    icon: <DollarSign className="text-blue-500" size={16} />,
    featureIcon: <DollarSign className="text-wedding-gold" size={64} />,
    highlightTitle: "Orçamento atualizado",
    highlightDesc: "Fotógrafo Quitado",
    color: "bg-blue-100",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800"
  }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeFeature, setActiveFeature] = useState(0);
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleStart = () => {
    setShowDemoModal(true);
  };

  const handleConfirmDemo = () => {
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
          <span className="text-2xl font-serif font-bold text-slate-800 tracking-tight">Simples Wed</span>
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
          <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start pt-4">
            <button
              onClick={handleStart}
              className="bg-wedding-gold text-white px-10 py-5 rounded-2xl text-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-wedding-gold/30 flex items-center gap-3 justify-center relative z-20"
            >
              <span className="flex items-center gap-3 pointer-events-none">
                Começar planejamento
                <ArrowRight size={20} />
              </span>
            </button>
            <button
              onClick={handleStart}
              className="bg-white border-2 border-slate-100 text-slate-600 px-10 py-5 rounded-2xl text-xl font-bold hover:bg-slate-50 transition-all flex items-center gap-3 justify-center relative z-20"
            >
              <span className="pointer-events-none">
                Ver demonstração
              </span>
            </button>
          </div>
        </div>

        <div className="relative group flex-1">
          <div className="absolute -inset-4 bg-gradient-to-tr from-wedding-gold/20 to-pink-100/30 rounded-[3rem] blur-2xl opacity-50"></div>
          <div className="relative bg-white p-4 rounded-[2.5rem] shadow-2xl border border-white/50 transform md:rotate-2 group-hover:rotate-0 transition-all duration-700">
            <div className="relative overflow-hidden rounded-[2rem]">
              <img
                key={`img-${activeFeature}`}
                src={FEATURES[activeFeature].image}
                alt={FEATURES[activeFeature].title}
                className="w-full h-auto object-cover transition-all duration-700 hover:scale-105 animate-slideUp"
              />
            </div>
            {/* Floating UI Elements based on rotating feature */}
            <div
              key={`card-${activeFeature}`}
              className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl animate-bounce-slow border border-slate-50 min-w-[180px] animate-fadeIn"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${FEATURES[activeFeature].color} rounded-full flex items-center justify-center`}>
                  {FEATURES[activeFeature].icon}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{FEATURES[activeFeature].highlightTitle}</p>
                  <p className="text-sm font-bold text-slate-700">{FEATURES[activeFeature].highlightDesc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Demo/Test Version Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fadeIn"
            onClick={() => setShowDemoModal(false)}
          />
          <div className="relative bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 w-full max-w-xl shadow-2xl border border-white animate-scaleIn mx-auto overflow-hidden">
            <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-wedding-gold/10 rounded-full flex items-center justify-center mb-0 md:mb-2">
                <Heart className="text-wedding-gold fill-wedding-gold" size={32} md:size={40} />
              </div>

              <div className="space-y-3 md:space-y-4 w-full">
                <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-800 leading-tight">Seja bem-vindo(a) ao Simples Wed!</h3>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                  Esta é uma <span className="text-wedding-gold font-bold">versão de testes exclusiva</span> da nossa plataforma.
                </p>
                <div className="bg-slate-50 p-4 md:p-6 rounded-2xl text-slate-600 text-sm md:text-base border border-slate-100 text-center">
                  Sinta-se à vontade para explorar todas as funcionalidades! Seu feedback é fundamental.
                  <br /><br />
                  <p className="font-bold text-slate-800 text-[10px] md:text-xs">
                    Para dar o feedback clique no botão abaixo ou mande mensagem no WhatsApp:
                  </p>
                  <div className="flex flex-col items-center gap-1 mt-3">
                    <p className="font-bold flex items-center gap-2 text-slate-800 text-xs">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      WhatsApp:
                    </p>
                    <span className="text-wedding-gold font-bold text-sm md:text-base tracking-wide">(81) 9.9984-0647</span>
                  </div>
                </div>
              </div>

              <div className="w-full flex flex-col gap-3 pt-4">
                <button
                  onClick={handleConfirmDemo}
                  className="w-full bg-wedding-gold text-white px-8 py-5 rounded-2xl font-bold shadow-xl shadow-wedding-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg relative z-20"
                >
                  <span className="pointer-events-none">Explorar Plataforma</span>
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/feedback')}
                    className="flex-1 bg-white border-2 border-wedding-gold text-wedding-gold px-8 py-4 rounded-2xl font-bold hover:bg-wedding-gold/5 transition-all relative z-20"
                  >
                    <span className="pointer-events-none">Dar Feedback</span>
                  </button>
                  <button
                    onClick={() => setShowDemoModal(false)}
                    className="flex-1 px-8 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all relative z-20"
                  >
                    <span className="pointer-events-none">Voltar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
          <span className="font-serif font-bold text-slate-800">Simples Wed</span>
        </div>
        &copy; 2026 Simples Wed - Criado com amor para o seu grande dia.
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: scale(1.1); } to { opacity: 1; transform: scale(1); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-slideUp { animation: slideUp 1s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      `}</style>
    </div >
  );
};

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="text-center">
    <p className="text-3xl font-bold text-slate-800">{value}</p>
    <p className="text-sm font-medium text-slate-400">{label}</p>
  </div>
);

export default LandingPage;
