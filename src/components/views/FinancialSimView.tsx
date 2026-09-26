import React, { useState } from 'react';
import { useBurger } from '../../context/BakeryContext';
import { TrendingUp, Calculator, DollarSign, Percent, ArrowUpRight, Flame } from 'lucide-react';

export const FinancialSimView: React.FC = () => {
  const { fichasTecnicas } = useBurger();

  const [custoFixoMensal, setCustoFixoMensal] = useState(18000); // Aluguel, equipe, energia, etc.
  const [diasOperacaoMes, setDiasOperacaoMes] = useState(26);
  const [metaFaturamento, setMetaFaturamento] = useState(65000);

  // Averages from registered technical sheets
  const ticketMedio = fichasTecnicas.length > 0
    ? fichasTecnicas.reduce((acc, f) => acc + f.precoVendaPraticado, 0) / fichasTecnicas.length
    : 42;

  const custoVariavelMedio = fichasTecnicas.length > 0
    ? fichasTecnicas.reduce((acc, f) => acc + f.custoTotalProducao, 0) / fichasTecnicas.length
    : 16;

  const margemContribuicaoUnitaria = ticketMedio - custoVariavelMedio;
  const margemContribuicaoPercentual = ticketMedio > 0 ? (margemContribuicaoUnitaria / ticketMedio) * 100 : 0;

  // Break-even (Ponto de Equilíbrio)
  const pontoEquilibrioBurgersMes = margemContribuicaoUnitaria > 0
    ? Math.ceil(custoFixoMensal / margemContribuicaoUnitaria)
    : 0;

  const pontoEquilibrioBurgersDia = Math.ceil(pontoEquilibrioBurgersMes / diasOperacaoMes);
  const pontoEquilibrioFaturamento = pontoEquilibrioBurgersMes * ticketMedio;

  // Projected burgers to reach revenue goal
  const burgersParaMeta = ticketMedio > 0 ? Math.ceil(metaFaturamento / ticketMedio) : 0;
  const burgersParaMetaDia = Math.ceil(burgersParaMeta / diasOperacaoMes);
  const lucroProjetado = (burgersParaMeta * margemContribuicaoUnitaria) - custoFixoMensal;

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Engenharia Financeira & DRE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-100 font-display">
            Simulador de Margens & Ponto de Equilíbrio
          </h1>
          <p className="text-xs text-stone-400">
            Análise de viabilidade econômica, metas de saída de hambúrgueres na chapa e lucro líquido.
          </p>
        </div>
      </div>

      {/* Primary Simulator Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-500" />
            Parâmetros Operacionais da Taverna
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Custos Fixos Mensais (R$)
              </label>
              <input
                type="number"
                step="500"
                value={custoFixoMensal}
                onChange={(e) => setCustoFixoMensal(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm font-mono font-bold text-stone-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-stone-500">Aluguel, equipe de chapa, eletricidade, taxas fixas</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Dias de Operação por Mês
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={diasOperacaoMes}
                onChange={(e) => setDiasOperacaoMes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm font-mono font-bold text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Meta de Faturamento Bruto (R$)
              </label>
              <input
                type="number"
                step="1000"
                value={metaFaturamento}
                onChange={(e) => setMetaFaturamento(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm font-mono font-bold text-amber-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Break-Even Point Summary */}
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200 flex items-center gap-2">
            <Percent className="w-4 h-4 text-emerald-400" />
            Ponto de Equilíbrio (Break-Even)
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
              <span className="text-[11px] text-stone-400 uppercase font-semibold">Burgers / Dia para Pagar a Casa</span>
              <div className="text-3xl font-extrabold text-stone-100 font-mono tabular-nums">
                {pontoEquilibrioBurgersDia} <span className="text-sm font-normal text-stone-500">burgers/dia</span>
              </div>
              <p className="text-[10px] text-stone-500">
                Total de {pontoEquilibrioBurgersMes} burgers/mês para cobrir 100% dos custos.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-950 rounded-lg border border-stone-800">
                <span className="text-[10px] text-stone-500 block uppercase">Ticket Médio</span>
                <span className="font-mono font-bold text-stone-200">
                  R$ {ticketMedio.toFixed(2)}
                </span>
              </div>

              <div className="p-3 bg-stone-950 rounded-lg border border-stone-800">
                <span className="text-[10px] text-stone-500 block uppercase">Margem Contrib.</span>
                <span className="font-mono font-bold text-emerald-400">
                  {margemContribuicaoPercentual.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Target Revenue Projection */}
        <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            Projeção da Meta de Faturamento
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-1">
              <span className="text-[11px] text-amber-400 uppercase font-semibold">Meta de Produção na Chapa</span>
              <div className="text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
                {burgersParaMetaDia} <span className="text-sm font-normal text-amber-500/80">burgers/dia</span>
              </div>
              <p className="text-[10px] text-stone-400">
                Meta mensal: {burgersParaMeta} pedidos expedidos
              </p>
            </div>

            <div className="p-3 bg-stone-950 rounded-lg border border-stone-800 flex justify-between items-center text-xs">
              <span className="text-stone-300">Lucro Operacional Projetado:</span>
              <span className={`font-mono font-extrabold text-sm ${lucroProjetado >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                R$ {lucroProjetado.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Engineering & CMV Table */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200">
          Tabela Comparativa de CMV por Item do Cardápio
        </h3>

        <div className="border border-stone-800 rounded-xl overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-950 text-stone-400 font-semibold border-b border-stone-800">
              <tr>
                <th className="p-3">Item / Hambúrguer</th>
                <th className="p-3">Categoria</th>
                <th className="p-3 text-right">Custo Insumos</th>
                <th className="p-3 text-right">Preço de Venda</th>
                <th className="p-3 text-right">Lucro Bruto (R$)</th>
                <th className="p-3 text-center">CMV (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 bg-stone-900">
              {fichasTecnicas.map((f) => {
                const lucro = f.precoVendaPraticado - f.custoTotalProducao;
                const isGood = f.cmvPercentual <= 35;
                return (
                  <tr key={f.id} className="hover:bg-stone-800/30">
                    <td className="p-3 font-bold text-stone-100">{f.nome}</td>
                    <td className="p-3 text-amber-500 font-medium">{f.categoria}</td>
                    <td className="p-3 text-right font-mono text-stone-300">R$ {f.custoInsumos.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-bold text-stone-100">R$ {f.precoVendaPraticado.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-semibold text-emerald-400">R$ {lucro.toFixed(2)}</td>
                    <td className="p-3 text-center font-mono font-extrabold">
                      <span className={`px-2 py-0.5 rounded ${isGood ? 'text-emerald-400 bg-emerald-950/60' : 'text-amber-400 bg-amber-950/60'}`}>
                        {f.cmvPercentual}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
