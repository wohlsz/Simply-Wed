import React, { useState, useEffect } from 'react';
import { X, Copy, MessageCircle, RefreshCw, Check } from 'lucide-react';
import { Guest } from '../types';
import { clsx } from 'clsx';
import { MESSAGE_TEMPLATES } from '../constants';

interface GuestMessageModalProps {
    guest: Guest;
    weddingName: string; // "Ana & João"
    onClose: () => void;
}

const GuestMessageModal: React.FC<GuestMessageModalProps> = ({ guest, weddingName, onClose }) => {
    const [selectedTemplate, setSelectedTemplate] = useState(MESSAGE_TEMPLATES[0]);
    const [message, setMessage] = useState('');
    const [copied, setCopied] = useState(false);

    // Generate message when template or guest changes
    useEffect(() => {
        const generatedMessage = selectedTemplate.content
            .replace('[Nome]', guest.name)
            .replace('[Casal]', weddingName);
        setMessage(generatedMessage);
    }, [selectedTemplate, guest, weddingName]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleWhatsApp = () => {
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="bg-white rounded-[2rem] w-full max-w-2xl relative z-10 shadow-2xl border border-white flex flex-col max-h-[90vh] animate-scaleUp overflow-hidden">

                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-slate-800 flex items-center gap-2">
                            <MessageCircle className="text-wedding-gold" size={24} />
                            Enviar Convite
                        </h3>
                        <p className="text-slate-500 mt-1">
                            Personalize a mensagem para <span className="font-bold text-slate-800">{guest.name}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 overflow-y-auto space-y-6">

                    {/* Templates Section */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                            Escolha um Modelo
                        </label>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            {MESSAGE_TEMPLATES.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => setSelectedTemplate(template)}
                                    className={clsx(
                                        "px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-[0.5px]",
                                        selectedTemplate.id === template.id
                                            ? "bg-wedding-gold text-white border-wedding-gold shadow-md"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-wedding-gold/50"
                                    )}
                                >
                                    {template.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Message Editor */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">
                                Mensagem (Editável)
                            </label>
                            <button
                                onClick={() => {
                                    const refreshed = selectedTemplate.content
                                        .replace('[Nome]', guest.name)
                                        .replace('[Casal]', weddingName);
                                    setMessage(refreshed);
                                }}
                                className="text-xs font-bold text-wedding-gold hover:text-wedding-gold/80 flex items-center gap-1"
                            >
                                <RefreshCw size={12} />
                                Restaurar Original
                            </button>
                        </div>

                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full h-48 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-wedding-gold focus:border-transparent outline-none resize-none text-slate-700 leading-relaxed custom-scrollbar"
                            placeholder="Digite sua mensagem aqui..."
                        />
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleCopy}
                        className={clsx(
                            "flex-1 py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-[0.5px]",
                            copied
                                ? "bg-green-50 text-green-600 border-green-200"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        )}
                    >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                        {copied ? "Copiado!" : "Copiar Texto"}
                    </button>

                    <button
                        onClick={handleWhatsApp}
                        className="flex-1 py-3 px-6 rounded-xl font-bold bg-[#25D366] text-white shadow-lg shadow-green-200 hover:bg-[#128C7E] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <MessageCircle size={20} />
                        Abrir no WhatsApp
                    </button>
                </div>

            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
          border: 3px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>
        </div>
    );
};

export default GuestMessageModal;
