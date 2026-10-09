import React, { useState, useMemo } from 'react';
import { useBurger, recipeCategories } from '../../context/BakeryContext';
import { FichaTecnica, RecipeCategory } from '../../types';
import { 
  SlidersHorizontal, 
  Search, 
  Check, 
  CheckCircle2, 
  Layers, 
  Scissors, 
  PackageCheck, 
  Sparkles, 
  Flame, 
  UtensilsCrossed, 
  Filter,
  CheckSquare,
  Square,
  ImageOff,
  Image,
  Trash2,
  Camera
} from 'lucide-react';

export const ItemManagementPanel: React.FC = () => {
  const { fichasTecnicas, updateFichaTecnica, clearAllPhotos } = useBurger();

  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todas');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleOpenPhotoEdit = (item: FichaTecnica) => {
    setEditingPhotoId(item.id);
    setPhotoUrlInput(item.imagemUrl || '');
  };

  const handleSavePhotoEdit = (itemId: string) => {
    const cleanUrl = photoUrlInput.trim();
    updateFichaTecnica(itemId, { imagemUrl: cleanUrl || undefined });
    setEditingPhotoId(null);
    showFeedback(cleanUrl ? 'Foto atualizada com sucesso!' : 'Foto removida com sucesso!');
  };

  const handleClearAllPhotos = () => {
    if (confirm('Deseja remover todas as fotos dos itens? Você poderá inserir fotos limpas da sua nova copy.')) {
      clearAllPhotos();
      showFeedback('Todas as fotos foram removidas dos itens!');
    }
  };

  // Filtered items
  const itensFiltrados = useMemo(() => {
    return fichasTecnicas.filter(item => {
      const matchCat = categoriaFiltro === 'Todas' || item.categoria === categoriaFiltro;
      const matchBusca = item.nome.toLowerCase().includes(busca.toLowerCase()) ||
                         (item.descricao && item.descricao.toLowerCase().includes(busca.toLowerCase()));
      return matchCat && matchBusca;
    });
  }, [fichasTecnicas, categoriaFiltro, busca]);

  // Handler for each checkbox
  const handleToggleCheckbox = (
    item: FichaTecnica, 
    campo: 'habilitarAdicionais' | 'habilitarRemocaoIngredientes' | 'perguntaSaches'
  ) => {
    // Default value if undefined
    const valorAtual = item[campo] !== undefined 
      ? Boolean(item[campo]) 
      : (campo === 'perguntaSaches' 
          ? (item.categoria === 'Smash Burgers' || item.categoria === 'Clássicos' || item.categoria === 'Porções / Acompanhamentos')
          : true);

    const novoValor = !valorAtual;
    updateFichaTecnica(item.id, { [campo]: novoValor });

    const labels = {
      habilitarAdicionais: novoValor ? 'Adicionais habilitados' : 'Adicionais desativados',
      habilitarRemocaoIngredientes: novoValor ? 'Remoção de ingredientes permitida' : 'Remoção desativada',
      perguntaSaches: novoValor ? 'Pergunta de sachês ativada' : 'Pergunta de sachês desativada'
    };
    showFeedback(`${item.nome}: ${labels[campo]}`);
  };

  // Bulk actions
  const handleBulkBurgers = (ativo: boolean) => {
    fichasTecnicas.forEach(item => {
      if (item.categoria === 'Smash Burgers' || item.categoria === 'Clássicos') {
        updateFichaTecnica(item.id, {
          habilitarAdicionais: ativo,
          habilitarRemocaoIngredientes: ativo,
          perguntaSaches: ativo
        });
      }
    });
    showFeedback(ativo ? 'Opções ativadas para todos os Burgers!' : 'Opções desativadas para todos os Burgers!');
  };

  const handleBulkSaches = (ativo: boolean) => {
    fichasTecnicas.forEach(item => {
      if (item.categoria !== 'Bebidas') {
        updateFichaTecnica(item.id, { perguntaSaches: ativo });
      }
    });
    showFeedback(ativo ? 'Pergunta de sachês ativada para comidas/lanches!' : 'Pergunta de sachês desativada!');
  };

  const handleCleanDrinksAndSauces = () => {
    fichasTecnicas.forEach(item => {
      if (item.categoria === 'Bebidas' || item.categoria === 'Molhos da Casa') {
        updateFichaTecnica(item.id, {
          habilitarAdicionais: false,
          habilitarRemocaoIngredientes: false,
          perguntaSaches: false
        });
      }
    });
    showFeedback('Bebidas e Molhos limpos (sem adicionais, remoções ou sachês)!');
  };

  return (
    <div className="p-6 bg-stone-900 rounded-3xl border border-stone-800 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-stone-950 font-black shadow-md">
            <SlidersHorizontal className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-100 font-display">
              Gestão de Itens do Cardápio & Opções ao Cliente
            </h2>
            <p className="text-xs text-stone-400">
              Controle individual por lanche: marque ou desmarque Habilitar Adicionais, Remoção de Ingredientes e Pergunta de Sachês estilo iFood
            </p>
          </div>
        </div>

        {feedbackMsg && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs font-bold animate-fade-in shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate max-w-xs">{feedbackMsg}</span>
          </div>
        )}
      </div>

      {/* Ações Rápidas / Configuração em Massa */}
      <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-stone-300 font-bold">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Ações Rápidas em Lote:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleBulkBurgers(true)}
            className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-400 font-bold rounded-xl transition-all"
          >
            ✓ Ativar Tudo nos Burgers
          </button>
          <button
            type="button"
            onClick={() => handleBulkSaches(true)}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-xl transition-colors"
          >
            🥫 Ativar Sachês em Lanches
          </button>
          <button
            type="button"
            onClick={handleCleanDrinksAndSauces}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 font-semibold rounded-xl transition-colors"
          >
            ✕ Desativar em Bebidas & Molhos
          </button>
          <button
            type="button"
            onClick={handleClearAllPhotos}
            className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 hover:text-rose-100 font-bold rounded-xl transition-colors flex items-center gap-1.5"
            title="Remove fotos de todos os itens para você poder recomeçar ou colocar as suas"
          >
            <ImageOff className="w-3.5 h-3.5" />
            <span>Limpar Fotos Indesejadas</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2">
        {/* Categorias */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setCategoriaFiltro('Todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              categoriaFiltro === 'Todas'
                ? 'bg-amber-600 text-stone-950 border-amber-500 shadow-md'
                : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200 hover:border-stone-700'
            }`}
          >
            Todas ({fichasTecnicas.length})
          </button>
          {recipeCategories.map(cat => {
            const count = fichasTecnicas.filter(f => f.categoria === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaFiltro(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  categoriaFiltro === cat
                    ? 'bg-amber-600 text-stone-950 border-amber-500 shadow-md'
                    : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200 hover:border-stone-700'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Busca */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar item do menu..."
            className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Legenda Explicativa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-stone-950/60 rounded-2xl border border-stone-800/80 text-[11px] text-stone-400">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Layers className="w-3 h-3" />
          </span>
          <span><strong>Habilitar Adicionais:</strong> Mostra lista de bacon extra, cheddar, cebola no modal.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
            <Scissors className="w-3 h-3" />
          </span>
          <span><strong>Habilitar Remoção:</strong> Permite cliente marcar 'Sem cebola', 'Sem molho', etc.</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
            <PackageCheck className="w-3 h-3" />
          </span>
          <span><strong>Pergunta de Sachês:</strong> Pergunta estilo iFood se deseja sachês de ketchup/maionese.</span>
        </div>
      </div>

      {/* Lista de Itens do Menu com Checkboxes Administrativos */}
      <div className="space-y-3">
        {itensFiltrados.length === 0 ? (
          <div className="text-center py-12 text-stone-500 text-xs">
            Nenhum item encontrado com os filtros selecionados.
          </div>
        ) : (
          itensFiltrados.map((item) => {
            const adicionaisAtivos = item.habilitarAdicionais !== false;
            const remocaoAtiva = item.habilitarRemocaoIngredientes !== false;
            const sachesAtivos = item.perguntaSaches !== undefined 
              ? Boolean(item.perguntaSaches)
              : (item.categoria === 'Smash Burgers' || item.categoria === 'Clássicos' || item.categoria === 'Porções / Acompanhamentos');

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-stone-950 border border-stone-800 hover:border-stone-700/80 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm"
              >
                {/* Informações do Item */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="relative group shrink-0">
                    {item.imagemUrl ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-stone-800">
                        <img 
                          src={item.imagemUrl} 
                          alt={item.nome}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-500">
                        <Flame className="w-6 h-6" />
                      </div>
                    )}

                    {/* Botões rápidos sobre a foto */}
                    <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5">
                      {item.imagemUrl ? (
                        <button
                          type="button"
                          onClick={() => {
                            updateFichaTecnica(item.id, { imagemUrl: undefined });
                            showFeedback(`Foto removida de ${item.nome}!`);
                          }}
                          className="p-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-md text-[10px]"
                          title="Remover foto deste item"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => handleOpenPhotoEdit(item)}
                        className="p-1 rounded-full bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-300 shadow-md text-[10px] border border-stone-700"
                        title="Adicionar ou alterar URL da foto"
                      >
                        <Camera className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-stone-100 font-display truncate">
                        {item.nome}
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full shrink-0">
                        {item.categoria}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 line-clamp-1 mt-0.5">
                      {item.descricao || 'Sem descrição cadastrada'}
                    </p>

                    {/* Inline Editor de Foto se aberto */}
                    {editingPhotoId === item.id ? (
                      <div className="flex items-center gap-2 mt-2 bg-stone-900 p-2 rounded-xl border border-amber-500/50">
                        <input
                          type="text"
                          value={photoUrlInput}
                          onChange={(e) => setPhotoUrlInput(e.target.value)}
                          placeholder="Cole o link da foto (URL)..."
                          className="flex-1 bg-stone-950 border border-stone-800 px-2 py-1 rounded text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSavePhotoEdit(item.id)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded"
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPhotoId(null)}
                          className="px-2 py-1 text-stone-400 hover:text-stone-200 text-xs"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-stone-500 font-mono font-bold">R$</span>
                        <input
                          type="number"
                          step="0.50"
                          min="0"
                          value={item.precoVendaPraticado}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            updateFichaTecnica(item.id, { precoVendaPraticado: val });
                          }}
                          className="w-20 bg-stone-900 border border-stone-800 hover:border-stone-700 px-2 py-0.5 rounded text-xs font-mono font-black text-amber-400 focus:outline-none focus:border-amber-500 text-right"
                          title="Altere o preço de venda diretamente"
                        />
                        {item.precoOriginal && (
                          <span className="text-[10px] font-mono text-stone-500 line-through">
                            R$ {item.precoOriginal.toFixed(2)}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenPhotoEdit(item)}
                          className="text-[10px] text-amber-400/80 hover:text-amber-300 underline ml-2"
                        >
                          {item.imagemUrl ? 'Trocar foto' : '+ Inserir foto'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Checkboxes Administrativos (Exatamente como pedido: Habilitar Adicionais, Habilitar Remoção de Ingredientes, Pergunta de Sachês) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-900">
                  {/* 1. Habilitar Adicionais */}
                  <label
                    onClick={() => handleToggleCheckbox(item, 'habilitarAdicionais')}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                      adicionaisAtivos
                        ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 font-bold shadow-sm'
                        : 'bg-stone-900/60 border-stone-800 text-stone-500 hover:border-stone-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={adicionaisAtivos}
                      onChange={() => {}}
                      className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs leading-tight">Habilitar Adicionais</span>
                      <span className="text-[9px] opacity-75">{adicionaisAtivos ? 'Disponível no modal' : 'Oculto'}</span>
                    </div>
                  </label>

                  {/* 2. Habilitar Remoção de Ingredientes */}
                  <label
                    onClick={() => handleToggleCheckbox(item, 'habilitarRemocaoIngredientes')}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                      remocaoAtiva
                        ? 'bg-rose-950/30 border-rose-500/50 text-rose-300 font-bold shadow-sm'
                        : 'bg-stone-900/60 border-stone-800 text-stone-500 hover:border-stone-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={remocaoAtiva}
                      onChange={() => {}}
                      className="rounded accent-rose-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs leading-tight">Habilitar Remoção</span>
                      <span className="text-[9px] opacity-75">{remocaoAtiva ? 'Permite sem cebola/molho' : 'Desativado'}</span>
                    </div>
                  </label>

                  {/* 3. Pergunta de Sachês */}
                  <label
                    onClick={() => handleToggleCheckbox(item, 'perguntaSaches')}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                      sachesAtivos
                        ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-300 font-bold shadow-sm'
                        : 'bg-stone-900/60 border-stone-800 text-stone-500 hover:border-stone-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={sachesAtivos}
                      onChange={() => {}}
                      className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs leading-tight">Pergunta de Sachês</span>
                      <span className="text-[9px] opacity-75">{sachesAtivos ? 'Pergunta no pedido' : 'Não perguntar'}</span>
                    </div>
                  </label>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
