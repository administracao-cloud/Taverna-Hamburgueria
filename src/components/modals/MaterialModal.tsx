import React, { useState, useEffect } from 'react';
import { Insumo, MaterialCategory, UnitType } from '../../types';
import { useBurger, materialCategories } from '../../context/BakeryContext';
import { X, PackagePlus } from 'lucide-react';

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialParaEditar?: Insumo | null;
}

export const MaterialModal: React.FC<MaterialModalProps> = ({
  isOpen,
  onClose,
  materialParaEditar
}) => {
  const { addInsumo, updateInsumo } = useBurger();

  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<MaterialCategory>('Carnes e Blends');
  const [unidade, setUnidade] = useState<UnitType>('kg');
  const [precoCompra, setPrecoCompra] = useState(38.00);
  const [quantidadeEmbalagem, setQuantidadeEmbalagem] = useState(1);
  const [estoqueAtual, setEstoqueAtual] = useState(10);
  const [estoqueMinimo, setEstoqueMinimo] = useState(5);
  const [fornecedor, setFornecedor] = useState('');

  useEffect(() => {
    if (materialParaEditar) {
      setNome(materialParaEditar.nome);
      setCategoria(materialParaEditar.categoria);
      setUnidade(materialParaEditar.unidade);
      setPrecoCompra(materialParaEditar.precoCompra);
      setQuantidadeEmbalagem(materialParaEditar.quantidadeEmbalagem);
      setEstoqueAtual(materialParaEditar.estoqueAtual);
      setEstoqueMinimo(materialParaEditar.estoqueMinimo);
      setFornecedor(materialParaEditar.fornecedor || '');
    } else {
      setNome('');
      setCategoria('Carnes e Blends');
      setUnidade('kg');
      setPrecoCompra(38.00);
      setQuantidadeEmbalagem(1);
      setEstoqueAtual(10);
      setEstoqueMinimo(5);
      setFornecedor('');
    }
  }, [materialParaEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    if (materialParaEditar) {
      updateInsumo(materialParaEditar.id, {
        nome: nome.trim(),
        categoria,
        unidade,
        precoCompra: Number(precoCompra),
        quantidadeEmbalagem: Number(quantidadeEmbalagem),
        estoqueAtual: Number(estoqueAtual),
        estoqueMinimo: Number(estoqueMinimo),
        fornecedor: fornecedor.trim()
      });
    } else {
      addInsumo({
        nome: nome.trim(),
        categoria,
        unidade,
        precoCompra: Number(precoCompra),
        quantidadeEmbalagem: Number(quantidadeEmbalagem),
        estoqueAtual: Number(estoqueAtual),
        estoqueMinimo: Number(estoqueMinimo),
        fornecedor: fornecedor.trim()
      });
    }
    onClose();
  };

  const custoPorGramaOuUnidade = (unidade === 'kg' || unidade === 'ml')
    ? (precoCompra / (quantidadeEmbalagem * 1000)).toFixed(4)
    : (precoCompra / quantidadeEmbalagem).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-600/20 text-amber-500 border border-amber-600/30">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100 font-display">
                {materialParaEditar ? 'Editar Insumo de Hamburgueria' : 'Cadastrar Novo Insumo'}
              </h2>
              <p className="text-xs text-stone-400">
                Controle de custos unitários e estoque mínimo
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Nome do Insumo *
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Peito Bovino Resfriado (Brisket)"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Categoria *
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as MaterialCategory)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              >
                {materialCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Unidade de Medida *
              </label>
              <select
                value={unidade}
                onChange={(e) => setUnidade(e.target.value as UnitType)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="kg">Kilograma (kg)</option>
                <option value="g">Grama (g)</option>
                <option value="un">Unidade (un)</option>
                <option value="l">Litro (l)</option>
                <option value="ml">Mililitro (ml)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Preço da Embalagem / Compra (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={precoCompra}
                onChange={(e) => setPrecoCompra(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 font-mono tabular-nums focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Qtd na Embalagem *
              </label>
              <input
                type="number"
                step="any"
                required
                min="0.01"
                value={quantidadeEmbalagem}
                onChange={(e) => setQuantidadeEmbalagem(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 font-mono tabular-nums focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Unit Cost Preview */}
          <div className="p-3 bg-stone-950/70 rounded-lg border border-stone-800 flex justify-between items-center text-xs">
            <span className="text-stone-300">Custo Base Calculado:</span>
            <span className="font-bold text-amber-400 font-mono tabular-nums">
              R$ {custoPorGramaOuUnidade} por {unidade === 'kg' ? 'g' : (unidade === 'l' ? 'ml' : unidade)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Estoque Atual ({unidade})
              </label>
              <input
                type="number"
                step="any"
                value={estoqueAtual}
                onChange={(e) => setEstoqueAtual(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 font-mono tabular-nums focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Estoque Mínimo / Alerta ({unidade})
              </label>
              <input
                type="number"
                step="any"
                value={estoqueMinimo}
                onChange={(e) => setEstoqueMinimo(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 font-mono tabular-nums focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Fornecedor / Origem
            </label>
            <input
              type="text"
              value={fornecedor}
              onChange={(e) => setFornecedor(e.target.value)}
              placeholder="Ex: Frigorífico Boi Nobre"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
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
              {materialParaEditar ? 'Atualizar Insumo' : 'Salvar Insumo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
