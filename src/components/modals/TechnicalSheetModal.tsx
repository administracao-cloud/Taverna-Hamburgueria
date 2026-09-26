import React, { useState, useEffect } from 'react';
import { FichaTecnica, RecipeCategory, IngredienteReceita } from '../../types';
import { useBurger, recipeCategories } from '../../context/BakeryContext';
import { X, Plus, Trash2, Calculator, Flame, AlertCircle, Info } from 'lucide-react';

interface TechnicalSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  fichaParaEditar?: FichaTecnica | null;
}

export const TechnicalSheetModal: React.FC<TechnicalSheetModalProps> = ({
  isOpen,
  onClose,
  fichaParaEditar
}) => {
  const { insumos, addFichaTecnica, updateFichaTecnica } = useBurger();

  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState<RecipeCategory>('Smash Burgers');
  const [descricao, setDescricao] = useState('');
  const [tempoPreparoMinutos, setTempoPreparoMinutos] = useState(10);
  const [pontoCarneRecomendado, setPontoCarneRecomendado] = useState('Ao Ponto');
  const [ingredientes, setIngredientes] = useState<IngredienteReceita[]>([]);
  const [fatorReducaoChapa, setFatorReducaoChapa] = useState(20); // Fator de Redução na Chapa / Grelha (%)
  const [custoEmbalagem, setCustoEmbalagem] = useState(1.50);
  const [custoMaoDeObra, setCustoMaoDeObra] = useState(2.50);
  const [margemLucroAlvo, setMargemLucroAlvo] = useState(60);
  const [impostosTaxas, setImpostosTaxas] = useState(10);
  const [precoVendaPraticado, setPrecoVendaPraticado] = useState(38.00);
  const [modoPreparo, setModoPreparo] = useState<string[]>(['']);

  useEffect(() => {
    if (fichaParaEditar) {
      setNome(fichaParaEditar.nome);
      setCategoria(fichaParaEditar.categoria);
      setDescricao(fichaParaEditar.descricao || '');
      setTempoPreparoMinutos(fichaParaEditar.tempoPreparoMinutos || 10);
      setPontoCarneRecomendado(fichaParaEditar.pontoCarneRecomendado || 'Ao Ponto');
      setIngredientes(fichaParaEditar.ingredientes || []);
      setFatorReducaoChapa(fichaParaEditar.fatorReducaoChapa ?? 20);
      setCustoEmbalagem(fichaParaEditar.custoEmbalagem || 0);
      setCustoMaoDeObra(fichaParaEditar.custoMaoDeObra || 0);
      setMargemLucroAlvo(fichaParaEditar.margemLucroAlvo || 60);
      setImpostosTaxas(fichaParaEditar.impostosTaxas || 10);
      setPrecoVendaPraticado(fichaParaEditar.precoVendaPraticado || 0);
      setModoPreparo(fichaParaEditar.modoPreparo?.length ? fichaParaEditar.modoPreparo : ['']);
    } else {
      setNome('');
      setCategoria('Smash Burgers');
      setDescricao('');
      setTempoPreparoMinutos(10);
      setPontoCarneRecomendado('Ao Ponto');
      setIngredientes([]);
      setFatorReducaoChapa(20);
      setCustoEmbalagem(1.50);
      setCustoMaoDeObra(2.50);
      setMargemLucroAlvo(60);
      setImpostosTaxas(10);
      setPrecoVendaPraticado(38.00);
      setModoPreparo(['']);
    }
  }, [fichaParaEditar, isOpen]);

  if (!isOpen) return null;

  // Real-time calculations
  const custoInsumos = ingredientes.reduce((sum, ing) => sum + (ing.custoTotal || 0), 0);
  const custoTotalProducao = custoInsumos + Number(custoEmbalagem || 0) + Number(custoMaoDeObra || 0);

  // Weight Calculations
  const pesoCruTotal = ingredientes.reduce((acc, ing) => {
    if (ing.unidade === 'g') return acc + ing.quantidade;
    if (ing.unidade === 'kg') return acc + (ing.quantidade * 1000);
    return acc;
  }, 0);

  // Peso Grelhado calculado com o Fator de Redução na Chapa / Grelha
  const pesoGrelhado = Math.round(pesoCruTotal * (1 - (fatorReducaoChapa / 100)));

  // Suggested price based on target margin & taxes
  const markupMultiplier = (100 - margemLucroAlvo - impostosTaxas);
  const precoVendaSugerido = markupMultiplier > 0 
    ? Number((custoTotalProducao / (markupMultiplier / 100)).toFixed(2))
    : Number((custoTotalProducao * 2.5).toFixed(2));

  // Actual CMV %
  const cmvPercentual = precoVendaPraticado > 0 
    ? Number(((custoInsumos / precoVendaPraticado) * 100).toFixed(1))
    : 0;

  const lucroBrutoReais = precoVendaPraticado - custoTotalProducao - (precoVendaPraticado * (impostosTaxas / 100));

  const handleAddIngrediente = () => {
    if (insumos.length === 0) return;
    const primeiroInsumo = insumos[0];
    const novo: IngredienteReceita = {
      insumoId: primeiroInsumo.id,
      nomeInsumo: primeiroInsumo.nome,
      unidade: primeiroInsumo.unidade === 'kg' ? 'g' : primeiroInsumo.unidade,
      quantidade: primeiroInsumo.unidade === 'kg' ? 100 : 1,
      custoUnitario: primeiroInsumo.custoUnitario,
      custoTotal: (primeiroInsumo.unidade === 'kg' ? 100 : 1) * primeiroInsumo.custoUnitario
    };
    setIngredientes([...ingredientes, novo]);
  };

  const handleUpdateIngrediente = (index: number, field: keyof IngredienteReceita, val: any) => {
    const updated = [...ingredientes];
    if (field === 'insumoId') {
      const selected = insumos.find(i => i.id === val);
      if (selected) {
        updated[index].insumoId = selected.id;
        updated[index].nomeInsumo = selected.nome;
        updated[index].unidade = selected.unidade === 'kg' ? 'g' : selected.unidade;
        updated[index].custoUnitario = selected.custoUnitario;
        updated[index].custoTotal = Number((updated[index].quantidade * selected.custoUnitario).toFixed(2));
      }
    } else if (field === 'quantidade') {
      const qtd = Number(val) || 0;
      updated[index].quantidade = qtd;
      updated[index].custoTotal = Number((qtd * updated[index].custoUnitario).toFixed(2));
    }
    setIngredientes(updated);
  };

  const handleRemoveIngrediente = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  };

  const handleAddPasso = () => {
    setModoPreparo([...modoPreparo, '']);
  };

  const handleUpdatePasso = (idx: number, txt: string) => {
    const p = [...modoPreparo];
    p[idx] = txt;
    setModoPreparo(p);
  };

  const handleRemovePasso = (idx: number) => {
    setModoPreparo(modoPreparo.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const payload = {
      nome: nome.trim(),
      categoria,
      descricao: descricao.trim(),
      tempoPreparoMinutos: Number(tempoPreparoMinutos),
      pontoCarneRecomendado,
      ingredientes,
      pesoCruTotal,
      fatorReducaoChapa: Number(fatorReducaoChapa),
      pesoGrelhado,
      rendimentoPorcoes: 1,
      custoInsumos: Number(custoInsumos.toFixed(2)),
      custoEmbalagem: Number(custoEmbalagem),
      custoMaoDeObra: Number(custoMaoDeObra),
      custoTotalProducao: Number(custoTotalProducao.toFixed(2)),
      margemLucroAlvo: Number(margemLucroAlvo),
      impostosTaxas: Number(impostosTaxas),
      precoVendaSugerido,
      precoVendaPraticado: Number(precoVendaPraticado),
      cmvPercentual,
      modoPreparo: modoPreparo.filter(p => p.trim().length > 0),
      ativo: true
    };

    if (fichaParaEditar) {
      updateFichaTecnica(fichaParaEditar.id, payload);
    } else {
      addFichaTecnica(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-600/20 text-amber-500 border border-amber-600/30">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100 font-display">
                {fichaParaEditar ? 'Editar Ficha Técnica' : 'Nova Ficha Técnica & Precificação'}
              </h2>
              <p className="text-xs text-stone-300">
                Padronização gastronômica, fator de redução na chapa e análise de CMV
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Nome do Item / Hambúrguer *
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Taverna Smash Bacon Duplo"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Exactly the required category options */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Categoria do Cardápio *
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as RecipeCategory)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 focus:outline-none focus:border-amber-500"
              >
                {recipeCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Descrição & Conceito Gastronômico
              </label>
              <textarea
                rows={2}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Blend especial prensado na chapa com crosta intensa, queijo cheddar artesanal..."
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Tempo Médio de Preparo (min)
                </label>
                <input
                  type="number"
                  min="1"
                  value={tempoPreparoMinutos}
                  onChange={(e) => setTempoPreparoMinutos(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Ponto da Carne Recomendado
                </label>
                <select
                  value={pontoCarneRecomendado}
                  onChange={(e) => setPontoCarneRecomendado(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="Ao Ponto">Ao Ponto (Rosado e Suculento)</option>
                  <option value="Ponto para Menos">Ponto para Menos (Vermelho)</option>
                  <option value="Bem Passado">Bem Passado</option>
                  <option value="Smash Crocante">Smash Crocante / Costra Maillard</option>
                  <option value="N/A">N/A (Bebida ou Molho)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Composition & Ingredients */}
          <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                  Composição de Insumos & Ingredientes
                </h3>
                <p className="text-[11px] text-stone-300">
                  Selecione os cortes, pães, queijos e molhos cadastrados no estoque.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddIngrediente}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-400 bg-amber-950/50 hover:bg-amber-900/50 border border-amber-700/50 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Insumo</span>
              </button>
            </div>

            {ingredientes.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-stone-800 rounded-lg text-stone-300 text-xs">
                Nenhum ingrediente adicionado. Clique no botão acima para montar o burger.
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-stone-300 px-2">
                  <div className="col-span-6">Insumo</div>
                  <div className="col-span-2 text-right">Quantidade</div>
                  <div className="col-span-1 text-center">Unidade</div>
                  <div className="col-span-2 text-right">Custo Total</div>
                  <div className="col-span-1 text-center">Ação</div>
                </div>

                {ingredientes.map((ing, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-stone-900/90 p-2 rounded-lg border border-stone-800/80">
                    <div className="col-span-6">
                      <select
                        value={ing.insumoId}
                        onChange={(e) => handleUpdateIngrediente(idx, 'insumoId', e.target.value)}
                        className="w-full px-2 py-1 bg-stone-950 border border-stone-700 rounded text-xs text-stone-200 focus:outline-none"
                      >
                        {insumos.map(i => (
                          <option key={i.id} value={i.id}>
                            {i.nome} ({i.categoria}) - R$ {i.precoCompra.toFixed(2)}/{i.unidade}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        step="any"
                        min="0.01"
                        value={ing.quantidade}
                        onChange={(e) => handleUpdateIngrediente(idx, 'quantidade', e.target.value)}
                        className="w-full px-2 py-1 text-right bg-stone-950 border border-stone-700 rounded text-xs text-stone-100 font-mono tabular-nums focus:outline-none"
                      />
                    </div>

                    <div className="col-span-1 text-center text-xs text-stone-300 font-mono">
                      {ing.unidade}
                    </div>

                    <div className="col-span-2 text-right text-xs font-semibold text-emerald-400 font-mono tabular-nums">
                      R$ {ing.custoTotal.toFixed(2)}
                    </div>

                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveIngrediente(idx)}
                        className="p-1 text-stone-300 hover:text-rose-400 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-2 px-2 border-t border-stone-800 text-xs font-semibold text-stone-300">
                  <span>Subtotal Insumos Alimentares:</span>
                  <span className="text-amber-400 font-mono tabular-nums text-sm">
                    R$ {custoInsumos.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Chapa & Weight Reduction Factors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-amber-950/20 border border-amber-800/40">
            <div>
              <label className="block text-xs font-semibold text-stone-200 mb-1">
                Peso Cru Total dos Ingredientes
              </label>
              <div className="px-3 py-2 bg-stone-950/80 border border-stone-800 rounded-lg text-sm font-bold text-stone-200 font-mono tabular-nums">
                {pesoCruTotal} g
              </div>
            </div>

            {/* Exactly: 'Fator de Redução na Chapa / Grelha' */}
            <div>
              <label className="block text-xs font-semibold text-amber-400 mb-1 flex items-center justify-between">
                <span>Fator de Redução na Chapa / Grelha</span>
                <span className="font-mono">{fatorReducaoChapa}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={fatorReducaoChapa}
                onChange={(e) => setFatorReducaoChapa(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-stone-300">
                Média de perda hídrica e gordura em burgers: 18% a 24%
              </span>
            </div>

            {/* Exactly: 'Peso Grelhado' */}
            <div>
              <label className="block text-xs font-semibold text-amber-400 mb-1">
                Peso Grelhado Final
              </label>
              <div className="px-3 py-2 bg-stone-950/80 border border-amber-600/40 rounded-lg text-sm font-extrabold text-amber-400 font-mono tabular-nums">
                ~ {pesoGrelhado} g
              </div>
            </div>
          </div>

          {/* Costs & Pricing Engine */}
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-500" />
              Engenharia de Custos, CMV & Margem de Lucro
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                  Custo Embalagens (R$)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={custoEmbalagem}
                  onChange={(e) => setCustoEmbalagem(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded text-xs text-stone-200 font-mono tabular-nums focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                  Mão de Obra / Gás (R$)
                </label>
                <input
                  type="number"
                  step="0.10"
                  value={custoMaoDeObra}
                  onChange={(e) => setCustoMaoDeObra(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded text-xs text-stone-200 font-mono tabular-nums focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                  Margem Alvo Desejada (%)
                </label>
                <input
                  type="number"
                  value={margemLucroAlvo}
                  onChange={(e) => setMargemLucroAlvo(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded text-xs text-stone-200 font-mono tabular-nums focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-300 mb-1">
                  Impostos + Taxa Cartão (%)
                </label>
                <input
                  type="number"
                  value={impostosTaxas}
                  onChange={(e) => setImpostosTaxas(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded text-xs text-stone-200 font-mono tabular-nums focus:outline-none"
                />
              </div>
            </div>

            {/* Financial Output Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-stone-900 rounded-lg border border-stone-800">
                <span className="text-[10px] text-stone-300 uppercase font-semibold">Custo Total Produção</span>
                <p className="text-sm font-bold text-stone-100 font-mono tabular-nums">
                  R$ {custoTotalProducao.toFixed(2)}
                </p>
              </div>

              <div className="p-3 bg-stone-900 rounded-lg border border-stone-800">
                <span className="text-[10px] text-stone-300 uppercase font-semibold">Preço Sugerido</span>
                <p className="text-sm font-bold text-stone-100 font-mono tabular-nums">
                  R$ {precoVendaSugerido.toFixed(2)}
                </p>
              </div>

              <div className="p-3 bg-stone-900 rounded-lg border border-amber-600/30">
                <label className="text-[10px] text-amber-400 uppercase font-bold block mb-0.5">Preço no Cardápio (R$)</label>
                <input
                  type="number"
                  step="0.10"
                  required
                  value={precoVendaPraticado}
                  onChange={(e) => setPrecoVendaPraticado(Number(e.target.value))}
                  className="w-full px-1.5 py-0.5 bg-stone-950 border border-stone-700 rounded text-sm font-extrabold text-amber-400 font-mono tabular-nums focus:outline-none"
                />
              </div>

              <div className="p-3 bg-stone-900 rounded-lg border border-stone-800">
                <span className="text-[10px] text-stone-300 uppercase font-semibold">CMV Real</span>
                <p className={`text-sm font-bold font-mono tabular-nums ${cmvPercentual <= 35 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {cmvPercentual}% <span className="text-[10px] text-stone-300 font-normal">{cmvPercentual <= 35 ? '(Ideal)' : '(Alto)'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Mode of preparation / Chapa Instructions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-stone-300">
                Passo a Passo na Chapa / Grelha & Montagem
              </label>
              <button
                type="button"
                onClick={handleAddPasso}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                + Adicionar Passo
              </button>
            </div>

            {modoPreparo.map((passo, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-5 text-xs text-stone-300 font-mono text-right">{idx + 1}.</span>
                <input
                  type="text"
                  value={passo}
                  onChange={(e) => handleUpdatePasso(idx, e.target.value)}
                  placeholder={`Instrução do passo ${idx + 1}`}
                  className="flex-1 px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                />
                {modoPreparo.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePasso(idx)}
                    className="p-1 text-stone-300 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Footer Actions */}
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
              {fichaParaEditar ? 'Atualizar Ficha Técnica' : 'Salvar Ficha Técnica'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
