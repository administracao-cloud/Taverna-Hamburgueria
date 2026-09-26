import React, { useState } from 'react';
import { useBurger, materialCategories } from '../../context/BakeryContext';
import { Insumo, MaterialCategory } from '../../types';
import { 
  PackageCheck, 
  Plus, 
  Search, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  PlusCircle, 
  MinusCircle 
} from 'lucide-react';

interface InventoryViewProps {
  onOpenNewMaterial: () => void;
  onEditMaterial: (insumo: Insumo) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onOpenNewMaterial,
  onEditMaterial
}) => {
  const { insumos, updateEstoque, deleteInsumo } = useBurger();
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('Todas');
  const [busca, setBusca] = useState('');

  const filteredInsumos = insumos.filter(ins => {
    const matchCat = categoriaAtiva === 'Todas' || ins.categoria === categoriaAtiva;
    const matchBusca = ins.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       ins.fornecedor?.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  const totalValorEstoque = filteredInsumos.reduce((acc, i) => {
    const unitPrice = i.precoCompra / i.quantidadeEmbalagem;
    return acc + (i.estoqueAtual * unitPrice);
  }, 0);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider">
            <PackageCheck className="w-4 h-4" />
            <span>Almoxarifado & Compras</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-100 font-display">
            Estoque de Insumos da Hamburgueria
          </h1>
          <p className="text-xs text-stone-400">
            Controle de cortes para blend, pães, queijos artesanais, molhos da casa e descartáveis.
          </p>
        </div>

        <button
          onClick={onOpenNewMaterial}
          className="px-4 py-2 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-lg shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Cadastrar Insumo</span>
        </button>
      </div>

      {/* Categories & Search Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-stone-900 border border-stone-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setCategoriaAtiva('Todas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              categoriaAtiva === 'Todas'
                ? 'bg-amber-600 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            Todas ({insumos.length})
          </button>
          {materialCategories.map(cat => {
            const count = insumos.filter(i => i.categoria === cat).length;
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

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar insumos ou fornecedor..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Table of Inventory */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-950 text-stone-400 font-semibold border-b border-stone-800">
              <tr>
                <th className="p-3.5">Nome do Insumo</th>
                <th className="p-3.5">Categoria</th>
                <th className="p-3.5 text-right">Preço Compra</th>
                <th className="p-3.5 text-right">Custo Unitário</th>
                <th className="p-3.5 text-center">Estoque Atual</th>
                <th className="p-3.5 text-center">Ajuste Rápido</th>
                <th className="p-3.5">Fornecedor</th>
                <th className="p-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 bg-stone-900">
              {filteredInsumos.map((item) => {
                const isCritico = item.estoqueAtual <= item.estoqueMinimo;

                return (
                  <tr key={item.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-stone-100">{item.nome}</div>
                      <div className="text-[10px] text-stone-500">Atualizado em {item.ultimaAtualizacao}</div>
                    </td>

                    <td className="p-3.5">
                      <span className="text-amber-500 font-medium">
                        {item.categoria}
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-mono text-stone-200 tabular-nums">
                      R$ {item.precoCompra.toFixed(2)} <span className="text-[10px] text-stone-500">/ {item.quantidadeEmbalagem} {item.unidade}</span>
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400 tabular-nums">
                      R$ {item.custoUnitario.toFixed(4)} <span className="text-[10px] text-stone-500">/{item.unidade === 'kg' ? 'g' : item.unidade}</span>
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span className={`font-mono font-extrabold text-xs px-2.5 py-0.5 rounded-full border ${
                          isCritico 
                            ? 'text-rose-400 bg-rose-950/80 border-rose-800' 
                            : 'text-stone-200 bg-stone-950 border-stone-800'
                        }`}>
                          {item.estoqueAtual} {item.unidade}
                        </span>
                        {isCritico && (
                          <span title="Estoque abaixo do mínimo!">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center justify-center gap-1">
                        <button
                          onClick={() => updateEstoque(item.id, -1)}
                          className="p-1 text-stone-400 hover:text-rose-400 rounded hover:bg-stone-800"
                          title="-1 no estoque"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateEstoque(item.id, 1)}
                          className="p-1 text-stone-400 hover:text-emerald-400 rounded hover:bg-stone-800"
                          title="+1 no estoque"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                    <td className="p-3.5 text-stone-400">
                      {item.fornecedor || '—'}
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onEditMaterial(item)}
                          className="p-1.5 text-stone-400 hover:text-amber-400 rounded hover:bg-stone-800"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir o insumo "${item.nome}"?`)) {
                              deleteInsumo(item.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-400 rounded hover:bg-stone-800"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <div>
            Exibindo <strong className="text-stone-200">{filteredInsumos.length}</strong> itens cadastrados
          </div>
          <div className="flex items-center gap-2">
            <span>Valor Total Avaliado em Estoque:</span>
            <span className="font-mono font-bold text-sm text-amber-400 tabular-nums">
              R$ {totalValorEstoque.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
