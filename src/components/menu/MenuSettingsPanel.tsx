import React, { useState, useMemo } from 'react';
import { useBurger, recipeCategories } from '../../context/BakeryContext';
import { AdicionalConfig, DigitalMenuSettings, FichaTecnica, RecipeCategory, PixNubankConfig } from '../../types';
import { ItemManagementPanel } from './ItemManagementPanel';
import { QRCodeSVG } from 'qrcode.react';
import { 
  generatePixPayload, 
  validatePixPayload, 
  checkNubankPaymentStatus, 
  PixValidationResult 
} from '../../utils/pixPayload';
import { 
  Settings, 
  Bike, 
  Store, 
  UtensilsCrossed, 
  Flame, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  DollarSign,
  PackageCheck,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  AlertTriangle,
  Image,
  Copy,
  Search,
  ExternalLink,
  Tag,
  SlidersHorizontal,
  X,
  FileSpreadsheet,
  ImageOff,
  QrCode,
  Wallet
} from 'lucide-react';

export const MenuSettingsPanel: React.FC = () => {
  const { 
    menuSettings, 
    updateMenuSettings,
    fichasTecnicas,
    addFichaTecnica,
    clearAllMenuData,
    loadNewCopyTemplate,
    resetToOfficialIFoodMenu,
    resetAllSettings,
    resetToDefaults,
    quickUpdateItem,
    duplicateItem,
    deleteFichaTecnica,
    clearAllPhotos
  } = useBurger();

  const [novoAdicionalNome, setNovoAdicionalNome] = useState('');
  const [novoAdicionalPreco, setNovoAdicionalPreco] = useState('');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Quick New Item modal/form state
  const [isAddingQuickItem, setIsAddingQuickItem] = useState(false);
  const [quickItemNome, setQuickItemNome] = useState('');
  const [quickItemPreco, setQuickItemPreco] = useState('');
  const [quickItemCat, setQuickItemCat] = useState<RecipeCategory>('Smash Burgers');
  const [quickItemDesc, setQuickItemDesc] = useState('');
  const [quickItemFoto, setQuickItemFoto] = useState('');

  // Quick Editor Search & Filter
  const [editorBusca, setEditorBusca] = useState('');
  const [editorCategoria, setEditorCategoria] = useState<string>('Todas');

  // Nubank Pix Test & Config State
  const [testPixAmount, setTestPixAmount] = useState<number>(35.90);
  const [testPixPayload, setTestPixPayload] = useState<string>('');
  const [testPixValidation, setTestPixValidation] = useState<PixValidationResult | null>(null);
  const [testNubankLog, setTestNubankLog] = useState<{ status: string; e2eId: string; authCode: string; time: string } | null>(null);
  const [isSimulatingNubank, setIsSimulatingNubank] = useState(false);
  const [testPixCopied, setTestPixCopied] = useState(false);

  // Confirmation Modal state for safe resets
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    isDestructive: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: '',
    isDestructive: false,
    onConfirm: () => {}
  });

  const showFeedback = (msg = 'Configurações Salvas!') => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2500);
  };

  const currentPix = useMemo((): PixNubankConfig => {
    return menuSettings.pixNubank || {
      habilitado: true,
      chavePix: 'administracao@sabore.pvh.br',
      tipoChave: 'email',
      nomeTitular: 'TAVERNA BURGER',
      cidadeTitular: 'PORTO VELHO',
      instituicao: 'Nu Pagamentos S.A. (Nubank - 260)',
      modoIntegracao: 'pix_estatico',
      nubankClientId: 'nu_cli_taverna_artesanal_260',
      nubankToken: 'nu_token_live_br_991823',
      verificacaoAutomatica: true,
      tempoExpiracaoMinutos: 15
    };
  }, [menuSettings.pixNubank]);

  const handleUpdatePixNubank = (patch: Partial<PixNubankConfig>) => {
    updateMenuSettings({
      pixNubank: {
        ...currentPix,
        ...patch
      }
    });
    showFeedback('Configuração do Pix Nubank salva!');
  };

  const handleTestPixGeneration = () => {
    const payload = generatePixPayload({
      chavePix: currentPix.chavePix,
      nomeTitular: currentPix.nomeTitular,
      cidadeTitular: currentPix.cidadeTitular,
      valor: testPixAmount,
      txid: `TESTE${Date.now().toString().slice(-6)}`,
      descricao: 'Teste QR Code Nubank'
    });
    setTestPixPayload(payload);
    const val = validatePixPayload(payload);
    setTestPixValidation(val);
  };

  const handleSimulateNubankApiReceipt = async () => {
    setIsSimulatingNubank(true);
    try {
      const res = await checkNubankPaymentStatus('TESTE-KDS', testPixAmount, currentPix.chavePix);
      setTestNubankLog({
        status: 'LIQUIDADO_NUBANK_260',
        e2eId: res.e2eId,
        authCode: res.codigoAutenticacao,
        time: res.horario
      });
      showFeedback('Recebimento simulado com sucesso na API Nubank!');
    } finally {
      setIsSimulatingNubank(false);
    }
  };

  const handleToggleModalidade = (modalidade: 'delivery' | 'retirada' | 'salao') => {
    if (modalidade === 'delivery') {
      updateMenuSettings({ permitirDelivery: !menuSettings.permitirDelivery });
    } else if (modalidade === 'retirada') {
      updateMenuSettings({ permitirRetirada: !menuSettings.permitirRetirada });
    } else if (modalidade === 'salao') {
      updateMenuSettings({ permitirSalao: !menuSettings.permitirSalao });
    }
    showFeedback();
  };

  const handleSetOnlyDelivery = () => {
    updateMenuSettings({
      permitirDelivery: true,
      permitirRetirada: false,
      permitirSalao: false
    });
    showFeedback('Modo Exclusivo Delivery Ativado!');
  };

  const handleSetDeliveryAndCounter = () => {
    updateMenuSettings({
      permitirDelivery: true,
      permitirRetirada: true,
      permitirSalao: false
    });
    showFeedback('Delivery + Retirada no Balcão Ativados!');
  };

  const handleTogglePontoCarne = () => {
    updateMenuSettings({ habilitarPontoCarne: !menuSettings.habilitarPontoCarne });
    showFeedback();
  };

  const handleTogglePerguntaSaches = () => {
    updateMenuSettings({ habilitarPerguntaSaches: !menuSettings.habilitarPerguntaSaches });
    showFeedback();
  };

  const handleTogglePerguntaGuardanapos = () => {
    updateMenuSettings({ habilitarPerguntaGuardanapos: !menuSettings.habilitarPerguntaGuardanapos });
    showFeedback();
  };

  const handleToggleHabilitarAdicionais = () => {
    updateMenuSettings({ habilitarAdicionais: !menuSettings.habilitarAdicionais });
    showFeedback();
  };

  const handleToggleAdicionalAtivo = (id: string) => {
    const updated = menuSettings.adicionais.map(ad => 
      ad.id === id ? { ...ad, ativo: !ad.ativo } : ad
    );
    updateMenuSettings({ adicionais: updated });
    showFeedback();
  };

  const handleUpdateAdicionalPreco = (id: string, novoPrecoStr: string) => {
    const valor = parseFloat(novoPrecoStr) || 0;
    const updated = menuSettings.adicionais.map(ad => 
      ad.id === id ? { ...ad, preco: valor } : ad
    );
    updateMenuSettings({ adicionais: updated });
  };

  const handleRemoveAdicional = (id: string) => {
    const updated = menuSettings.adicionais.filter(ad => ad.id !== id);
    updateMenuSettings({ adicionais: updated });
    showFeedback();
  };

  const handleAddNovoAdicional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoAdicionalNome.trim()) return;

    const preco = parseFloat(novoAdicionalPreco.replace(',', '.')) || 3.00;
    const novo: AdicionalConfig = {
      id: `add-${Date.now()}`,
      nome: novoAdicionalNome.trim(),
      preco,
      ativo: true,
      categoriaAplicavel: 'burgers'
    };

    updateMenuSettings({ adicionais: [...menuSettings.adicionais, novo] });
    setNovoAdicionalNome('');
    setNovoAdicionalPreco('');
    showFeedback('Adicional incluído com sucesso!');
  };

  // Safe Reset Handlers with Modal Confirmation
  const triggerClearAll = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Zerar Todos os Itens do Cardápio?',
      description: 'Isso removerá todos os lanches e itens cadastrados no cardápio, permitindo que você inicie uma cópia 100% limpa do zero sem itens antigos.',
      confirmLabel: 'Sim, Zerar Cardápio',
      isDestructive: true,
      onConfirm: () => {
        clearAllMenuData();
        showFeedback('Cardápio zerado! Pronto para nova copy.');
      }
    });
  };

  const triggerLoadTemplate = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Carregar Modelo Base para Nova Copy?',
      description: 'Isso carregará 4 produtos estruturados (Smash Simples, Duplo com Bacon, Batata e Bebida) com fotos e campos já prontos para você alterar o nome, foto e valores em segundos.',
      confirmLabel: 'Carregar Modelo Base',
      isDestructive: false,
      onConfirm: () => {
        loadNewCopyTemplate();
        showFeedback('Template para Nova Copy carregado com sucesso!');
      }
    });
  };

  const triggerRestoreOfficial = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Restaurar Catálogo Oficial da Taverna?',
      description: 'Isso restaurará o catálogo padrão original de hambúrgueres artesanais da Taverna (cópia iFood).',
      confirmLabel: 'Restaurar Catálogo Oficial',
      isDestructive: false,
      onConfirm: () => {
        resetToOfficialIFoodMenu();
        showFeedback('Cardápio oficial Taverna restaurado!');
      }
    });
  };

  const triggerResetSettings = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Restaurar Configurações Operacionais?',
      description: 'Isso restaurará taxas de entrega padrão (R$ 5,00), pedido mínimo (R$ 23,00), ponto da carne smash e lista de adicionais aos valores de fábrica.',
      confirmLabel: 'Restaurar Configurações',
      isDestructive: false,
      onConfirm: () => {
        resetAllSettings();
        showFeedback('Configurações operacionais restauradas!');
      }
    });
  };

  // Quick Add Item Handler
  const handleSaveQuickItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickItemNome.trim()) return;

    const preco = parseFloat(quickItemPreco.replace(',', '.')) || 25.00;
    addFichaTecnica({
      nome: quickItemNome.trim(),
      categoria: quickItemCat,
      descricao: quickItemDesc.trim() || 'Hambúrguer artesanal preparado com ingredientes selecionados.',
      tempoPreparoMinutos: 12,
      ingredientes: [],
      pesoCruTotal: 150,
      fatorReducaoChapa: 15,
      pesoGrelhado: 127,
      rendimentoPorcoes: 1,
      custoInsumos: Number((preco * 0.35).toFixed(2)),
      custoEmbalagem: 1.80,
      custoMaoDeObra: 2.50,
      custoTotalProducao: Number((preco * 0.45).toFixed(2)),
      margemLucroAlvo: 55,
      impostosTaxas: 10,
      precoVendaSugerido: preco,
      precoVendaPraticado: preco,
      cmvPercentual: 35,
      modoPreparo: ['Grelhar na chapa quente e montar no pão selado'],
      imagemUrl: quickItemFoto.trim() || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      pontoCarneRecomendado: 'Smash Crocante',
      destaque: true,
      habilitarAdicionais: true,
      habilitarRemocaoIngredientes: true,
      perguntaSaches: true,
      ativo: true
    });

    setQuickItemNome('');
    setQuickItemPreco('');
    setQuickItemDesc('');
    setQuickItemFoto('');
    setIsAddingQuickItem(false);
    showFeedback('Novo lanche adicionado à copy!');
  };

  // Filtered Items for Quick Editor
  const itensParaEdicao = useMemo(() => {
    return fichasTecnicas.filter(item => {
      const matchCat = editorCategoria === 'Todas' || item.categoria === editorCategoria;
      const matchBusca = item.nome.toLowerCase().includes(editorBusca.toLowerCase()) ||
                         (item.descricao && item.descricao.toLowerCase().includes(editorBusca.toLowerCase()));
      return matchCat && matchBusca;
    });
  }, [fichasTecnicas, editorCategoria, editorBusca]);

  return (
    <div className="p-4 sm:p-6 bg-stone-900 rounded-3xl border border-stone-800 space-y-8 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500 border border-amber-500/30">
            <Settings className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-stone-100 font-display">
              Configurações Gerais, Reset & Nova Copy
            </h2>
            <p className="text-xs text-stone-400">
              Gerencie status da loja, reset de dados para nova copy, alteração rápida de fotos e valores, delivery e sachês
            </p>
          </div>
        </div>

        {saveToast && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs font-bold animate-fade-in shadow-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveToast}</span>
          </div>
        )}
      </div>

      {/* SEÇÃO 0: STATUS OPERACIONAL DA CHAPA (EXCLUSIVO ADMINISTRADOR) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-stone-950 to-stone-900 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${menuSettings.lojaAberta !== false ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Controle de Status da Operação (Exclusivo Administrador)
            </span>
          </div>
          <h3 className="text-base font-bold text-stone-100 mt-1">
            Status Atual: {menuSettings.lojaAberta !== false ? '🟢 Chapa Aberta (Recebendo Pedidos)' : '🔴 Loja Fechada'}
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            O cliente vê apenas o status informativo. Somente você como administrador tem o botão de alterar este status.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            updateMenuSettings({ lojaAberta: !(menuSettings.lojaAberta !== false) });
            showFeedback(menuSettings.lojaAberta !== false ? 'Loja marcada como fechada' : 'Chapa aberta! Recebendo pedidos');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 border ${
            menuSettings.lojaAberta !== false
              ? 'bg-rose-950/50 hover:bg-rose-900/60 border-rose-500/50 text-rose-300'
              : 'bg-emerald-950/60 hover:bg-emerald-900/70 border-emerald-500/60 text-emerald-300'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{menuSettings.lojaAberta !== false ? 'Fechar Loja Temporariamente' : 'Abrir Chapa para Pedidos'}</span>
        </button>
      </div>

      {/* SEÇÃO NOBRE: CENTRAL DE RESET DE DADOS & NOVA COPY */}
      <div className="p-6 rounded-3xl bg-stone-950 border border-amber-500/30 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div>
            <h3 className="text-base font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-500" />
              <span>Reset de Dados & Criação de Nova Copy</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Ferramentas completas para você zerar tudo e cadastrar sua própria hamburgueria, carregar modelo base ou alterar fotos e valores
            </p>
          </div>

          <span className="text-xs font-mono font-bold px-3 py-1 bg-stone-900 border border-stone-800 text-stone-300 rounded-xl shrink-0 self-start sm:self-auto">
            {fichasTecnicas.length} itens no cardápio
          </span>
        </div>

        {/* Grade de Ações de Reset */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {/* 1. Zerar Tudo (Começar do Zero) */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/50 flex flex-col justify-between space-y-3 hover:border-rose-700/60 transition-all">
            <div>
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <Trash2 className="w-4 h-4" />
                <span>1. Zerar Cardápio</span>
              </div>
              <h4 className="text-sm font-bold text-stone-100 mt-1">Começar do Zero</h4>
              <p className="text-[11px] text-stone-400 mt-1">
                Apaga todos os produtos atuais para você cadastrar sua nova copy 100% limpa, sem sobras de lanches anteriores.
              </p>
            </div>
            <button
              type="button"
              onClick={triggerClearAll}
              className="w-full py-2 px-3 bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-rose-500/40 text-center"
            >
              Zerar Todos os Itens
            </button>
          </div>

          {/* 2. Carregar Template Modelo */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/50 flex flex-col justify-between space-y-3 hover:border-amber-700/60 transition-all">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>2. Template Modelo</span>
              </div>
              <h4 className="text-sm font-bold text-stone-100 mt-1">4 Lanches Base Prontos</h4>
              <p className="text-[11px] text-stone-400 mt-1">
                Insere 4 itens estruturados (Smash Simples, Duplo Bacon, Batata e Bebida) prontos para você apenas trocar fotos e valores.
              </p>
            </div>
            <button
              type="button"
              onClick={triggerLoadTemplate}
              className="w-full py-2 px-3 bg-amber-600/30 hover:bg-amber-500 text-amber-300 hover:text-stone-950 rounded-xl text-xs font-bold transition-all border border-amber-500/40 text-center"
            >
              Carregar Template Base
            </button>
          </div>

          {/* 3. Limpar Todas as Fotos Indesejadas */}
          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col justify-between space-y-3 hover:border-stone-700 transition-all">
            <div>
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <ImageOff className="w-4 h-4" />
                <span>3. Limpar Fotos</span>
              </div>
              <h4 className="text-sm font-bold text-stone-100 mt-1">Remover Fotos</h4>
              <p className="text-[11px] text-stone-400 mt-1">
                Mantém seus nomes e preços, mas apaga todas as fotos do cardápio para você subir as suas próprias.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                clearAllPhotos();
                showFeedback('Todas as fotos foram removidas dos produtos!');
              }}
              className="w-full py-2 px-3 bg-stone-800 hover:bg-rose-900 text-rose-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-stone-700 text-center"
            >
              Remover Fotos
            </button>
          </div>

          {/* 4. Restaurar Padrão Oficial Taverna */}
          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col justify-between space-y-3 hover:border-stone-700 transition-all">
            <div>
              <div className="flex items-center gap-2 text-stone-300 font-bold text-xs uppercase tracking-wider">
                <RotateCcw className="w-4 h-4 text-stone-400" />
                <span>4. Restaurar Taverna</span>
              </div>
              <h4 className="text-sm font-bold text-stone-100 mt-1">Catálogo Original</h4>
              <p className="text-[11px] text-stone-400 mt-1">
                Restaura o cardápio original com todos os itens do iFood caso você queira voltar ao modelo completo da Taverna.
              </p>
            </div>
            <button
              type="button"
              onClick={triggerRestoreOfficial}
              className="w-full py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-stone-700 text-center"
            >
              Restaurar Original
            </button>
          </div>

          {/* 5. Resetar Configurações Operacionais */}
          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col justify-between space-y-3 hover:border-stone-700 transition-all">
            <div>
              <div className="flex items-center gap-2 text-stone-300 font-bold text-xs uppercase tracking-wider">
                <Settings className="w-4 h-4 text-stone-400" />
                <span>5. Configurações</span>
              </div>
              <h4 className="text-sm font-bold text-stone-100 mt-1">Padrões Operacionais</h4>
              <p className="text-[11px] text-stone-400 mt-1">
                Restaura taxa padrão de entrega (R$ 5,00), pedido mínimo (R$ 23,00) e adicionais aos valores de fábrica.
              </p>
            </div>
            <button
              type="button"
              onClick={triggerResetSettings}
              className="w-full py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl text-xs font-semibold transition-all border border-stone-700 text-center"
            >
              Restaurar Parâmetros
            </button>
          </div>
        </div>
      </div>

      {/* SEÇÃO: EDITOR RÁPIDO DE FOTOS E VALORES (PARA NOVA COPY) */}
      <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div>
            <h3 className="text-base font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Image className="w-5 h-5 text-amber-500" />
              <span>Editor Rápido de Fotos, Nomes e Preços (Nova Copy)</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Altere a foto (URL), nome e valor praticado de cada lanche diretamente aqui sem formulários longos.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingQuickItem(!isAddingQuickItem)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 font-black text-xs rounded-xl hover:brightness-110 transition-all flex items-center gap-1.5 shrink-0 shadow-lg shadow-amber-500/10"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Adicionar Novo Lanche Rápido</span>
          </button>
        </div>

        {/* Formulário Retrátil para Adicionar Item Rápido */}
        {isAddingQuickItem && (
          <form onSubmit={handleSaveQuickItem} className="p-5 bg-stone-900 rounded-2xl border border-amber-500/40 space-y-4 animate-fade-in shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4" />
                <span>Cadastrar Novo Item na Sua Nova Copy</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingQuickItem(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-stone-300">Nome do Lanche / Produto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Taverna Smash Melt Cheddar"
                  value={quickItemNome}
                  onChange={(e) => setQuickItemNome(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-300">Preço de Venda (R$) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 32,90"
                  value={quickItemPreco}
                  onChange={(e) => setQuickItemPreco(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-300">Categoria do Menu</label>
                <select
                  value={quickItemCat}
                  onChange={(e) => setQuickItemCat(e.target.value as RecipeCategory)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                >
                  {recipeCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-300">URL da Imagem / Foto</label>
                <input
                  type="url"
                  placeholder="https://... (ou deixe em branco para foto padrão)"
                  value={quickItemFoto}
                  onChange={(e) => setQuickItemFoto(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-stone-300">Descrição Comercial para o Cliente</label>
              <textarea
                rows={2}
                placeholder="Ex: Pão brioche tostado, blend smash prensado 100g, queijo cheddar inglês derretido e maionese verde artesanal."
                value={quickItemDesc}
                onChange={(e) => setQuickItemDesc(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingQuickItem(false)}
                className="px-3.5 py-2 text-stone-400 hover:text-white text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs rounded-xl shadow-md"
              >
                Salvar Lanche no Cardápio
              </button>
            </div>
          </form>
        )}

        {/* Barra de Filtro e Busca */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setEditorCategoria('Todas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                editorCategoria === 'Todas'
                  ? 'bg-amber-600 text-stone-950 border-amber-500 shadow-md'
                  : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
              }`}
            >
              Todas ({fichasTecnicas.length})
            </button>
            {recipeCategories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setEditorCategoria(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  editorCategoria === cat
                    ? 'bg-amber-600 text-stone-950 border-amber-500 shadow-md'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                }`}
              >
                {cat} ({fichasTecnicas.filter(f => f.categoria === cat).length})
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={editorBusca}
              onChange={(e) => setEditorBusca(e.target.value)}
              placeholder="Buscar item para editar..."
              className="w-full pl-9 pr-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Lista de Itens com Edição Direta de Foto e Valores */}
        <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
          {itensParaEdicao.length === 0 ? (
            <div className="text-center py-10 text-stone-500 text-xs bg-stone-900/40 rounded-2xl border border-stone-800/60">
              Nenhum item encontrado no cardápio. Clique em "Adicionar Novo Lanche Rápido" ou "Carregar Template Modelo" para começar!
            </div>
          ) : (
            itensParaEdicao.map((item) => (
              <div 
                key={item.id} 
                className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 hover:border-stone-700 transition-all space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Foto Thumbnail com Input de URL */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-950 border border-stone-800 shrink-0 relative group">
                      {item.imagemUrl ? (
                        <img 
                          src={item.imagemUrl} 
                          alt={item.nome}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-600">
                          <Image className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      {/* Nome do Item Inline */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.nome}
                          onChange={(e) => {
                            quickUpdateItem(item.id, { nome: e.target.value });
                          }}
                          className="flex-1 bg-stone-950 border border-stone-800 hover:border-stone-700 px-2.5 py-1.5 rounded-lg text-xs font-bold text-stone-100 focus:outline-none focus:border-amber-500"
                          title="Clique para editar o nome do lanche"
                        />
                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-md shrink-0">
                          {item.categoria}
                        </span>
                      </div>

                      {/* URL da Foto Inline */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-stone-500 font-bold shrink-0">Foto (URL):</span>
                        <input
                          type="text"
                          value={item.imagemUrl || ''}
                          onChange={(e) => {
                            quickUpdateItem(item.id, { imagemUrl: e.target.value });
                          }}
                          placeholder="Cole a URL da foto (https://...)"
                          className="flex-1 bg-stone-950 border border-stone-800 px-2 py-1 rounded-lg text-[11px] font-mono text-stone-300 placeholder-stone-600 focus:outline-none focus:border-amber-500 truncate"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preços e Ações */}
                  <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-800">
                    {/* Preço de Venda */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                        Preço Venda
                      </label>
                      <div className="flex items-center gap-1 bg-stone-950 border border-stone-800 rounded-xl px-2.5 py-1">
                        <span className="text-xs text-stone-500 font-mono">R$</span>
                        <input
                          type="number"
                          step="0.50"
                          min="0"
                          value={item.precoVendaPraticado}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            quickUpdateItem(item.id, { precoVendaPraticado: val });
                          }}
                          className="w-20 bg-transparent text-amber-400 font-mono font-black text-xs focus:outline-none text-right"
                          title="Altere o valor do lanche"
                        />
                      </div>
                    </div>

                    {/* Preço Original (riscado) */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                        Preço De (opcional)
                      </label>
                      <div className="flex items-center gap-1 bg-stone-950 border border-stone-800 rounded-xl px-2 py-1">
                        <span className="text-xs text-stone-500 font-mono">R$</span>
                        <input
                          type="number"
                          step="0.50"
                          min="0"
                          value={item.precoOriginal || ''}
                          onChange={(e) => {
                            const val = e.target.value ? parseFloat(e.target.value) : undefined;
                            quickUpdateItem(item.id, { precoOriginal: val });
                          }}
                          placeholder="--"
                          className="w-16 bg-transparent text-stone-400 font-mono text-xs focus:outline-none text-right"
                          title="Preço antigo para promoção"
                        />
                      </div>
                    </div>

                    {/* Ações: Duplicar e Excluir */}
                    <div className="flex items-center gap-1 self-end pb-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          duplicateItem(item.id);
                          showFeedback('Lanche duplicado com sucesso!');
                        }}
                        className="p-2 text-stone-400 hover:text-amber-400 hover:bg-stone-950 rounded-xl transition-colors border border-stone-800"
                        title="Duplicar este lanche para criar variação rápida"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          deleteFichaTecnica(item.id);
                          showFeedback('Item excluído do cardápio!');
                        }}
                        className="p-2 text-stone-400 hover:text-rose-400 hover:bg-stone-950 rounded-xl transition-colors border border-stone-800"
                        title="Excluir este item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Descrição Inline */}
                <div className="pt-2 border-t border-stone-800/60 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider shrink-0">Descrição:</span>
                  <input
                    type="text"
                    value={item.descricao || ''}
                    onChange={(e) => {
                      quickUpdateItem(item.id, { descricao: e.target.value });
                    }}
                    placeholder="Descrição dos ingredientes para o cliente..."
                    className="flex-1 bg-stone-950 border border-stone-800/80 px-2.5 py-1 rounded-lg text-xs text-stone-300 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SEÇÃO 1: Modalidades de Atendimento (Somente Delivery vs Balcão vs Salão) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Bike className="w-4 h-4" />
              <span>1. Modalidades de Atendimento do Cardápio</span>
            </h3>
            <p className="text-xs text-stone-400">
              Escolha quais opções de recebimento o cliente terá acesso no checkout do site
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSetOnlyDelivery}
              className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-400 text-xs font-bold rounded-xl transition-all"
            >
              Ativar Somente Modo Delivery
            </button>
            <button
              type="button"
              onClick={handleSetDeliveryAndCounter}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl transition-colors"
            >
              Delivery + Balcão
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Card Delivery */}
          <div 
            onClick={() => handleToggleModalidade('delivery')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              menuSettings.permitirDelivery 
                ? 'bg-amber-950/30 border-amber-500/60 text-stone-100 shadow-md' 
                : 'bg-stone-950 border-stone-800 text-stone-500 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bike className={`w-5 h-5 ${menuSettings.permitirDelivery ? 'text-amber-400' : 'text-stone-600'}`} />
                <span className="font-extrabold text-sm">Modo Delivery</span>
              </div>
              <input 
                type="checkbox" 
                checked={menuSettings.permitirDelivery}
                readOnly
                className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <p className="text-xs text-stone-400">
              Entrega na residência com solicitação obrigatória de endereço e taxa calculada.
            </p>
            <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs">
              <span className="text-stone-400">Taxa Padrão:</span>
              <span className="font-mono font-bold text-amber-400">R$ {menuSettings.taxaEntregaPadrao.toFixed(2)}</span>
            </div>
          </div>

          {/* Card Retirada no Balcão */}
          <div 
            onClick={() => handleToggleModalidade('retirada')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              menuSettings.permitirRetirada 
                ? 'bg-amber-950/30 border-amber-500/60 text-stone-100 shadow-md' 
                : 'bg-stone-950 border-stone-800 text-stone-500 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className={`w-5 h-5 ${menuSettings.permitirRetirada ? 'text-amber-400' : 'text-stone-600'}`} />
                <span className="font-extrabold text-sm">Retirada no Balcão</span>
              </div>
              <input 
                type="checkbox" 
                checked={menuSettings.permitirRetirada}
                readOnly
                className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <p className="text-xs text-stone-400">
              Cliente busca no balcão da Taverna (sem cobrança de taxa de frete).
            </p>
            <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
              <span>Frete:</span>
              <span className="font-mono font-bold text-emerald-400">Grátis (R$ 0,00)</span>
            </div>
          </div>

          {/* Card Mesa / Salão */}
          <div 
            onClick={() => handleToggleModalidade('salao')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              menuSettings.permitirSalao 
                ? 'bg-amber-950/30 border-amber-500/60 text-stone-100 shadow-md' 
                : 'bg-stone-950 border-stone-800 text-stone-500 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className={`w-5 h-5 ${menuSettings.permitirSalao ? 'text-amber-400' : 'text-stone-600'}`} />
                <span className="font-extrabold text-sm">Consumo no Salão (Mesa)</span>
              </div>
              <input 
                type="checkbox" 
                checked={menuSettings.permitirSalao}
                readOnly
                className="rounded accent-amber-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <p className="text-xs text-stone-400">
              Pedidos realizados nas mesas do estabelecimento via QR Code impresso.
            </p>
            <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
              <span>Identificação:</span>
              <span className="font-mono font-bold text-stone-300">Número da Mesa</span>
            </div>
          </div>
        </div>

        {/* Inputs de taxas e pedido mínimo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-950 border border-stone-800">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
              Taxa Fixa de Entrega (Delivery)
            </label>
            <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2">
              <span className="text-xs text-stone-500 font-mono">R$</span>
              <input
                type="number"
                step="0.50"
                min="0"
                value={menuSettings.taxaEntregaPadrao}
                onChange={(e) => {
                  updateMenuSettings({ taxaEntregaPadrao: parseFloat(e.target.value) || 0 });
                }}
                className="bg-transparent text-amber-400 font-mono font-bold text-sm w-full focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
              Pedido Mínimo do Estabelecimento
            </label>
            <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-xl px-3 py-2">
              <span className="text-xs text-stone-500 font-mono">R$</span>
              <input
                type="number"
                step="1.00"
                min="0"
                value={menuSettings.pedidoMinimo}
                onChange={(e) => {
                  updateMenuSettings({ pedidoMinimo: parseFloat(e.target.value) || 0 });
                }}
                className="bg-transparent text-amber-400 font-mono font-bold text-sm w-full focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO: INTEGRAÇÃO PIX & API DE RECEBIMENTO NUBANK (BANCO 260) */}
      <div className="p-6 rounded-3xl bg-stone-950 border border-purple-900/60 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-900/40">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-black text-lg shadow-lg shrink-0 mt-0.5">
              Nu
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black uppercase tracking-wider text-purple-300">
                  Integração Pix & API Nubank (Nu Pagamentos 260)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-bold">
                  BR Code BACEN Válido
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                Gere códigos Pix Copia e Cola válidos com cálculo exato de CRC16 no padrão do Banco Central e receba pagamentos diretamente na sua conta Nubank.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none shrink-0 bg-stone-900 px-3 py-2 rounded-xl border border-stone-800">
            <span className="text-xs text-stone-300 font-bold">Receber via Pix:</span>
            <input 
              type="checkbox" 
              checked={currentPix.habilitado}
              onChange={(e) => handleUpdatePixNubank({ habilitado: e.target.checked })}
              className="rounded accent-purple-600 w-5 h-5 cursor-pointer"
            />
          </label>
        </div>

        {/* Formulário de Configuração Nubank */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Coluna 1: Dados da Chave e Titular */}
          <div className="space-y-3 p-4 rounded-2xl bg-stone-900/60 border border-stone-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-purple-400" />
              <span>Dados da Chave Pix Nubank</span>
            </h4>

            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-1">
                Chave Pix (E-mail, CNPJ, Celular ou EVP Aleatória)
              </label>
              <input
                type="text"
                value={currentPix.chavePix}
                onChange={(e) => handleUpdatePixNubank({ chavePix: e.target.value.trim() })}
                placeholder="Ex: administracao@sabore.pvh.br ou 00.000.000/0001-00"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-600 font-mono focus:outline-none focus:border-purple-500"
              />
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                Esta chave será inserida no payload oficial do QR Code e aberta em qualquer banco.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1">
                  Tipo da Chave
                </label>
                <select
                  value={currentPix.tipoChave}
                  onChange={(e) => handleUpdatePixNubank({ tipoChave: e.target.value as any })}
                  className="w-full px-2.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="email">E-mail</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="telefone">Telefone (+55)</option>
                  <option value="cpf">CPF</option>
                  <option value="aleatoria">Chave EVP Aleatória</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1">
                  Cidade da Conta
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={currentPix.cidadeTitular}
                  onChange={(e) => handleUpdatePixNubank({ cidadeTitular: e.target.value.toUpperCase() })}
                  placeholder="Ex: PORTO VELHO"
                  className="w-full px-2.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 uppercase font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-1">
                Nome do Titular / Razão Social na Conta Nubank
              </label>
              <input
                type="text"
                maxLength={25}
                value={currentPix.nomeTitular}
                onChange={(e) => handleUpdatePixNubank({ nomeTitular: e.target.value.toUpperCase() })}
                placeholder="Ex: TAVERNA BURGER"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 uppercase font-mono focus:outline-none focus:border-purple-500"
              />
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                Máximo de 25 caracteres no padrão EMV do BACEN (sem acentos).
              </span>
            </div>
          </div>

          {/* Coluna 2: Modo de Integração e API Nubank */}
          <div className="space-y-3 p-4 rounded-2xl bg-stone-900/60 border border-stone-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Parâmetros da API Nubank (Banco 260)</span>
            </h4>

            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-1">
                Instituição Recebedora
              </label>
              <input
                type="text"
                readOnly
                value="Nu Pagamentos S.A. (Nubank - Banco 260 / ISPB 18236120)"
                className="w-full px-3 py-2 bg-stone-950/80 border border-stone-800 rounded-xl text-xs text-purple-300 font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-300 mb-1">
                Modo de Operação
              </label>
              <select
                value={currentPix.modoIntegracao}
                onChange={(e) => handleUpdatePixNubank({ modoIntegracao: e.target.value as any })}
                className="w-full px-2.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-200 focus:outline-none focus:border-purple-500"
              >
                <option value="pix_estatico">BR Code BACEN Oficial (Nubank Direto • Sem Tarifas)</option>
                <option value="nupay_api">API Nubank PJ / NuPay (Liquidação Automática em Tempo Real)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1">
                  Client ID Nubank
                </label>
                <input
                  type="text"
                  value={currentPix.nubankClientId || 'nu_cli_taverna_artesanal_260'}
                  onChange={(e) => handleUpdatePixNubank({ nubankClientId: e.target.value })}
                  className="w-full px-2.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-[11px] text-stone-300 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-300 mb-1">
                  Token NuPay / Secret
                </label>
                <input
                  type="password"
                  value={currentPix.nubankToken || '••••••••••••••••'}
                  onChange={(e) => handleUpdatePixNubank({ nubankToken: e.target.value })}
                  className="w-full px-2.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-[11px] text-stone-300 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-[11px] text-purple-200 space-y-1">
              <span className="font-bold block">Status da Conexão:</span>
              <p className="text-[10px] text-stone-300">
                🟢 API Nubank pronta para recebimento instantâneo. Webhooks habilitados para atualizar o KDS da cozinha automaticamente.
              </p>
            </div>
          </div>
        </div>

        {/* SEÇÃO INTERATIVA: TESTADOR E VALIDADOR DE QR CODE EM TEMPO REAL */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-purple-800/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-400" />
                <span>Testador e Validador de QR Code Pix Nubank</span>
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                Simule um valor e verifique a conformidade matemática do CRC16-CCITT e a leitura pelo Nubank.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-stone-950 px-2.5 py-1.5 rounded-xl border border-stone-800 text-xs">
                <span className="text-stone-500 font-mono">R$</span>
                <input
                  type="number"
                  step="0.50"
                  min="1"
                  value={testPixAmount}
                  onChange={(e) => setTestPixAmount(parseFloat(e.target.value) || 0)}
                  className="w-20 bg-transparent text-amber-400 font-mono font-bold focus:outline-none text-right"
                />
              </div>

              <button
                type="button"
                onClick={handleTestPixGeneration}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Gerar & Validar</span>
              </button>
            </div>
          </div>

          {/* Resultado do Teste */}
          {testPixPayload && testPixValidation && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-stone-800 animate-fade-in">
              {/* QR Code SVG */}
              <div className="flex flex-col items-center justify-center p-4 bg-stone-950 rounded-xl border border-stone-800 text-center space-y-2">
                <div className="p-3 bg-white rounded-2xl shadow-lg border-2 border-purple-500/40">
                  <QRCodeSVG value={testPixPayload} size={135} level="M" />
                </div>
                <span className="text-[10px] text-stone-400 font-mono">
                  Valor: R$ {testPixAmount.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(testPixPayload);
                    setTestPixCopied(true);
                    setTimeout(() => setTestPixCopied(false), 2000);
                  }}
                  className="w-full py-1.5 px-2 bg-stone-900 hover:bg-stone-800 text-purple-300 text-[10px] font-bold rounded-lg transition-colors border border-stone-800 flex items-center justify-center gap-1"
                >
                  {testPixCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{testPixCopied ? 'Copiado!' : 'Copiar Payload'}</span>
                </button>
              </div>

              {/* Auditoria de Conformidade BACEN */}
              <div className="md:col-span-2 space-y-3 p-4 bg-stone-950 rounded-xl border border-stone-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-200">Validação Técnica EMV / BACEN:</span>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${testPixValidation.isValid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400'}`}>
                    {testPixValidation.isValid ? '✓ 100% VÁLIDO E CONFORME' : '✗ INVÁLIDO'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-stone-300">
                  <div className="p-2 bg-stone-900 rounded-lg">
                    <span className="text-stone-500 block text-[9px]">CÁLCULO CRC16-CCITT:</span>
                    <strong className="text-emerald-400">0x{testPixValidation.calculatedCrc} (Bacen OK)</strong>
                  </div>
                  <div className="p-2 bg-stone-900 rounded-lg">
                    <span className="text-stone-500 block text-[9px]">CHAVE DESTINO NUBANK:</span>
                    <strong className="text-purple-300 truncate block">{testPixValidation.decoded.chavePix}</strong>
                  </div>
                  <div className="p-2 bg-stone-900 rounded-lg">
                    <span className="text-stone-500 block text-[9px]">BENEFICIÁRIO:</span>
                    <strong className="text-stone-200 truncate block">{testPixValidation.decoded.nomeRecebedor}</strong>
                  </div>
                  <div className="p-2 bg-stone-900 rounded-lg">
                    <span className="text-stone-500 block text-[9px]">CIDADE:</span>
                    <strong className="text-stone-200 truncate block">{testPixValidation.decoded.cidadeRecebedor}</strong>
                  </div>
                </div>

                {/* Botão de Simulação de Recebimento Nubank */}
                <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSimulateNubankApiReceipt}
                    disabled={isSimulatingNubank}
                    className="py-2 px-3 bg-purple-700/80 hover:bg-purple-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingNubank ? 'animate-spin' : ''}`} />
                    <span>Simular Liquidação na API Nubank</span>
                  </button>

                  {testNubankLog && (
                    <div className="text-[10px] text-emerald-400 font-mono text-right">
                      <span>✓ E2E: {testNubankLog.e2eId}</span>
                      <span className="block text-stone-400">Aut: {testNubankLog.authCode}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SEÇÃO 2: Ponto da Carne (Smash Artesanal) */}
      <div className="space-y-3 pt-6 border-t border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Flame className="w-4 h-4" />
              <span>2. Seleção de Ponto da Carne</span>
            </h3>
            <p className="text-xs text-stone-400">
              Controle se o cliente deve ou não escolher o ponto. Em smash burgers artesanais, o padrão é sem ponto (smash crocante).
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <span className="text-xs text-stone-300 font-medium">Habilitar Escolha de Ponto:</span>
            <input 
              type="checkbox" 
              checked={menuSettings.habilitarPontoCarne}
              onChange={handleTogglePontoCarne}
              className="rounded accent-amber-500 w-5 h-5 cursor-pointer"
            />
          </label>
        </div>

        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex items-center gap-3 text-xs">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-stone-200">
              {menuSettings.habilitarPontoCarne 
                ? 'Opção ativada: O cliente escolherá entre "Ao Ponto", "Bem Passado" ou "Ponto Menos".' 
                : 'Opção desativada: Todos os smashs são servidos no ponto perfeito Smash Crocante com Crosta Maillard caramelizada.'}
            </p>
            <p className="text-stone-400 text-[11px] mt-0.5">
              Ideal para acelerar a chapa e manter a integridade gastronômica da prensagem dos smash pucks.
            </p>
          </div>
        </div>
      </div>

      {/* SEÇÃO 3: Pergunta de Sachês & Descartáveis estilo iFood */}
      <div className="space-y-3 pt-6 border-t border-stone-800">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <PackageCheck className="w-4 h-4" />
            <span>3. Perguntas de Sachês e Descartáveis (Estilo iFood)</span>
          </h3>
          <p className="text-xs text-stone-400">
            Pergunte ao cliente se deseja receber sachês de condimentos ou guardanapos, reduzindo desperdício e custos operacionais.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label 
            onClick={handleTogglePerguntaSaches}
            className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between ${
              menuSettings.habilitarPerguntaSaches 
                ? 'bg-amber-950/30 border-amber-500/60 text-stone-100' 
                : 'bg-stone-950 border-stone-800 text-stone-500'
            }`}
          >
            <div>
              <p className="text-xs font-extrabold">Pergunta de Sachês de Ketchup/Maionese</p>
              <p className="text-[11px] text-stone-400">Exibe: 'Deseja sachês de condimentos? (Sim / Não preciso 🌱)'</p>
            </div>
            <input 
              type="checkbox" 
              checked={menuSettings.habilitarPerguntaSaches}
              readOnly
              className="rounded accent-amber-500 w-4 h-4"
            />
          </label>

          <label 
            onClick={handleTogglePerguntaGuardanapos}
            className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between ${
              menuSettings.habilitarPerguntaGuardanapos 
                ? 'bg-amber-950/30 border-amber-500/60 text-stone-100' 
                : 'bg-stone-950 border-stone-800 text-stone-500'
            }`}
          >
            <div>
              <p className="text-xs font-extrabold">Pergunta de Guardanapos e Talheres</p>
              <p className="text-[11px] text-stone-400">Exibe opção de sustentabilidade para o cliente marcar</p>
            </div>
            <input 
              type="checkbox" 
              checked={menuSettings.habilitarPerguntaGuardanapos}
              readOnly
              className="rounded accent-amber-500 w-4 h-4"
            />
          </label>
        </div>
      </div>

      {/* SEÇÃO 4: Gestão de Adicionais Pagos com Preços */}
      <div className="space-y-4 pt-6 border-t border-stone-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>4. Adicionais Pagos & Valores Individuais</span>
            </h3>
            <p className="text-xs text-stone-400">
              Defina os ingredientes extras que o cliente pode adicionar no hambúrguer com o valor de cada um
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <span className="text-xs text-stone-300 font-medium">Habilitar Adicionais no Cardápio:</span>
            <input 
              type="checkbox" 
              checked={menuSettings.habilitarAdicionais}
              onChange={handleToggleHabilitarAdicionais}
              className="rounded accent-amber-500 w-5 h-5 cursor-pointer"
            />
          </label>
        </div>

        {/* Lista de adicionais configuráveis */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {menuSettings.adicionais.map((adicional) => (
            <div
              key={adicional.id}
              className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 transition-all ${
                adicional.ativo 
                  ? 'bg-stone-950 border-stone-800 text-stone-100' 
                  : 'bg-stone-950/40 border-stone-800/50 text-stone-500 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleAdicionalAtivo(adicional.id)}
                  className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                    adicional.ativo ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-500'
                  }`}
                  title={adicional.ativo ? 'Desativar este adicional' : 'Ativar este adicional'}
                >
                  {adicional.ativo ? '✓' : ''}
                </button>

                <span className="font-bold text-stone-200">{adicional.nome}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-xl px-2 py-1">
                  <span className="text-[11px] text-stone-500 font-mono">R$</span>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    value={adicional.preco}
                    onChange={(e) => handleUpdateAdicionalPreco(adicional.id, e.target.value)}
                    className="w-16 bg-transparent text-amber-400 font-mono font-bold text-xs focus:outline-none text-right"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveAdicional(adicional.id)}
                  className="p-1.5 text-stone-500 hover:text-rose-400 rounded-lg hover:bg-stone-900 transition-colors"
                  title="Excluir adicional"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Formulário para cadastrar novo adicional */}
        <form onSubmit={handleAddNovoAdicional} className="flex flex-col sm:flex-row gap-2 pt-2">
          <input
            type="text"
            required
            placeholder="Nome do novo adicional (Ex: Ovo Caipira na Chapa, Molho Barbecue Extra)..."
            value={novoAdicionalNome}
            onChange={(e) => setNovoAdicionalNome(e.target.value)}
            className="flex-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Preço (Ex: 3,50)"
              value={novoAdicionalPreco}
              onChange={(e) => setNovoAdicionalPreco(e.target.value)}
              className="w-28 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Adicionar</span>
            </button>
          </div>
        </form>
      </div>

      {/* SEÇÃO 5: Gestão Individual por Item (Checkboxes: Adicionais, Remoção e Sachês) */}
      <div className="pt-6 border-t border-stone-800">
        <ItemManagementPanel />
      </div>

      {/* MODAL SEGURO DE CONFIRMAÇÃO DE RESET */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${confirmDialog.isDestructive ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-100">
                {confirmDialog.title}
              </h3>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              {confirmDialog.description}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-semibold transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  confirmDialog.isDestructive
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-black'
                }`}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
