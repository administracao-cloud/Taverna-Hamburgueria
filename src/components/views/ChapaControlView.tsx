import React, { useState } from 'react';
import { useBurger } from '../../context/BakeryContext';
import { StatusChapa, OrdemChapa } from '../../types';
import { generateThermalPDF } from '../../utils/thermalPrinter';
import { 
  Flame, 
  Clock, 
  Thermometer, 
  ArrowRight, 
  CheckCircle2, 
  Plus, 
  AlertCircle, 
  Trash2, 
  RotateCcw,
  Printer 
} from 'lucide-react';

interface ChapaControlViewProps {
  onOpenNewOrder: () => void;
}

export const ChapaControlView: React.FC<ChapaControlViewProps> = ({ onOpenNewOrder }) => {
  const { 
    ordensChapa, 
    updateStatusOrdemChapa, 
    deleteOrdemChapa, 
    userRole,
    simulateIFoodOrder,
    simulateDigitalMenuOrder,
    confirmPixPayment
  } = useBurger();
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [testNotification, setTestNotification] = useState<string | null>(null);

  const handleTestIFood = () => {
    const order = simulateIFoodOrder();
    setTestNotification(`✓ Pedido iFood #${order.numeroMesaComanda} recebido com sucesso na Chapa! (Impresso e adicionado na fila)`);
    setTimeout(() => setTestNotification(null), 4500);
  };

  const handleTestCardapio = () => {
    const order = simulateDigitalMenuOrder();
    setTestNotification(`✓ Pedido Cardápio Digital #${order.numeroMesaComanda} recebido com sucesso na Chapa!`);
    setTimeout(() => setTestNotification(null), 4500);
  };

  const columns: { id: StatusChapa; label: string; icon: any; color: string; bg: string }[] = [
    { id: 'na_fila', label: 'Na Fila (Espera)', icon: Clock, color: 'text-stone-400', bg: 'bg-stone-900/80 border-stone-800' },
    { id: 'na_chapa', label: 'Na Chapa (Selando / Fogo)', icon: Flame, color: 'text-amber-500', bg: 'bg-amber-950/20 border-amber-900/40' },
    { id: 'montagem', label: 'Montagem & Queijo', icon: Thermometer, color: 'text-orange-400', bg: 'bg-orange-950/20 border-orange-900/40' },
    { id: 'pronto', label: 'Pronto / Entregue', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-900/40' }
  ];

  const filteredOrdens = ordensChapa.filter(ord => {
    if (filtroTipo === 'todos') return true;
    if (filtroTipo === 'ifood') return ord.origem === 'ifood';
    if (filtroTipo === 'cardapio') return ord.origem === 'cardapio_digital';
    return ord.tipo === filtroTipo;
  });

  const getNextStatus = (current: StatusChapa): StatusChapa | null => {
    switch (current) {
      case 'na_fila': return 'na_chapa';
      case 'na_chapa': return 'montagem';
      case 'montagem': return 'pronto';
      default: return null;
    }
  };

  const getNextStatusLabel = (current: StatusChapa): string => {
    switch (current) {
      case 'na_fila': return 'Colocar na Chapa 🔥';
      case 'na_chapa': return 'Para Montagem 🍔';
      case 'montagem': return 'Finalizar / Entregar ✓';
      default: return '';
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider">
            <Flame className="w-4 h-4 fill-amber-500" />
            <span>KDS da Hamburgueria</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-100 font-display">
            Controle de Chapa & Estação de Grelha
          </h1>
          <p className="text-xs text-stone-400">
            Fluxo contínuo de selagem maillard, pontos da carne e montagem artesanal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botões de Teste da Integração de Pedidos (iFood & Cardápio Digital) */}
          <button
            onClick={handleTestIFood}
            className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            title="Simula a recepção de um pedido real vindo do iFood com entrega e itens"
          >
            <span>🔴 Simular Pedido iFood</span>
          </button>

          <button
            onClick={handleTestCardapio}
            className="px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-950/70 hover:bg-amber-900/80 border border-amber-600/40 rounded-lg shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            title="Simula um pedido feito por cliente no Cardápio Digital"
          >
            <span>📱 Testar Cardápio Web</span>
          </button>

          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-stone-900 border border-stone-800 rounded-lg text-xs">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'ifood', label: '🔴 iFood' },
              { id: 'cardapio', label: '📱 Digital' },
              { id: 'delivery', label: 'Delivery' },
              { id: 'salao', label: 'Salão' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFiltroTipo(t.id)}
                className={`px-2 py-1 rounded-md font-medium text-[11px] transition-colors ${
                  filtroTipo === t.id
                    ? 'bg-amber-600 text-stone-950 font-bold shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenNewOrder}
            className="px-3.5 py-1.5 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Novo Pedido</span>
          </button>
        </div>
      </div>

      {/* Banner de Feedback de Teste de Integração */}
      {testNotification && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/60 rounded-xl flex items-center justify-between gap-3 text-emerald-200 text-xs shadow-lg animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-bold">{testNotification}</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900 text-emerald-300">
            KDS & TÉRMICA OK
          </span>
        </div>
      )}

      {/* Kanban Chapa Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colOrdens = filteredOrdens.filter(o => o.status === col.id);
          const ColIcon = col.icon;

          return (
            <div
              key={col.id}
              className={`rounded-2xl border p-4 flex flex-col space-y-3 min-h-[550px] ${col.bg}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <ColIcon className={`w-4 h-4 ${col.color}`} />
                  <span className="text-xs font-bold text-stone-200">
                    {col.label}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-stone-950 text-stone-300 border border-stone-800">
                  {colOrdens.length}
                </span>
              </div>

              {/* Cards inside column */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colOrdens.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-center text-stone-600 text-xs border border-dashed border-stone-800 rounded-xl">
                    Sem pedidos nesta etapa
                  </div>
                ) : (
                  colOrdens.map((ord) => {
                    const next = getNextStatus(ord.status);
                    const nextLabel = getNextStatusLabel(ord.status);

                    return (
                      <div
                        key={ord.id}
                        className={`p-4 rounded-xl bg-stone-950 border transition-all shadow-md space-y-3 ${
                          ord.prioridade === 'urgente' 
                            ? 'border-rose-700/60 shadow-rose-950/20' 
                            : 'border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        {/* Top card bar */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-extrabold text-stone-100 font-mono">
                              {ord.numeroMesaComanda}
                            </span>
                            
                            {/* Origem do Pedido */}
                            {ord.origem === 'ifood' ? (
                              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-rose-600 text-white shadow-sm flex items-center gap-1">
                                🔴 iFood
                              </span>
                            ) : ord.origem === 'cardapio_digital' ? (
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                                📱 Digital
                              </span>
                            ) : (
                              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                                {ord.tipo}
                              </span>
                            )}

                            {ord.origem && (
                              <span className="text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded bg-stone-800/80 text-stone-400">
                                {ord.tipo}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                const lines = [
                                  `Comanda: ${ord.numeroMesaComanda}`,
                                  `Cliente: ${ord.clienteNome || 'N/A'}`,
                                  ord.enderecoEntrega ? `End: ${ord.enderecoEntrega}` : '',
                                  ...ord.itens.map(it => `${it.quantidade}x ${it.nomeItem}`)
                                ].filter(Boolean);
                                generateThermalPDF('Comanda Chapa', lines);
                              }}
                              className="p-1 text-stone-600 hover:text-amber-500 rounded transition-colors"
                              title="Imprimir Comanda (58mm)"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] text-stone-500 font-mono">
                              {ord.horaEntrada}
                            </span>
                            <button
                              onClick={() => deleteOrdemChapa(ord.id)}
                              className="p-1 text-stone-600 hover:text-rose-400 rounded transition-colors"
                              title="Cancelar/Excluir comanda"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {ord.clienteNome && (
                          <div className="text-[11px] text-stone-300 flex items-center justify-between">
                            <span>Cliente: <strong className="text-stone-100">{ord.clienteNome}</strong></span>
                            {ord.valorTotal && (
                              <span className="font-mono font-bold text-amber-400">
                                R$ {ord.valorTotal.toFixed(2)}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Status de Pagamento Pix Nubank */}
                        {ord.formaPagamento === 'pix' && (
                          <div className="flex items-center justify-between text-[10px] px-2 py-1 rounded-lg bg-purple-950/40 border border-purple-800/40">
                            <div className="flex items-center gap-1.5 text-purple-300">
                              <span className="font-bold">🟣 Pix Nubank:</span>
                              {ord.pixStatus === 'confirmado' ? (
                                <span className="text-emerald-400 font-extrabold flex items-center gap-0.5">
                                  Confirmado ✅ {ord.pixDataConfirmacao ? `(${ord.pixDataConfirmacao})` : ''}
                                </span>
                              ) : (
                                <span className="text-amber-400 font-semibold">
                                  Aguardando Pgto
                                </span>
                              )}
                            </div>

                            {ord.pixStatus !== 'confirmado' && (
                              <button
                                onClick={() => confirmPixPayment(ord.id)}
                                className="px-1.5 py-0.5 bg-purple-800 hover:bg-purple-700 text-white rounded text-[9px] font-bold transition-colors shadow-sm"
                                title="Confirmar recebimento do Pix Nubank"
                              >
                                Confirmar
                              </button>
                            )}
                          </div>
                        )}

                        {/* Endereço de entrega se for delivery / ifood */}
                        {ord.enderecoEntrega && (
                          <div className="text-[10px] text-stone-400 bg-stone-900/60 p-1.5 rounded-lg border border-stone-800/60 flex items-start gap-1">
                            <span className="text-amber-500 shrink-0">📍</span>
                            <span className="truncate">{ord.enderecoEntrega}</span>
                          </div>
                        )}

                        {/* Descartáveis e sachês indicator */}
                        {(ord.precisaSaches !== undefined || ord.precisaGuardanapos !== undefined) && (
                          <div className="flex items-center gap-2 text-[10px] py-0.5">
                            <span className={`px-1.5 py-0.5 rounded font-bold ${ord.precisaSaches ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-stone-900 text-stone-400'}`}>
                              {ord.precisaSaches ? '🥫 Com sachês' : '🌱 Sem sachês'}
                            </span>
                            {ord.precisaGuardanapos && (
                              <span className="px-1.5 py-0.5 rounded font-bold bg-stone-900 text-stone-300 border border-stone-800">
                                🧻 Guardanapos
                              </span>
                            )}
                          </div>
                        )}

                        {/* Items list */}
                        <div className="space-y-1.5 py-1 border-t border-b border-stone-800/60">
                          {ord.itens.map((it, idx) => (
                            <div key={idx} className="text-xs space-y-0.5">
                              <div className="flex items-start justify-between">
                                <span className="font-semibold text-stone-200">
                                  {it.quantidade}x {it.nomeItem}
                                </span>
                              </div>
                              {it.pontoCarne && (
                                <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                                  <span>• Ponto:</span>
                                  <span className="underline decoration-amber-500/50">{it.pontoCarne}</span>
                                </div>
                              )}
                              {it.adicionais && it.adicionais.length > 0 && (
                                <div className="text-[10px] text-emerald-400 font-semibold">
                                  + {it.adicionais.join(', ')}
                                </div>
                              )}
                              {it.remocoes && it.remocoes.length > 0 && (
                                <div className="text-[10px] text-rose-400 font-medium">
                                  Sem: {it.remocoes.join(', ')}
                                </div>
                              )}
                              {it.observacoes && (
                                <div className="text-[10px] text-rose-300 italic bg-rose-950/30 px-1.5 py-0.5 rounded">
                                  Obs: {it.observacoes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Card footer with action button */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          {ord.status !== 'na_fila' && (
                            <button
                              onClick={() => {
                                if (ord.status === 'na_chapa') updateStatusOrdemChapa(ord.id, 'na_fila');
                                if (ord.status === 'montagem') updateStatusOrdemChapa(ord.id, 'na_chapa');
                                if (ord.status === 'pronto') updateStatusOrdemChapa(ord.id, 'montagem');
                              }}
                              className="p-1 text-stone-500 hover:text-stone-300"
                              title="Voltar etapa"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {next ? (
                            <button
                              onClick={() => updateStatusOrdemChapa(ord.id, next)}
                              className="w-full py-1.5 px-2.5 text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                            >
                              <span>{nextLabel}</span>
                            </button>
                          ) : (
                            <div className="w-full text-center text-[11px] font-semibold text-emerald-400 py-1 flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Pedido Concluído</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
