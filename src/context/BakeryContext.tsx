import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Insumo, 
  FichaTecnica, 
  OrdemChapa, 
  ItemPedidoChapa,
  MaterialCategory, 
  RecipeCategory, 
  UserRole,
  BlendCalculatorState,
  DigitalMenuSettings,
  AdicionalConfig
} from '../types';
import { 
  TAVERNA_IFOOD_CATALOG, 
  convertParsedItemToFicha, 
  ParsedIFoodItem 
} from '../utils/ifoodParser';
import { printOrdemChapaThermal } from '../utils/thermalPrinter';
import { generatePixPayload } from '../utils/pixPayload';

export const DEFAULT_MENU_SETTINGS: DigitalMenuSettings = {
  lojaAberta: true,
  permitirDelivery: true,
  permitirRetirada: true,
  permitirSalao: false, // Default desmarcado para modo delivery prioritário
  taxaEntregaPadrao: 5.00,
  pedidoMinimo: 23.00,

  habilitarPontoCarne: false, // Hambúrguer smash é smash crocante padrão
  pontoCarnePadrao: 'Smash Crocante (Crosta Maillard)',

  habilitarPerguntaSaches: true, // Estilo iFood
  habilitarPerguntaGuardanapos: true,

  habilitarAdicionais: true,
  adicionais: [
    { id: 'add-1', nome: 'Bacon Artesanal Crocante (+30g)', preco: 4.50, ativo: true, categoriaAplicavel: 'burgers' },
    { id: 'add-2', nome: 'Creme de Cheddar Especial Taverna (+40g)', preco: 4.00, ativo: true, categoriaAplicavel: 'todos' },
    { id: 'add-3', nome: 'Fatias Extras de Queijo Cheddar Inglês', preco: 3.50, ativo: true, categoriaAplicavel: 'burgers' },
    { id: 'add-4', nome: 'Cebola Caramelizada no Açúcar Mascavo (+40g)', preco: 3.00, ativo: true, categoriaAplicavel: 'burgers' },
    { id: 'add-5', nome: 'Pote de Maionese Verde Defumada da Casa', preco: 2.50, ativo: true, categoriaAplicavel: 'todos' },
    { id: 'add-6', nome: 'Picles Artesanal Agridoce Crocante', preco: 2.00, ativo: false, categoriaAplicavel: 'burgers' }
  ],

  pixNubank: {
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
  }
};

// Exactly matching required material categories
export const materialCategories: MaterialCategory[] = [
  'Carnes e Blends',
  'Pães',
  'Queijos',
  'Molhos e Condimentos',
  'Vegetais e Saladas',
  'Embalagens e Descartáveis',
  'Bebidas',
  'Outros'
];

export const recipeCategories: RecipeCategory[] = [
  'Smash Burgers',
  'Clássicos',
  'Porções / Acompanhamentos',
  'Molhos da Casa',
  'Bebidas'
];

const INITIAL_INSUMOS: Insumo[] = [
  {
    id: 'ins-1',
    nome: 'Blend Especial Taverna (Peito + Acém + Costela)',
    categoria: 'Carnes e Blends',
    unidade: 'kg',
    precoCompra: 38.50,
    quantidadeEmbalagem: 1,
    custoUnitario: 0.0385, // R$ por grama
    estoqueAtual: 42.5,
    estoqueMinimo: 15.0,
    fornecedor: 'Frigorífico Boi Nobre',
    ultimaAtualizacao: '2026-09-25'
  },
  {
    id: 'ins-2',
    nome: 'Blend Smash (Acém + Fraldinha + Gordura Brisket)',
    categoria: 'Carnes e Blends',
    unidade: 'kg',
    precoCompra: 36.00,
    quantidadeEmbalagem: 1,
    custoUnitario: 0.0360,
    estoqueAtual: 28.0,
    estoqueMinimo: 12.0,
    fornecedor: 'Frigorífico Boi Nobre',
    ultimaAtualizacao: '2026-09-25'
  },
  {
    id: 'ins-3',
    nome: 'Bacon em Manta Defumado Artesanal',
    categoria: 'Carnes e Blends',
    unidade: 'kg',
    precoCompra: 44.00,
    quantidadeEmbalagem: 1,
    custoUnitario: 0.0440,
    estoqueAtual: 14.2,
    estoqueMinimo: 6.0,
    fornecedor: 'Charcutaria da Serra',
    ultimaAtualizacao: '2026-09-24'
  },
  {
    id: 'ins-4',
    nome: 'Pão Brioche Selado com Manteiga (Gergelim Preto)',
    categoria: 'Pães',
    unidade: 'un',
    precoCompra: 72.00,
    quantidadeEmbalagem: 30, // R$ 2.40 por unidade
    custoUnitario: 2.40,
    estoqueAtual: 120,
    estoqueMinimo: 40,
    fornecedor: 'Panifício Central',
    ultimaAtualizacao: '2026-09-25'
  },
  {
    id: 'ins-5',
    nome: 'Pão Australiano Artesanal com Cacau & Mel',
    categoria: 'Pães',
    unidade: 'un',
    precoCompra: 52.00,
    quantidadeEmbalagem: 20,
    custoUnitario: 2.60,
    estoqueAtual: 65,
    estoqueMinimo: 25,
    fornecedor: 'Panifício Central',
    ultimaAtualizacao: '2026-09-24'
  },
  {
    id: 'ins-6',
    nome: 'Pão Smash de Batata Amarela',
    categoria: 'Pães',
    unidade: 'un',
    precoCompra: 57.00,
    quantidadeEmbalagem: 30,
    custoUnitario: 1.90,
    estoqueAtual: 95,
    estoqueMinimo: 35,
    fornecedor: 'Panifício Central',
    ultimaAtualizacao: '2026-09-25'
  },
  {
    id: 'ins-7',
    nome: 'Queijo Cheddar Inglês Curado Fatiado',
    categoria: 'Queijos',
    unidade: 'kg',
    precoCompra: 58.00,
    quantidadeEmbalagem: 1,
    custoUnitario: 0.0580,
    estoqueAtual: 18.5,
    estoqueMinimo: 5.0,
    fornecedor: 'Laticínios Ouro Branco',
    ultimaAtualizacao: '2026-09-23'
  },
  {
    id: 'ins-8',
    nome: 'Queijo Gouda Holandês Fatiado',
    categoria: 'Queijos',
    unidade: 'kg',
    precoCompra: 64.00,
    quantidadeEmbalagem: 1,
    custoUnitario: 0.0640,
    estoqueAtual: 9.2,
    estoqueMinimo: 4.0,
    fornecedor: 'Laticínios Ouro Branco',
    ultimaAtualizacao: '2026-09-22'
  },
  {
    id: 'ins-9',
    nome: 'Queijo Gorgonzola D.O.C.',
    categoria: 'Queijos',
    unidade: 'kg',
    precoCompra: 72.00,
    quantidadeEmbalagem: 1,
    custoUnitario: 0.0720,
    estoqueAtual: 5.4,
    estoqueMinimo: 2.5,
    fornecedor: 'Laticínios Ouro Branco',
    ultimaAtualizacao: '2026-09-21'
  },
  {
    id: 'ins-10',
    nome: 'Molho Especial Taverna (Secret Burger Sauce)',
    categoria: 'Molhos e Condimentos',
    unidade: 'kg',
    precoCompra: 32.00,
    quantidadeEmbalagem: 1,
    custoUnitario: 0.0320,
    estoqueAtual: 12.0,
    estoqueMinimo: 4.0,
    fornecedor: 'Produção Própria',
    ultimaAtualizacao: '2026-09-25'
  },
  {
    id: 'ins-11',
    nome: 'Maionese Verde Defumada da Casa',
    categoria: 'Molhos e Condimentos',
    unidade: 'kg',
    precoCompra: 28.00,
    quantidadeEmbalagem: 1,
    custoUnitario: 0.0280,
    estoqueAtual: 15.0,
    estoqueMinimo: 5.0,
    fornecedor: 'Produção Própria',
    ultimaAtualizacao: '2026-09-25'
  },
  {
    id: 'ins-12',
    nome: 'Geleia de Bacon com Pimenta Biquinho',
    categoria: 'Molhos e Condimentos',
    unidade: 'kg',
    precoCompra: 48.00,
    quantidadeEmbalagem: 1,
    custoUnitario: 0.0480,
    estoqueAtual: 6.8,
    estoqueMinimo: 2.0,
    fornecedor: 'Produção Própria',
    ultimaAtualizacao: '2026-09-23'
  },
  {
    id: 'ins-13',
    nome: 'Cebola Roxa Caramelizada no Açúcar Mascavo',
    categoria: 'Vegetais e Saladas',
    unidade: 'kg',
    precoCompra: 24.00,
    quantidadeEmbalagem: 1,
    custoUnitario: 0.0240,
    estoqueAtual: 8.5,
    estoqueMinimo: 3.0,
    fornecedor: 'Produção Própria',
    ultimaAtualizacao: '2026-09-25'
  },
  {
    id: 'ins-14',
    nome: 'Pickles de Pepino Agridoce Crocante',
    categoria: 'Vegetais e Saladas',
    unidade: 'kg',
    precoCompra: 26.00,
    quantidadeEmbalagem: 1,
    custoUnitario: 0.0260,
    estoqueAtual: 7.2,
    estoqueMinimo: 2.5,
    fornecedor: 'Conservas Artesanais',
    ultimaAtualizacao: '2026-09-20'
  },
  {
    id: 'ins-15',
    nome: 'Alface Americana Hidropônica & Rúcula',
    categoria: 'Vegetais e Saladas',
    unidade: 'kg',
    precoCompra: 16.00,
    quantidadeEmbalagem: 1,
    custoUnitario: 0.0160,
    estoqueAtual: 6.0,
    estoqueMinimo: 3.0,
    fornecedor: 'Hortifruti Fazenda Verde',
    ultimaAtualizacao: '2026-09-25'
  },
  {
    id: 'ins-16',
    nome: 'Caixa Térmica Kraft Taverna Burger',
    categoria: 'Embalagens e Descartáveis',
    unidade: 'un',
    precoCompra: 130.00,
    quantidadeEmbalagem: 100,
    custoUnitario: 1.30,
    estoqueAtual: 340,
    estoqueMinimo: 100,
    fornecedor: 'Embalagens Brasil',
    ultimaAtualizacao: '2026-09-18'
  },
  {
    id: 'ins-17',
    nome: 'Papel Acoplado Antigordura Taverna',
    categoria: 'Embalagens e Descartáveis',
    unidade: 'un',
    precoCompra: 50.00,
    quantidadeEmbalagem: 200,
    custoUnitario: 0.25,
    estoqueAtual: 600,
    estoqueMinimo: 150,
    fornecedor: 'Embalagens Brasil',
    ultimaAtualizacao: '2026-09-18'
  },
  {
    id: 'ins-18',
    nome: 'Cerveja IPA Artesanal Taverna 500ml',
    categoria: 'Bebidas',
    unidade: 'un',
    precoCompra: 11.50,
    quantidadeEmbalagem: 1,
    custoUnitario: 11.50,
    estoqueAtual: 48,
    estoqueMinimo: 20,
    fornecedor: 'Cervejaria MaltHouse',
    ultimaAtualizacao: '2026-09-24'
  },
  {
    id: 'ins-19',
    nome: 'Batata Rústica Congelada Pré-Frita',
    categoria: 'Outros',
    unidade: 'kg',
    precoCompra: 15.00,
    quantidadeEmbalagem: 1,
    custoUnitario: 0.0150,
    estoqueAtual: 45.0,
    estoqueMinimo: 15.0,
    fornecedor: 'Distribuidora FoodService',
    ultimaAtualizacao: '2026-09-25'
  }
];

const INITIAL_FICHAS: FichaTecnica[] = [
  {
    id: 'ft-1',
    nome: 'Taverna Smash Bacon Duplo',
    categoria: 'Smash Burgers',
    descricao: 'Dois discos de 90g prensados na chapa de aço quente com crostinha perfeita, fatias generosas de cheddar inglês derretido, bacon artesanal crocante e molho especial da casa no pão brioche amanteigado.',
    tempoPreparoMinutos: 8,
    ingredientes: [
      { insumoId: 'ins-2', nomeInsumo: 'Blend Smash (Acém + Fraldinha)', unidade: 'g', quantidade: 180, custoUnitario: 0.0360, custoTotal: 6.48 },
      { insumoId: 'ins-4', nomeInsumo: 'Pão Brioche Selado', unidade: 'un', quantidade: 1, custoUnitario: 2.40, custoTotal: 2.40 },
      { insumoId: 'ins-7', nomeInsumo: 'Queijo Cheddar Inglês Curado', unidade: 'g', quantidade: 40, custoUnitario: 0.0580, custoTotal: 2.32 },
      { insumoId: 'ins-3', nomeInsumo: 'Bacon Artesanal Defumado', unidade: 'g', quantidade: 30, custoUnitario: 0.0440, custoTotal: 1.32 },
      { insumoId: 'ins-10', nomeInsumo: 'Molho Especial Taverna', unidade: 'g', quantidade: 25, custoUnitario: 0.0320, custoTotal: 0.80 }
    ],
    pesoCruTotal: 340,
    fatorReducaoChapa: 22, // 22% de redução na chapa/grelha
    pesoGrelhado: 265,
    rendimentoPorcoes: 1,
    custoInsumos: 13.32,
    custoEmbalagem: 1.55,
    custoMaoDeObra: 2.50,
    custoTotalProducao: 17.37,
    margemLucroAlvo: 60,
    impostosTaxas: 10,
    precoVendaSugerido: 42.00,
    precoVendaPraticado: 39.90,
    cmvPercentual: 33.38,
    modoPreparo: [
      'Aquecer a chapa a 230°C e pincelar manteiga clarificada.',
      'Selar o pão brioche por 40 segundos até dourar com brilho.',
      'Colocar 2 bolas de 90g do Blend Smash na chapa bem quente e smasher com peso uniforme.',
      'Temperar imediatamente com sal de parrilla e pimenta do reino.',
      'Aguardar formar crosta maillard profunda (aprox. 90s) e raspar com espátula afiada.',
      'Virar, aplicar as fatias de cheddar imediatamente e abafar com cúpula por 30s.',
      'Montar no pão com molho especial na base, empilhar os dois smashes, adicionar bacon crocante e fechar.'
    ],
    pontoCarneRecomendado: 'Bem Crocante (Smash)',
    habilitarAdicionais: true,
    habilitarRemocaoIngredientes: true,
    perguntaSaches: true,
    ativo: true,
    dataCriacao: '2026-09-20'
  },
  {
    id: 'ft-2',
    nome: 'O Clássico da Taverna (180g)',
    categoria: 'Clássicos',
    descricao: 'Hambúrguer de 180g grelhado na brasa viva com blend nobre de peito e costela, queijo gouda cremoso, cebola roxa caramelizada e maionese verde da casa no pão brioche.',
    tempoPreparoMinutos: 12,
    ingredientes: [
      { insumoId: 'ins-1', nomeInsumo: 'Blend Especial Taverna', unidade: 'g', quantidade: 180, custoUnitario: 0.0385, custoTotal: 6.93 },
      { insumoId: 'ins-4', nomeInsumo: 'Pão Brioche Selado', unidade: 'un', quantidade: 1, custoUnitario: 2.40, custoTotal: 2.40 },
      { insumoId: 'ins-8', nomeInsumo: 'Queijo Gouda Holandês', unidade: 'g', quantidade: 45, custoUnitario: 0.0640, custoTotal: 2.88 },
      { insumoId: 'ins-13', nomeInsumo: 'Cebola Roxa Caramelizada', unidade: 'g', quantidade: 35, custoUnitario: 0.0240, custoTotal: 0.84 },
      { insumoId: 'ins-11', nomeInsumo: 'Maionese Verde Defumada', unidade: 'g', quantidade: 30, custoUnitario: 0.0280, custoTotal: 0.84 }
    ],
    pesoCruTotal: 360,
    fatorReducaoChapa: 18,
    pesoGrelhado: 295,
    rendimentoPorcoes: 1,
    custoInsumos: 13.89,
    custoEmbalagem: 1.55,
    custoMaoDeObra: 3.00,
    custoTotalProducao: 18.44,
    margemLucroAlvo: 62,
    impostosTaxas: 10,
    precoVendaSugerido: 45.00,
    precoVendaPraticado: 44.90,
    cmvPercentual: 30.93,
    modoPreparo: [
      'Temperar o burger de 180g com sal grosso moído na hora e pimenta.',
      'Grelhar na charbroiler/chapa em fogo alto: 3m30s de cada lado para ponto rosado suculento.',
      'Colocar o queijo gouda por cima e abafar nos últimos 60 segundos.',
      'Deixar a carne descansar por 1 minuto na grelha de apoio antes da montagem.',
      'Passar maionese verde nas duas metades do pão selado, adicionar o burger com queijo, cobrir com a cebola caramelizada e fechar.'
    ],
    pontoCarneRecomendado: 'Ao Ponto (Rosado e Suculento)',
    habilitarAdicionais: true,
    habilitarRemocaoIngredientes: true,
    perguntaSaches: true,
    ativo: true,
    dataCriacao: '2026-09-19'
  },
  {
    id: 'ft-3',
    nome: 'Brisket & Gorgonzola Rústico',
    categoria: 'Clássicos',
    descricao: 'Blend encorpado de 180g na brasa, creme aveludado de gorgonzola D.O.C., geleia picante de bacon com pimenta e folhas frescas de rúcula no pão australiano artesanal.',
    tempoPreparoMinutos: 14,
    ingredientes: [
      { insumoId: 'ins-1', nomeInsumo: 'Blend Especial Taverna', unidade: 'g', quantidade: 180, custoUnitario: 0.0385, custoTotal: 6.93 },
      { insumoId: 'ins-5', nomeInsumo: 'Pão Australiano com Mel', unidade: 'un', quantidade: 1, custoUnitario: 2.60, custoTotal: 2.60 },
      { insumoId: 'ins-9', nomeInsumo: 'Queijo Gorgonzola D.O.C.', unidade: 'g', quantidade: 40, custoUnitario: 0.0720, custoTotal: 2.88 },
      { insumoId: 'ins-12', nomeInsumo: 'Geleia de Bacon com Pimenta', unidade: 'g', quantidade: 35, custoUnitario: 0.0480, custoTotal: 1.68 },
      { insumoId: 'ins-15', nomeInsumo: 'Rúcula Fresca', unidade: 'g', quantidade: 15, custoUnitario: 0.0160, custoTotal: 0.24 }
    ],
    pesoCruTotal: 340,
    fatorReducaoChapa: 19,
    pesoGrelhado: 275,
    rendimentoPorcoes: 1,
    custoInsumos: 14.33,
    custoEmbalagem: 1.55,
    custoMaoDeObra: 3.20,
    custoTotalProducao: 19.08,
    margemLucroAlvo: 65,
    impostosTaxas: 10,
    precoVendaSugerido: 52.00,
    precoVendaPraticado: 49.90,
    cmvPercentual: 28.72,
    modoPreparo: [
      'Grelhar burger 180g por 4 minutos de cada lado.',
      'Derreter o queijo gorgonzola com toque de maçarico ou cúpula.',
      'Passar geleia de bacon morna na base do pão australiano.',
      'Assentar o burger com gorgonzola, finalizar com rúcula fresca crocante e servir.'
    ],
    pontoCarneRecomendado: 'Ao Ponto para Menos',
    habilitarAdicionais: true,
    habilitarRemocaoIngredientes: true,
    perguntaSaches: true,
    ativo: true,
    dataCriacao: '2026-09-18'
  },
  {
    id: 'ft-4',
    nome: 'Batatas Rústicas com Páprica da Casa (250g)',
    categoria: 'Porções / Acompanhamentos',
    descricao: 'Batatas com corte rústico e casca, fritas em imersão com crocância extrema, temperadas com sal de parrilla e páprica defumada. Acompanha pote de maionese verde.',
    tempoPreparoMinutos: 7,
    ingredientes: [
      { insumoId: 'ins-19', nomeInsumo: 'Batata Rústica Congelada', unidade: 'g', quantidade: 280, custoUnitario: 0.0150, custoTotal: 4.20 },
      { insumoId: 'ins-11', nomeInsumo: 'Maionese Verde Defumada', unidade: 'g', quantidade: 50, custoUnitario: 0.0280, custoTotal: 1.40 },
      { insumoId: 'ins-16', nomeInsumo: 'Embalagem Porção Kraft', unidade: 'un', quantidade: 1, custoUnitario: 0.80, custoTotal: 0.80 }
    ],
    pesoCruTotal: 330,
    fatorReducaoChapa: 15,
    pesoGrelhado: 280,
    rendimentoPorcoes: 1,
    custoInsumos: 6.40,
    custoEmbalagem: 0.80,
    custoMaoDeObra: 1.50,
    custoTotalProducao: 8.70,
    margemLucroAlvo: 65,
    impostosTaxas: 10,
    precoVendaSugerido: 24.00,
    precoVendaPraticado: 22.90,
    cmvPercentual: 27.95,
    modoPreparo: [
      'Fritar em óleo vegetal a 180°C por 4m30s até douração intensa e crocância audível.',
      'Escorrer em grade e polvilhar mix de sal de parrilla e páprica defumada.',
      'Embalar e servir com pote de maionese verde fresca.'
    ],
    habilitarAdicionais: true,
    habilitarRemocaoIngredientes: false,
    perguntaSaches: true,
    ativo: true,
    dataCriacao: '2026-09-15'
  },
  {
    id: 'ft-5',
    nome: 'Molho Especial Taverna (Lote 1kg)',
    categoria: 'Molhos da Casa',
    descricao: 'Molho exclusivo aveludado com base de emulsão artesanal, picles picadinhos, mostarda dijon, páprica doce e temperos secretos da casa.',
    tempoPreparoMinutos: 20,
    ingredientes: [
      { insumoId: 'ins-10', nomeInsumo: 'Base Emulsão e Especiarias', unidade: 'g', quantidade: 800, custoUnitario: 0.025, custoTotal: 20.00 },
      { insumoId: 'ins-14', nomeInsumo: 'Pickles Triturado', unidade: 'g', quantidade: 200, custoUnitario: 0.026, custoTotal: 5.20 }
    ],
    pesoCruTotal: 1000,
    fatorReducaoChapa: 0,
    pesoGrelhado: 1000,
    rendimentoPorcoes: 20, // 20 porções de 50g
    custoInsumos: 25.20,
    custoEmbalagem: 2.00,
    custoMaoDeObra: 4.00,
    custoTotalProducao: 31.20,
    margemLucroAlvo: 70,
    impostosTaxas: 10,
    precoVendaSugerido: 6.00,
    precoVendaPraticado: 5.50,
    cmvPercentual: 22.90,
    modoPreparo: [
      'Higienizar todos os recipientes e batedeira.',
      'Emulsionar a base até ponto denso e homogêneo.',
      'Incorporar picles brunoise e especiarias.',
      'Armazenar em bisnagas dosadoras refrigeradas entre 2°C e 4°C com validade de 5 dias.'
    ],
    habilitarAdicionais: false,
    habilitarRemocaoIngredientes: false,
    perguntaSaches: false,
    ativo: true,
    dataCriacao: '2026-09-12'
  }
];

const INITIAL_ORDENS: OrdemChapa[] = [
  {
    id: 'ord-101',
    numeroMesaComanda: 'Mesa 04',
    clienteNome: 'Rodrigo Silva',
    tipo: 'salao',
    status: 'na_chapa',
    horaEntrada: '18:15',
    temperaturaChapa: 235,
    chapeiroResponsavel: 'Marcos (Chapeiro / Grelhador)',
    prioridade: 'alta',
    itens: [
      {
        fichaTecnicaId: 'ft-1',
        nomeItem: 'Taverna Smash Bacon Duplo',
        quantidade: 2,
        pontoCarne: 'Smash Crocante',
        observacoes: 'Sem cebola em 1 dos burgers'
      },
      {
        fichaTecnicaId: 'ft-4',
        nomeItem: 'Batatas Rústicas com Páprica',
        quantidade: 1
      }
    ]
  },
  {
    id: 'ord-102',
    numeroMesaComanda: 'Delivery #482',
    clienteNome: 'Mariana Costa',
    tipo: 'delivery',
    status: 'na_fila',
    horaEntrada: '18:22',
    temperaturaChapa: 230,
    chapeiroResponsavel: 'Marcos (Chapeiro / Grelhador)',
    prioridade: 'normal',
    itens: [
      {
        fichaTecnicaId: 'ft-2',
        nomeItem: 'O Clássico da Taverna (180g)',
        quantidade: 1,
        pontoCarne: 'Ao Ponto',
        observacoes: 'Bacon extra'
      },
      {
        fichaTecnicaId: 'ft-3',
        nomeItem: 'Brisket & Gorgonzola Rústico',
        quantidade: 1,
        pontoCarne: 'Ponto para Menos'
      }
    ]
  },
  {
    id: 'ord-103',
    numeroMesaComanda: 'Mesa 08',
    clienteNome: 'Carlos Eduardo',
    tipo: 'salao',
    status: 'montagem',
    horaEntrada: '18:05',
    temperaturaChapa: 220,
    chapeiroResponsavel: 'Marcos (Chapeiro / Grelhador)',
    prioridade: 'urgente',
    itens: [
      {
        fichaTecnicaId: 'ft-1',
        nomeItem: 'Taverna Smash Bacon Duplo',
        quantidade: 1,
        pontoCarne: 'Smash Crocante'
      }
    ]
  }
];

const INITIAL_BLEND_CALCULATOR: BlendCalculatorState = {
  nomeBlend: 'Blend Assinatura Taverna 2026',
  pesoLoteKg: 10,
  cortes: [
    { id: 'c1', corteNome: 'Acém Bovino Resfriado', proporcaoPercentual: 45, teorGorduraCorte: 12, precoKg: 31.90 },
    { id: 'c2', corteNome: 'Peito Bovino (Brisket)', proporcaoPercentual: 35, teorGorduraCorte: 22, precoKg: 34.50 },
    { id: 'c3', corteNome: 'Fraldinha Bovina', proporcaoPercentual: 20, teorGorduraCorte: 16, precoKg: 42.00 }
  ],
  gorduraAdicionalPercentual: 0,
  precoGorduraKg: 18.00,
  pesoPuckGramas: 160
};

const BLANK_COPY_TEMPLATE: Omit<FichaTecnica, 'id' | 'dataCriacao'>[] = [
  {
    nome: 'Burger Artesanal Clássico',
    categoria: 'Smash Burgers',
    descricao: 'Pão brioche selado na manteiga, blend artesanal suculento 120g na chapa, queijo cheddar cremoso e maionese especial da casa.',
    tempoPreparoMinutos: 12,
    ingredientes: [],
    pesoCruTotal: 120,
    fatorReducaoChapa: 15,
    pesoGrelhado: 102,
    rendimentoPorcoes: 1,
    custoInsumos: 9.50,
    custoEmbalagem: 1.80,
    custoMaoDeObra: 2.50,
    custoTotalProducao: 13.80,
    margemLucroAlvo: 60,
    impostosTaxas: 10,
    precoVendaSugerido: 28.00,
    precoVendaPraticado: 28.90,
    precoOriginal: 34.00,
    cmvPercentual: 32.9,
    modoPreparo: ['Tostar pão brioche na manteiga', 'Prensagem smash na chapa 230°C com crosta maillard', 'Derreter queijo cheddar e finalizar'],
    pontoCarneRecomendado: 'Smash Crocante',
    imagemUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    destaque: true,
    habilitarAdicionais: true,
    habilitarRemocaoIngredientes: true,
    perguntaSaches: true,
    ativo: true
  },
  {
    nome: 'Smash Duplo com Bacon Crocante',
    categoria: 'Smash Burgers',
    descricao: '2x discos smash crocantes de 90g, fatias generosas de bacon defumado, dobro de cheddar e molho barbecue rústico.',
    tempoPreparoMinutos: 14,
    ingredientes: [],
    pesoCruTotal: 180,
    fatorReducaoChapa: 18,
    pesoGrelhado: 148,
    rendimentoPorcoes: 1,
    custoInsumos: 12.80,
    custoEmbalagem: 1.80,
    custoMaoDeObra: 2.50,
    custoTotalProducao: 17.10,
    margemLucroAlvo: 58,
    impostosTaxas: 10,
    precoVendaSugerido: 35.00,
    precoVendaPraticado: 35.90,
    precoOriginal: 42.00,
    cmvPercentual: 35.6,
    modoPreparo: ['Tostar pão', 'Prensagem smash duplo', 'Grelhar bacon até ficar crocante', 'Montagem final com barbecue'],
    pontoCarneRecomendado: 'Smash Crocante',
    imagemUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    destaque: true,
    habilitarAdicionais: true,
    habilitarRemocaoIngredientes: true,
    perguntaSaches: true,
    ativo: true
  },
  {
    nome: 'Batata Rústica Temperada com Alecrim',
    categoria: 'Porções / Acompanhamentos',
    descricao: 'Batatas rústicas com casca bem douradas e crocantes, temperadas com sal marinho, páprica e alecrim. Acompanha molho da casa.',
    tempoPreparoMinutos: 8,
    ingredientes: [],
    pesoCruTotal: 250,
    fatorReducaoChapa: 10,
    pesoGrelhado: 225,
    rendimentoPorcoes: 1,
    custoInsumos: 4.50,
    custoEmbalagem: 1.50,
    custoMaoDeObra: 1.50,
    custoTotalProducao: 7.50,
    margemLucroAlvo: 60,
    impostosTaxas: 10,
    precoVendaSugerido: 16.00,
    precoVendaPraticado: 16.90,
    cmvPercentual: 26.6,
    modoPreparo: ['Fritar em óleo a 180°C até dourar', 'Secar e temperar com flor de sal e páprica', 'Servir com molho'],
    imagemUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
    destaque: false,
    habilitarAdicionais: false,
    habilitarRemocaoIngredientes: false,
    perguntaSaches: true,
    ativo: true
  },
  {
    nome: 'Refrigerante Lata Gelada 350ml',
    categoria: 'Bebidas',
    descricao: 'Lata 350ml super gelada. Opções: Coca-Cola original, Coca-Cola Zero ou Guaraná Antarctica.',
    tempoPreparoMinutos: 1,
    ingredientes: [],
    pesoCruTotal: 350,
    fatorReducaoChapa: 0,
    pesoGrelhado: 350,
    rendimentoPorcoes: 1,
    custoInsumos: 3.20,
    custoEmbalagem: 0.30,
    custoMaoDeObra: 0.50,
    custoTotalProducao: 4.00,
    margemLucroAlvo: 40,
    impostosTaxas: 10,
    precoVendaSugerido: 6.00,
    precoVendaPraticado: 6.00,
    cmvPercentual: 53.3,
    modoPreparo: ['Retirar lata bem gelada da cervejeira/geladeira', 'Sanitizar lata e embalar'],
    imagemUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
    destaque: false,
    habilitarAdicionais: false,
    habilitarRemocaoIngredientes: false,
    perguntaSaches: false,
    ativo: true
  }
];

interface BurgerContextType {
  insumos: Insumo[];
  fichasTecnicas: FichaTecnica[];
  ordensChapa: OrdemChapa[];
  userRole: UserRole;
  blendCalculator: BlendCalculatorState;
  menuSettings: DigitalMenuSettings;
  
  // Handlers
  setUserRole: (role: UserRole) => void;
  updateMenuSettings: (settings: Partial<DigitalMenuSettings>) => void;
  addInsumo: (insumo: Omit<Insumo, 'id' | 'ultimaAtualizacao' | 'custoUnitario'>) => void;
  updateInsumo: (id: string, insumo: Partial<Insumo>) => void;
  deleteInsumo: (id: string) => void;
  updateEstoque: (id: string, quantidadeDelta: number) => void;

  addFichaTecnica: (ficha: Omit<FichaTecnica, 'id' | 'dataCriacao'>) => void;
  updateFichaTecnica: (id: string, ficha: Partial<FichaTecnica>) => void;
  deleteFichaTecnica: (id: string) => void;

  addOrdemChapa: (ordem: Omit<OrdemChapa, 'id'>) => void;
  updateStatusOrdemChapa: (id: string, status: OrdemChapa['status']) => void;
  deleteOrdemChapa: (id: string) => void;

  updateBlendCalculator: (blend: Partial<BlendCalculatorState>) => void;
  importIFoodCatalog: (items: ParsedIFoodItem[]) => number;
  resetToOfficialIFoodMenu: () => void;
  resetToDefaults: () => void;
  clearAllMenuData: () => void;
  loadNewCopyTemplate: () => void;
  resetAllSettings: () => void;
  quickUpdateItem: (id: string, updates: Partial<FichaTecnica>) => void;
  duplicateItem: (id: string) => void;
  clearAllPhotos: () => void;
  simulateIFoodOrder: (custom?: Partial<OrdemChapa>) => OrdemChapa;
  simulateDigitalMenuOrder: (custom?: Partial<OrdemChapa>) => OrdemChapa;
  confirmPixPayment: (id: string, e2eId?: string) => void;
}

const BurgerContext = createContext<BurgerContextType | undefined>(undefined);

export const BurgerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [insumos, setInsumos] = useState<Insumo[]>(() => {
    const local = localStorage.getItem('taverna_insumos');
    return local ? JSON.parse(local) : INITIAL_INSUMOS;
  });

  const [menuSettings, setMenuSettings] = useState<DigitalMenuSettings>(() => {
    const local = localStorage.getItem('taverna_menu_settings');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return {
          ...DEFAULT_MENU_SETTINGS,
          ...parsed,
          pixNubank: {
            ...DEFAULT_MENU_SETTINGS.pixNubank!,
            ...(parsed.pixNubank || {})
          }
        };
      } catch (e) {
        console.error('Erro ao ler menu settings:', e);
      }
    }
    return DEFAULT_MENU_SETTINGS;
  });

  const [fichasTecnicas, setFichasTecnicas] = useState<FichaTecnica[]>(() => {
    const local = localStorage.getItem('taverna_fichas');
    if (local !== null) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          return parsed as FichaTecnica[];
        }
      } catch (e) {
        console.error('Erro ao ler fichas salvas:', e);
      }
    }
    const officialFichas = TAVERNA_IFOOD_CATALOG.map((item, idx) => convertParsedItemToFicha(item, idx));
    return officialFichas;
  });

  const [ordensChapa, setOrdensChapa] = useState<OrdemChapa[]>(() => {
    const local = localStorage.getItem('taverna_ordens');
    return local ? JSON.parse(local) : INITIAL_ORDENS;
  });

  const [userRole, setUserRole] = useState<UserRole>(() => {
    const local = localStorage.getItem('taverna_role');
    return (local as UserRole) || 'Chapeiro / Grelhador';
  });

  const [blendCalculator, setBlendCalculator] = useState<BlendCalculatorState>(() => {
    const local = localStorage.getItem('taverna_blend');
    return local ? JSON.parse(local) : INITIAL_BLEND_CALCULATOR;
  });

  useEffect(() => {
    localStorage.setItem('taverna_menu_settings', JSON.stringify(menuSettings));
  }, [menuSettings]);

  useEffect(() => {
    localStorage.setItem('taverna_insumos', JSON.stringify(insumos));
  }, [insumos]);

  useEffect(() => {
    localStorage.setItem('taverna_fichas', JSON.stringify(fichasTecnicas));
  }, [fichasTecnicas]);

  useEffect(() => {
    localStorage.setItem('taverna_ordens', JSON.stringify(ordensChapa));
  }, [ordensChapa]);

  useEffect(() => {
    localStorage.setItem('taverna_role', userRole);
  }, [userRole]);

  useEffect(() => {
    localStorage.setItem('taverna_blend', JSON.stringify(blendCalculator));
  }, [blendCalculator]);

  const addInsumo = (insumoData: Omit<Insumo, 'id' | 'ultimaAtualizacao' | 'custoUnitario'>) => {
    const custoUnitario = insumoData.unidade === 'g' || insumoData.unidade === 'ml' 
      ? insumoData.precoCompra / (insumoData.quantidadeEmbalagem * 1000)
      : insumoData.precoCompra / insumoData.quantidadeEmbalagem;

    const newInsumo: Insumo = {
      ...insumoData,
      id: `ins-${Date.now()}`,
      custoUnitario: Number(custoUnitario.toFixed(4)),
      ultimaAtualizacao: new Date().toISOString().split('T')[0]
    };
    setInsumos(prev => [newInsumo, ...prev]);
  };

  const updateInsumo = (id: string, data: Partial<Insumo>) => {
    setInsumos(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, ...data };
      if (data.precoCompra !== undefined || data.quantidadeEmbalagem !== undefined) {
        const preco = data.precoCompra ?? item.precoCompra;
        const qtd = data.quantidadeEmbalagem ?? item.quantidadeEmbalagem;
        updated.custoUnitario = updated.unidade === 'g' || updated.unidade === 'ml'
          ? preco / (qtd * 1000)
          : preco / qtd;
      }
      updated.ultimaAtualizacao = new Date().toISOString().split('T')[0];
      return updated;
    }));
  };

  const deleteInsumo = (id: string) => {
    setInsumos(prev => prev.filter(item => item.id !== id));
  };

  const updateEstoque = (id: string, delta: number) => {
    setInsumos(prev => prev.map(item => {
      if (item.id !== id) return item;
      const novoEstoque = Math.max(0, Number((item.estoqueAtual + delta).toFixed(2)));
      return { ...item, estoqueAtual: novoEstoque, ultimaAtualizacao: new Date().toISOString().split('T')[0] };
    }));
  };

  const addFichaTecnica = (fichaData: Omit<FichaTecnica, 'id' | 'dataCriacao'>) => {
    const newFicha: FichaTecnica = {
      ...fichaData,
      id: `ft-${Date.now()}`,
      dataCriacao: new Date().toISOString().split('T')[0]
    };
    setFichasTecnicas(prev => [newFicha, ...prev]);
  };

  const updateFichaTecnica = (id: string, data: Partial<FichaTecnica>) => {
    setFichasTecnicas(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
  };

  const deleteFichaTecnica = (id: string) => {
    setFichasTecnicas(prev => prev.filter(item => item.id !== id));
  };

  const addOrdemChapa = (ordemData: Omit<OrdemChapa, 'id'>) => {
    const newOrdem: OrdemChapa = {
      ...ordemData,
      id: `ord-${Date.now()}`
    };
    setOrdensChapa(prev => [newOrdem, ...prev]);
  };

  const updateStatusOrdemChapa = (id: string, status: OrdemChapa['status']) => {
    setOrdensChapa(prev => prev.map(ord => ord.id === id ? { ...ord, status } : ord));
  };

  const confirmPixPayment = (id: string, e2eId?: string) => {
    const confirmationTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const generatedE2e = e2eId || `E18236120${Date.now()}`;
    setOrdensChapa(prev => prev.map(ord => {
      if (ord.id === id) {
        return {
          ...ord,
          pixStatus: 'confirmado' as const,
          pixDataConfirmacao: confirmationTime,
          pixE2eId: generatedE2e
        };
      }
      return ord;
    }));
  };

  const deleteOrdemChapa = (id: string) => {
    setOrdensChapa(prev => prev.filter(ord => ord.id !== id));
  };

  const updateBlendCalculator = (data: Partial<BlendCalculatorState>) => {
    setBlendCalculator(prev => ({ ...prev, ...data }));
  };

  const updateMenuSettings = (settings: Partial<DigitalMenuSettings>) => {
    setMenuSettings(prev => ({ ...prev, ...settings }));
  };

  const importIFoodCatalog = (items: ParsedIFoodItem[]) => {
    let count = 0;
    setFichasTecnicas(prev => {
      const updated = [...prev];
      items.forEach((item, idx) => {
        const existingIdx = updated.findIndex(f => f.nome.toLowerCase() === item.nome.toLowerCase());
        const newFicha = convertParsedItemToFicha(item, updated.length + idx);
        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            precoVendaPraticado: item.precoVenda,
            precoOriginal: item.precoOriginal,
            descricao: item.descricao || updated[existingIdx].descricao,
            destaque: item.destaque,
            ifoodCategory: item.categoriaOrigem
          };
        } else {
          updated.unshift(newFicha);
        }
        count++;
      });
      return updated;
    });
    return count;
  };

  const resetToOfficialIFoodMenu = () => {
    const officialFichas = TAVERNA_IFOOD_CATALOG.map((item, idx) => convertParsedItemToFicha(item, idx));
    setFichasTecnicas(officialFichas);
    localStorage.setItem('taverna_fichas', JSON.stringify(officialFichas));
  };

  const clearAllMenuData = () => {
    setFichasTecnicas([]);
    localStorage.setItem('taverna_fichas', JSON.stringify([]));
  };

  const loadNewCopyTemplate = () => {
    const today = new Date().toISOString().split('T')[0];
    const newItems: FichaTecnica[] = BLANK_COPY_TEMPLATE.map((tpl, i) => ({
      ...tpl,
      id: `copy-item-${Date.now()}-${i}`,
      dataCriacao: today
    }));
    setFichasTecnicas(newItems);
    localStorage.setItem('taverna_fichas', JSON.stringify(newItems));
  };

  const resetAllSettings = () => {
    setMenuSettings(DEFAULT_MENU_SETTINGS);
    localStorage.setItem('taverna_menu_settings', JSON.stringify(DEFAULT_MENU_SETTINGS));
  };

  const quickUpdateItem = (id: string, updates: Partial<FichaTecnica>) => {
    setFichasTecnicas(prev => {
      const next = prev.map(item => item.id === id ? { ...item, ...updates } : item);
      localStorage.setItem('taverna_fichas', JSON.stringify(next));
      return next;
    });
  };

  const duplicateItem = (id: string) => {
    const existing = fichasTecnicas.find(f => f.id === id);
    if (!existing) return;
    const duplicated: FichaTecnica = {
      ...existing,
      id: `copy-${Date.now()}`,
      nome: `${existing.nome} (Cópia)`,
      dataCriacao: new Date().toISOString().split('T')[0]
    };
    const next = [duplicated, ...fichasTecnicas];
    setFichasTecnicas(next);
    localStorage.setItem('taverna_fichas', JSON.stringify(next));
  };

  const resetToDefaults = () => {
    const officialFichas = TAVERNA_IFOOD_CATALOG.map((item, idx) => convertParsedItemToFicha(item, idx));
    setInsumos(INITIAL_INSUMOS);
    setFichasTecnicas(officialFichas);
    setOrdensChapa(INITIAL_ORDENS);
    setBlendCalculator(INITIAL_BLEND_CALCULATOR);
    setMenuSettings(DEFAULT_MENU_SETTINGS);
    setUserRole('Chapeiro / Grelhador');
    localStorage.setItem('taverna_insumos', JSON.stringify(INITIAL_INSUMOS));
    localStorage.setItem('taverna_fichas', JSON.stringify(officialFichas));
    localStorage.setItem('taverna_ordens', JSON.stringify(INITIAL_ORDENS));
    localStorage.setItem('taverna_menu_settings', JSON.stringify(DEFAULT_MENU_SETTINGS));
  };

  const clearAllPhotos = () => {
    setFichasTecnicas(prev => {
      const updated = prev.map(f => ({ ...f, imagemUrl: undefined }));
      localStorage.setItem('taverna_fichas', JSON.stringify(updated));
      return updated;
    });
  };

  const simulateIFoodOrder = (custom?: Partial<OrdemChapa>): OrdemChapa => {
    const now = new Date();
    const hora = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const ifoodNumber = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ord-ifood-${Date.now().toString().slice(-5)}`;

    const burgerItem = fichasTecnicas.find(f => f.categoria === 'Smash Burgers' || f.categoria === 'Clássicos') || fichasTecnicas[0];
    const sideItem = fichasTecnicas.find(f => f.categoria === 'Porções / Acompanhamentos');
    const drinkItem = fichasTecnicas.find(f => f.categoria === 'Bebidas');

    const itens: ItemPedidoChapa[] = [];
    if (burgerItem) {
      itens.push({
        fichaTecnicaId: burgerItem.id,
        nomeItem: burgerItem.nome,
        quantidade: 1,
        precoUnitario: burgerItem.precoVendaPraticado,
        pontoCarne: burgerItem.pontoCarneRecomendado || 'Smash Crocante',
        adicionais: ['Bacon Extra Crocante (+R$ 5,00)'],
        remocoes: ['Sem Cebola'],
        querSaches: true,
        observacoes: 'Borda bem tostada na chapa e caprichar no molho da casa'
      });
    } else {
      itens.push({
        fichaTecnicaId: 'ft-sim-1',
        nomeItem: 'O Ogro | Smash Triplo Burguer',
        quantidade: 1,
        precoUnitario: 44.90,
        pontoCarne: 'Smash Crocante',
        adicionais: ['Bacon Extra'],
        remocoes: ['Sem Cebola'],
        querSaches: true,
        observacoes: 'Padrão especial da guilda'
      });
    }

    if (sideItem) {
      itens.push({
        fichaTecnicaId: sideItem.id,
        nomeItem: sideItem.nome,
        quantidade: 1,
        precoUnitario: sideItem.precoVendaPraticado,
        querSaches: true
      });
    }

    if (drinkItem) {
      itens.push({
        fichaTecnicaId: drinkItem.id,
        nomeItem: drinkItem.nome,
        quantidade: 1,
        precoUnitario: drinkItem.precoVendaPraticado
      });
    }

    const subtotal = itens.reduce((sum, it) => sum + ((it.precoUnitario || 35) * it.quantidade), 0) + 5;
    const taxa = menuSettings.taxaEntregaPadrao || 5.00;
    const valorTotal = Number((subtotal + taxa).toFixed(2));

    const names = ['Mariana Silva (iFood)', 'Lucas Rocha (iFood)', 'Camila Andrade (iFood)', 'Felipe Albuquerque (iFood)'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const addresses = [
      'Av. Jorge Teixeira, 1420 - Apto 302, Bairro Liberdade',
      'Rua Duque de Caxias, 850 - Caiari',
      'Av. Sete de Setembro, 2100 - Centro',
      'Rua Guanabara, 455 - Embratel'
    ];
    const randomAddr = addresses[Math.floor(Math.random() * addresses.length)];

    const novaOrdem: OrdemChapa = {
      id: orderId,
      numeroMesaComanda: `iFood #${ifoodNumber}`,
      clienteNome: randomName,
      clienteTelefone: `(69) 99${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      enderecoEntrega: randomAddr,
      formaPagamento: 'pix',
      valorTotal,
      tipo: 'delivery',
      status: 'na_fila',
      horaEntrada: hora,
      temperaturaChapa: 230,
      chapeiroResponsavel: userRole,
      prioridade: 'alta',
      origem: 'ifood',
      precisaSaches: true,
      precisaGuardanapos: true,
      itens,
      ...custom
    };

    setOrdensChapa(prev => [novaOrdem, ...prev]);

    try {
      printOrdemChapaThermal(novaOrdem);
    } catch (e) {
      console.log('Thermal print simulated');
    }

    return novaOrdem;
  };

  const simulateDigitalMenuOrder = (custom?: Partial<OrdemChapa>): OrdemChapa => {
    const now = new Date();
    const hora = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const comandaNum = Math.floor(100 + Math.random() * 900);
    const orderId = `ord-cardapio-${Date.now().toString().slice(-5)}`;

    const burgerItem = fichasTecnicas.find(f => f.categoria === 'Smash Burgers' || f.categoria === 'Clássicos') || fichasTecnicas[0];
    const sideItem = fichasTecnicas.find(f => f.categoria === 'Porções / Acompanhamentos');

    const itens: ItemPedidoChapa[] = [
      {
        fichaTecnicaId: burgerItem ? burgerItem.id : 'ft-1',
        nomeItem: burgerItem ? burgerItem.nome : 'Burger Artesanal Especial',
        quantidade: 1,
        precoUnitario: burgerItem ? burgerItem.precoVendaPraticado : 32.90,
        pontoCarne: burgerItem?.pontoCarneRecomendado || 'Smash Crocante',
        adicionais: ['Queijo Cheddar Duplo (+R$ 4,00)'],
        remocoes: [],
        querSaches: true
      }
    ];

    if (sideItem) {
      itens.push({
        fichaTecnicaId: sideItem.id,
        nomeItem: sideItem.nome,
        quantidade: 1,
        precoUnitario: sideItem.precoVendaPraticado,
        querSaches: false
      });
    }

    const subtotal = itens.reduce((sum, it) => sum + ((it.precoUnitario || 30) * it.quantidade), 0) + 4;
    const taxa = menuSettings.taxaEntregaPadrao || 5.00;
    const valorTotal = Number((subtotal + taxa).toFixed(2));

    const novaOrdem: OrdemChapa = {
      id: orderId,
      numeroMesaComanda: `Delivery #WEB-${comandaNum}`,
      clienteNome: 'Cliente do Cardápio Digital',
      clienteTelefone: '(69) 99888-7766',
      enderecoEntrega: 'Av. Pinheiro Machado, 920 - São Cristóvão',
      formaPagamento: 'pix',
      valorTotal,
      tipo: 'delivery',
      status: 'na_fila',
      horaEntrada: hora,
      temperaturaChapa: 230,
      chapeiroResponsavel: userRole,
      prioridade: 'normal',
      origem: 'cardapio_digital',
      precisaSaches: true,
      precisaGuardanapos: true,
      itens,
      ...custom
    };

    setOrdensChapa(prev => [novaOrdem, ...prev]);

    try {
      printOrdemChapaThermal(novaOrdem);
    } catch (e) {
      console.log('Thermal print simulated');
    }

    return novaOrdem;
  };

  return (
    <BurgerContext.Provider value={{
      insumos,
      fichasTecnicas,
      ordensChapa,
      userRole,
      blendCalculator,
      menuSettings,
      setUserRole,
      updateMenuSettings,
      addInsumo,
      updateInsumo,
      deleteInsumo,
      updateEstoque,
      addFichaTecnica,
      updateFichaTecnica,
      deleteFichaTecnica,
      addOrdemChapa,
      updateStatusOrdemChapa,
      deleteOrdemChapa,
      updateBlendCalculator,
      importIFoodCatalog,
      resetToOfficialIFoodMenu,
      resetToDefaults,
      clearAllMenuData,
      loadNewCopyTemplate,
      resetAllSettings,
      quickUpdateItem,
      duplicateItem,
      clearAllPhotos,
      simulateIFoodOrder,
      simulateDigitalMenuOrder,
      confirmPixPayment
    }}>
      {children}
    </BurgerContext.Provider>
  );
};

export const useBurger = () => {
  const context = useContext(BurgerContext);
  if (!context) throw new Error('useBurger must be used within a BurgerProvider');
  return context;
};

// Backwards compatibility alias if any code references BakeryContext
export const useBakery = useBurger;
export const BakeryProvider = BurgerProvider;
export const BakeryContext = BurgerContext;
