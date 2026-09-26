import React, { useState } from 'react';
import { useBurger } from '../../context/BakeryContext';
import { ItemPedidoChapa, StatusChapa } from '../../types';
import { X, Flame, Plus, Trash2 } from 'lucide-react';

interface NewChapaOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewChapaOrderModal: React.FC<NewChapaOrderModalProps> = ({
  isOpen,
  onClose
}) => {
  const { fichasTecnicas, addOrdemChapa, userRole } = useBurger();

  const [numeroMesaComanda, setNumeroMesaComanda] = useState('Mesa 05');
  const [clienteNome, setClienteNome] = useState('');
  const [tipo, setTipo] = useState<'salao' | 'delivery' | 'takeaway'>('salao');
  const [prioridade, setPrioridade] = useState<'normal' | 'alta' | 'urgente'>('normal');
  const [itens, setItens] = useState<ItemPedidoChapa[]>([
    {
      fichaTecnicaId: fichasTecnicas[0]?.id || 'ft-1',
      nomeItem: fichasTecnicas[0]?.nome || 'Taverna Smash Bacon Duplo',
      quantidade: 1,
      pontoCarne: 'Smash Crocante',
      observacoes: ''
    }
  ]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (fichasTecnicas.length === 0) return;
    const primeira = fichasTecnicas[0];
    setItens([
      ...itens,
      {
        fichaTecnicaId: primeira.id,
        nomeItem: primeira.nome,
        quantidade: 1,
        pontoCarne: primeira.pontoCarneRecomendado || 'Ao Ponto',
        observacoes: ''
      }
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof ItemPedidoChapa, val: any) => {
    const updated = [...itens];
    if (field === 'fichaTecnicaId') {
      const selected = fichasTecnicas.find(f => f.id === val);
      if (selected) {
        updated[index].fichaTecnicaId = selected.id;
        updated[index].nomeItem = selected.nome;
        updated[index].pontoCarne = selected.pontoCarneRecomendado || 'Ao Ponto';
      }
    } else {
      (updated[index] as any)[field] = val;
    }
    setItens(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itens.length === 0) return;

    const now = new Date();
    const horaFormatada = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    addOrdemChapa({
      numeroMesaComanda: numeroMesaComanda.trim() || 'Comanda Balcão',
      clienteNome: clienteNome.trim() || undefined,
      tipo,
      status: 'na_fila' as StatusChapa,
      horaEntrada: horaFormatada,
      temperaturaChapa: 230,
      chapeiroResponsavel: userRole,
      prioridade,
      itens
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-600/20 text-amber-500 border border-amber-600/30">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100 font-display">
                Novo Pedido para Chapa
              </h2>
              <p className="text-xs text-stone-400">
                Enviar comanda para a fila de grelhados e montagem
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Mesa / Comanda *
              </label>
              <input
                type="text"
                required
                value={numeroMesaComanda}
                onChange={(e) => setNumeroMesaComanda(e.target.value)}
                placeholder="Ex: Mesa 05"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Nome do Cliente (Opcional)
              </label>
              <input
                type="text"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Ex: Lucas Henrique"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Tipo de Atendimento
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="salao">Salão (Mesa)</option>
                <option value="delivery">Delivery</option>
                <option value="takeaway">Takeaway / Retirada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Prioridade da Comanda
              </label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente 🔥</option>
              </select>
            </div>
          </div>

          {/* Burgers & Items */}
          <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300">
                Itens do Pedido
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Item
              </button>
            </div>

            {itens.map((item, idx) => (
              <div key={idx} className="p-3 bg-stone-900 rounded-lg border border-stone-800 space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={item.fichaTecnicaId}
                    onChange={(e) => handleUpdateItem(idx, 'fichaTecnicaId', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-stone-950 border border-stone-700 rounded text-xs text-stone-100 focus:outline-none"
                  >
                    {fichasTecnicas.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.nome} ({f.categoria}) - R$ {f.precoVendaPraticado.toFixed(2)}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={item.quantidade}
                    onChange={(e) => handleUpdateItem(idx, 'quantidade', Number(e.target.value))}
                    className="w-14 px-2 py-1.5 text-center bg-stone-950 border border-stone-700 rounded text-xs text-stone-100 font-mono focus:outline-none"
                  />

                  {itens.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-stone-400 hover:text-rose-400 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      value={item.pontoCarne || ''}
                      onChange={(e) => handleUpdateItem(idx, 'pontoCarne', e.target.value)}
                      placeholder="Ponto: Ao Ponto / Smash Crocante"
                      className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded text-[11px] text-stone-200 placeholder-stone-400"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={item.observacoes || ''}
                      onChange={(e) => handleUpdateItem(idx, 'observacoes', e.target.value)}
                      placeholder="Obs: Sem picles, dobro bacon..."
                      className="w-full px-2 py-1 bg-stone-950 border border-stone-800 rounded text-[11px] text-stone-200 placeholder-stone-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-lg shadow-sm transition-all"
            >
              Lançar na Chapa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
