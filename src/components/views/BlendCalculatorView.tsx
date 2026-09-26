import React from 'react';
import { useBurger } from '../../context/BakeryContext';
import { BlendCompositionItem } from '../../types';
import { Scale, Plus, Trash2, Flame, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const BlendCalculatorView: React.FC = () => {
  const { blendCalculator, updateBlendCalculator } = useBurger();

  const handleAddCorte = () => {
    const novoCorte: BlendCompositionItem = {
      id: `c-${Date.now()}`,
      corteNome: 'Costela Bovina Desossada',
      proporcaoPercentual: 10,
      teorGorduraCorte: 25,
      precoKg: 36.00
    };
    updateBlendCalculator({
      cortes: [...blendCalculator.cortes, novoCorte]
    });
  };

  const handleUpdateCorte = (id: string, field: keyof BlendCompositionItem, val: any) => {
    const updated = blendCalculator.cortes.map(c => {
      if (c.id !== id) return c;
      return { ...c, [field]: val };
    });
    updateBlendCalculator({ cortes: updated });
  };

  const handleRemoveCorte = (id: string) => {
    updateBlendCalculator({
      cortes: blendCalculator.cortes.filter(c => c.id !== id)
    });
  };

  // Calculations
  const somaProporcoes = blendCalculator.cortes.reduce((acc, c) => acc + (Number(c.proporcaoPercentual) || 0), 0);
  
  // Weighted cost per kg
  const custoKgBlend = blendCalculator.cortes.reduce((acc, c) => {
    const prop = (Number(c.proporcaoPercentual) || 0) / (somaProporcoes || 100);
    return acc + (prop * (Number(c.precoKg) || 0));
  }, 0);

  // Weighted fat ratio (%)
  const teorGorduraTotal = blendCalculator.cortes.reduce((acc, c) => {
    const prop = (Number(c.proporcaoPercentual) || 0) / (somaProporcoes || 100);
    return acc + (prop * (Number(c.teorGorduraCorte) || 0));
  }, 0);

  // Number of patties produced from the batch
  const pesoPuckKg = blendCalculator.pesoPuckGramas / 1000;
  const quantidadePucksLote = pesoPuckKg > 0 
    ? Math.floor((blendCalculator.pesoLoteKg * 1000) / blendCalculator.pesoPuckGramas)
    : 0;

  const custoPorDisco = pesoPuckKg * custoKgBlend;
  const custoTotalLote = blendCalculator.pesoLoteKg * custoKgBlend;

  const isFatIdeal = teorGorduraTotal >= 18 && teorGorduraTotal <= 22;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Laboratório de Moagem & Charcutaria</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-100 font-display">
            Calculadora de Blends Bovinos & Gordura
          </h1>
          <p className="text-xs text-stone-400">
            Equilíbrio de cortes nobres, teor de gordura para suculência na brasa e custo exato por disco.
          </p>
        </div>

        <button
          onClick={handleAddCorte}
          className="px-4 py-2 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-lg shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Adicionar Corte Bovino</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cuts and Proportions Editor */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <label className="block text-[11px] font-semibold text-stone-400 uppercase mb-1">
                Nome da Fórmula do Blend
              </label>
              <input
                type="text"
                value={blendCalculator.nomeBlend}
                onChange={(e) => updateBlendCalculator({ nomeBlend: e.target.value })}
                className="w-full px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-sm font-bold text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="w-36">
              <label className="block text-[11px] font-semibold text-stone-400 uppercase mb-1">
                Lote Moagem (kg)
              </label>
              <input
                type="number"
                min="1"
                value={blendCalculator.pesoLoteKg}
                onChange={(e) => updateBlendCalculator({ pesoLoteKg: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-sm font-mono font-bold text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Cuts list */}
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-stone-400 px-2">
              <div className="col-span-5">Corte Nobre</div>
              <div className="col-span-2 text-right">Proporção (%)</div>
              <div className="col-span-2 text-right">Gordura (%)</div>
              <div className="col-span-2 text-right">Preço / kg</div>
              <div className="col-span-1 text-center">Ação</div>
            </div>

            {blendCalculator.cortes.map((corte) => {
              const pesoCorteKg = (blendCalculator.pesoLoteKg * corte.proporcaoPercentual) / 100;

              return (
                <div key={corte.id} className="grid grid-cols-12 gap-2 items-center bg-stone-950 p-3 rounded-xl border border-stone-800">
                  <div className="col-span-5">
                    <input
                      type="text"
                      value={corte.corteNome}
                      onChange={(e) => handleUpdateCorte(corte.id, 'corteNome', e.target.value)}
                      className="w-full px-2 py-1 bg-stone-900 border border-stone-800 rounded text-xs text-stone-100 focus:outline-none"
                    />
                    <span className="text-[10px] text-stone-500 font-mono">
                      Qtd no lote: {pesoCorteKg.toFixed(2)} kg
                    </span>
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={corte.proporcaoPercentual}
                      onChange={(e) => handleUpdateCorte(corte.id, 'proporcaoPercentual', Number(e.target.value))}
                      className="w-full px-2 py-1 text-right bg-stone-900 border border-stone-800 rounded text-xs font-mono font-bold text-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={corte.teorGorduraCorte}
                      onChange={(e) => handleUpdateCorte(corte.id, 'teorGorduraCorte', Number(e.target.value))}
                      className="w-full px-2 py-1 text-right bg-stone-900 border border-stone-800 rounded text-xs font-mono text-stone-300 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.50"
                      value={corte.precoKg}
                      onChange={(e) => handleUpdateCorte(corte.id, 'precoKg', Number(e.target.value))}
                      className="w-full px-2 py-1 text-right bg-stone-900 border border-stone-800 rounded text-xs font-mono font-semibold text-emerald-400 focus:outline-none"
                    />
                  </div>

                  <div className="col-span-1 text-center">
                    {blendCalculator.cortes.length > 1 && (
                      <button
                        onClick={() => handleRemoveCorte(corte.id)}
                        className="p-1 text-stone-500 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sum percentage warning */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-stone-950 border border-stone-800 text-xs">
            <span className="text-stone-400">Soma Total das Proporções:</span>
            <span className={`font-mono font-extrabold ${somaProporcoes === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {somaProporcoes}% {somaProporcoes !== 100 && '(Ajuste para somar 100%)'}
            </span>
          </div>
        </div>

        {/* Blend Analytics & Patty Sizing */}
        <div className="space-y-6">
          {/* Blend Analysis Card */}
          <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <Flame className="w-4 h-4" />
              Resultado Físico-Químico
            </h3>

            {/* Fat ratio gauge */}
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-300 font-semibold">Teor de Gordura Estimado:</span>
                <span className={`font-mono font-extrabold text-sm ${isFatIdeal ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {teorGorduraTotal.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${isFatIdeal ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(100, (teorGorduraTotal / 30) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-stone-400 leading-tight">
                {isFatIdeal ? '✓ Gordura ideal para burger na chapa: retém suco e caramelização sem encolher excessivamente.' : 'Dica: entre 18% e 22% de gordura atinge o ponto ideal de suculência.'}
              </p>
            </div>

            {/* Patty Size Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-300">
                Gramatura do Disco / Puck de Hambúrguer
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[90, 120, 160, 180].map((gramas) => (
                  <button
                    key={gramas}
                    type="button"
                    onClick={() => updateBlendCalculator({ pesoPuckGramas: gramas })}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-bold font-mono transition-all border ${
                      blendCalculator.pesoPuckGramas === gramas
                        ? 'bg-amber-600 text-stone-950 border-amber-500 shadow-sm'
                        : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {gramas}g {gramas <= 100 ? '(Smash)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Outputs */}
            <div className="space-y-3 pt-3 border-t border-stone-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">Custo do Kg do Blend:</span>
                <span className="font-mono font-bold text-stone-100 tabular-nums">
                  R$ {custoKgBlend.toFixed(2)} / kg
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">Rendimento do Lote ({blendCalculator.pesoLoteKg}kg):</span>
                <span className="font-mono font-bold text-amber-400 tabular-nums">
                  {quantidadePucksLote} discos de {blendCalculator.pesoPuckGramas}g
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-400">Custo Total do Lote:</span>
                <span className="font-mono font-bold text-stone-100 tabular-nums">
                  R$ {custoTotalLote.toFixed(2)}
                </span>
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-700/50 rounded-xl flex justify-between items-center">
                <span className="text-xs font-bold text-amber-300">Custo Unitário do Disco:</span>
                <span className="font-mono text-base font-extrabold text-amber-400 tabular-nums">
                  R$ {custoPorDisco.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
