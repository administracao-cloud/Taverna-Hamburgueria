import React, { useState } from 'react';
import { useBurger } from '../../context/BakeryContext';
import { 
  parseRawIFoodText, 
  extractIFoodStoreMetadata,
  TAVERNA_IFOOD_CATALOG, 
  ParsedIFoodItem,
  IFoodStoreMetadata 
} from '../../utils/ifoodParser';
import { 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  MapPin,
  Clock,
  DollarSign,
  Star,
  ExternalLink,
  Flame,
  FileCheck,
  ImageOff,
  Trash2,
  Send
} from 'lucide-react';

export const MenuImporter: React.FC = () => {
  const { 
    importIFoodCatalog, 
    resetToOfficialIFoodMenu, 
    fichasTecnicas,
    clearAllPhotos,
    simulateIFoodOrder 
  } = useBurger();
  const [inputText, setInputText] = useState('');
  const [storeMeta, setStoreMeta] = useState<IFoodStoreMetadata | null>(null);
  const [parsedPreview, setParsedPreview] = useState<ParsedIFoodItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const handleAnalyze = () => {
    const isUrl = inputText.trim().startsWith('http') || inputText.includes('ifood.com.br');
    const items = isUrl ? TAVERNA_IFOOD_CATALOG : parseRawIFoodText(inputText);
    const meta = extractIFoodStoreMetadata(inputText);

    setStoreMeta(meta);
    setParsedPreview(items);
    setSelectedItems(new Set(items.map((_, i) => i)));
    setImportSuccessMessage(null);
  };

  const handleDiscardAllPreviewPhotos = () => {
    setParsedPreview(prev => prev.map(p => ({ ...p, imagemUrl: undefined })));
    setImportSuccessMessage('Todas as fotos foram removidas da pré-visualização. Os itens serão importados sem fotos indesejadas.');
  };

  const handleRemovePhotoFromItem = (index: number) => {
    setParsedPreview(prev => prev.map((p, i) => i === index ? { ...p, imagemUrl: undefined } : p));
  };

  const handleClearExistingMenuPhotos = () => {
    clearAllPhotos();
    setImportSuccessMessage('Todas as fotos dos itens existentes no cardápio foram removidas com sucesso!');
  };

  const handleTestOrderFromImporter = () => {
    const order = simulateIFoodOrder();
    setImportSuccessMessage(`✓ Pedido de Teste iFood #${order.numeroMesaComanda} recebido no KDS e impresso com sucesso!`);
  };

  const handleQuickPasteSample = () => {
    const sample = `Taverna - Hamburgueria Artesanal
Porto Velho - RO
Loja fechada - Abre às 18:00
Pedido mínimo R$ 23,00
Destaques
Tesouro do Dragão (Batata com Cheddar e Bacon) - R$ 18,90 R$ 25,90
Espadas de Ouro (Batata Frita Tradicional) - R$ 12,90 R$ 16,90
O Caçador | Smash Burger X-Bacon - R$ 28,90 R$ 33,90
O Aventureiro | Smash Cheeseburger Artesanal - R$ 23,90 R$ 27,90
Combos e Missões (Mais Vendidos)
Banquete do Solitário | Combo Individual (Smash + Batata + Refri) - R$ 39,90 R$ 45,90
Aliança de Heróis | Combo Duplo (2 Smash + Batata + Refri) - R$ 74,90 R$ 79,90
Festim da Guilda | Combo Família (3 Smash + 1 Batata Grande + Bebida) - R$ 109,90 R$ 125,00
Guilda de Heróis (Smash Burgers)
O Ogro | Smash Triplo Burguer - R$ 44,90 R$ 48,90
O Alquimista | Smash Duplo Cheddar Melt - R$ 38,90 R$ 42,90
O Piromante | Smash Bbq & Cebola Caramelizada - R$ 37,90 R$ 42,90
O Bárbaro | Smash Burger Duplo Cheddar - R$ 35,90 R$ 40,90
O Druida | Smash Burger X-Salada - R$ 25,90 R$ 29,90`;
    setInputText(sample);
  };

  const handleToggleSelectAll = () => {
    if (selectedItems.size === parsedPreview.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(parsedPreview.map((_, i) => i)));
    }
  };

  const handleToggleItem = (index: number) => {
    const next = new Set(selectedItems);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedItems(next);
  };

  const handleConfirmImport = () => {
    const itemsToImport = parsedPreview.filter((_, i) => selectedItems.has(i));
    if (itemsToImport.length === 0) return;

    const count = importIFoodCatalog(itemsToImport);
    setImportSuccessMessage(`${count} itens do iFood (Taverna) foram sincronizados com sucesso no cardápio digital, KDS e fichas técnicas!`);
    setParsedPreview([]);
    setStoreMeta(null);
    setInputText('');
  };

  const handleLoadOfficialTaverna = () => {
    resetToOfficialIFoodMenu();
    setImportSuccessMessage('Cardápio Oficial Taverna Porto Velho (19 itens completos com Ogro, Alquimista, Combos, Batatas e Poções) sincronizado com sucesso!');
  };

  return (
    <div className="p-6 bg-stone-900 rounded-2xl border border-stone-800 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-600/20 text-amber-500 border border-amber-600/30">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-100 font-display">
              Importador & Clonador iFood (Estilo Beefood)
            </h3>
            <p className="text-xs text-stone-400">
              Copie do iFood ou cole o link da loja para gerar o cardápio digital e fichas técnicas
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleTestOrderFromImporter}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all shadow-md active:scale-95"
            title="Enviar pedido simulado de teste do iFood para verificar recepção no KDS e impressão"
          >
            <span>🔴 Testar Pedido do iFood</span>
          </button>

          <button
            onClick={handleClearExistingMenuPhotos}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-300 bg-stone-800 hover:bg-stone-700 hover:text-white rounded-xl transition-all border border-stone-700"
            title="Remove todas as fotos indesejadas já cadastradas"
          >
            <ImageOff className="w-3.5 h-3.5 text-stone-400" />
            <span>Limpar Fotos Atuais</span>
          </button>

          <button
            onClick={handleLoadOfficialTaverna}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-md active:scale-95"
            title="Carregar todos os 19 itens oficiais da Taverna Porto Velho"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sincronizar Oficial (19 Itens)</span>
          </button>
        </div>
      </div>

      {/* Success banner */}
      {importSuccessMessage && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl flex items-center gap-3 text-emerald-300 text-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-medium">{importSuccessMessage}</span>
        </div>
      )}

      {/* Instructions & Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>Cole o texto da página do iFood ou o link da sua loja:</span>
          <button
            type="button"
            onClick={handleQuickPasteSample}
            className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
          >
            Preencher texto do iFood da Taverna
          </button>
        </div>

        <textarea
          rows={5}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full p-3.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono leading-relaxed"
          placeholder="Exemplo: Cole o link do iFood ou o texto copiado da página (Taverna - Porto Velho - RO, O Ogro, O Alquimista, Combos, etc.)..."
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <p className="text-[11px] text-stone-500">
            Dica: No iFood, selecione o cardápio com <kbd className="px-1 py-0.5 bg-stone-800 rounded text-stone-300">Ctrl+A</kbd> e <kbd className="px-1 py-0.5 bg-stone-800 rounded text-stone-300">Ctrl+C</kbd>, depois cole acima.
          </p>

          <button
            onClick={handleAnalyze}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-black uppercase tracking-wider text-stone-950 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Processar Dados do iFood</span>
          </button>
        </div>
      </div>

      {/* Store Metadata Card */}
      {storeMeta && (
        <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500" /> Estabelecimento
            </span>
            <p className="font-extrabold text-stone-200">{storeMeta.nomeLoja}</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-500" /> Cidade
            </span>
            <p className="font-extrabold text-stone-200">{storeMeta.cidade} - {storeMeta.estado}</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-amber-500" /> Pedido Mínimo
            </span>
            <p className="font-extrabold text-amber-400">R$ {storeMeta.pedidoMinimo.toFixed(2)}</p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-stone-500 uppercase font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-500" /> Horário
            </span>
            <p className="font-extrabold text-emerald-400">{storeMeta.horarioAbertura}</p>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {parsedPreview.length > 0 && (
        <div className="p-4 bg-stone-950/80 border border-stone-800 rounded-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-stone-800/80 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-200">
                Itens Identificados no iFood ({parsedPreview.length})
              </span>
              <span className="text-[10px] text-amber-400 font-mono px-2 py-0.5 bg-amber-950/60 rounded border border-amber-800/60">
                {selectedItems.size} selecionados
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDiscardAllPreviewPhotos}
                className="text-xs text-rose-400 hover:text-rose-300 underline font-medium flex items-center gap-1"
                title="Descartar fotos para importar apenas os nomes, descrições e preços limpos"
              >
                <ImageOff className="w-3.5 h-3.5" />
                <span>Descartar Fotos da Cópia</span>
              </button>

              <button
                onClick={handleToggleSelectAll}
                className="text-xs text-stone-400 hover:text-stone-200 underline"
              >
                {selectedItems.size === parsedPreview.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {parsedPreview.map((item, idx) => {
              const isSelected = selectedItems.has(idx);

              return (
                <div
                  key={idx}
                  onClick={() => handleToggleItem(idx)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-stone-900 border-amber-600/40 text-stone-100 shadow-sm'
                      : 'bg-stone-900/40 border-stone-800/60 text-stone-400 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleItem(idx)}
                      className="rounded accent-amber-500 cursor-pointer shrink-0"
                    />

                    {item.imagemUrl ? (
                      <div className="relative group shrink-0" title="Clique no X para remover esta foto">
                        <img 
                          src={item.imagemUrl} 
                          alt={item.nome}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover border border-stone-800" 
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhotoFromItem(idx);
                          }}
                          className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-0.5 shadow text-[9px]"
                          title="Remover foto deste item"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-center shrink-0 text-stone-600" title="Item sem foto">
                        <ImageOff className="w-4 h-4" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="font-bold text-stone-100 flex items-center gap-2">
                        <span className="truncate">{item.nome}</span>
                        {item.destaque && (
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 shrink-0">
                            Destaque
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 truncate mt-0.5">
                        {item.descricao || item.categoriaOrigem}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="font-mono font-black text-amber-400 text-sm">
                      R$ {item.precoVenda.toFixed(2)}
                    </span>
                    {item.precoOriginal && (
                      <span className="block text-[10px] text-stone-500 line-through font-mono">
                        R$ {item.precoOriginal.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setParsedPreview([]);
                setStoreMeta(null);
              }}
              className="px-3 py-1.5 text-xs text-stone-400 hover:text-stone-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={selectedItems.size === 0}
              className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-stone-950 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Sincronizar {selectedItems.size} Itens na Taverna</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
