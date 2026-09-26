import React, { useState } from 'react';
import { useBurger, recipeCategories } from '../../context/BakeryContext';
import { FichaTecnica, RecipeCategory } from '../../types';
import { 
  FileSpreadsheet, 
  Plus, 
  Search, 
  Filter, 
  Flame, 
  Clock, 
  TrendingUp, 
  Edit, 
  Trash2, 
  Layers, 
  Scale, 
  Eye 
} from 'lucide-react';

interface TechnicalSheetsViewProps {
  onOpenNewFicha: () => void;
  onEditFicha: (ficha: FichaTecnica) => void;
}

export const TechnicalSheetsView: React.FC<TechnicalSheetsViewProps> = ({
  onOpenNewFicha,
  onEditFicha
}) => {
  const { fichasTecnicas, deleteFichaTecnica } = useBurger();
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('Todas');
  const [busca, setBusca] = useState('');
  const [fichaDetalhe, setFichaDetalhe] = useState<FichaTecnica | null>(null);

  const filteredFichas = fichasTecnicas.filter(f => {
    const matchCat = categoriaAtiva === 'Todas' || f.categoria === categoriaAtiva;
    const matchBusca = f.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       f.descricao?.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Engenharia de Cardápio</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-100 font-display">
            Fichas Técnicas & Formação de Preço
          </h1>
          <p className="text-xs text-stone-400">
            Fator de redução na chapa/grelha, cálculo de CMV, pesos brutos e margens brutas.
          </p>
        </div>

        <button
          onClick={onOpenNewFicha}
          className="px-4 py-2 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-lg shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nova Ficha Técnica</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-stone-900 border border-stone-800">
        {/* Category tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setCategoriaAtiva('Todas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              categoriaAtiva === 'Todas'
                ? 'bg-amber-600 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            Todas ({fichasTecnicas.length})
          </button>
          {recipeCategories.map(cat => {
            const count = fichasTecnicas.filter(f => f.categoria === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  categoriaAtiva === cat
                    ? 'bg-amber-600 text-stone-950 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar receitas ou blends..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Grid of Technical Sheets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFichas.map((ficha) => {
          const lucroBruto = ficha.precoVendaPraticado - ficha.custoTotalProducao;
          const isHealthyCMV = ficha.cmvPercentual <= 35;

          return (
            <div
              key={ficha.id}
              className="rounded-2xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition-all shadow-lg flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-4">
                {/* Top badges */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-500 font-bold uppercase tracking-wider text-[11px]">
                    {ficha.categoria}
                  </span>
                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                    isHealthyCMV 
                      ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
                      : 'text-amber-400 bg-amber-950/60 border-amber-800/60'
                  }`}>
                    CMV {ficha.cmvPercentual}%
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-extrabold text-stone-100 font-display">
                    {ficha.nome}
                  </h3>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                    {ficha.descricao || 'Sem descrição cadastrada.'}
                  </p>
                </div>

                {/* Reduction and Grilled Weight Badges */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-stone-950/70 border border-stone-800/60 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-500 block uppercase font-medium">Redução Chapa</span>
                    <span className="font-mono font-bold text-amber-400">
                      {ficha.fatorReducaoChapa}% perda
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-500 block uppercase font-medium">Peso Grelhado</span>
                    <span className="font-mono font-bold text-stone-200">
                      ~ {ficha.pesoGrelhado} g
                    </span>
                  </div>
                </div>

                {/* Ingredients summary */}
                <div className="space-y-1 text-xs">
                  <span className="text-[11px] font-semibold text-stone-400">Insumos Principais ({ficha.ingredientes.length}):</span>
                  <div className="text-[11px] text-stone-300 line-clamp-2">
                    {ficha.ingredientes.map(i => `${i.quantidade}${i.unidade} ${i.nomeInsumo}`).join(', ')}
                  </div>
                </div>

                {/* Financial overview */}
                <div className="pt-3 border-t border-stone-800/80 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-stone-950/50">
                    <span className="text-[10px] text-stone-500 block uppercase">Custo Insumos</span>
                    <span className="font-mono font-bold text-stone-300 text-xs tabular-nums">
                      R$ {ficha.custoInsumos.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-stone-950/50">
                    <span className="text-[10px] text-stone-500 block uppercase">Custo Total</span>
                    <span className="font-mono font-bold text-stone-300 text-xs tabular-nums">
                      R$ {ficha.custoTotalProducao.toFixed(2)}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-amber-950/30 border border-amber-800/30">
                    <span className="text-[10px] text-amber-500 block uppercase font-bold">Venda</span>
                    <span className="font-mono font-extrabold text-amber-400 text-xs tabular-nums">
                      R$ {ficha.precoVendaPraticado.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-stone-950/80 border-t border-stone-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => setFichaDetalhe(ficha)}
                  className="text-stone-300 hover:text-white flex items-center gap-1.5 font-medium"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Completa</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditFicha(ficha)}
                    className="p-1.5 text-stone-400 hover:text-amber-400 rounded hover:bg-stone-800 transition-colors"
                    title="Editar Ficha"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Excluir a ficha técnica "${ficha.nome}"?`)) {
                        deleteFichaTecnica(ficha.id);
                      }
                    }}
                    className="p-1.5 text-stone-400 hover:text-rose-400 rounded hover:bg-stone-800 transition-colors"
                    title="Excluir Ficha"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal View */}
      {fichaDetalhe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 space-y-6 my-8">
            <div className="flex items-start justify-between border-b border-stone-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                  {fichaDetalhe.categoria}
                </span>
                <h2 className="text-xl font-extrabold text-stone-100 font-display">
                  {fichaDetalhe.nome}
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  {fichaDetalhe.descricao}
                </p>
              </div>
              <button
                onClick={() => setFichaDetalhe(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
              >
                ✕
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-stone-950 rounded-lg border border-stone-800">
                <span className="text-[10px] text-stone-500 uppercase">Fator Redução Chapa</span>
                <p className="text-sm font-bold text-amber-400 font-mono">
                  {fichaDetalhe.fatorReducaoChapa}% perda
                </p>
              </div>
              <div className="p-3 bg-stone-950 rounded-lg border border-stone-800">
                <span className="text-[10px] text-stone-500 uppercase">Peso Grelhado Final</span>
                <p className="text-sm font-bold text-stone-200 font-mono">
                  {fichaDetalhe.pesoGrelhado} g
                </p>
              </div>
              <div className="p-3 bg-stone-950 rounded-lg border border-stone-800">
                <span className="text-[10px] text-stone-500 uppercase">CMV Real</span>
                <p className="text-sm font-bold text-emerald-400 font-mono">
                  {fichaDetalhe.cmvPercentual}%
                </p>
              </div>
            </div>

            {/* Ingredients table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300">
                Composição de Insumos
              </h4>
              <div className="border border-stone-800 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-950 text-stone-400 font-semibold border-b border-stone-800">
                    <tr>
                      <th className="p-2.5">Insumo</th>
                      <th className="p-2.5 text-right">Qtd</th>
                      <th className="p-2.5 text-right">Custo Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 bg-stone-900">
                    {fichaDetalhe.ingredientes.map((ing, i) => (
                      <tr key={i}>
                        <td className="p-2.5 text-stone-200">{ing.nomeInsumo}</td>
                        <td className="p-2.5 text-right font-mono text-stone-400">{ing.quantidade} {ing.unidade}</td>
                        <td className="p-2.5 text-right font-mono font-semibold text-stone-200">R$ {ing.custoTotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Preparation steps */}
            {fichaDetalhe.modoPreparo && fichaDetalhe.modoPreparo.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300">
                  Modo de Preparo & Chapa
                </h4>
                <div className="space-y-1.5 p-3 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-300">
                  {fichaDetalhe.modoPreparo.map((p, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="font-mono text-amber-500 font-bold">{idx + 1}.</span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setFichaDetalhe(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-300 bg-stone-800 hover:bg-stone-700 rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
