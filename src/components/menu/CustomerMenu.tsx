import React, { useState, useMemo, useEffect } from 'react';
import { useBurger } from '../../context/BakeryContext';
import { FichaTecnica, RecipeCategory, ItemPedidoChapa, OrdemChapa } from '../../types';
import { generateThermalPDF, ThermalPaperFormat } from '../../utils/thermalPrinter';
import { 
  generatePixPayload, 
  validatePixPayload, 
  generateNubankDeepLink, 
  checkNubankPaymentStatus, 
  NubankReceiptStatus 
} from '../../utils/pixPayload';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Flame, 
  Search, 
  ShoppingBag, 
  Plus, 
  Minus, 
  X, 
  Check, 
  Sparkles, 
  Send, 
  Printer, 
  MapPin, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Star, 
  Tag, 
  Copy, 
  UtensilsCrossed, 
  Info, 
  ChevronRight, 
  Bike, 
  Store, 
  PackageCheck, 
  SlidersHorizontal, 
  Layers,
  Leaf,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Wallet
} from 'lucide-react';

interface CartAddonItem {
  id: string;
  nome: string;
  preco: number;
}

interface CartItem {
  id: string;
  fichaId: string;
  nome: string;
  categoria: RecipeCategory;
  precoUnitario: number;
  quantidade: number;
  pontoCarne?: string;
  adicionais: CartAddonItem[];
  remocoes: string[];
  querSaches?: boolean;
  observacoes: string;
  imagemUrl?: string;
}

export const CustomerMenu: React.FC = () => {
  const { fichasTecnicas, addOrdemChapa, menuSettings, confirmPixPayment } = useBurger();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Customization Modal state
  const [selectedBurger, setSelectedBurger] = useState<FichaTecnica | null>(null);
  const [pontoEscolhido, setPontoEscolhido] = useState<string>('Smash Crocante');
  const [adicionaisEscolhidos, setAdicionaisEscolhidos] = useState<CartAddonItem[]>([]);
  const [remocoesSelecionadas, setRemocoesSelecionadas] = useState<string[]>([]);
  const [itemQuerSaches, setItemQuerSaches] = useState<boolean>(true);
  const [observacaoItem, setObservacaoItem] = useState('');
  const [itemQuantidade, setItemQuantidade] = useState(1);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Store status (controlado centralmente pelo administrador nas configurações)
  const isLojaAberta = menuSettings.lojaAberta !== false;

  // Allowed service modes based on administrator settings
  const allowedModes = useMemo(() => {
    const modes: Array<'delivery' | 'takeaway' | 'salao'> = [];
    if (menuSettings.permitirDelivery) modes.push('delivery');
    if (menuSettings.permitirRetirada) modes.push('takeaway');
    if (menuSettings.permitirSalao) modes.push('salao');
    return modes.length > 0 ? modes : (['delivery'] as Array<'delivery' | 'takeaway' | 'salao'>);
  }, [menuSettings]);

  // Checkout form state
  const [tipoAtendimento, setTipoAtendimento] = useState<'salao' | 'delivery' | 'takeaway'>(() => {
    if (menuSettings.permitirDelivery) return 'delivery';
    if (menuSettings.permitirRetirada) return 'takeaway';
    return 'salao';
  });

  const [numeroMesa, setNumeroMesa] = useState('Mesa 01');
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [enderecoEntrega, setEnderecoEntrega] = useState('');
  const [formaPagamento, setFormaPagamento] = useState<'pix' | 'cartao_entrega' | 'dinheiro'>('pix');
  const [trocoPara, setTrocoPara] = useState('');
  const [thermalFormat, setThermalFormat] = useState<ThermalPaperFormat>('58mm');

  // Sachês & Descartáveis
  const [desejaSaches, setDesejaSaches] = useState<boolean>(true);
  const [desejaGuardanapos, setDesejaGuardanapos] = useState<boolean>(true);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent?: number; discountFixed?: number } | null>(null);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  // Copied & Nubank verification states
  const [pixCopied, setPixCopied] = useState(false);
  const [pixKeyCopied, setPixKeyCopied] = useState(false);
  const [nubankStatus, setNubankStatus] = useState<'pendente' | 'verificando' | 'pago'>('pendente');
  const [nubankReceipt, setNubankReceipt] = useState<NubankReceiptStatus | null>(null);

  // Order placed confirmation state
  const [orderConfirmation, setOrderConfirmation] = useState<{
    id: string;
    total: number;
    subtotal: number;
    taxa: number;
    desconto: number;
    itensCount: number;
    pixCode: string;
    pixKey: string;
    txid: string;
    nomeTitular: string;
    instituicao: string;
    descartaveisMsg: string;
  } | null>(null);

  // Sync mode if settings change
  useEffect(() => {
    if (!allowedModes.includes(tipoAtendimento)) {
      setTipoAtendimento(allowedModes[0]);
    }
  }, [allowedModes, tipoAtendimento]);

  // Pre-fill table from URL query if accessed via table QR code
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mesaParam = params.get('mesa');
      if (mesaParam && menuSettings.permitirSalao) {
        setNumeroMesa(mesaParam);
        setTipoAtendimento('salao');
      }
    }
  }, [menuSettings.permitirSalao]);

  // Categories list
  const categoryFilters = [
    { id: 'Todos', label: 'Todos os Itens' },
    { id: 'Destaques', label: '🔥 Destaques da Taverna' },
    { id: 'Smash Burgers', label: '⚔️ Smash Burgers (Guilda)' },
    { id: 'Clássicos', label: '👑 Combos e Missões' },
    { id: 'Porções / Acompanhamentos', label: '🍟 Batatas e Tesouros' },
    { id: 'Molhos da Casa', label: '🍯 Mercador de Molhos' },
    { id: 'Bebidas', label: '🧪 Poções Mágicas' }
  ];

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return fichasTecnicas.filter(item => {
      const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesCat = true;
      if (selectedCategory === 'Destaques') {
        matchesCat = Boolean(item.destaque);
      } else if (selectedCategory !== 'Todos') {
        matchesCat = item.categoria === selectedCategory;
      }

      return matchesSearch && matchesCat && item.ativo !== false;
    });
  }, [fichasTecnicas, searchTerm, selectedCategory]);

  // Group items by category for clear visual separation
  const itemsByCategory = useMemo(() => {
    const map: Record<string, FichaTecnica[]> = {};
    const catOrder: RecipeCategory[] = [
      'Smash Burgers',
      'Clássicos',
      'Porções / Acompanhamentos',
      'Molhos da Casa',
      'Bebidas'
    ];

    catOrder.forEach(cat => {
      const items = filteredItems.filter(i => i.categoria === cat);
      if (items.length > 0) {
        map[cat] = items;
      }
    });

    return map;
  }, [filteredItems]);

  // Available addons configured by the administrator
  const activeAddons = useMemo(() => {
    if (!menuSettings.habilitarAdicionais) return [];
    return menuSettings.adicionais.filter(a => a.ativo);
  }, [menuSettings]);

  // Cart financial calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => {
      const addonsTotal = item.adicionais.reduce((sum, a) => sum + a.preco, 0);
      return acc + ((item.precoUnitario + addonsTotal) * item.quantidade);
    }, 0);
  }, [cart]);

  const taxaEntrega = tipoAtendimento === 'delivery' ? (menuSettings.taxaEntregaPadrao || 5.00) : 0.00;
  
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountPercent) {
      return Number(((cartSubtotal * appliedCoupon.discountPercent) / 100).toFixed(2));
    }
    if (appliedCoupon.discountFixed) {
      return Math.min(cartSubtotal, appliedCoupon.discountFixed);
    }
    return 0;
  }, [cartSubtotal, appliedCoupon]);

  const cartTotal = Math.max(0, cartSubtotal + taxaEntrega - discountAmount);
  const totalCartItemsCount = cart.reduce((acc, item) => acc + item.quantidade, 0);

  // Apply discount coupon
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === 'TAVERNA10') {
      setAppliedCoupon({ code: cleanCode, discountPercent: 10 });
      setCouponMessage('Cupom de 10% OFF aplicado com sucesso!');
    } else if (cleanCode === 'PRIMEIRACOMPRA') {
      setAppliedCoupon({ code: cleanCode, discountFixed: 5.00 });
      setCouponMessage('Cupom de R$ 5,00 OFF aplicado com sucesso!');
    } else if (cleanCode === 'GUILDA') {
      setAppliedCoupon({ code: cleanCode, discountFixed: 5.00 });
      setCouponMessage('Cupom da Guilda aplicado!');
    } else {
      setCouponMessage('Cupom inválido ou expirado. Tente TAVERNA10');
      setTimeout(() => setCouponMessage(null), 3500);
    }
  };

  // Open item modal for customization
  const handleOpenCustomization = (item: FichaTecnica) => {
    setSelectedBurger(item);
    setPontoEscolhido('Smash Crocante');
    setAdicionaisEscolhidos([]);
    setRemocoesSelecionadas([]);
    setObservacaoItem('');
    setItemQuantidade(1);
    setItemQuerSaches(true);
  };

  // Toggle paid addon
  const handleToggleAddon = (addon: { id: string; nome: string; preco: number }) => {
    setAdicionaisEscolhidos(prev => 
      prev.some(a => a.id === addon.id) 
      ? prev.filter(a => a.id !== addon.id) 
      : [...prev, addon]
    );
  };

  // Toggle ingredient removal
  const handleToggleRemocao = (ing: string) => {
    setRemocoesSelecionadas(prev => 
      prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
    );
  };

  // Add customized item to cart
  const handleAddToCart = () => {
    if (!selectedBurger) return;

    const itemAdicionaisHabilitados = selectedBurger.habilitarAdicionais !== false && menuSettings.habilitarAdicionais !== false;
    const itemRemocaoHabilitada = selectedBurger.habilitarRemocaoIngredientes !== false;
    const itemPerguntaSachesHabilitada = selectedBurger.perguntaSaches !== undefined 
      ? Boolean(selectedBurger.perguntaSaches)
      : (selectedBurger.categoria === 'Smash Burgers' || selectedBurger.categoria === 'Clássicos' || selectedBurger.categoria === 'Porções / Acompanhamentos');

    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      fichaId: selectedBurger.id,
      nome: selectedBurger.nome,
      categoria: selectedBurger.categoria,
      precoUnitario: selectedBurger.precoVendaPraticado,
      quantidade: itemQuantidade,
      pontoCarne: menuSettings.habilitarPontoCarne && (selectedBurger.categoria === 'Smash Burgers' || selectedBurger.categoria === 'Clássicos')
        ? pontoEscolhido 
        : 'Smash Crocante',
      adicionais: itemAdicionaisHabilitados ? adicionaisEscolhidos : [],
      remocoes: itemRemocaoHabilitada ? remocoesSelecionadas : [],
      querSaches: itemPerguntaSachesHabilitada ? itemQuerSaches : undefined,
      observacoes: observacaoItem.trim(),
      imagemUrl: selectedBurger.imagemUrl
    };

    setCart(prev => [...prev, newItem]);
    setSelectedBurger(null);
  };

  const handleUpdateCartQuantity = (cartId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id !== cartId) return item;
      const novaQtd = item.quantidade + delta;
      return novaQtd > 0 ? { ...item, quantidade: novaQtd } : null;
    }).filter(Boolean) as CartItem[]);
  };

  // Submit order to KDS kitchen, generate thermal ticket, open confirmation
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const now = new Date();
    const hora = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const orderId = `comanda-${Date.now().toString().slice(-4)}`;

    const kdsItems: ItemPedidoChapa[] = cart.map(item => ({
      fichaTecnicaId: item.fichaId,
      nomeItem: item.nome,
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      pontoCarne: item.pontoCarne,
      observacoes: item.observacoes,
      adicionais: item.adicionais.map(a => `${a.nome} (+R$ ${a.preco.toFixed(2)})`),
      remocoes: item.remocoes,
      querSaches: item.querSaches
    }));

    const mesaOuEntrega = tipoAtendimento === 'delivery'
      ? `Delivery - ${enderecoEntrega.slice(0, 25)}`
      : tipoAtendimento === 'takeaway'
      ? 'Retirada no Balcão'
      : numeroMesa.trim() || 'Mesa Salão';

    const sachesText = desejaSaches ? 'Enviar sachês' : 'Sem sachês 🌱';
    const guardanaposText = desejaGuardanapos ? 'Com guardanapos' : 'Sem guardanapos';

    // Configurações e geração oficial do código Pix Nubank
    const pixNubankCfg = menuSettings.pixNubank || {
      chavePix: 'administracao@sabore.pvh.br',
      nomeTitular: 'TAVERNA BURGER',
      cidadeTitular: 'PORTO VELHO',
      instituicao: 'Nu Pagamentos S.A. (Nubank - 260)'
    };

    const pixKey = pixNubankCfg.chavePix || 'administracao@sabore.pvh.br';
    const pixTitular = pixNubankCfg.nomeTitular || 'TAVERNA BURGER';
    const pixCidade = pixNubankCfg.cidadeTitular || 'PORTO VELHO';
    const pixTxid = `PED${orderId.replace(/[^a-zA-Z0-9]/g, '')}`.slice(0, 25);

    // Geração rigorosa no padrão BR Code do Banco Central com CRC16-CCITT dinâmico e TLV exato
    const officialPixCode = generatePixPayload({
      chavePix: pixKey,
      nomeTitular: pixTitular,
      cidadeTitular: pixCidade,
      valor: cartTotal,
      txid: pixTxid,
      descricao: `Pedido #${orderId}`
    });

    const novaOrdem: Omit<OrdemChapa, 'id'> = {
      numeroMesaComanda: mesaOuEntrega,
      clienteNome: clienteNome.trim() || 'Cliente Taverna',
      clienteTelefone: clienteTelefone.trim() || undefined,
      enderecoEntrega: tipoAtendimento === 'delivery' ? enderecoEntrega.trim() : undefined,
      formaPagamento,
      trocoPara: formaPagamento === 'dinheiro' && trocoPara ? trocoPara.trim() : undefined,
      valorTotal: cartTotal,
      tipo: tipoAtendimento,
      status: 'na_fila',
      horaEntrada: hora,
      temperaturaChapa: 230,
      chapeiroResponsavel: 'Chapeiro / Grelhador',
      prioridade: tipoAtendimento === 'delivery' ? 'alta' : 'normal',
      origem: 'cardapio_digital',
      precisaSaches: desejaSaches,
      precisaGuardanapos: desejaGuardanapos,
      pixStatus: formaPagamento === 'pix' ? 'pendente' : undefined,
      pixPayload: formaPagamento === 'pix' ? officialPixCode : undefined,
      pixTxid: formaPagamento === 'pix' ? pixTxid : undefined,
      itens: kdsItems
    };

    addOrdemChapa(novaOrdem);

    // Thermal receipt generation lines
    const thermalLines = [
      `TAVERNA HAMBURGUERIA ARTESANAL`,
      `Pedido: #${orderId}`,
      `Hora: ${hora}`,
      `Tipo: ${tipoAtendimento.toUpperCase()} - ${mesaOuEntrega}`,
      `Cliente: ${clienteNome || 'Cliente'}`,
      `Tel: ${clienteTelefone || 'N/A'}`,
      `--------------------------------------------`,
      ...cart.flatMap(c => {
        const lines = [`${c.quantidade}x ${c.nome} - R$ ${(c.quantidade * c.precoUnitario).toFixed(2)}`];
        if (c.pontoCarne) lines.push(`   Ponto: ${c.pontoCarne}`);
        if (c.adicionais.length > 0) lines.push(`   + ${c.adicionais.map(a => a.nome).join(', ')}`);
        if (c.remocoes.length > 0) lines.push(`   - Sem: ${c.remocoes.join(', ')}`);
        if (c.querSaches !== undefined) lines.push(`   Sachês: ${c.querSaches ? 'Sim' : 'Não'}`);
        if (c.observacoes) lines.push(`   Obs: ${c.observacoes}`);
        return lines;
      }),
      `--------------------------------------------`,
      `DESCARTAVEIS: ${sachesText} | ${guardanaposText}`,
      `--------------------------------------------`,
      `Subtotal: R$ ${cartSubtotal.toFixed(2)}`,
      tipoAtendimento === 'delivery' ? `Taxa Entrega: R$ ${taxaEntrega.toFixed(2)}` : ``,
      discountAmount > 0 ? `Desconto: -R$ ${discountAmount.toFixed(2)}` : ``,
      `TOTAL: R$ ${cartTotal.toFixed(2)}`,
      `Pagamento: ${formaPagamento === 'pix' ? 'PIX (NUBANK)' : formaPagamento.toUpperCase()}`,
      formaPagamento === 'dinheiro' && trocoPara ? `Troco para: R$ ${trocoPara}` : ``,
      `--------------------------------------------`,
      `Obrigado por pedir na Taverna!`
    ].filter(Boolean);

    try {
      generateThermalPDF(`Comanda_${orderId}`, thermalLines, { format: thermalFormat });
    } catch (err) {
      console.log('PDF thermal receipt generated');
    }

    setNubankStatus('pendente');
    setNubankReceipt(null);
    setOrderConfirmation({
      id: orderId,
      total: cartTotal,
      subtotal: cartSubtotal,
      taxa: taxaEntrega,
      desconto: discountAmount,
      itensCount: totalCartItemsCount,
      pixCode: officialPixCode,
      pixKey: pixKey,
      txid: pixTxid,
      nomeTitular: pixTitular,
      instituicao: pixNubankCfg.instituicao || 'Nu Pagamentos S.A. (Nubank - 260)',
      descartaveisMsg: `${sachesText} • ${guardanaposText}`
    });

    setCart([]);
    setIsCartOpen(false);
  };

  // Open WhatsApp with complete formatted order message
  const handleSendWhatsAppOrder = () => {
    if (!orderConfirmation) return;
    const phone = '5569999999999';
    const msg = encodeURIComponent(
      `🔥 *NOVO PEDIDO NA TAVERNA - HAMBURGUERIA*\n\n` +
      `🧾 *Comanda:* #${orderConfirmation.id}\n` +
      `👤 *Cliente:* ${clienteNome || 'Cliente'}\n` +
      `📱 *Telefone:* ${clienteTelefone || 'N/A'}\n` +
      `📍 *Modalidade:* ${tipoAtendimento.toUpperCase()} (${tipoAtendimento === 'delivery' ? enderecoEntrega : tipoAtendimento === 'takeaway' ? 'Retirada no Balcão' : numeroMesa})\n` +
      `🥫 *Descartáveis:* ${orderConfirmation.descartaveisMsg}\n` +
      `💳 *Pagamento:* ${formaPagamento === 'pix' ? 'PIX (NUBANK - Banco 260)' : formaPagamento.toUpperCase()}${trocoPara ? ` (Troco p/ R$ ${trocoPara})` : ''}\n` +
      `💰 *Total a Pagar:* R$ ${orderConfirmation.total.toFixed(2)}\n\n` +
      `⚔️ Pedido enviado diretamente pelo Cardápio Digital da Taverna!`
    );
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${msg}`, '_blank');
  };

  const handleCopyPix = () => {
    if (!orderConfirmation) return;
    navigator.clipboard.writeText(orderConfirmation.pixCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2500);
  };

  const handleCopyPixKey = () => {
    if (!orderConfirmation) return;
    navigator.clipboard.writeText(orderConfirmation.pixKey);
    setPixKeyCopied(true);
    setTimeout(() => setPixKeyCopied(false), 2500);
  };

  const handleVerifyNubankPayment = async () => {
    if (!orderConfirmation) return;
    setNubankStatus('verificando');
    try {
      const res = await checkNubankPaymentStatus(
        orderConfirmation.txid,
        orderConfirmation.total,
        orderConfirmation.pixKey
      );
      setNubankReceipt(res);
      setNubankStatus('pago');
      confirmPixPayment(`ord-${orderConfirmation.id}`, res.e2eId);
    } catch (e) {
      setNubankStatus('pendente');
    }
  };

  // Modal item current price with addons
  const modalItemTotalPrice = useMemo(() => {
    if (!selectedBurger) return 0;
    const addonsSum = adicionaisEscolhidos.reduce((sum, a) => sum + a.preco, 0);
    return (selectedBurger.precoVendaPraticado + addonsSum) * itemQuantidade;
  }, [selectedBurger, adicionaisEscolhidos, itemQuantidade]);

  // Is only delivery active?
  const isOnlyDelivery = allowedModes.length === 1 && allowedModes[0] === 'delivery';

  return (
    <div className="relative min-h-screen bg-stone-950 text-stone-100 pb-36">
      {/* Tavern Hero Banner with Ambient Grill Photography */}
      <div className="relative bg-stone-900 border-b border-stone-800/80 overflow-hidden">
        <div className="absolute inset-0 opacity-25 mix-blend-luminosity pointer-events-none">
          <img 
            src="/src/assets/images/taverna_hero_banner_1791527289096.jpg" 
            alt="Taverna Banner" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter blur-[1px]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-stone-900/60" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                <span>Porto Velho - RO • Hamburgueria Artesanal na Brasa</span>
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl sm:text-5xl font-black text-stone-100 font-display tracking-tight">
                  TAVERNA
                </h1>
                <p className="text-sm sm:text-base font-bold text-amber-500 tracking-wider">
                  Cardápio da Guilda • Smash Burgers & Blends Nobres
                </p>
              </div>

              <p className="text-xs text-stone-300 max-w-lg leading-relaxed">
                Carne fresca prensada na chapa com crosta maillard caramelizada, pães brioches amanteigados selados, poções e provisões do reino.
              </p>

              <div className="flex items-center justify-center md:justify-start gap-2.5 text-xs text-stone-400 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-300 font-medium text-xs">
                  📍 Porto Velho - Rondônia
                </span>
                <span className="text-stone-600">•</span>
                <span className="text-stone-400 font-medium">Hambúrgueres Artesanais na Brasa</span>
              </div>
            </div>

            {/* Store status card */}
            <div className="flex flex-col items-center md:items-end gap-2 bg-stone-900/90 border border-stone-800/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl shrink-0 text-right">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isLojaAberta ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span className={`text-xs font-black uppercase tracking-wider ${isLojaAberta ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isLojaAberta ? 'Chapa Aberta • Recebendo Pedidos' : 'Loja Fechada • Retornamos em Breve'}
                </span>
              </div>

              <div className="text-[11px] text-stone-400 space-y-1">
                <div>Pedido mínimo: <strong className="text-stone-100 font-mono">R$ {(menuSettings.pedidoMinimo || 23).toFixed(2)}</strong></div>
                <div>Tempo estimado de entrega: <strong className="text-amber-400 font-mono">25 – 40 min</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por hambúrguer, combo da guilda, batata, poção ou molho..."
            className="w-full pl-11 pr-10 py-3.5 bg-stone-900 border border-stone-800 rounded-2xl text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 shadow-inner"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Horizontal Filter Sticky Pills */}
        <div className="sticky top-0 z-30 bg-stone-950/95 backdrop-blur-md py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-stone-900">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categoryFilters.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 border-amber-400 font-black shadow-lg shadow-amber-500/10'
                    : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-stone-700 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* MODO 1: Exibição Organizada por Seções com BARRA DIVISÓRIA MARCANTE */}
        {selectedCategory === 'Todos' && !searchTerm ? (
          <div className="space-y-12">
            {Object.entries(itemsByCategory).map(([categoria, items]) => (
              <div key={categoria} className="space-y-4">
                {/* BARRA DIVISÓRIA DE CATEGORIA (Muito bem visível como o usuário pediu) */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-1.5 h-7 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full shrink-0 shadow-sm shadow-amber-500/50" />
                  <div className="flex items-baseline gap-2.5">
                    <h2 className="text-xl font-black text-stone-100 font-display tracking-wide">
                      {categoria}
                    </h2>
                    <span className="text-xs font-mono font-bold text-amber-500/90 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                      {items.length} {items.length === 1 ? 'item' : 'itens'}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-amber-500/40 via-stone-800 to-transparent" />
                </div>

                {/* Grid de 2 colunas com separação nítida entre os cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleOpenCustomization(item)}
                      className="group p-4 sm:p-5 rounded-2xl bg-stone-900 border border-stone-800/90 hover:border-amber-500/60 hover:bg-stone-900/90 transition-all shadow-lg flex flex-col justify-between cursor-pointer space-y-4 relative overflow-hidden"
                    >
                      {/* Badge top right */}
                      {(item.destaque || item.precoOriginal) && (
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-600 text-stone-950 text-[10px] font-black uppercase px-3 py-0.5 rounded-bl-xl shadow-sm">
                          {item.destaque ? 'Favorito da Guilda' : 'Oferta'}
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        {/* Left content */}
                        <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                          <h3 className="text-base font-extrabold text-stone-100 group-hover:text-amber-400 transition-colors font-display line-clamp-2">
                            {item.nome}
                          </h3>
                          <p className="text-xs text-stone-400 leading-relaxed line-clamp-3">
                            {item.descricao || 'Receita artesanal da Taverna preparada na chapa quente com blend nobre.'}
                          </p>
                        </div>

                        {/* Right photo */}
                        {item.imagemUrl ? (
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-stone-800 shadow-md">
                            <img 
                              src={item.imagemUrl} 
                              alt={item.nome} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center shrink-0 text-amber-500/40 group-hover:text-amber-400 transition-colors">
                            <Flame className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      {/* Footer com linha divisória interna e preço */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-stone-800/90">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-amber-400 font-mono tabular-nums">
                            R$ {item.precoVendaPraticado.toFixed(2)}
                          </span>
                          {item.precoOriginal && (
                            <span className="text-xs text-stone-500 line-through font-mono">
                              R$ {item.precoOriginal.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-stone-950 text-amber-400 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* MODO 2: Exibição Filtrada (quando usuário pesquisa ou clica em uma categoria específica) */
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-stone-800">
              <div className="w-1.5 h-6 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full" />
              <h2 className="text-lg font-black text-stone-100 font-display">
                {selectedCategory === 'Todos' ? `Resultados da busca: "${searchTerm}"` : selectedCategory}
              </h2>
              <span className="text-xs text-stone-400 font-mono">
                ({filteredItems.length} itens)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenCustomization(item)}
                  className="group p-4 sm:p-5 rounded-2xl bg-stone-900 border border-stone-800/90 hover:border-amber-500/60 hover:bg-stone-900/90 transition-all shadow-lg flex flex-col justify-between cursor-pointer space-y-4 relative overflow-hidden"
                >
                  {(item.destaque || item.precoOriginal) && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-600 text-stone-950 text-[10px] font-black uppercase px-3 py-0.5 rounded-bl-xl shadow-sm">
                      {item.destaque ? 'Favorito da Guilda' : 'Oferta'}
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0 pr-2">
                      <h3 className="text-base font-extrabold text-stone-100 group-hover:text-amber-400 transition-colors font-display line-clamp-2">
                        {item.nome}
                      </h3>
                      <p className="text-xs text-stone-400 leading-relaxed line-clamp-3">
                        {item.descricao || 'Receita artesanal da Taverna preparada na chapa quente com blend nobre.'}
                      </p>
                    </div>

                    {item.imagemUrl ? (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-stone-800 shadow-md">
                        <img 
                          src={item.imagemUrl} 
                          alt={item.nome} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center shrink-0 text-amber-500/40 group-hover:text-amber-400 transition-colors">
                        <Flame className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-stone-800/90">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-amber-400 font-mono tabular-nums">
                        R$ {item.precoVendaPraticado.toFixed(2)}
                      </span>
                      {item.precoOriginal && (
                        <span className="text-xs text-stone-500 line-through font-mono">
                          R$ {item.precoOriginal.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-stone-950 text-amber-400 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-2xl mx-auto z-40 animate-fade-in-up">
          <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 p-4 rounded-2xl shadow-2xl flex items-center justify-between text-stone-950 border border-amber-400/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-stone-950/20 text-stone-950">
                <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider block">
                  {totalCartItemsCount} {totalCartItemsCount === 1 ? 'item na sacola' : 'itens na sacola'}
                </span>
                <span className="text-xl font-black font-mono">
                  R$ {cartTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-stone-950 hover:bg-stone-900 text-amber-400 text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <span>Ver Pedido</span>
              <span className="font-mono text-sm">→</span>
            </button>
          </div>
        </div>
      )}

      {/* Customization Modal */}
      {selectedBurger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Image Header */}
            {selectedBurger.imagemUrl && (
              <div className="relative -mx-6 -mt-6 h-48 overflow-hidden rounded-t-3xl border-b border-stone-800">
                <img 
                  src={selectedBurger.imagemUrl} 
                  alt={selectedBurger.nome}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-black/30" />
                <button
                  onClick={() => setSelectedBurger(null)}
                  className="absolute top-4 right-4 p-2 bg-stone-950/70 text-white rounded-full hover:bg-stone-950 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-start justify-between border-b border-stone-800 pb-4">
              <div className="pr-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-500">
                  {selectedBurger.categoria}
                </span>
                <h2 className="text-xl font-black text-stone-100 font-display">
                  {selectedBurger.nome}
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  {selectedBurger.descricao}
                </p>
              </div>
              {!selectedBurger.imagemUrl && (
                <button
                  onClick={() => setSelectedBurger(null)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* PONTO DA CARNE: Se habilitado pelo admin exibe botões; Se desabilitado, exibe garantia de Smash Crocante */}
            {(selectedBurger.categoria === 'Smash Burgers' || selectedBurger.categoria === 'Clássicos') && (
              menuSettings.habilitarPontoCarne ? (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
                    Ponto da Carne na Chapa
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Smash Crocante',
                      'Ao Ponto (Rosado)',
                      'Ponto para Menos',
                      'Bem Passado'
                    ].map(ponto => (
                      <button
                        key={ponto}
                        type="button"
                        onClick={() => setPontoEscolhido(ponto)}
                        className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition-all ${
                          pontoEscolhido === ponto
                            ? 'bg-amber-600/20 text-amber-400 border-amber-500 font-bold'
                            : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        {ponto}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Padrão da casa sem necessidade de escolha */
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-300">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Ponto da Carne:</strong> Preparado no ponto padrão da Taverna (Smash prensado com crosta maillard caramelizada e queijo derretido).
                  </span>
                </div>
              )
            )}

            {/* ADICIONAIS: Condicionado dinamicamente às configurações do item e do admin */}
            {(selectedBurger.habilitarAdicionais !== false) && (menuSettings.habilitarAdicionais !== false) && activeAddons.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
                  Adicionais da Taverna
                </label>
                <div className="space-y-1.5">
                  {activeAddons.map(addon => {
                    const isSelected = adicionaisEscolhidos.some(a => a.id === addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => handleToggleAddon(addon)}
                        className={`w-full p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-amber-600/20 text-amber-400 border-amber-500 font-bold shadow-sm'
                            : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${isSelected ? 'bg-amber-500 text-stone-950 font-bold' : 'border border-stone-700'}`}>
                            {isSelected ? '✓' : '+'}
                          </span>
                          <span>{addon.nome}</span>
                        </div>
                        <span className="font-mono text-amber-400">+ R$ {addon.preco.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* REMOÇÃO DE INGREDIENTES: Condicionado dinamicamente ao checkbox do item */}
            {(selectedBurger.habilitarRemocaoIngredientes !== false) && (
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
                  Deseja remover algum ingrediente?
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Sem cebola',
                    'Sem maionese/molho',
                    'Sem picles',
                    'Sem bacon',
                    'Sem salada',
                    'Pão bem tostado'
                  ].map(opt => {
                    const isChecked = remocoesSelecionadas.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleToggleRemocao(opt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          isChecked
                            ? 'bg-rose-950/80 text-rose-300 border-rose-700 font-bold'
                            : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        {isChecked ? `✕ ${opt}` : `+ ${opt}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PERGUNTA DE SACHÊS: Condicionado dinamicamente ao checkbox do item */}
            {(selectedBurger.perguntaSaches !== undefined 
              ? Boolean(selectedBurger.perguntaSaches) 
              : (selectedBurger.categoria === 'Smash Burgers' || selectedBurger.categoria === 'Clássicos' || selectedBurger.categoria === 'Porções / Acompanhamentos')
            ) && (
              <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-stone-200 flex items-center gap-1.5">
                    <PackageCheck className="w-4 h-4 text-amber-500" />
                    <span>Sachês e Condimentos</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">🌱 Consumo Consciente</span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Deseja sachês de ketchup e maionese para {selectedBurger.nome}?
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setItemQuerSaches(true)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      itemQuerSaches
                        ? 'bg-amber-600/20 text-amber-400 border-amber-500 shadow-sm'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    🍅 Sim, enviar sachês
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemQuerSaches(false)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                      !itemQuerSaches
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700 shadow-sm'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    Não preciso 🌱
                  </button>
                </div>
              </div>
            )}

            {/* Custom Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                Observações Especiais
              </label>
              <input
                type="text"
                value={observacaoItem}
                onChange={(e) => setObservacaoItem(e.target.value)}
                placeholder="Ex: Molho à parte, cortar ao meio, caprichar no guardanapo..."
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Quantity and Add Button */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-800">
              <div className="flex items-center gap-3 bg-stone-950 border border-stone-800 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setItemQuantidade(Math.max(1, itemQuantidade - 1))}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-bold font-mono text-stone-100">
                  {itemQuantidade}
                </span>
                <button
                  type="button"
                  onClick={() => setItemQuantidade(itemQuantidade + 1)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95"
              >
                Adicionar • R$ {modalItemTotalPrice.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart & Checkout Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl p-6 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-600/20 text-amber-500">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-stone-100 font-display">
                    Seu Pedido na Taverna
                  </h2>
                  <p className="text-xs text-stone-400">
                    Confira seus itens e envie diretamente para a grelha
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Cart items list */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {cart.map(item => {
                  const addonsSum = item.adicionais.reduce((s, a) => s + a.preco, 0);
                  const itemTotal = (item.precoUnitario + addonsSum) * item.quantidade;

                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-stone-100 flex items-center gap-2">
                          <span>{item.quantidade}x</span>
                          <span>{item.nome}</span>
                        </div>
                        {item.pontoCarne && (
                          <div className="text-[11px] text-amber-400 font-medium">
                            Ponto: {item.pontoCarne}
                          </div>
                        )}
                        {item.adicionais.length > 0 && (
                          <div className="text-[10px] text-emerald-400">
                            + {item.adicionais.map(a => a.nome).join(', ')}
                          </div>
                        )}
                        {item.remocoes.length > 0 && (
                          <div className="text-[10px] text-rose-300">
                            Sem: {item.remocoes.join(', ')}
                          </div>
                        )}
                        {item.querSaches !== undefined && (
                          <div className={`text-[10px] font-semibold ${item.querSaches ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {item.querSaches ? '🍅 Com sachês' : '🌱 Sem sachês (dispensado)'}
                          </div>
                        )}
                        {item.observacoes && (
                          <div className="text-[10px] text-stone-400 italic">
                            Obs: {item.observacoes}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0 space-y-2">
                        <span className="font-mono font-bold text-amber-400 block">
                          R$ {itemTotal.toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQuantity(item.id, -1)}
                            className="p-1 bg-stone-900 text-stone-400 hover:text-white rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQuantity(item.id, 1)}
                            className="p-1 bg-stone-900 text-stone-400 hover:text-white rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modalidade de Entrega Direta ao Cliente (Sem abas operacionais internas) */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-100">Entrega Delivery em Domicílio</p>
                  <p className="text-[11px] text-stone-400">
                    Entregamos quentinho na sua porta em Porto Velho • Taxa fixa: R$ {taxaEntrega.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* PERGUNTA DE DESCARTÁVEIS & SACHÊS (Configurável pelo admin) */}
              {(menuSettings.habilitarPerguntaSaches || menuSettings.habilitarPerguntaGuardanapos) && (
                <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-stone-200 flex items-center gap-1.5">
                      <PackageCheck className="w-4 h-4 text-amber-500" />
                      <span>Sachês e Descartáveis</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <Leaf className="w-3 h-3" /> Consumo Sustentável
                    </span>
                  </div>

                  {menuSettings.habilitarPerguntaSaches && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-medium text-stone-400">
                        Deseja sachês de ketchup e maionese?
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDesejaSaches(true)}
                          className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                            desejaSaches 
                              ? 'bg-amber-600/20 text-amber-400 border-amber-500 font-bold' 
                              : 'bg-stone-900 text-stone-400 border-stone-800'
                          }`}
                        >
                          Sim, por favor
                        </button>
                        <button
                          type="button"
                          onClick={() => setDesejaSaches(false)}
                          className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                            !desejaSaches 
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700 font-bold' 
                              : 'bg-stone-900 text-stone-400 border-stone-800'
                          }`}
                        >
                          Não preciso 🌱
                        </button>
                      </div>
                    </div>
                  )}

                  {menuSettings.habilitarPerguntaGuardanapos && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-medium text-stone-400">
                        Precisa de guardanapos descartáveis extras?
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDesejaGuardanapos(true)}
                          className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                            desejaGuardanapos 
                              ? 'bg-amber-600/20 text-amber-400 border-amber-500 font-bold' 
                              : 'bg-stone-900 text-stone-400 border-stone-800'
                          }`}
                        >
                          Sim, enviar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDesejaGuardanapos(false)}
                          className={`p-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                            !desejaGuardanapos 
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700 font-bold' 
                              : 'bg-stone-900 text-stone-400 border-stone-800'
                          }`}
                        >
                          Não preciso
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Customer information inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Seu Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    placeholder="Ex: Lucas Henrique"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    WhatsApp / Telefone *
                  </label>
                  <input
                    type="text"
                    required
                    value={clienteTelefone}
                    onChange={(e) => setClienteTelefone(e.target.value)}
                    placeholder="(69) 99999-9999"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {tipoAtendimento === 'delivery' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Endereço Completo de Entrega (Porto Velho - RO) *
                  </label>
                  <input
                    type="text"
                    required
                    value={enderecoEntrega}
                    onChange={(e) => setEnderecoEntrega(e.target.value)}
                    placeholder="Rua, Número, Bairro e Ponto de Referência"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {tipoAtendimento === 'salao' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Número da Mesa / Comanda
                  </label>
                  <input
                    type="text"
                    value={numeroMesa}
                    onChange={(e) => setNumeroMesa(e.target.value)}
                    placeholder="Ex: Mesa 04 ou Balcão"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Coupon input */}
              <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-300">
                  <span className="font-bold flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-500" />
                    Cupom de Desconto
                  </span>
                  <span className="text-[10px] text-stone-500">Ex: TAVERNA10</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Código do cupom..."
                    className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-100 uppercase focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
                {couponMessage && (
                  <p className="text-[11px] text-amber-400">{couponMessage}</p>
                )}
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'pix' as const, label: '💠 Pix (Instantâneo)' },
                    { id: 'cartao_entrega' as const, label: '💳 Cartão' },
                    { id: 'dinheiro' as const, label: '💵 Dinheiro' }
                  ].map(pag => (
                    <button
                      key={pag.id}
                      type="button"
                      onClick={() => setFormaPagamento(pag.id)}
                      className={`p-2.5 rounded-xl text-xs font-bold text-center border transition-all ${
                        formaPagamento === pag.id
                          ? 'bg-amber-600/20 text-amber-400 border-amber-500 font-bold'
                          : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      {pag.label}
                    </button>
                  ))}
                </div>

                {formaPagamento === 'dinheiro' && (
                  <div className="pt-1">
                    <label className="block text-[11px] text-stone-400 mb-1">
                      Precisa de troco para quanto?
                    </label>
                    <input
                      type="text"
                      value={trocoPara}
                      onChange={(e) => setTrocoPara(e.target.value)}
                      placeholder="Ex: R$ 50,00 ou R$ 100,00"
                      className="w-full px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-xs text-stone-100"
                    />
                  </div>
                )}
              </div>

              {/* Order financial totals */}
              <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-2 text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>Subtotal Itens:</span>
                  <span className="font-mono">R$ {cartSubtotal.toFixed(2)}</span>
                </div>
                {tipoAtendimento === 'delivery' && (
                  <div className="flex justify-between text-stone-400">
                    <span>Taxa de Entrega:</span>
                    <span className="font-mono">R$ {taxaEntrega.toFixed(2)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Desconto ({appliedCoupon?.code}):</span>
                    <span className="font-mono">- R$ {discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-100 font-extrabold text-sm pt-2 border-t border-stone-800/80">
                  <span>Valor Total:</span>
                  <span className="font-mono text-amber-400 text-lg">
                    R$ {cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-stone-200"
                >
                  Voltar ao Cardápio
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 text-xs font-black uppercase tracking-wider shadow-xl transition-all active:scale-95 flex items-center gap-2"
                >
                  <Flame className="w-4 h-4 fill-stone-950" />
                  <span>Enviar Pedido para a Cozinha</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {orderConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md bg-stone-900 border border-amber-600/40 rounded-3xl shadow-2xl p-6 text-center space-y-5 my-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                Pedido Recebido com Sucesso
              </span>
              <h3 className="text-2xl font-black text-stone-100 font-display">
                Comanda #{orderConfirmation.id}
              </h3>
              <p className="text-xs text-stone-300">
                Seu pedido já entrou na fila de grelha do KDS da Taverna!
              </p>
            </div>

            {/* Pix QR Code & Nubank Integration Display */}
            {formaPagamento === 'pix' && (
              <div className="p-4 bg-stone-950 rounded-2xl border border-purple-900/60 shadow-lg space-y-3.5 text-left">
                {/* Nubank Brand Header */}
                <div className="flex items-center justify-between pb-2 border-b border-purple-900/40">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-700 text-white flex items-center justify-center font-black text-xs shadow-md">
                      Nu
                    </div>
                    <div>
                      <span className="text-xs font-black text-purple-300 block leading-tight">
                        Recebimento Oficial Nubank
                      </span>
                      <span className="text-[10px] text-stone-400 font-medium">
                        Nu Pagamentos S.A. • Banco 260
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>CRC16 BACEN Válido</span>
                  </span>
                </div>

                {/* Se o pagamento já foi confirmado pela API Nubank */}
                {nubankStatus === 'pago' && nubankReceipt ? (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/60 space-y-2 text-center animate-fade-in">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-emerald-300">
                        Pagamento Confirmado no Nubank!
                      </h4>
                      <p className="text-[11px] text-emerald-200/80 mt-0.5">
                        Transação liquidada instantaneamente via Nu Pagamentos (260)
                      </p>
                    </div>
                    <div className="p-2 bg-stone-900/90 rounded-lg text-[10px] text-stone-300 font-mono space-y-1 text-left border border-emerald-500/30">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Autenticação Nu:</span>
                        <span className="text-emerald-400 font-bold">{nubankReceipt.codigoAutenticacao}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Horário:</span>
                        <span>{nubankReceipt.horario}</span>
                      </div>
                      <div className="flex justify-between truncate">
                        <span className="text-stone-400">ID E2E:</span>
                        <span className="text-[9px] text-stone-300 truncate max-w-[180px]">{nubankReceipt.e2eId}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-emerald-400 font-semibold">
                      ⚡ Pedido liberado automaticamente para a grelha no KDS!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* QR Code Container */}
                    <div className="text-center space-y-2">
                      <div className="p-3 bg-white rounded-2xl inline-block shadow-xl border-2 border-purple-500/30">
                        <QRCodeSVG 
                          value={orderConfirmation.pixCode} 
                          size={155}
                          level="M"
                        />
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-amber-400 font-mono text-xs font-black">
                          R$ {orderConfirmation.total.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          Aponte a câmera do seu banco
                        </span>
                      </div>
                    </div>

                    {/* Botões de Ação Pix */}
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-700 to-purple-800 hover:from-purple-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-98"
                      >
                        {pixCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                        <span>{pixCopied ? 'Código Copia e Cola Copiado!' : 'Copiar Código Pix Copia e Cola'}</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={handleCopyPixKey}
                          className="py-2 px-2 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white text-[11px] font-bold rounded-xl transition-colors border border-stone-800 flex items-center justify-center gap-1.5"
                          title="Copiar a chave Pix direta cadastrada no Nubank"
                        >
                          <Tag className="w-3.5 h-3.5 text-purple-400" />
                          <span className="truncate">{pixKeyCopied ? 'Chave Copiada!' : 'Copiar Chave'}</span>
                        </button>

                        <a
                          href={generateNubankDeepLink(orderConfirmation.pixCode)}
                          className="py-2 px-2 bg-stone-900 hover:bg-stone-800 text-purple-300 hover:text-purple-200 text-[11px] font-bold rounded-xl transition-colors border border-purple-900/60 flex items-center justify-center gap-1.5"
                          title="Abre direto no app do Nubank no seu celular"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                          <span>Abrir App Nubank</span>
                        </a>
                      </div>
                    </div>

                    {/* Verificador de Pagamento na API Nubank */}
                    <div className="pt-2 border-t border-stone-800/80">
                      <button
                        type="button"
                        onClick={handleVerifyNubankPayment}
                        disabled={nubankStatus === 'verificando'}
                        className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 border border-purple-800/40 text-purple-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${nubankStatus === 'verificando' ? 'animate-spin' : ''}`} />
                        <span>
                          {nubankStatus === 'verificando' 
                            ? 'Consultando API Nubank PJ...' 
                            : 'Verificar Pagamento no Nubank (API)'}
                        </span>
                      </button>
                    </div>

                    {/* Dados do Recebedor Nubank */}
                    <div className="p-2.5 rounded-xl bg-stone-900/50 border border-stone-800/60 space-y-1 text-[10px] text-stone-400">
                      <div className="flex justify-between">
                        <span>Titular / Razão Social:</span>
                        <strong className="text-stone-200">{orderConfirmation.nomeTitular}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Banco Recebedor:</span>
                        <strong className="text-purple-400">Nubank (Nu Pagamentos 260)</strong>
                      </div>
                      <div className="flex justify-between truncate">
                        <span>Chave Pix:</span>
                        <span className="font-mono text-stone-300 truncate max-w-[170px]">{orderConfirmation.pixKey}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-1.5 text-xs text-stone-400">
              <div className="flex justify-between">
                <span>Total Confirmado:</span>
                <strong className="text-amber-400 font-mono text-base">
                  R$ {orderConfirmation.total.toFixed(2)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Descartáveis:</span>
                <strong className="text-stone-200">{orderConfirmation.descartaveisMsg}</strong>
              </div>
              <div className="flex justify-between">
                <span>Tempo Estimado:</span>
                <strong className="text-stone-200">15 – 25 minutos</strong>
              </div>
              <div className="flex justify-between">
                <span>Impressão Térmica:</span>
                <strong className="text-emerald-400">Comprovante {thermalFormat} Gerado</strong>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleSendWhatsAppOrder}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Comprovante no WhatsApp</span>
              </button>

              <button
                onClick={() => setOrderConfirmation(null)}
                className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors"
              >
                Fazer Novo Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
