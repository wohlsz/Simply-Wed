
import React, { useState } from 'react';
import { Vendor } from '../types';
import { Briefcase, Star, Phone, DollarSign, ExternalLink, Plus } from 'lucide-react';

interface Props {
  vendors: Vendor[];
  setVendors: (vendors: Vendor[]) => void;
}

const VendorManager: React.FC<Props> = ({ vendors, setVendors }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newVendor, setNewVendor] = useState<Partial<Vendor>>({
    name: '',
    service: '',
    contact: '',
    cost: 0,
    status: 'contacted'
  });

  const addVendor = () => {
    if (!newVendor.name || !newVendor.service) return;
    const vendor: Vendor = {
      id: Date.now().toString(),
      name: newVendor.name!,
      service: newVendor.service!,
      contact: newVendor.contact || '',
      cost: newVendor.cost || 0,
      status: newVendor.status as any,
    };
    setVendors([...vendors, vendor]);
    setIsAdding(false);
    setNewVendor({ name: '', service: '', contact: '', cost: 0, status: 'contacted' });
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800">Fornecedores</h1>
          <p className="text-slate-500">Contrate e gerencie sua rede de serviços.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-wedding-gold text-white p-4 rounded-2xl shadow-lg shadow-wedding-gold/20 flex items-center gap-2 hover:scale-105 transition"
        >
          <Plus size={20} />
          <span>Novo Fornecedor</span>
        </button>
      </header>

      {isAdding && (
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-wedding-gold/20 animate-fadeIn">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Cadastrar Fornecedor</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              className="px-4 py-3 rounded-xl border border-slate-200"
              placeholder="Nome da Empresa"
              value={newVendor.name}
              onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
            />
            <input 
              className="px-4 py-3 rounded-xl border border-slate-200"
              placeholder="Serviço (ex: Fotografia)"
              value={newVendor.service}
              onChange={(e) => setNewVendor({...newVendor, service: e.target.value})}
            />
            <input 
              className="px-4 py-3 rounded-xl border border-slate-200"
              placeholder="Contato (Email/Tel)"
              value={newVendor.contact}
              onChange={(e) => setNewVendor({...newVendor, contact: e.target.value})}
            />
            <input 
              type="number"
              className="px-4 py-3 rounded-xl border border-slate-200"
              placeholder="Valor Contrato (R$)"
              value={newVendor.cost || ''}
              onChange={(e) => setNewVendor({...newVendor, cost: Number(e.target.value)})}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIsAdding(false)} className="px-6 py-2 text-slate-400">Cancelar</button>
            <button onClick={addVendor} className="bg-wedding-gold text-white px-8 py-2 rounded-xl font-bold">Salvar</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.length > 0 ? vendors.map(vendor => (
          <div key={vendor.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-wedding-nude rounded-2xl flex items-center justify-center text-wedding-gold">
                <Briefcase size={24} />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                ${vendor.status === 'booked' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}
              `}>
                {vendor.status === 'booked' ? 'Contratado' : 'Em negociação'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-800">{vendor.name}</h3>
            <p className="text-slate-400 text-sm mb-6 font-medium">{vendor.service}</p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-slate-600">
                <Phone size={16} />
                <span className="text-sm">{vendor.contact}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <DollarSign size={16} />
                <span className="text-sm font-bold">R$ {vendor.cost.toLocaleString('pt-BR')}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-wedding-nude text-wedding-gold py-2 rounded-xl font-bold hover:bg-wedding-gold hover:text-white transition">
                Detalhes
              </button>
              <button className="p-2 text-slate-300 hover:text-wedding-gold">
                <Star size={20} />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
            <p className="text-slate-400">Você ainda não cadastrou fornecedores.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorManager;
