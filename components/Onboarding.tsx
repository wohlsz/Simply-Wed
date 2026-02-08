
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWedding } from '../context/WeddingContext';
import { Calendar, Users, Wallet, Heart, ArrowRight, Sparkles } from 'lucide-react';

const Onboarding: React.FC = () => {
  const { createWedding } = useWedding();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    coupleName: '',
    weddingDate: '',
    budget: 50000,
    guestCount: 150,
    ceremonyType: 'Religiosa'
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await createWedding({
      ...formData,
      onboarded: true
    });
    // Navigation is handled by App.tsx state change, but we can push to ensure
    navigate('/dashboard');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-2">
              <h2 className="text-4xl font-serif font-bold text-slate-800">Primeiro, como devemos chamar o casal?</h2>
              <p className="text-slate-400 font-medium">Pode ser o nome de vocês ou algo carinhoso.</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">NOME DO CASAL</label>
              <div className="relative">
                <Heart className="absolute left-6 top-1/2 -translate-y-1/2 text-wedding-gold" size={24} />
                <input
                  type="text"
                  placeholder="Ex: Maria & João"
                  autoFocus
                  className="w-full pl-16 pr-6 py-5 rounded-3xl border border-slate-100 outline-none text-xl font-medium transition-all bg-white text-slate-800 placeholder:text-slate-300 focus:ring-4 focus:ring-wedding-gold/20 focus:border-wedding-gold/30"
                  value={formData.coupleName}
                  onChange={(e) => setFormData({ ...formData, coupleName: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && formData.coupleName && nextStep()}
                />
              </div>
            </div>
            <button
              disabled={!formData.coupleName}
              onClick={nextStep}
              className="w-full bg-wedding-gold text-white border-[0.5px] border-wedding-gold/50 py-5 rounded-3xl text-xl font-bold disabled:opacity-30 shadow-xl shadow-wedding-gold/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
            >
              Próximo Passo
              <ArrowRight size={20} />
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-2">
              <h2 className="text-4xl font-serif font-bold text-slate-800">Qual a data do grande dia?</h2>
              <p className="text-slate-400 font-medium">Você pode mudar depois se precisar.</p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">DATA DO CASAMENTO</label>
              <div className="relative">
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-wedding-gold" size={24} />
                <input
                  type="date"
                  className="w-full pl-16 pr-6 py-5 rounded-3xl border border-slate-100 outline-none text-xl font-medium transition-all bg-white text-slate-800 focus:ring-4 focus:ring-wedding-gold/20 focus:border-wedding-gold/30"
                  value={formData.weddingDate}
                  onChange={(e) => setFormData({ ...formData, weddingDate: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && formData.weddingDate && nextStep()}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={prevStep}
                className="flex-1 py-4 border-[0.5px] border-wedding-gold/40 rounded-3xl font-bold text-wedding-gold hover:bg-wedding-gold/5 transition-all bg-white shadow-sm"
              >
                Voltar
              </button>
              <button
                disabled={!formData.weddingDate}
                onClick={nextStep}
                className="flex-[2] bg-wedding-gold text-white border-[0.5px] border-wedding-gold/50 py-5 rounded-3xl text-xl font-bold disabled:opacity-30 shadow-xl shadow-wedding-gold/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
              >
                Continuar
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="space-y-2">
              <h2 className="text-4xl font-serif font-bold text-slate-800">Quais as expectativas?</h2>
              <p className="text-slate-400 font-medium">Configure as bases do seu plano.</p>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">ORÇAMENTO TOTAL (R$)</label>
                <div className="relative">
                  <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 text-wedding-gold" size={20} />
                  <input
                    type="number"
                    className="w-full pl-16 pr-6 py-5 rounded-3xl border border-slate-100 outline-none text-lg font-bold bg-white text-slate-800 focus:ring-4 focus:ring-wedding-gold/20 focus:border-wedding-gold/30"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">NÚMERO DE CONVIDADOS</label>
                <div className="relative">
                  <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-wedding-gold" size={20} />
                  <input
                    type="number"
                    className="w-full pl-16 pr-6 py-5 rounded-3xl border border-slate-100 outline-none text-lg font-bold bg-white text-slate-800 focus:ring-4 focus:ring-wedding-gold/20 focus:border-wedding-gold/30"
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                onClick={prevStep}
                className="flex-1 py-4 border-[0.5px] border-wedding-gold/40 rounded-3xl font-bold text-wedding-gold hover:bg-wedding-gold/5 transition-all bg-white shadow-sm"
              >
                Voltar
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="flex-[2] bg-wedding-gold text-white border-[0.5px] border-wedding-gold/50 py-5 rounded-3xl text-xl font-bold shadow-xl shadow-wedding-gold/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {isSubmitting ? 'Criando...' : 'Gerar meu painel'}
                {!isSubmitting && <Sparkles size={20} />}
              </button>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-wedding-nude flex items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full bg-white p-12 rounded-[3.5rem] shadow-2xl space-y-10 relative overflow-hidden border border-white">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-50">
          <div
            className="h-full bg-wedding-gold transition-all duration-700 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="flex justify-center">
          <div className="w-16 h-16 bg-wedding-gold/10 rounded-3xl flex items-center justify-center text-wedding-gold border-[0.5px] border-wedding-gold/20">
            <Heart size={32} />
          </div>
        </div>

        {renderStep()}

        <div className="text-center">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">PASSO {step} DE 3</p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
