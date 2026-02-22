
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useWedding } from '../context/WeddingContext';
import { SeatingTable } from '../types';
import { Users, Plus, Minus, Download, GripVertical, X, Edit2, Check, Armchair, UserCheck, Search } from 'lucide-react';
import clsx from 'clsx';
import jsPDF from 'jspdf';

const SeatingChart: React.FC = () => {
    const { weddingData, updateSeatingTables } = useWedding();
    const { guests, seatingTables, coupleName } = weddingData;

    const [tableCount, setTableCount] = useState(seatingTables.length || 0);
    const [tables, setTables] = useState<SeatingTable[]>(seatingTables);
    const [editingTableId, setEditingTableId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [draggedGuestId, setDraggedGuestId] = useState<string | null>(null);
    const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Sync tables when seatingTables changes from context (e.g. after refresh)
    const prevTablesRef = useRef(seatingTables);
    if (prevTablesRef.current !== seatingTables && !hasUnsavedChanges) {
        prevTablesRef.current = seatingTables;
        setTables(seatingTables);
        setTableCount(seatingTables.length);
    }

    // All guest IDs that are currently assigned to a table
    const assignedGuestIds = useMemo(() => {
        const ids = new Set<string>();
        tables.forEach(t => t.guestIds.forEach(id => ids.add(id)));
        return ids;
    }, [tables]);

    // Unassigned guests
    const unassignedGuests = useMemo(() => {
        return guests.filter(g => !assignedGuestIds.has(g.id));
    }, [guests, assignedGuestIds]);

    // Filtered unassigned guests
    const filteredUnassigned = useMemo(() => {
        if (!searchTerm.trim()) return unassignedGuests;
        return unassignedGuests.filter(g =>
            g.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [unassignedGuests, searchTerm]);

    // --- Table Management ---
    const handleSetTableCount = (count: number) => {
        if (count < 0) return;
        const newCount = Math.max(0, count);
        setTableCount(newCount);

        if (newCount > tables.length) {
            // Add new tables
            const newTables = [...tables];
            for (let i = tables.length; i < newCount; i++) {
                newTables.push({
                    id: `temp-${Date.now()}-${i}`,
                    name: `Mesa ${i + 1}`,
                    guestIds: []
                });
            }
            setTables(newTables);
        } else if (newCount < tables.length) {
            // Remove tables from the end, unassigning their guests
            setTables(prev => prev.slice(0, newCount));
        }
        setHasUnsavedChanges(true);
    };

    const handleRenameTable = (tableId: string) => {
        if (!editingName.trim()) return;
        setTables(prev =>
            prev.map(t => t.id === tableId ? { ...t, name: editingName.trim() } : t)
        );
        setEditingTableId(null);
        setEditingName('');
        setHasUnsavedChanges(true);
    };

    const removeTable = (tableId: string) => {
        setTables(prev => prev.filter(t => t.id !== tableId));
        setTableCount(prev => prev - 1);
        setHasUnsavedChanges(true);
    };

    // --- Drag & Drop ---
    const handleDragStart = (e: React.DragEvent, guestId: string) => {
        setDraggedGuestId(guestId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', guestId);
        // Add a slight delay for visual feedback
        requestAnimationFrame(() => {
            const el = document.getElementById(`guest-card-${guestId}`);
            if (el) el.style.opacity = '0.4';
        });
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedGuestId(null);
        setDragOverTarget(null);
        const el = document.getElementById(`guest-card-${draggedGuestId}`);
        if (el) el.style.opacity = '1';
        // Restore all opacities
        document.querySelectorAll('[data-guest-card]').forEach(el => {
            (el as HTMLElement).style.opacity = '1';
        });
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverTarget(targetId);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Only clear if we're actually leaving the container
        const relatedTarget = e.relatedTarget as HTMLElement;
        if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
            setDragOverTarget(null);
        }
    };

    const handleDropOnTable = (e: React.DragEvent, targetTableId: string) => {
        e.preventDefault();
        const guestId = e.dataTransfer.getData('text/plain');
        if (!guestId) return;

        setTables(prev => {
            // Remove guest from any current table
            const updated = prev.map(t => ({
                ...t,
                guestIds: t.guestIds.filter(id => id !== guestId)
            }));
            // Add guest to target table
            return updated.map(t =>
                t.id === targetTableId
                    ? { ...t, guestIds: [...t.guestIds, guestId] }
                    : t
            );
        });

        setDragOverTarget(null);
        setDraggedGuestId(null);
        setHasUnsavedChanges(true);
    };

    const handleDropOnUnassigned = (e: React.DragEvent) => {
        e.preventDefault();
        const guestId = e.dataTransfer.getData('text/plain');
        if (!guestId) return;

        // Remove guest from any table
        setTables(prev =>
            prev.map(t => ({
                ...t,
                guestIds: t.guestIds.filter(id => id !== guestId)
            }))
        );

        setDragOverTarget(null);
        setDraggedGuestId(null);
        setHasUnsavedChanges(true);
    };

    // Remove guest from a table (click-based alternative)
    const removeGuestFromTable = (tableId: string, guestId: string) => {
        setTables(prev =>
            prev.map(t =>
                t.id === tableId
                    ? { ...t, guestIds: t.guestIds.filter(id => id !== guestId) }
                    : t
            )
        );
        setHasUnsavedChanges(true);
    };

    // --- Save ---
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSeatingTables(tables);
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Error saving seating chart:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // --- PDF Generation ---
    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let yPos = 50;

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(197, 160, 89);
        doc.text('Mesa de Convidados', pageWidth / 2, 20, { align: 'center' });

        // Subtitle
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`${coupleName || 'Casal'} • ${tables.length} mesas`, pageWidth / 2, 28, { align: 'center' });

        // Total
        const totalAssigned = tables.reduce((acc, t) => acc + t.guestIds.length, 0);
        doc.setFontSize(10);
        doc.text(`Convidados alocados: ${totalAssigned} de ${guests.length}`, pageWidth / 2, 35, { align: 'center' });

        // Divider
        doc.setDrawColor(197, 160, 89);
        doc.setLineWidth(0.5);
        doc.line(margin, 42, pageWidth - margin, 42);

        yPos = 50;

        tables.forEach((table, tableIndex) => {
            // Check if we need a new page
            const estimatedHeight = 20 + (table.guestIds.length * 10);
            if (yPos + estimatedHeight > pageHeight - 30) {
                doc.addPage();
                yPos = margin + 10;
            }

            // Table name header
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(197, 160, 89);
            const tableTitle = `${table.name} (${table.guestIds.length} convidados)`;
            doc.text(tableTitle, margin, yPos);

            yPos += 4;
            doc.setDrawColor(230, 220, 200);
            doc.setLineWidth(0.3);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 8;

            // Guest list for this table
            if (table.guestIds.length === 0) {
                doc.setFont('helvetica', 'italic');
                doc.setFontSize(9);
                doc.setTextColor(180);
                doc.text('Nenhum convidado alocado', margin + 5, yPos);
                yPos += 10;
            } else {
                table.guestIds.forEach((guestId, gIdx) => {
                    if (yPos > pageHeight - 30) {
                        doc.addPage();
                        yPos = margin + 10;
                    }

                    const guest = guests.find(g => g.id === guestId);
                    if (guest) {
                        // Zebra striping
                        if (gIdx % 2 === 0) {
                            doc.setFillColor(252, 251, 247);
                            doc.rect(margin, yPos - 5, pageWidth - margin * 2, 9, 'F');
                        }

                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(10);
                        doc.setTextColor(60);
                        doc.text(`${gIdx + 1}. ${guest.name}`, margin + 5, yPos);

                        // Type badge
                        doc.setFontSize(8);
                        doc.setTextColor(150);
                        doc.text(
                            guest.type === 'bride' ? 'Noiva' : 'Noivo',
                            pageWidth - margin - 10,
                            yPos,
                            { align: 'right' }
                        );
                    }
                    yPos += 10;
                });
            }

            yPos += 8; // Space between tables
        });

        // Footer on all pages
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            // Watermark
            const ctx = doc as any;
            ctx.saveGraphicsState();
            ctx.setGState(new ctx.GState({ opacity: 0.05 }));
            doc.setFontSize(60);
            doc.setTextColor(150);
            doc.text('Simples Wed', pageWidth / 2, pageHeight / 2, { align: 'center', angle: 45 });
            ctx.restoreGraphicsState();

            // Footer
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(`Simples Wed • Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        }

        doc.save(`Mesa_Convidados_${coupleName || 'Casal'}.pdf`);
    };

    // --- Helper: get guest by id ---
    const getGuest = useCallback((id: string) => guests.find(g => g.id === id), [guests]);

    return (
        <div className="space-y-8 pb-20 max-w-6xl mx-auto">
            {/* Header */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-slate-800">Mesa de Convidados</h1>
                    <p className="text-slate-500 mt-1">Organize seus convidados nas mesas arrastando e soltando.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={generatePDF}
                        disabled={tables.length === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Exportar para PDF"
                    >
                        <Download size={20} />
                        <span className="hidden sm:inline">PDF</span>
                    </button>
                    {hasUnsavedChanges && (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-8 py-3 bg-wedding-gold text-white rounded-2xl font-bold shadow-lg shadow-wedding-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all border-[0.5px] border-wedding-gold/20 animate-fadeIn"
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Check size={20} />
                                    Salvar
                                </>
                            )}
                        </button>
                    )}
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border-[0.5px] border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-wedding-gold/10 rounded-xl flex items-center justify-center">
                            <Armchair size={20} className="text-wedding-gold" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{tables.length}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mesas</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border-[0.5px] border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                            <UserCheck size={20} className="text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{assignedGuestIds.size}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alocados</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border-[0.5px] border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                            <Users size={20} className="text-amber-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{unassignedGuests.length}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sem Mesa</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border-[0.5px] border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                            <Users size={20} className="text-purple-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-800">{guests.length}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Count Control */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border-[0.5px] border-slate-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Quantidade de Mesas</h3>
                        <p className="text-sm text-slate-400">Defina quantas mesas terão no evento</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleSetTableCount(tableCount - 1)}
                            disabled={tableCount <= 0}
                            className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Minus size={20} />
                        </button>
                        <div className="w-20 text-center">
                            <span className="text-3xl font-bold text-slate-800 font-serif">{tableCount}</span>
                        </div>
                        <button
                            onClick={() => handleSetTableCount(tableCount + 1)}
                            className="w-12 h-12 rounded-2xl bg-wedding-gold text-white hover:bg-wedding-gold/90 flex items-center justify-center transition-all shadow-md shadow-wedding-gold/20"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Layout: Unassigned + Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Unassigned Guests Panel */}
                <div
                    className={clsx(
                        "lg:col-span-1 bg-white rounded-[2rem] shadow-sm border-[0.5px] overflow-hidden transition-all h-fit lg:sticky lg:top-4",
                        dragOverTarget === 'unassigned'
                            ? 'border-wedding-gold/50 ring-4 ring-wedding-gold/10 shadow-lg'
                            : 'border-slate-100'
                    )}
                    onDragOver={(e) => handleDragOver(e, 'unassigned')}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDropOnUnassigned}
                >
                    <div className="p-5 border-b border-slate-50 bg-gradient-to-r from-slate-50 to-white">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <Users size={18} className="text-wedding-gold" />
                                Não Alocados
                            </h3>
                            <span className="text-xs font-bold text-wedding-gold bg-wedding-gold/10 px-3 py-1 rounded-full">
                                {unassignedGuests.length}
                            </span>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar convidado..."
                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-wedding-gold/30 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="p-3 max-h-[60vh] overflow-y-auto space-y-1.5">
                        {filteredUnassigned.length > 0 ? filteredUnassigned.map(guest => (
                            <div
                                key={guest.id}
                                id={`guest-card-${guest.id}`}
                                data-guest-card
                                draggable
                                onDragStart={(e) => handleDragStart(e, guest.id)}
                                onDragEnd={handleDragEnd}
                                className={clsx(
                                    "flex items-center gap-3 p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all group",
                                    "bg-white hover:bg-slate-50 border border-transparent hover:border-slate-100",
                                    "hover:shadow-sm"
                                )}
                            >
                                <div className="text-slate-200 group-hover:text-slate-400 transition-colors">
                                    <GripVertical size={16} />
                                </div>
                                <div className={clsx(
                                    "w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0",
                                    guest.type === 'bride' ? 'bg-pink-50 text-pink-500' : 'bg-blue-50 text-blue-500'
                                )}>
                                    {guest.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-700 truncate">{guest.name}</p>
                                    <p className={clsx(
                                        "text-[10px] font-bold uppercase tracking-widest",
                                        guest.type === 'bride' ? 'text-pink-400' : 'text-blue-400'
                                    )}>
                                        {guest.type === 'bride' ? 'Noiva' : 'Noivo'}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="py-12 text-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <UserCheck size={24} className="text-slate-200" />
                                </div>
                                <p className="text-sm text-slate-400 italic">
                                    {unassignedGuests.length === 0 ? 'Todos alocados!' : 'Nenhum resultado'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tables Grid */}
                <div className="lg:col-span-2 space-y-4">
                    {tables.length > 0 ? tables.map((table) => (
                        <div
                            key={table.id}
                            className={clsx(
                                "bg-white rounded-[2rem] shadow-sm border-[0.5px] overflow-hidden transition-all",
                                dragOverTarget === table.id
                                    ? 'border-wedding-gold/50 ring-4 ring-wedding-gold/10 shadow-lg scale-[1.01]'
                                    : 'border-slate-100'
                            )}
                            onDragOver={(e) => handleDragOver(e, table.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDropOnTable(e, table.id)}
                        >
                            {/* Table Header */}
                            <div className="p-5 border-b border-slate-50 bg-gradient-to-r from-wedding-gold/5 to-transparent flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-wedding-gold/10 rounded-xl flex items-center justify-center">
                                        <Armchair size={18} className="text-wedding-gold" />
                                    </div>
                                    {editingTableId === table.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                autoFocus
                                                className="px-3 py-1.5 rounded-xl border border-wedding-gold/30 outline-none focus:ring-2 focus:ring-wedding-gold/20 text-sm font-bold"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleRenameTable(table.id)}
                                            />
                                            <button
                                                onClick={() => handleRenameTable(table.id)}
                                                className="p-1.5 rounded-lg bg-wedding-gold text-white hover:bg-wedding-gold/90 transition-all"
                                            >
                                                <Check size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-800 text-lg">{table.name}</h3>
                                            <button
                                                onClick={() => {
                                                    setEditingTableId(table.id);
                                                    setEditingName(table.name);
                                                }}
                                                className="p-1.5 rounded-lg text-slate-300 hover:text-wedding-gold hover:bg-wedding-gold/5 transition-all"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-wedding-gold bg-wedding-gold/10 px-3 py-1 rounded-full">
                                        {table.guestIds.length} {table.guestIds.length === 1 ? 'convidado' : 'convidados'}
                                    </span>
                                    <button
                                        onClick={() => removeTable(table.id)}
                                        className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                        title="Remover mesa"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Table Content - Drop Zone */}
                            <div className={clsx(
                                "p-4 min-h-[80px] transition-all",
                                dragOverTarget === table.id ? 'bg-wedding-gold/5' : '',
                                table.guestIds.length === 0 ? 'flex items-center justify-center' : ''
                            )}>
                                {table.guestIds.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {table.guestIds.map(guestId => {
                                            const guest = getGuest(guestId);
                                            if (!guest) return null;
                                            return (
                                                <div
                                                    key={guestId}
                                                    id={`guest-card-${guestId}`}
                                                    data-guest-card
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, guestId)}
                                                    onDragEnd={handleDragEnd}
                                                    className={clsx(
                                                        "flex items-center gap-2 px-3 py-2 rounded-xl cursor-grab active:cursor-grabbing transition-all group",
                                                        "bg-slate-50 hover:bg-white border border-slate-100 hover:border-slate-200",
                                                        "hover:shadow-sm"
                                                    )}
                                                >
                                                    <div className="text-slate-200 group-hover:text-slate-400 transition-colors flex-shrink-0">
                                                        <GripVertical size={14} />
                                                    </div>
                                                    <div className={clsx(
                                                        "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0",
                                                        guest.type === 'bride' ? 'bg-pink-50 text-pink-500' : 'bg-blue-50 text-blue-500'
                                                    )}>
                                                        {guest.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">{guest.name}</span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeGuestFromTable(table.id, guestId);
                                                        }}
                                                        className="p-0.5 rounded text-slate-200 hover:text-red-500 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className={clsx(
                                        "text-center py-6 rounded-2xl border-2 border-dashed transition-all",
                                        dragOverTarget === table.id
                                            ? 'border-wedding-gold/40 bg-wedding-gold/5'
                                            : 'border-slate-100'
                                    )}>
                                        <Armchair size={28} className="mx-auto text-slate-200 mb-2" />
                                        <p className="text-sm text-slate-300 italic">Arraste convidados para cá</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="bg-white rounded-[2rem] shadow-sm border-[0.5px] border-slate-100 py-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border-[0.5px] border-slate-100">
                                <Armchair size={36} className="text-slate-200" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-400 mb-2">Nenhuma mesa criada</h3>
                            <p className="text-sm text-slate-300">Use o controle acima para adicionar mesas ao evento.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SeatingChart;
