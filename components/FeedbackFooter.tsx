
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const FeedbackFooter: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show footer on feedback page itself
    if (location.pathname === '/feedback') return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 lg:p-8 bg-gradient-to-t from-wedding-nude/90 via-wedding-nude/40 to-transparent pointer-events-none z-10">
            <div className="max-w-7xl mx-auto flex justify-center lg:justify-end pointer-events-auto">
                <div
                    key={location.pathname}
                    className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl border-2 border-wedding-gold/20 shadow-2xl flex items-center gap-6 animate-footerBounce"
                >
                    <div className="flex flex-col">
                        <span className="text-base font-bold text-slate-800">Sua opinião é fundamental!</span>
                        <span className="text-sm text-slate-500">Ajude-nos a melhorar o Simples Wed</span>
                    </div>
                    <button
                        onClick={() => navigate('/feedback')}
                        className="bg-wedding-gold text-white px-6 py-3 rounded-xl text-base font-bold shadow-lg shadow-wedding-gold/20 hover:scale-110 active:scale-95 transition-all flex items-center gap-2 animate-attentionShake"
                    >
                        <MessageCircle size={20} />
                        Dar feedback
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes footerBounce {
                    0% { transform: translateY(20px); opacity: 0; }
                    50% { transform: translateY(-5px); }
                    100% { transform: translateY(0); opacity: 1; }
                }
                @keyframes attentionShake {
                    0%, 100% { transform: rotate(0deg); }
                    20% { transform: rotate(-3deg); }
                    40% { transform: rotate(3deg); }
                    60% { transform: rotate(-3deg); }
                    80% { transform: rotate(3deg); }
                }
                .animate-footerBounce { animation: footerBounce 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-attentionShake { animation: attentionShake 0.5s ease-in-out 0.8s; }
            `}</style>
        </div>
    );
};

export default FeedbackFooter;
