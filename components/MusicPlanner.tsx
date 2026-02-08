
import React, { useState } from 'react';
import { useWedding } from '../context/WeddingContext';
import { MusicSong } from '../types';
import {
  Music,
  Plus,
  Trash2,
  Play,
  X,
  Disc,
  ExternalLink,
  Music2,
  ListMusic,
  Search,
  Check
} from 'lucide-react';


const MusicPlanner: React.FC = () => {
  const { weddingData, addSong: addSongContext, removeSong: removeSongContext } = useWedding();
  const songs = weddingData.songs;

  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [moment, setMoment] = useState('Festa');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const moments = [
    "Cerimônia - Entrada",
    "Cerimônia - Alianças",
    "Cerimônia - Saída",
    "Primeira Dança",
    "Jantar",
    "Coquetel",
    "Festa"
  ];

  const extractYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const addSong = async () => {
    if (!title.trim()) {
      alert("Por favor, insira pelo menos o título da música.");
      return;
    }

    const youtubeId = extractYoutubeId(url);

    const newSong: MusicSong = {
      id: Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      url: url.trim(),
      youtubeId: youtubeId || '',
      moment
    };

    await addSongContext(newSong);
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setUrl('');
    setTitle('');
    setMoment('Festa');
  };

  const performRemoveSong = async (id: string) => {
    await removeSongContext(id);
    setConfirmDeleteId(null);
  };

  const filteredSongs = songs.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.moment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto animate-fadeIn">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-800">Trilha Sonora</h1>
          <p className="text-slate-500 mt-1">Sua playlist personalizada para o grande dia.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`${isAdding ? 'bg-slate-800' : 'bg-red-600'} text-white px-8 py-3 rounded-2xl shadow-lg transition-all font-bold flex items-center gap-2`}
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
          {isAdding ? 'Fechar' : 'Adicionar Música'}
        </button>
      </header>

      {/* Formulário de Adição */}
      {isAdding && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-red-100 animate-slideDown ring-4 ring-wedding-nude z-10 relative">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
              <Music size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Nova música na playlist</h3>
              <p className="text-sm text-slate-400">O título é obrigatório, o link do YouTube é opcional.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Título ou Artista *</label>
              <input
                autoFocus
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                placeholder="Ex: Perfect - Ed Sheeran"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Link do YouTube (Opcional)</label>
              <input
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                placeholder="youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Momento</label>
              <select
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all appearance-none cursor-pointer"
                value={moment}
                onChange={(e) => setMoment(e.target.value)}
              >
                {moments.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={addSong}
              className="bg-red-600 text-white px-12 py-4 rounded-2xl font-bold shadow-lg shadow-red-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3"
            >
              Adicionar à Playlist
              <ListMusic size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Lista de Playlist */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-serif font-bold text-slate-800 flex items-center gap-3">
            <Disc className="text-wedding-gold animate-spin-slow" size={24} />
            Playlist do Casamento
          </h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar música ou momento..."
              className="pl-12 pr-4 py-2 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-wedding-gold w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                <th className="px-8 py-4">#</th>
                <th className="px-8 py-4">Música / Artista</th>
                <th className="px-8 py-4">Momento</th>
                <th className="px-8 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSongs.length > 0 ? filteredSongs.map((song, index) => (
                <tr key={song.id} className="group hover:bg-wedding-nude/30 transition-all animate-fadeIn">
                  <td className="px-8 py-6 text-slate-300 font-bold">{index + 1}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 relative group/thumb flex items-center justify-center">
                        {song.youtubeId ? (
                          <>
                            <img
                              src={`https://img.youtube.com/vi/${song.youtubeId}/default.jpg`}
                              alt=""
                              className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-100 transition-opacity"
                            />
                            <a href={song.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                              <Play size={16} className="text-white fill-white" />
                            </a>
                          </>
                        ) : (
                          <div className="w-full h-full bg-slate-50 text-slate-300 flex items-center justify-center">
                            <Music2 size={24} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{song.title}</p>
                        {song.youtubeId && <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Youtube ID: {song.youtubeId}</p>}
                        {!song.url && <p className="text-[10px] text-slate-300 italic">Sem link de referência</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-wedding-nude text-wedding-gold px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-wedding-gold/10">
                      {song.moment}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="grid grid-cols-2 gap-2 w-24 mx-auto items-center">
                      <div className="flex justify-center">
                        {song.url ? (
                          <a
                            href={song.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Ver no YouTube"
                          >
                            <ExternalLink size={20} />
                          </a>
                        ) : (
                          <div className="w-10 h-10" />
                        )}
                      </div>

                      <div className="relative flex justify-center">
                        {confirmDeleteId === song.id ? (
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 animate-fadeIn bg-red-50 p-1 rounded-xl border border-red-100 z-10 whitespace-nowrap shadow-xl">
                            <button
                              onClick={() => performRemoveSong(song.id)}
                              className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-red-600 shadow-md transition-colors"
                            >
                              <Check size={12} strokeWidth={3} />
                              Confirmar
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-slate-400 p-1.5 hover:text-slate-600 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(song.id)}
                            className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Remover"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                      <Music2 size={40} />
                    </div>
                    <p className="text-slate-400 font-medium">Nenhuma música encontrada.</p>
                    {!searchTerm && (
                      <button
                        onClick={() => setIsAdding(true)}
                        className="mt-4 text-wedding-gold font-bold text-sm hover:underline"
                      >
                        Clique para adicionar sua primeira música
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-slideDown { animation: slideDown 0.4s ease-out; }
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MusicPlanner;
