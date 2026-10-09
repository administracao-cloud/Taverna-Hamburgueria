export type MaterialCategory = 
  | 'Carnes e Blends'
  | 'Pães'
  | 'Queijos'
  | 'Molhos e Condimentos'
  | 'Vegetais e Saladas'
  | 'Embalagens e Descartáveis'
  | 'Bebidas'
  | 'Outros';

export type RecipeCategory = 
  | 'Smash Burgers'
  | 'Clássicos'
  | 'Porções / Acompanhamentos'
  | 'Molhos da Casa'
  | 'Bebidas';

export type UnitType = 'kg' | 'g' | 'un' | 'ml' | 'l';

export interface Insumo {
  id: string;
  nome: string;
  categoria: MaterialCategory;
  unidade: UnitType;
  precoCompra: number; // Preço por unidade de compra (ex: R$ 42,00 por kg)
  quantidadeEmbalagem: number; // Ex: 1 kg ou 100 un
  custoUnitario: number; // Calculado: precoCompra / quantidadeEmbalagem (ex: R$ por g ou un)
  estoqueAtual: number;
  estoqueMinimo: number;
  fornecedor?: string;
  ultimaAtualizacao: string;
}

export interface IngredienteReceita {
  insumoId: string;
  nomeInsumo: string;
  unidade: UnitType;
  quantidade: number;
  custoUnitario: number;
  custoTotal: number;
}

export interface FichaTecnica {
  id: string;
  nome: string;
  categoria: RecipeCategory;
  descricao: string;
  tempoPreparoMinutos: number;
  ingredientes: IngredienteReceita[];
  pesoCruTotal: number; // gramas
  fatorReducaoChapa: number; // percentual de redução na chapa/grelha (ex: 20%)
  pesoGrelhado: number; // gramas calculado: pesoCruTotal * (1 - fatorReducaoChapa/100)
  rendimentoPorcoes: number;
  custoInsumos: number;
  custoEmbalagem: number;
  custoMaoDeObra: number;
  custoTotalProducao: number;
  margemLucroAlvo: number; // Ex: 65%
  impostosTaxas: number; // Ex: 12% (imposto + taxa cartão)
  precoVendaSugerido: number;
  precoVendaPraticado: number;
  precoOriginal?: number; // Preço riscado promocional (ex: R$ 33,90 no iFood)
  cmvPercentual: number; // CMV = (Custo Insumos / Preço Venda) * 100
  modoPreparo: string[];
  pontoCarneRecomendado?: string; // Ao Ponto, Bem Passado, Ponto Menos
  imagemUrl?: string;
  destaque?: boolean;
  ifoodCategory?: string; // Categoria original do iFood (ex: Guilda de Heróis, Combos)
  habilitarAdicionais?: boolean; // Checkbox admin: permite adicionais pagos neste item
  habilitarRemocaoIngredientes?: boolean; // Checkbox admin: permite cliente remover ingredientes
  perguntaSaches?: boolean; // Checkbox admin: pergunta de sachês estilo iFood para este item
  ativo: boolean;
  dataCriacao: string;
}

export type StatusChapa = 'na_fila' | 'na_chapa' | 'montagem' | 'pronto';

export interface ItemPedidoChapa {
  fichaTecnicaId: string;
  nomeItem: string;
  quantidade: number;
  precoUnitario?: number;
  pontoCarne?: string;
  observacoes?: string;
  adicionais?: string[];
  remocoes?: string[];
  querSaches?: boolean;
}

export interface AdicionalConfig {
  id: string;
  nome: string;
  preco: number;
  ativo: boolean;
  categoriaAplicavel?: 'burgers' | 'todos' | 'porcoes';
}

export interface PixNubankConfig {
  habilitado: boolean;
  chavePix: string;
  tipoChave: 'cnpj' | 'cpf' | 'email' | 'telefone' | 'aleatoria';
  nomeTitular: string; // Ex: "TAVERNA BURGER" (max 25 chars)
  cidadeTitular: string; // Ex: "PORTO VELHO" (max 15 chars)
  instituicao: string; // Ex: "Nu Pagamentos S.A. (Nubank - 260)"
  modoIntegracao: 'pix_estatico' | 'nupay_api';
  nubankClientId?: string;
  nubankToken?: string;
  verificacaoAutomatica: boolean;
  tempoExpiracaoMinutos: number; // default: 15
}

export interface DigitalMenuSettings {
  // Status da operação
  lojaAberta?: boolean; // Aberta recebendo pedidos vs fechada

  // Modalidades de atendimento configuráveis pelo administrador
  permitirDelivery: boolean;
  permitirRetirada: boolean;
  permitirSalao: boolean;
  taxaEntregaPadrao: number;
  pedidoMinimo: number;

  // Ponto da carne (para smash artesanal)
  habilitarPontoCarne: boolean;
  pontoCarnePadrao: string; // Ex: "Smash Crocante (Crosta Maillard)"

  // Pergunta de descartáveis e sachês (estilo iFood)
  habilitarPerguntaSaches: boolean;
  habilitarPerguntaGuardanapos: boolean;

  // Adicionais com preços configuráveis
  habilitarAdicionais: boolean;
  adicionais: AdicionalConfig[];

  // Configuração Oficial Pix / Nubank
  pixNubank?: PixNubankConfig;
}

export interface OrdemChapa {
  id: string;
  numeroMesaComanda: string;
  clienteNome?: string;
  clienteTelefone?: string;
  enderecoEntrega?: string;
  formaPagamento?: 'pix' | 'cartao_entrega' | 'dinheiro' | 'balcao';
  trocoPara?: string;
  valorTotal?: number;
  tipo: 'salao' | 'delivery' | 'takeaway';
  status: StatusChapa;
  itens: ItemPedidoChapa[];
  horaEntrada: string;
  tempoDecorridoMinutos?: number;
  temperaturaChapa?: number; // Ex: 220°C
  chapeiroResponsavel: string;
  prioridade: 'normal' | 'alta' | 'urgente';
  origem?: 'cardapio_digital' | 'balcao' | 'ifood' | 'whatsapp';
  precisaSaches?: boolean;
  precisaGuardanapos?: boolean;
  // Recebimento Pix Nubank
  pixStatus?: 'pendente' | 'confirmado' | 'expirado';
  pixPayload?: string;
  pixTxid?: string;
  pixDataConfirmacao?: string;
  pixE2eId?: string;
}

export interface BlendCompositionItem {
  id: string;
  corteNome: string;
  proporcaoPercentual: number; // Ex: 50%
  teorGorduraCorte: number; // Ex: 15%
  precoKg: number; // Ex: R$ 38.00
}

export interface BlendCalculatorState {
  nomeBlend: string;
  pesoLoteKg: number;
  cortes: BlendCompositionItem[];
  gorduraAdicionalPercentual: number; // Ex: 5%
  precoGorduraKg: number;
  pesoPuckGramas: number; // Ex: 160g
}

export type UserRole = 
  | 'Chapeiro / Grelhador'
  | 'Chapeiro Chefe'
  | 'Gerente de Operações'
  | 'Administrador';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  telefone?: string;
  createdAt?: string;
}
