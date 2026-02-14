import React, { useState } from 'react';
import { useWedding } from '../context/WeddingContext';
import { Gift } from '../types';
import { Gift as GiftIcon, Plus, Trash2, Search, Image as ImageIcon, Download, ExternalLink, RefreshCw, Smartphone, ShoppingBag, MessageCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import clsx from 'clsx';

const GiftList: React.FC = () => {
    const { weddingData, addGift, removeGift, updateWedding } = useWedding();
    const gifts = weddingData.gifts || [];

    const [isAdding, setIsAdding] = useState(false);
    const [newGift, setNewGift] = useState<Partial<Gift>>({
        name: '',
        price: 0,
        description: '',
        imageUrl: '',
        status: 'available'
    });
    const [loadingImage, setLoadingImage] = useState(false);
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [tempPhone, setTempPhone] = useState('');

    // Verificar se precisa configurar telefone
    React.useEffect(() => {
        if (!weddingData.giftPhone && gifts.length > 0) {
            // Se já tem presentes mas não tem telefone, sugere configurar
            setShowPhoneModal(true);
        }
    }, [weddingData.giftPhone, gifts.length]);

    // Máscara de Telefone
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);

        if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }
        if (value.length > 9) {
            value = `${value.slice(0, 9)}-${value.slice(9)}`;
        }

        setTempPhone(value);
    };

    const handleSavePhone = async (e: React.FormEvent) => {
        e.preventDefault();
        if (tempPhone) {
            await updateWedding({ giftPhone: tempPhone });
            setShowPhoneModal(false);
        }
    };

    // Função para upload de imagem
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 500 * 1024) { // 500KB limit
                alert('A imagem deve ter no máximo 500KB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setNewGift(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddGift = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGift.name || !newGift.price) return;

        // Se não tiver imagem, usa placeholder padrão
        let finalImageUrl = newGift.imageUrl;

        const gift: Gift = {
            id: Math.random().toString(36).substr(2, 9),
            name: newGift.name,
            description: newGift.description || '',
            price: Number(newGift.price),
            imageUrl: finalImageUrl,
            status: 'available'
        };

        await addGift(gift);
        setNewGift({ name: '', price: 0, description: '', imageUrl: '', status: 'available' });
        setIsAdding(false);
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const cardHeight = 28; // Mais fino (era 35)
        const cardGap = 4;
        let yPos = 50; // Começar após o cabeçalho

        // Título Centralizado
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(197, 160, 89); // Gold
        doc.text('Lista de Presentes', pageWidth / 2, 20, { align: 'center' });

        // Subtítulo (Nome do Casal)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text(weddingData.coupleName || 'Casal', pageWidth / 2, 30, { align: 'center' });

        // Aviso Interativo
        doc.setFontSize(10);
        doc.setTextColor(59, 130, 246); // Blue
        doc.text('PDF Interativo, clique nos botões para interagir', pageWidth / 2, 38, { align: 'center' });

        // Reset Styles for Body
        doc.setDrawColor(226, 232, 240); // Slate 200
        doc.setLineWidth(0.5);

        gifts.forEach((gift, index) => {
            // Verificar Quebra de Página
            if (yPos + cardHeight > pageHeight - margin) {
                doc.addPage();
                yPos = margin;
            }

            // Marca D'água (Em todas as páginas se necessário, ou só na primeira? O user disse "meio do pdf")
            // Vou colocar em cada página para garantir, ou só na primeira se preferir. 
            // "Meio do pdf" pode ser meio da página. Vou colocar a cada página nova.
            // Mas para não ficar repetindo código, melhor fazer uma função ou simplificar.
            // Como é um loop, se adicionar page, tem que redesenhar marca d'agua?
            // Sim.
            // Mas vou simplificar e desenhar no inicio de cada pagina.
            // Porem o addPage() cria uma pagina em branco.
            // Vou criar uma função helper interna ou apenas repetir o codigo da watermark no `if addPage`.

            // Desenhar Watermark na pagina atual se for a primeira ou nova
            if (index === 0 || yPos === margin) {
                const ctx = doc as any;
                ctx.saveGraphicsState();
                ctx.setGState(new ctx.GState({ opacity: 0.1 }));
                doc.setFontSize(60);
                doc.setTextColor(150, 150, 150);
                doc.setFont('helvetica', 'bold');
                // Rotacionar texto no centro
                doc.text('Simply Wed', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
                ctx.restoreGraphicsState();
            }


            const x = margin;
            const width = pageWidth - (margin * 2);

            // Card Background & Border (Rounded)
            doc.setFillColor(255, 255, 255);
            doc.setDrawColor(226, 232, 240); // Slate 200 Border
            doc.roundedRect(x, yPos, width, cardHeight, 3, 3, 'FD');

            // Icon Placeholder / Image (Left)
            const iconSize = 20; // 20x20mm
            const iconX = x + 5;
            const iconY = yPos + (cardHeight - iconSize) / 2;

            if (gift.imageUrl) {
                // Desenhar Imagem Circular
                try {
                    // Bypass TS check for internal API methods
                    const ctx = doc as any;

                    ctx.saveGraphicsState();
                    ctx.beginPath();
                    ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, 2 * Math.PI, false);
                    ctx.clip();

                    // Add Image centered in the clip area
                    doc.addImage(gift.imageUrl, 'JPEG', iconX, iconY, iconSize, iconSize);

                    ctx.restoreGraphicsState();

                    // Optional: Draw a subtle border around the image
                    doc.setDrawColor(226, 232, 240);
                    doc.setLineWidth(0.2);
                    // doc.circle is available in typings
                    doc.circle(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 'S');
                } catch (e) {
                    console.error("Erro ao adicionar imagem circular no PDF", e);
                    // Fallback to square if error
                    doc.addImage(gift.imageUrl, 'JPEG', iconX, iconY, iconSize, iconSize);
                }
            } else {
                // Desenhar Ícone Vetorial "Outline" (Estilo Lucide Gift)
                doc.setDrawColor(197, 160, 89); // Gold Border
                doc.setLineWidth(0.8);
                doc.setFillColor(255, 255, 255); // White fill

                const boxW = iconSize * 0.8;
                const boxH = iconSize * 0.7;
                const centerX = iconX + iconSize / 2;
                const centerY = iconY + iconSize / 2;

                // Parte de baixo (Caixa)
                doc.roundedRect(centerX - boxW / 2, centerY - boxH / 2 + 2, boxW, boxH, 1, 1, 'FD');

                // Tampa
                const lidW = iconSize;
                const lidH = iconSize * 0.25;
                doc.roundedRect(centerX - lidW / 2, centerY - boxH / 2 + 2, lidW, lidH, 1, 1, 'FD');

                // Fita
                doc.line(centerX, centerY - boxH / 2 + 2, centerX, centerY + boxH / 2 + 2);
                doc.line(centerX, centerY - boxH / 2 + 2, centerX - 3, centerY - boxH / 2 - 1);
                doc.line(centerX, centerY - boxH / 2 + 2, centerX + 3, centerY - boxH / 2 - 1);
                doc.line(centerX - 3, centerY - boxH / 2 - 1, centerX, centerY - boxH / 2 + 1);
                doc.line(centerX + 3, centerY - boxH / 2 - 1, centerX, centerY - boxH / 2 + 1);
            }

            // Text Content
            // Revertendo centralização e formatação (asteriscos visíveis)

            doc.setTextColor(30, 41, 59); // Slate 800
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(gift.name, iconX + iconSize + 5, yPos + 8);

            doc.setTextColor(100, 116, 139); // Slate 500
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            const desc = gift.description || 'Sem descrição';
            // Truncate description if too long
            const truncatedDesc = desc.length > 70 ? desc.substring(0, 67) + '...' : desc;
            doc.text(truncatedDesc, iconX + iconSize + 5, yPos + 13);

            doc.setTextColor(197, 160, 89); // Gold
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text(`R$ ${gift.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, iconX + iconSize + 5, yPos + 21);

            // Buttons (Right Side)
            // ... (Buttons code remains the same, assuming 'buttonsX' is valid)
            const buttonWidth = 25;
            const buttonHeight = 7;
            const buttonGap = 3;
            const buttonsXLocal = x + width - buttonWidth - 5; // Re-declaring for clarity if needed, or reusing buttonsX from scope if it didn't change logic
            const buyButtonY = yPos + 5;
            const giftButtonY = buyButtonY + buttonHeight + buttonGap;

            // Link Comprar (Azul)
            const googleUrl = `https://www.google.com/search?q=comprar+${encodeURIComponent(gift.name)}`;
            doc.setFillColor(59, 130, 246); // Blue
            doc.roundedRect(buttonsXLocal, buyButtonY, buttonWidth, buttonHeight, 2, 2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            doc.text('Comprar', buttonsXLocal + buttonWidth / 2, buyButtonY + 4.5, { align: 'center' });
            doc.link(buttonsXLocal, buyButtonY, buttonWidth, buttonHeight, { url: googleUrl });

            // Link Presentear (Verde) - Se tiver telefone
            if (weddingData.giftPhone) {
                let phone = weddingData.giftPhone.replace(/\D/g, '');
                if (phone.length >= 10 && phone.length <= 11) {
                    phone = '55' + phone;
                }

                const waMessage = `Olá! Gostaria de lhe presentear com ${gift.name} do valor de R$ ${gift.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(waMessage)}`;

                doc.setFillColor(34, 197, 94); // Green
                doc.roundedRect(buttonsXLocal, giftButtonY, buttonWidth, buttonHeight, 2, 2, 'F');
                doc.setTextColor(255, 255, 255);
                doc.text('Presentear', buttonsXLocal + buttonWidth / 2, giftButtonY + 4.5, { align: 'center' });
                doc.link(buttonsXLocal, giftButtonY, buttonWidth, buttonHeight, { url: waUrl });
            }

            yPos += cardHeight + cardGap;
        });

        // Rodapé em todas as páginas
        const pageCount = doc.getNumberOfPages();
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(150);
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text('Simples Wed', pageWidth - margin, pageHeight - 10, { align: 'right' });
        }

        // Nome do Arquivo com Nome do Casal
        const filename = `lista-de-presentes-${weddingData.coupleName || 'casamento'}.pdf`.toLowerCase().replace(/ /g, '-');
        doc.save(filename);
    };

    const totalValue = gifts.reduce((acc, curr) => acc + curr.price, 0);

    return (
        <div className="space-y-8 pb-20 max-w-6xl mx-auto">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-slate-800">Lista de Presentes</h1>
                    <p className="text-slate-500 mt-1">Organize sua lista de desejos e compartilhe com os convidados.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={generatePDF}
                        className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-bold flex items-center gap-2"
                        title="Baixar lista em PDF"
                    >
                        <Download size={20} /> PDF
                    </button>

                    {/* Botão Configurar/Alterar WhatsApp */}
                    <button
                        onClick={() => setShowPhoneModal(true)}
                        className={clsx(
                            "px-6 py-3 rounded-2xl border transition-all font-bold flex items-center gap-2",
                            weddingData.giftPhone
                                ? "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                : "border-red-200 text-red-600 bg-red-50 hover:bg-red-100 animate-pulse"
                        )}
                        title={weddingData.giftPhone ? "Alterar WhatsApp" : "Configurar WhatsApp"}
                    >
                        <Smartphone size={20} />
                        {weddingData.giftPhone ? 'WhatsApp' : 'Configurar'}
                    </button>

                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className={clsx(
                            "px-6 py-3 rounded-2xl shadow-lg transition-all font-bold flex items-center gap-2 border-[0.5px] border-wedding-gold/20 hover:scale-[1.02] active:scale-[0.98]",
                            isAdding ? 'bg-slate-800 text-white' : 'bg-wedding-gold text-white'
                        )}
                    >
                        {isAdding ? <Trash2 size={20} /> : <Plus size={20} />}
                        {isAdding ? 'Cancelar' : 'Novo Presente'}
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                        <GiftIcon size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total de Itens</p>
                        <p className="text-2xl font-bold text-slate-800">{gifts.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                        <span className="font-serif font-bold text-xl">R$</span>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor Total</p>
                        <p className="text-2xl font-bold text-slate-800">R$ {totalValue.toLocaleString('pt-BR')}</p>
                    </div>
                </div>
            </div>

            {/* Add Form */}
            {isAdding && (
                <form onSubmit={handleAddGift} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-wedding-gold/10 animate-fadeIn ring-4 ring-wedding-nude">
                    <h3 className="text-2xl font-serif font-bold text-slate-800 mb-6 flex items-center gap-2">
                        Adicionar Novo Presente
                        <GiftIcon className="text-wedding-gold" size={24} />
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Nome do Presente</label>
                                <input
                                    required
                                    autoFocus
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-wedding-gold focus:bg-white"
                                    placeholder="Ex: Cafeteira Expresso"
                                    value={newGift.name}
                                    onChange={(e) => setNewGift({ ...newGift, name: e.target.value })}
                                    onBlur={() => { }} // Removido fetch automático
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Preço Estimado (R$)</label>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-wedding-gold focus:bg-white"
                                    placeholder="0,00"
                                    value={newGift.price || ''}
                                    onChange={(e) => setNewGift({ ...newGift, price: Number(e.target.value) })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Descrição / Modelo</label>
                                <input
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-wedding-gold focus:bg-white"
                                    placeholder="Ex: Marca X, voltagem 110v..."
                                    value={newGift.description}
                                    onChange={(e) => setNewGift({ ...newGift, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Foto do Item (Opcional)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="w-full text-sm text-slate-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-xs file:font-semibold
                                        file:bg-wedding-gold/10 file:text-wedding-gold
                                        hover:file:bg-wedding-gold/20
                                        cursor-pointer"
                                    />
                                    {newGift.imageUrl && (
                                        <button
                                            type="button"
                                            onClick={() => setNewGift({ ...newGift, imageUrl: '' })}
                                            className="text-red-400 hover:text-red-500"
                                            title="Remover imagem"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="w-full h-48 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center overflow-hidden relative group">
                                {newGift.imageUrl || loadingImage ? (
                                    loadingImage ? (
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <RefreshCw className="animate-spin" size={24} />
                                            <span className="text-xs font-bold">Buscando imagem...</span>
                                        </div>
                                    ) : (
                                        <img
                                            src={newGift.imageUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={() => setNewGift({ ...newGift, imageUrl: '' })} // Clear on error
                                        />
                                    )
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-300">
                                        <ImageIcon size={32} />
                                        <span className="text-xs font-bold uppercase">Sem imagem</span>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-wedding-gold text-white py-4 rounded-2xl font-bold shadow-lg shadow-wedding-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={20} /> Adicionar à Lista
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Lista de Presentes (Layout Lista Horizontal Simplificada) */}
            <div className="space-y-3">
                {gifts.length > 0 ? gifts.map(gift => (
                    <div key={gift.id} className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all flex items-center p-3 gap-5">

                        {/* Imagem/Ícone à Esquerda (Menor) */}
                        <div className="w-16 h-16 flex-shrink-0 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center relative group-hover:scale-105 transition-transform">
                            {gift.imageUrl ? (
                                <img src={gift.imageUrl} alt={gift.name} className="w-full h-full object-cover" />
                            ) : (
                                <GiftIcon size={24} className="text-slate-300" />
                            )}
                        </div>

                        {/* Conteúdo Central */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-slate-800 truncate">{gift.name}</h3>
                                {gift.status === 'received' && (
                                    <span className="bg-green-100 text-green-600 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">Recebido</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span className="font-bold text-wedding-gold">R$ {gift.price.toLocaleString('pt-BR')}</span>
                                {gift.description && (
                                    <>
                                        <span className="text-slate-300">•</span>
                                        <span className="truncate max-w-[200px] sm:max-w-md">{gift.description}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Ações à Direita (Apenas Remover) */}
                        <div className="flex items-center">
                            <button
                                onClick={() => removeGift(gift.id)}
                                className="text-slate-300 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="Remover presente"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                )) : (
                    !isAdding && (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                                <GiftIcon size={32} className="text-slate-300" />
                            </div>
                            <p className="text-slate-400 italic">Sua lista de presentes está vazia.</p>
                            <button
                                onClick={() => setIsAdding(true)}
                                className="text-wedding-gold font-bold hover:underline"
                            >
                                Começar a adicionar
                            </button>
                        </div>
                    )
                )}
            </div>

            {/* Phone Config Modal */}
            {showPhoneModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPhoneModal(false)} />
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md relative z-10 animate-scaleUp shadow-2xl">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Smartphone size={32} />
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-center text-slate-800 mb-2">Configurar WhatsApp</h3>
                        <p className="text-center text-slate-500 mb-6">
                            Adicione o número que receberá as mensagens dos convidados interessados em presentear.
                        </p>

                        <form onSubmit={handleSavePhone} className="space-y-4">
                            <input
                                autoFocus
                                type="tel"
                                required
                                placeholder="Ex: (11) 99999-9999"
                                className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-green-500"
                                value={tempPhone}
                                onChange={handlePhoneChange}
                            />
                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                            >
                                Salvar Número
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleUp { animation: scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
        </div>
    );
};

export default GiftList;
