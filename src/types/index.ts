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
  cmvPercentual: number; // CMV = (Custo Insumos / Preço Venda) * 100
  modoPreparo: string[];
  pontoCarneRecomendado?: string; // Ao Ponto, Bem Passado, Ponto Menos
  imagemUrl?: string;
  ativo: boolean;
  dataCriacao: string;
}

export type StatusChapa = 'na_fila' | 'na_chapa' | 'montagem' | 'pronto';

export interface ItemPedidoChapa {
  fichaTecnicaId: string;
  nomeItem: string;
  quantidade: number;
  pontoCarne?: string;
  observacoes?: string;
  adicionais?: string[];
  remocoes?: string[];
}

export interface OrdemChapa {
  id: string;
  numeroMesaComanda: string;
  clienteNome?: string;
  tipo: 'salao' | 'delivery' | 'takeaway';
  status: StatusChapa;
  itens: ItemPedidoChapa[];
  horaEntrada: string;
  tempoDecorridoMinutos?: number;
  temperaturaChapa?: number; // Ex: 220°C
  chapeiroResponsavel: string;
  prioridade: 'normal' | 'alta' | 'urgente';
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
