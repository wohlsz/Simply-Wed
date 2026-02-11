
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MessageCircle, ArrowLeft, Trash2, Calendar, User, Loader2 } from 'lucide-react';

interface Feedback {
    id: string;
    created_at: string;
    content: string;
    user_email: string;
}

const FeedbackAdmin: React.FC = () => {
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const { data, error } = await supabase
                .from('feedbacks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setFeedbacks(data || []);
        } catch (err) {
            console.error('Erro ao buscar feedbacks:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este feedback?')) return;

        try {
            const { error } = await supabase
                .from('feedbacks')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setFeedbacks(prev => prev.filter(f => f.id !== id));
        } catch (err) {
            console.error('Erro ao excluir feedback:', err);
        }
    };

    return (
        <div className="min-h-screen bg-wedding-nude p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-wedding-gold transition-colors font-medium"
                    >
                        <ArrowLeft size={20} />
                        Voltar
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-wedding-gold/10 rounded-xl flex items-center justify-center text-wedding-gold">
                            <MessageCircle size={24} />
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-slate-800">Mensagens de Feedback</h1>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="text-wedding-gold animate-spin" size={40} />
                        <p className="text-slate-500 font-medium">Carregando feedbacks...</p>
                    </div>
                ) : feedbacks.length > 0 ? (
                    <div className="grid gap-6">
                        {feedbacks.map((f) => (
                            <div key={f.id} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-white hover:shadow-md transition-shadow group relative">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-50">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <Calendar size={16} />
                                            {new Date(f.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex items-center gap-2 text-wedding-gold text-sm font-bold">
                                            <User size={16} />
                                            {f.user_email}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(f.id)}
                                        className="text-slate-300 hover:text-red-500 transition-colors md:opacity-0 group-hover:opacity-100 p-2"
                                        title="Excluir feedback"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <p className="text-slate-700 leading-relaxed font-medium">"{f.content}"</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-20 rounded-[2.5rem] text-center border border-white shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <MessageCircle size={40} />
                        </div>
                        <h2 className="text-xl font-serif font-bold text-slate-800 mb-2">Nenhum feedback ainda</h2>
                        <p className="text-slate-500">As sugestões dos seus usuários aparecerão aqui.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackAdmin;
