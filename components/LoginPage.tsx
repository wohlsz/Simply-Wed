
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) {
                setError(error.message);
            } else {
                alert('Verifique seu email para confirmar o cadastro!');
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                setError(error.message);
            } else {
                navigate('/');
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-wedding-nude flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-md border border-white">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-wedding-gold/10 rounded-2xl flex items-center justify-center text-wedding-gold mb-4">
                        <Heart size={32} fill="currentColor" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-slate-800">Simply Wed</h1>
                    <p className="text-slate-400">Planeje seu casamento dos sonhos</p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-5 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-wedding-gold transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                        <input
                            type="password"
                            required
                            className="w-full px-5 py-3 rounded-xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-wedding-gold transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-wedding-gold text-white py-4 rounded-xl font-bold shadow-lg shadow-wedding-gold/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Criar Conta' : 'Entrar')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-slate-400 hover:text-wedding-gold text-sm font-medium transition-colors"
                    >
                        {isSignUp ? 'Já tem uma conta? Entre aqui.' : 'Não tem conta? Crie uma agora.'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
