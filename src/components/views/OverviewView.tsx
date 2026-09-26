import React from 'react';
import { useBurger } from '../../context/BakeryContext';
import { 
  Flame, 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Layers, 
  UtensilsCrossed, 
  Scale, 
  CheckCircle2 
} from 'lucide-react';
import { ActiveTab } from '../Sidebar';

interface OverviewViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenNewOrder: () => void;
  onOpenNewFicha: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  onOpenNewOrder,
  onOpenNewFicha
}) => {
  const { insumos, fichasTecnicas, ordensChapa, userRole } = useBurger();

  const totalInsumos = insumos.length;
  const insumosCriticos = insumos.filter(i => i.estoqueAtual <= i.estoqueMinimo);
  const valorEstoqueTotal = insumos.reduce((acc, i) => acc + (i.estoqueAtual * (i.precoCompra / i.quantidadeEmbalagem)), 0);

  const cmvMedio = (
    fichasTecnicas.reduce((acc, f) => acc + (f.cmvPercentual || 0), 0) / (fichasTecnicas.length || 1)
  ).toFixed(1);

  const margemMedia = (
    fichasTecnicas.reduce((acc, f) => acc + (f.margemLucroAlvo || 0), 0) / (fichasTecnicas.length || 1)
  ).toFixed(1);

  const ordensNaChapa = ordensChapa.filter(o => o.status === 'na_chapa' || o.status === 'na_fila');
  const ordensProntas = ordensChapa.filter(o => o.status === 'pronto');

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border border-stone-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            <span>Taverna • Hamburgueria Artesanal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-100 font-display">
            Painel Operacional da Hamburgueria & Chapa - Taverna
          </h1>
          <p className="text-xs text-stone-400">
            Conectado como <strong className="text-stone-200">{userRole}</strong> • Monitoramento de chapa em tempo real, fichas técnicas e CMV.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('chapa')}
            className="px-4 py-2.5 text-xs font-semibold text-stone-200 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors border border-stone-700 flex items-center gap-2"
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Ver Controle de Chapa</span>
          </button>

          <button
            onClick={onOpenNewOrder}
            className="px-4 py-2.5 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-lg transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <span>+ Lançar Pedido</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
            <span>CMV Médio dos Burgers</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-stone-100 font-mono tabular-nums">
            {cmvMedio}%
          </div>
          <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Meta de Custo de Insumos: 28% – 34%</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
            <span>Chapa & Pedidos Ativos</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono tabular-nums">
            {ordensNaChapa.length} <span className="text-sm font-normal text-stone-400">na fila / chapa</span>
          </div>
          <div className="text-[11px] text-stone-400">
            {ordensProntas.length} comandas finalizadas hoje
          </div>
        </div>

        <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
            <span>Fichas Técnicas Ativas</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-stone-100 font-mono tabular-nums">
            {fichasTecnicas.length} <span className="text-sm font-normal text-stone-400">receitas</span>
          </div>
          <div className="text-[11px] text-stone-400">
            Margem Bruta Média: <strong className="text-stone-200">{margemMedia}%</strong>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
            <span>Valor Total em Estoque</span>
            <DollarSign className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-extrabold text-stone-100 font-mono tabular-nums">
            R$ {valorEstoqueTotal.toFixed(2)}
          </div>
          <div className="text-[11px] text-stone-400">
            {totalInsumos} insumos e carnes cadastradas
          </div>
        </div>
      </div>

      {/* Grid: Live Chapa Preview & Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Chapa Queue Preview */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold text-stone-100 font-display">
                Fila de Controle de Chapa (Tempo Real)
              </h2>
            </div>
            <button
              onClick={() => onNavigate('chapa')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              Abrir Quadro Completo →
            </button>
          </div>

          {ordensChapa.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-stone-800 rounded-xl text-stone-500 text-xs">
              Nenhuma comanda ativa no momento.
            </div>
          ) : (
            <div className="space-y-3">
              {ordensChapa.slice(0, 4).map((ord) => (
                <div 
                  key={ord.id}
                  className="p-4 rounded-xl bg-stone-950/70 border border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-100 font-mono">
                        {ord.numeroMesaComanda}
                      </span>
                      {ord.clienteNome && (
                        <span className="text-xs text-stone-400">
                          ({ord.clienteNome})
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-stone-800 text-stone-300">
                        {ord.tipo}
                      </span>
                      {ord.prioridade === 'urgente' && (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 border border-rose-800 px-1.5 py-0.5 rounded">
                          Urgente
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-300">
                      {ord.itens.map((it, idx) => (
                        <span key={idx}>
                          {it.quantidade}x {it.nomeItem} {it.pontoCarne ? `(${it.pontoCarne})` : ''}
                          {idx < ord.itens.length - 1 ? ' · ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-stone-400 font-mono">
                      Entrada: {ord.horaEntrada}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                      ord.status === 'na_chapa'
                        ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                        : ord.status === 'montagem'
                        ? 'bg-orange-950/80 text-orange-400 border-orange-800'
                        : ord.status === 'pronto'
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                        : 'bg-stone-800 text-stone-300 border-stone-700'
                    }`}>
                      {ord.status === 'na_chapa' ? '🔥 Na Chapa' : ord.status === 'montagem' ? '🍔 Montagem' : ord.status === 'pronto' ? '✓ Pronto' : '⏳ Na Fila'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock & Blend Fast-Actions */}
        <div className="space-y-6">
          {/* Critical Stock Alert */}
          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h2 className="text-sm font-bold text-stone-100 font-display">
                  Alerta de Estoque Mínimo
                </h2>
              </div>
              <button
                onClick={() => onNavigate('estoque')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                Gerenciar →
              </button>
            </div>

            {insumosCriticos.length === 0 ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Todos os insumos estão acima do estoque mínimo!</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {insumosCriticos.slice(0, 4).map(ins => (
                  <div key={ins.id} className="p-2.5 rounded-lg bg-stone-950 border border-rose-900/40 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-stone-200">{ins.nome}</p>
                      <p className="text-[10px] text-stone-400">Mín: {ins.estoqueMinimo} {ins.unidade}</p>
                    </div>
                    <span className="font-bold text-rose-400 font-mono tabular-nums">
                      {ins.estoqueAtual} {ins.unidade}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Blend Tool Widget */}
          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <Scale className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Laboratório de Blends
              </h3>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Formule a proporção exata de cortes bovinos (Peito, Acém, Fraldinha), calcule o teor de gordura e o custo unitário por disco de burger.
            </p>
            <button
              onClick={() => onNavigate('blends')}
              className="w-full py-2 px-3 text-xs font-semibold text-stone-100 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors border border-stone-700 text-center"
            >
              Abrir Calculadora de Blends →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
