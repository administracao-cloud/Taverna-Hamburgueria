import { FichaTecnica, RecipeCategory } from '../types';

export interface ParsedIFoodItem {
  nome: string;
  descricao: string;
  precoVenda: number;
  precoOriginal?: number;
  categoriaOrigem: string;
  categoriaSistema: RecipeCategory;
  destaque?: boolean;
  imagemUrl?: string;
  badge?: string;
}

export interface IFoodStoreMetadata {
  nomeLoja: string;
  cidade: string;
  estado: string;
  status: 'aberta' | 'fechada';
  horarioAbertura: string;
  pedidoMinimo: number;
  tempoMedioMinutos: string;
  avaliacao: number;
  totalAvaliacoes: number;
}

export const DEFAULT_TAVERNA_STORE_INFO: IFoodStoreMetadata = {
  nomeLoja: 'Taverna - Hamburgueria Artesanal',
  cidade: 'Porto Velho',
  estado: 'RO',
  status: 'aberta',
  horarioAbertura: 'Aberto até 23:30 (Chapa Quente)',
  pedidoMinimo: 23.00,
  tempoMedioMinutos: '15 – 25 min',
  avaliacao: 4.9,
  totalAvaliacoes: 128
};

// Cardápio Oficial extraído diretamente da loja Taverna - Hamburgueria Artesanal (Porto Velho - RO) no iFood
export const TAVERNA_IFOOD_CATALOG: ParsedIFoodItem[] = [
  // Guilda de Heróis (Smash Burgers)
  {
    nome: 'O Ogro | Smash Triplo Burguer',
    descricao: 'Para as fomes mais brutais do reino! Pão brioche tostado na manteiga, 3 suculentos smash burgers (210g de carne artesanal) e o triplo de queijo cheddar derretido entre todas as camadas. Um desafio monumental que só um verdadeiro ogro conseguiria devorar. Vai encarar? ⚔️',
    precoVenda: 44.90,
    precoOriginal: 48.90,
    categoriaOrigem: 'Guilda de Heróis (Smash Burgers)',
    categoriaSistema: 'Smash Burgers',
    destaque: true,
    imagemUrl: '/src/assets/images/ogro_smash_burger_1791527297769.jpg',
    badge: '⚔️ Desafio da Guilda (3x Carne)'
  },
  {
    nome: 'O Alquimista | Smash Duplo Cheddar Melt',
    descricao: 'Para os fãs do clássico Melt, mas com a qualidade artesanal da Taverna! Pão brioche super macio selado na manteiga, 2 smash burgers (140g) com crostinha perfeita, 2 fatias de cheddar derretido, cobertos por uma poção generosa do nosso creme de cheddar especial e finalizado com cebola caramelizada doce e suculenta.',
    precoVenda: 38.90,
    precoOriginal: 42.90,
    categoriaOrigem: 'Guilda de Heróis (Smash Burgers)',
    categoriaSistema: 'Smash Burgers',
    destaque: true,
    badge: '🧀 Cheddar Melt da Casa'
  },
  {
    nome: 'O Piromante | Smash Bbq & Cebola Caramelizada',
    descricao: 'Pão brioche selado na manteiga, 2 smash burgers (140g no total), queijo cheddar duplo derretido, bacon super crocante e o toque mágico de nossa cebola caramelizada artesanal com um fio de molho barbecue defumado. Uma explosão de sabores direto da chapa!',
    precoVenda: 37.90,
    precoOriginal: 42.90,
    categoriaOrigem: 'Guilda de Heróis (Smash Burgers)',
    categoriaSistema: 'Smash Burgers',
    destaque: true,
    badge: '🔥 Fogo & Brasa'
  },
  {
    nome: 'O Bárbaro | Smash Burger Duplo Cheddar',
    descricao: 'Pão brioche selado na manteiga, 2 smash burgers (140g no total), dupla camada de queijo cheddar derretido e maionese cremosa da casa. Para quem precisa de força em dobro!',
    precoVenda: 35.90,
    precoOriginal: 40.90,
    categoriaOrigem: 'Guilda de Heróis (Smash Burgers)',
    categoriaSistema: 'Smash Burgers',
    badge: '💪 Força em Dobro'
  },
  {
    nome: 'O Caçador | Smash Burger X-Bacon',
    descricao: 'Pão brioche selado na manteiga, 1 smash burger (70g), queijo cheddar derretido, bastante bacon crocante e maionese cremosa da casa.',
    precoVenda: 28.90,
    precoOriginal: 33.90,
    categoriaOrigem: 'Guilda de Heróis (Smash Burgers)',
    categoriaSistema: 'Smash Burgers',
    destaque: true,
    badge: '🥓 Muito Bacon'
  },
  {
    nome: 'O Druida | Smash Burger X-Salada',
    descricao: 'Pão brioche selado na manteiga, 1 smash burger (70g), queijo cheddar derretido, alface fresca, tomate suculento e maionese cremosa da casa. Frescor e equilíbrio natural!',
    precoVenda: 25.90,
    precoOriginal: 29.90,
    categoriaOrigem: 'Guilda de Heróis (Smash Burgers)',
    categoriaSistema: 'Smash Burgers',
    badge: '🥗 Equilíbrio Natural'
  },
  {
    nome: 'O Aventureiro | Smash Cheeseburger Artesanal',
    descricao: 'Pão brioche selado na manteiga, 1 smash burger (70g) preparado na chapa, queijo cheddar derretido e maionese cremosa da casa. O ponto de partida perfeito para a sua jornada!',
    precoVenda: 23.90,
    precoOriginal: 27.90,
    categoriaOrigem: 'Guilda de Heróis (Smash Burgers)',
    categoriaSistema: 'Smash Burgers',
    destaque: true,
    badge: '⭐ Entrada da Guilda'
  },

  // Combos e Missões (Mais Vendidos)
  {
    nome: 'Banquete do Solitário | Combo Individual (Smash + Batata + Refri)',
    descricao: '1 Hambúrguer à sua escolha + 1 Batata Escudeiro (150g) + 1 Poção (Bebida 350ml). A energia necessária para seguir viagem!',
    precoVenda: 39.90,
    precoOriginal: 45.90,
    categoriaOrigem: 'Combos e Missões (Mais Vendidos)',
    categoriaSistema: 'Clássicos',
    destaque: true,
    imagemUrl: '/src/assets/images/taverna_combo_feast_1791527316477.jpg',
    badge: '👑 Campeão de Pedidos'
  },
  {
    nome: 'Aliança de Heróis | Combo Duplo (2 Smash + Batata + Refri)',
    descricao: '2 Hambúrgueres à sua escolha + 1 Batata Guilda para partilhar (Tamanho médio) + Bebida.',
    precoVenda: 74.90,
    precoOriginal: 79.90,
    categoriaOrigem: 'Combos e Missões (Mais Vendidos)',
    categoriaSistema: 'Clássicos',
    badge: '👥 Combo para 2'
  },
  {
    nome: 'Festim da Guilda | Combo Família (3 Smash + 1 Batata Grande + Bebida)',
    descricao: 'Reúna a sua guilda para o maior banquete do reino! 3 Hambúrgueres artesanais à vossa escolha + 1 Porção Colossal do nosso Tesouro do Dragão (Batatas super crocantes cobertas com muito cheddar derretido e bacon rústico) + Bebidas para saciar a sede de todos os guerreiros.',
    precoVenda: 109.90,
    precoOriginal: 125.00,
    categoriaOrigem: 'Combos e Missões (Mais Vendidos)',
    categoriaSistema: 'Clássicos',
    destaque: true,
    imagemUrl: '/src/assets/images/taverna_combo_feast_1791527316477.jpg',
    badge: '🏰 Banquete da Guilda'
  },

  // Provisões (Batatas e Tesouros)
  {
    nome: 'Tesouro do Dragão (Batata com Cheddar e Bacon)',
    descricao: 'As nossas famosas Raízes da Taverna cobertas com uma generosa camada de creme de cheddar derretido e pedaços de bacon crocante.',
    precoVenda: 18.90,
    precoOriginal: 25.90,
    categoriaOrigem: 'Provisões (Batatas e Tesouros)',
    categoriaSistema: 'Porções / Acompanhamentos',
    destaque: true,
    imagemUrl: '/src/assets/images/tesouro_dragao_fries_1791527306799.jpg',
    badge: '🍟 Crocância Suprema'
  },
  {
    nome: 'Espadas de Ouro (Batata Frita Tradicional)',
    descricao: 'Batatas fritas tradicionais sequinhas e super crocantes, temperadas com sal de parrilla da Taverna.',
    precoVenda: 12.90,
    precoOriginal: 16.90,
    categoriaOrigem: 'Provisões (Batatas e Tesouros)',
    categoriaSistema: 'Porções / Acompanhamentos',
    badge: '⚔️ Super Crocante'
  },

  // Mercador de Poções (Molhos Extras)
  {
    nome: 'Elixir da Casa (Pote de Molho Cheddar)',
    descricao: 'Pote com a nossa poção aveludada e cremosa de queijo cheddar artesanal derretido.',
    precoVenda: 4.90,
    categoriaOrigem: 'Mercador de Poções (Molhos Extras)',
    categoriaSistema: 'Molhos da Casa'
  },
  {
    nome: 'Elixir da Forja (Pote de Molho Barbecue)',
    descricao: 'Pote com molho barbecue defumado artesanal com especiarias secretas da casa.',
    precoVenda: 4.90,
    categoriaOrigem: 'Mercador de Poções (Molhos Extras)',
    categoriaSistema: 'Molhos da Casa'
  },

  // Poções Mágicas (Bebidas)
  {
    nome: 'Água Mineral Sem Gás Kayary 498ml | Água da Nascente Élfica',
    descricao: 'Pura, leve e refrescante, extraída diretamente das nascentes místicas para hidratar a sua guilda antes da próxima jornada.',
    precoVenda: 4.90,
    categoriaOrigem: 'Poções Mágicas (Bebidas)',
    categoriaSistema: 'Bebidas'
  },
  {
    nome: 'Coca-Cola Zero 600ml | Elixir das Sombras Maior',
    descricao: 'Todo o poder de recuperação em uma poção sombria e sem açúcar. A escolha ideal para os magos e guerreiros que buscam leveza sem perder a energia.',
    precoVenda: 10.90,
    categoriaOrigem: 'Poções Mágicas (Bebidas)',
    categoriaSistema: 'Bebidas'
  },
  {
    nome: 'Coca-Cola Original 600ml | Poção de Vida Maior',
    descricao: 'A poção vermelha clássica em tamanho grande. Perfeita para recuperar todos os seus pontos de energia (HP) depois de encarar os maiores desafios da nossa Taverna. Bem gelada!',
    precoVenda: 10.90,
    categoriaOrigem: 'Poções Mágicas (Bebidas)',
    categoriaSistema: 'Bebidas'
  },
  {
    nome: 'Coca-Cola Original Lata 350ml | Poção de Vida Menor',
    descricao: 'A dose exata de cura rápida. Nossa poção vermelha clássica em lata, servida trincando de gelada para acompanhar o seu banquete.',
    precoVenda: 8.90,
    categoriaOrigem: 'Poções Mágicas (Bebidas)',
    categoriaSistema: 'Bebidas'
  },
  {
    nome: 'Coca-Cola Zero Lata 350ml | Elixir das Sombras Menor',
    descricao: 'A versão compacta e sem açúcar da nossa poção sombria. Refrescante e na medida certa para a sua missão.',
    precoVenda: 8.90,
    categoriaOrigem: 'Poções Mágicas (Bebidas)',
    categoriaSistema: 'Bebidas'
  }
];

export function extractIFoodStoreMetadata(rawText: string): IFoodStoreMetadata {
  const metadata = { ...DEFAULT_TAVERNA_STORE_INFO };
  if (!rawText) return metadata;

  const lower = rawText.toLowerCase();

  if (lower.includes('porto velho') || lower.includes('pvh')) {
    metadata.cidade = 'Porto Velho';
    metadata.estado = 'RO';
  }

  if (lower.includes('loja fechada')) {
    metadata.status = 'fechada';
  } else if (lower.includes('loja aberta') || lower.includes('aberto')) {
    metadata.status = 'aberta';
  }

  const abreMatch = rawText.match(/abre\s*(?:às|as)\s*([\d:]+)/i);
  if (abreMatch) {
    metadata.horarioAbertura = `Abre às ${abreMatch[1]}`;
  }

  const minOrderMatch = rawText.match(/pedido\s*m[íi]nimo\s*r\$\s*([\d,.]+)/i);
  if (minOrderMatch) {
    metadata.pedidoMinimo = parseFloat(minOrderMatch[1].replace('.', '').replace(',', '.'));
  }

  return metadata;
}

export function parseRawIFoodText(rawText: string): ParsedIFoodItem[] {
  if (!rawText || rawText.trim().length === 0) {
    return TAVERNA_IFOOD_CATALOG;
  }

  const lines = rawText
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const parsedItems: ParsedIFoodItem[] = [];
  let currentCategory = 'Geral';
  const seenNames = new Set<string>();

  const categoryKeywords = [
    'Guilda de Heróis',
    'Combos e Missões',
    'Provisões',
    'Mercador de Poções',
    'Poções Mágicas',
    'Destaques',
    'Smash Burgers',
    'Clássicos',
    'Porções',
    'Bebidas',
    'Molhos'
  ];

  const ignoreKeywords = [
    'busque por item ou loja',
    'ver mais',
    'pedido mínimo',
    'início',
    'restaurantes',
    'mercados',
    '0 itens',
    'loja fechada',
    'abre às',
    'buscar no cardápio',
    'novidade no ifood',
    'porto velho - ro'
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is a category header
    const matchedCategory = categoryKeywords.find(kw => 
      line.toLowerCase().includes(kw.toLowerCase()) && line.length < 55 && !line.includes('R$')
    );
    if (matchedCategory) {
      currentCategory = line;
      continue;
    }

    // Check if line contains a price pattern like "R$ 28,90" or "R$ 28,90R$ 33,90"
    const priceMatch = line.match(/R\$\s*([\d,.]+)(?:R\$\s*([\d,.]+))?/);
    if (priceMatch) {
      const price1Str = priceMatch[1].replace('.', '').replace(',', '.');
      const price2Str = priceMatch[2]?.replace('.', '').replace(',', '.');

      let precoVenda = parseFloat(price1Str);
      let precoOriginal: number | undefined = price2Str ? parseFloat(price2Str) : undefined;

      // In iFood, the promo price comes first and original strikethrough second
      if (precoOriginal && precoVenda > precoOriginal) {
        const tmp = precoVenda;
        precoVenda = precoOriginal;
        precoOriginal = tmp;
      }

      // Ignore zero price noise (e.g. cart counter R$ 0,00)
      if (precoVenda <= 0) continue;

      // Look back for item title & description
      let title = '';
      let desc = '';

      if (i > 1 && !lines[i - 1].includes('R$') && lines[i - 1] !== 'Fechado') {
        if (i > 2 && !lines[i - 2].includes('R$') && lines[i - 2] !== 'Fechado' && !lines[i - 2].includes('iFood')) {
          title = lines[i - 2];
          desc = lines[i - 1];
        } else {
          title = lines[i - 1];
        }
      } else if (i > 0 && !lines[i - 1].includes('R$') && lines[i - 1] !== 'Fechado') {
        title = lines[i - 1];
      }

      // Clean title from repetition or tags
      title = title.replace(/\s*Fechado\s*$/i, '').trim();

      // Check if title is a noise header
      const lowerTitle = title.toLowerCase();
      const isNoise = ignoreKeywords.some(kw => lowerTitle === kw || lowerTitle.includes(kw));
      if (isNoise || title.length < 3) continue;

      if (!seenNames.has(lowerTitle)) {
        seenNames.add(lowerTitle);

        let categoriaSistema: RecipeCategory = 'Smash Burgers';
        const lowerCat = currentCategory.toLowerCase();

        if (lowerCat.includes('bebida') || lowerCat.includes('poções mágicas') || lowerTitle.includes('coca') || lowerTitle.includes('água') || lowerTitle.includes('suco')) {
          categoriaSistema = 'Bebidas';
        } else if (lowerCat.includes('molho') || lowerCat.includes('mercador de poções') || lowerTitle.includes('elixir') || lowerTitle.includes('pote')) {
          categoriaSistema = 'Molhos da Casa';
        } else if (lowerCat.includes('provisões') || lowerCat.includes('batata') || lowerCat.includes('porç') || lowerTitle.includes('batata') || lowerTitle.includes('espadas') || lowerTitle.includes('tesouro')) {
          categoriaSistema = 'Porções / Acompanhamentos';
        } else if (lowerCat.includes('combo') || lowerCat.includes('banquete') || lowerCat.includes('festim') || lowerCat.includes('aliança')) {
          categoriaSistema = 'Clássicos';
        } else {
          categoriaSistema = 'Smash Burgers';
        }

        // Identificar imagem se fornecida explicitamente ou se for exatamente um item com foto autêntica confirmada
        let itemImagemUrl: string | undefined = undefined;
        
        // Verifica se há URL de imagem no texto copiado do iFood
        if (desc.includes('http') && (desc.includes('.jpg') || desc.includes('.png') || desc.includes('.webp') || desc.includes('ifood'))) {
          const urlMatch = desc.match(/https?:\/\/[^\s)]+/);
          if (urlMatch) itemImagemUrl = urlMatch[0];
        }

        // Se não tiver imagem na cópia, apenas anexa foto se for rigorosamente o item com foto autêntica própria
        if (!itemImagemUrl) {
          const norm = lowerTitle.trim();
          if (norm.startsWith('o ogro') || norm.includes('smash triplo burguer')) {
            itemImagemUrl = '/src/assets/images/ogro_smash_burger_1791527297769.jpg';
          } else if (norm.startsWith('tesouro do dragão') || (norm.includes('batata') && norm.includes('cheddar') && norm.includes('bacon'))) {
            itemImagemUrl = '/src/assets/images/tesouro_dragao_fries_1791527306799.jpg';
          } else if (norm.startsWith('festim da guilda') || norm.startsWith('banquete do solitário')) {
            itemImagemUrl = '/src/assets/images/taverna_combo_feast_1791527316477.jpg';
          }
        }

        // Descrição e badges do catálogo apenas se for item correspondente conhecido
        const exactMatch = TAVERNA_IFOOD_CATALOG.find(k => 
          k.nome.toLowerCase().trim() === lowerTitle.trim()
        );

        parsedItems.push({
          nome: title,
          descricao: desc || exactMatch?.descricao || '',
          precoVenda,
          precoOriginal: precoOriginal || exactMatch?.precoOriginal,
          categoriaOrigem: currentCategory,
          categoriaSistema,
          destaque: currentCategory.toLowerCase().includes('destaque') || currentCategory.toLowerCase().includes('mais vendido') || exactMatch?.destaque,
          imagemUrl: itemImagemUrl,
          badge: exactMatch?.badge
        });
      }
    }
  }

  // Se a lista estiver vazia (usuário não colou nada), retorna o catálogo oficial Taverna
  if (parsedItems.length === 0) {
    return TAVERNA_IFOOD_CATALOG;
  }

  return parsedItems;
}

export function convertParsedItemToFicha(item: ParsedIFoodItem, existingFichasCount: number): FichaTecnica {
  let custoInsumos = Number((item.precoVenda * 0.30).toFixed(2));
  let custoEmbalagem = 1.50;
  let custoMaoDeObra = 2.00;
  let pesoCru = 250;
  let fatorReducao = 20;

  if (item.categoriaSistema === 'Bebidas') {
    custoInsumos = Number((item.precoVenda * 0.38).toFixed(2));
    custoEmbalagem = 0.20;
    custoMaoDeObra = 0.30;
    pesoCru = 350;
    fatorReducao = 0;
  } else if (item.categoriaSistema === 'Molhos da Casa') {
    custoInsumos = Number((item.precoVenda * 0.25).toFixed(2));
    custoEmbalagem = 0.40;
    custoMaoDeObra = 0.50;
    pesoCru = 60;
    fatorReducao = 0;
  } else if (item.categoriaSistema === 'Porções / Acompanhamentos') {
    custoInsumos = Number((item.precoVenda * 0.28).toFixed(2));
    custoEmbalagem = 0.80;
    custoMaoDeObra = 1.00;
    pesoCru = 200;
    fatorReducao = 15;
  } else if (item.nome.includes('Triplo')) {
    pesoCru = 380;
    custoInsumos = Number((item.precoVenda * 0.35).toFixed(2));
  } else if (item.nome.includes('Duplo')) {
    pesoCru = 300;
    custoInsumos = Number((item.precoVenda * 0.32).toFixed(2));
  }

  const custoTotal = custoInsumos + custoEmbalagem + custoMaoDeObra;
  const cmv = item.precoVenda > 0 ? Number(((custoInsumos / item.precoVenda) * 100).toFixed(1)) : 30;
  const pesoGrelhado = Math.round(pesoCru * (1 - fatorReducao / 100));

  return {
    id: `ft-ifood-${Date.now()}-${existingFichasCount}-${Math.random().toString(36).substr(2, 4)}`,
    nome: item.nome,
    categoria: item.categoriaSistema,
    descricao: item.descricao,
    tempoPreparoMinutos: item.categoriaSistema === 'Bebidas' ? 2 : item.categoriaSistema === 'Molhos da Casa' ? 3 : 10,
    ingredientes: [
      {
        insumoId: 'ins-ifood-base',
        nomeInsumo: item.categoriaSistema === 'Bebidas' ? 'Lata / Garrafa Refrigerada' : 'Insumos do Item (Blend + Acompanhamentos)',
        unidade: 'un',
        quantidade: 1,
        custoUnitario: custoInsumos,
        custoTotal: custoInsumos
      }
    ],
    pesoCruTotal: pesoCru,
    fatorReducaoChapa: fatorReducao,
    pesoGrelhado,
    rendimentoPorcoes: 1,
    custoInsumos,
    custoEmbalagem,
    custoMaoDeObra,
    custoTotalProducao: Number(custoTotal.toFixed(2)),
    margemLucroAlvo: 60,
    impostosTaxas: 10,
    precoVendaSugerido: item.precoVenda,
    precoVendaPraticado: item.precoVenda,
    precoOriginal: item.precoOriginal,
    cmvPercentual: cmv,
    modoPreparo: [
      'Separar os insumos padronizados da guilda.',
      'Grelhar / montar conforme ficha técnica do cardápio.',
      'Embalar termicamente para entrega ou servir na bandeja de madeira.'
    ],
    pontoCarneRecomendado: item.categoriaSistema === 'Smash Burgers' ? 'Smash Crocante' : 'Ao Ponto',
    destaque: item.destaque,
    ifoodCategory: item.categoriaOrigem,
    imagemUrl: item.imagemUrl,
    habilitarAdicionais: item.categoriaSistema === 'Smash Burgers' || item.categoriaSistema === 'Clássicos' || item.categoriaSistema === 'Porções / Acompanhamentos',
    habilitarRemocaoIngredientes: item.categoriaSistema === 'Smash Burgers' || item.categoriaSistema === 'Clássicos',
    perguntaSaches: item.categoriaSistema === 'Smash Burgers' || item.categoriaSistema === 'Clássicos' || item.categoriaSistema === 'Porções / Acompanhamentos',
    ativo: true,
    dataCriacao: new Date().toISOString().split('T')[0]
  };
}

