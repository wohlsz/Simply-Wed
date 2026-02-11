
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Send, MessageCircle, Star, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const FeedbackPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const examples = [
        "Amei o checklist!",
        "Gostaria de PDF.",
        "Navegação mobile rápida.",
        "Mais cores no painel.",
        "Controle financeiro top!",
        "Facilidade nos convidados."
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback.trim() || loading) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('feedbacks')
                .insert([
                    {
                        content: feedback,
                        user_id: user?.id || null,
                        user_email: user?.email || 'Anonymous'
                    }
                ]);

            if (error) throw error;

            setIsSubmitted(true);
            setTimeout(() => {
                navigate(-1);
            }, 3000);
        } catch (err) {
            console.error('Erro ao enviar feedback:', err);
            alert('Erro ao enviar feedback. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-wedding-nude flex flex-col items-center justify-center p-4 bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(rgba(250, 249, 246, 0.95), rgba(250, 249, 246, 0.95)), url("https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000")' }}>
            <div className="w-full max-w-xl bg-white rounded-[2rem] p-6 shadow-2xl border border-white animate-scaleIn">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-slate-400 hover:text-wedding-gold transition-colors mb-4 group text-sm"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Voltar
                </button>

                <div className="text-center space-y-2 mb-6">
                    <div className="w-12 h-12 bg-wedding-gold/10 rounded-full flex items-center justify-center mx-auto">
                        <MessageCircle className="text-wedding-gold" size={24} />
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-slate-800">Seu feedback é precioso</h1>
                    <p className="text-slate-500 text-sm">
                        Ajude-nos a construir o futuro do planejamento de casamentos.
                    </p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sua mensagem</label>
                            <textarea
                                className="w-full h-28 px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-wedding-gold transition-all resize-none text-slate-700 text-sm leading-relaxed placeholder:text-slate-300"
                                placeholder="Conte para nós sua experiência..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                                <Star size={12} className="text-wedding-gold fill-wedding-gold" />
                                Inspirações:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {examples.map((ex, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setFeedback(prev => prev + (prev ? ' ' : '') + ex)}
                                        className="text-[10px] px-3 py-1.5 rounded-full bg-slate-50 text-slate-500 border border-slate-100 hover:border-wedding-gold hover:text-wedding-gold hover:bg-white transition-all"
                                    >
                                        {ex}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-wedding-gold text-white py-3.5 rounded-xl font-bold shadow-lg shadow-wedding-gold/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                <>
                                    Enviar Feedback
                                    <Send size={18} />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-6 space-y-4 animate-fadeIn">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-500">
                            <Heart size={32} fill="currentColor" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-serif font-bold text-slate-800">Obrigado!</h2>
                            <p className="text-slate-500 text-sm">Seu feedback foi recebido. Redirecionando...</p>
                        </div>
                    </div>
                )}
            </div>

            <p className="mt-8 text-slate-400 text-sm flex items-center gap-2">
                Simples Wed <Heart size={14} className="text-wedding-gold fill-wedding-gold" /> Criando memórias incríveis
            </p>

            <style>{`
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-scaleIn { animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fadeIn { animation: fadeIn 0.8s ease-out; }
            `}</style>
        </div>
    );
};

export default FeedbackPage;
