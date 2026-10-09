import { jsPDF } from "jspdf";
import { FichaTecnica, OrdemChapa } from "../types";

export type ThermalPaperFormat = '58mm' | '80mm';

export interface ThermalPrintOptions {
  format?: ThermalPaperFormat;
  headerSubtitle?: string;
}

/**
 * Utilitário para gerar PDF formatado para impressora térmica (58mm e 80mm)
 * 58mm = ~164pt de largura
 * 80mm = ~226pt de largura
 */
export const generateThermalPDF = (
  title: string, 
  lines: string[], 
  options: ThermalPrintOptions = {}
) => {
  const paperFormat = options.format || '58mm';
  const width = paperFormat === '80mm' ? 226 : 164;
  
  // Calculate dynamic height so nothing is cut off
  const estimatedHeight = Math.max(220, lines.length * 13 + 90);

  const doc = new jsPDF({
    unit: 'pt',
    format: [width, estimatedHeight],
  });

  const centerX = width / 2;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(paperFormat === '80mm' ? 12 : 10);
  doc.text("TAVERNA HAMBURGUERIA", centerX, 18, { align: 'center' });
  
  doc.setFontSize(paperFormat === '80mm' ? 9 : 8);
  doc.setFont("helvetica", "normal");
  doc.text("Porto Velho - RO • Chapa & Brasa", centerX, 29, { align: 'center' });
  doc.text("--------------------------------------------", centerX, 38, { align: 'center' });

  // Document Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(paperFormat === '80mm' ? 10 : 9);
  doc.text(title, centerX, 50, { align: 'center' });
  
  if (options.headerSubtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(paperFormat === '80mm' ? 8 : 7);
    doc.text(options.headerSubtitle, centerX, 60, { align: 'center' });
  }

  doc.text("--------------------------------------------", centerX, 70, { align: 'center' });

  // Body lines
  doc.setFont("helvetica", "normal");
  doc.setFontSize(paperFormat === '80mm' ? 8.5 : 7.5);
  
  let y = 82;
  lines.forEach(line => {
    if (line.startsWith("==") || line.startsWith("--")) {
      doc.text("--------------------------------------------", centerX, y, { align: 'center' });
    } else if (line.startsWith("TOTAL:") || line.startsWith("VALOR:")) {
      doc.setFont("helvetica", "bold");
      doc.text(line, 6, y);
      doc.setFont("helvetica", "normal");
    } else {
      doc.text(line, 6, y);
    }
    y += 12;
  });

  // Footer
  y += 6;
  doc.setFontSize(7);
  doc.text("Agradecemos a sua preferência!", centerX, y, { align: 'center' });
  doc.text("*** FIM DO COMPROVANTE ***", centerX, y + 10, { align: 'center' });

  const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Taverna_${safeTitle}_${paperFormat}.pdf`);
};

export const printFichaTecnicaThermal = (
  ficha: FichaTecnica,
  format: ThermalPaperFormat = '80mm'
) => {
  const lines: string[] = [
    `CATEGORIA: ${ficha.categoria.toUpperCase()}`,
    `TEMPO CHAPA: ${ficha.tempoPreparoMinutos} MINUTOS`,
    `PESO CRU: ${ficha.pesoCruTotal}g | GRELHADO: ${ficha.pesoGrelhado}g`,
    `FATOR DE REDUCAO: ${ficha.fatorReducaoChapa}%`,
    `PONTO: ${ficha.pontoCarneRecomendado || 'Smash Crocante'}`,
    `--------------------------------------------`,
    `COMPOSICAO / INSUMOS:`,
    ...ficha.ingredientes.map(i => `* ${i.quantidade}${i.unidade} ${i.nomeInsumo.slice(0, 24)} - R$ ${i.custoTotal.toFixed(2)}`),
    `--------------------------------------------`,
    `CUSTO INSUMOS: R$ ${ficha.custoInsumos.toFixed(2)}`,
    `EMBALAGEM: R$ ${ficha.custoEmbalagem.toFixed(2)}`,
    `MAO DE OBRA: R$ ${ficha.custoMaoDeObra.toFixed(2)}`,
    `CUSTO TOTAL: R$ ${ficha.custoTotalProducao.toFixed(2)}`,
    `CMV PADRAO: ${ficha.cmvPercentual}%`,
    `PRECO PRATICADO: R$ ${ficha.precoVendaPraticado.toFixed(2)}`,
    `--------------------------------------------`,
    `MODO DE PREPARO / GRELHA:`,
    ...ficha.modoPreparo.map((m, idx) => `${idx + 1}. ${m.slice(0, 36)}`)
  ];

  generateThermalPDF(
    `FICHA TECNICA: ${ficha.nome.slice(0, 20)}`,
    lines,
    { format, headerSubtitle: `ID: ${ficha.id}` }
  );
};

export const printOrdemChapaThermal = (
  ordem: OrdemChapa,
  format: ThermalPaperFormat = '58mm'
) => {
  const lines: string[] = [
    `COMANDA: #${ordem.id.slice(-6)}`,
    `TIPO: ${ordem.tipo.toUpperCase()} - ${ordem.numeroMesaComanda}`,
    `HORA: ${ordem.horaEntrada}`,
    `CLIENTE: ${ordem.clienteNome || 'Cliente Taverna'}`,
    ordem.clienteTelefone ? `TEL: ${ordem.clienteTelefone}` : '',
    ordem.enderecoEntrega ? `END: ${ordem.enderecoEntrega.slice(0, 30)}` : '',
    `--------------------------------------------`,
    `ITENS DO PEDIDO:`,
    ...ordem.itens.map(i => {
      const extra = i.pontoCarne ? ` [${i.pontoCarne}]` : '';
      const rem = i.remocoes && i.remocoes.length > 0 ? ` (Sem: ${i.remocoes.join(', ')})` : '';
      return `${i.quantidade}x ${i.nomeItem.slice(0, 22)}${extra}${rem}`;
    }),
    `--------------------------------------------`,
    ordem.valorTotal ? `TOTAL: R$ ${ordem.valorTotal.toFixed(2)}` : '',
    ordem.formaPagamento ? `PAGAMENTO: ${ordem.formaPagamento.toUpperCase()}` : '',
    ordem.trocoPara ? `TROCO PARA: R$ ${ordem.trocoPara}` : '',
    `ORIGEM: ${ordem.origem?.toUpperCase() || 'BALCAO'}`
  ].filter(Boolean);

  generateThermalPDF(
    `PEDIDO DE CHAPA #${ordem.id.slice(-4)}`,
    lines,
    { format, headerSubtitle: `Chapeiro: ${ordem.chapeiroResponsavel}` }
  );
};
