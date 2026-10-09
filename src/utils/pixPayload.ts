/**
 * Gerador e Validador Oficial de Payload Pix (BR Code / BACEN / EMVCo)
 * com Suporte a Nu Pagamentos S.A. (Nubank - Banco 260) e NuPay
 */

export interface GeneratePixParams {
  chavePix: string;
  nomeTitular?: string;
  cidadeTitular?: string;
  valor?: number;
  txid?: string;
  descricao?: string;
}

export interface PixValidationResult {
  isValid: boolean;
  crcValid: boolean;
  calculatedCrc: string;
  foundCrc: string;
  decoded: {
    chavePix?: string;
    nomeRecebedor?: string;
    cidadeRecebedor?: string;
    valor?: number;
    txid?: string;
    descricao?: string;
  };
  error?: string;
}

/**
 * Remove acentos e caracteres especiais para compatibilidade com o padrão EMV / BACEN
 */
export function sanitizePixText(text: string, maxLength: number): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-zA-Z0-9 ]/g, '')   // apenas letras, números e espaços
    .trim()
    .toUpperCase()
    .slice(0, maxLength);
}

/**
 * Formata um campo no padrão EMVCo TLV (Tag-Length-Value)
 * Tag: 2 dígitos
 * Length: 2 dígitos com zeros à esquerda
 * Value: string do campo
 */
export function formatEMVField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

/**
 * Cálculo oficial do CRC16-CCITT (Polinômio 0x1021, Init 0xFFFF, sem reflexão)
 * Exigência estrita de todas as instituições financeiras (Nubank, Itaú, BB, etc.)
 */
export function calculateCRC16(payload: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= (payload.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Gera o payload oficial do Pix (Copia e Cola / QR Code Estático ou Dinâmico)
 */
export function generatePixPayload({
  chavePix,
  nomeTitular = 'TAVERNA BURGER',
  cidadeTitular = 'PORTO VELHO',
  valor,
  txid = '***',
  descricao
}: GeneratePixParams): string {
  // Limpeza e formatação de chave
  const cleanKey = (chavePix || '').trim();
  const cleanName = sanitizePixText(nomeTitular, 25) || 'TAVERNA BURGER';
  const cleanCity = sanitizePixText(cidadeTitular, 15) || 'PORTO VELHO';
  
  // Limpeza do txid (apenas alfanumérico sem espaços, ou *** para não especificado)
  let cleanTxid = (txid || '***').replace(/[^a-zA-Z0-9]/g, '').slice(0, 25);
  if (!cleanTxid) cleanTxid = '***';

  // 1. Merchant Account Information (Tag 26)
  // Subtag 00: Domínio "br.gov.bcb.pix"
  let maiContent = formatEMVField('00', 'br.gov.bcb.pix');
  // Subtag 01: Chave Pix
  maiContent += formatEMVField('01', cleanKey);
  // Subtag 02: Descrição adicional (opcional, máx 25)
  if (descricao) {
    const cleanDesc = sanitizePixText(descricao, 25);
    if (cleanDesc) {
      maiContent += formatEMVField('02', cleanDesc);
    }
  }
  const tag26 = formatEMVField('26', maiContent);

  // 2. Montagem dos campos padrão
  let payload = '';
  // Tag 00: Payload Format Indicator ("01")
  payload += formatEMVField('00', '01');
  // Tag 26: Informações da conta recebedora
  payload += tag26;
  // Tag 52: Merchant Category Code ("0000" para geral/comércio)
  payload += formatEMVField('52', '0000');
  // Tag 53: Transaction Currency ("986" = BRL Real Brasileiro)
  payload += formatEMVField('53', '986');

  // Tag 54: Transaction Amount (apenas se valor for especificado e maior que 0)
  if (valor !== undefined && valor > 0) {
    const formattedAmount = Number(valor).toFixed(2);
    payload += formatEMVField('54', formattedAmount);
  }

  // Tag 58: Country Code ("BR")
  payload += formatEMVField('58', 'BR');
  // Tag 59: Merchant Name (Nome do recebedor / Nubank)
  payload += formatEMVField('59', cleanName);
  // Tag 60: Merchant City (Cidade do recebedor)
  payload += formatEMVField('60', cleanCity);

  // Tag 62: Additional Data Field Template
  // Subtag 05: Reference Label / txid
  const addDataContent = formatEMVField('05', cleanTxid);
  payload += formatEMVField('62', addDataContent);

  // Tag 63: CRC16 (Sempre no final com Tag 63 e Length 04)
  payload += '6304';

  // Calcula o CRC16 sobre toda a string incluindo o '6304'
  const crc = calculateCRC16(payload);

  return `${payload}${crc}`;
}

/**
 * Valida a integridade do código Pix Copia e Cola / Payload EMV
 */
export function validatePixPayload(payload: string): PixValidationResult {
  if (!payload || typeof payload !== 'string' || payload.length < 20) {
    return {
      isValid: false,
      crcValid: false,
      calculatedCrc: '',
      foundCrc: '',
      decoded: {},
      error: 'Payload vazio ou com tamanho insuficiente.'
    };
  }

  if (!payload.startsWith('000201')) {
    return {
      isValid: false,
      crcValid: false,
      calculatedCrc: '',
      foundCrc: '',
      decoded: {},
      error: 'Código não inicia com o identificador padrão EMV "000201".'
    };
  }

  const crcIndex = payload.lastIndexOf('6304');
  if (crcIndex === -1 || crcIndex !== payload.length - 8) {
    return {
      isValid: false,
      crcValid: false,
      calculatedCrc: '',
      foundCrc: '',
      decoded: {},
      error: 'Tag de CRC16 (6304) ausente ou fora de posição.'
    };
  }

  const payloadWithoutCrc = payload.slice(0, crcIndex + 4);
  const foundCrc = payload.slice(crcIndex + 4).toUpperCase();
  const calculatedCrc = calculateCRC16(payloadWithoutCrc);

  const crcValid = foundCrc === calculatedCrc;

  // Decodifica campos básicos para exibição
  const decoded: PixValidationResult['decoded'] = {};
  try {
    let cursor = 0;
    while (cursor < crcIndex) {
      const tag = payload.slice(cursor, cursor + 2);
      const len = parseInt(payload.slice(cursor + 2, cursor + 4), 10);
      const val = payload.slice(cursor + 4, cursor + 4 + len);
      cursor += 4 + len;

      if (tag === '26') {
        // Parse subfields
        let subCursor = 0;
        while (subCursor < val.length) {
          const subTag = val.slice(subCursor, subCursor + 2);
          const subLen = parseInt(val.slice(subCursor + 2, subCursor + 4), 10);
          const subVal = val.slice(subCursor + 4, subCursor + 4 + subLen);
          subCursor += 4 + subLen;
          if (subTag === '01') decoded.chavePix = subVal;
          if (subTag === '02') decoded.descricao = subVal;
        }
      } else if (tag === '54') {
        decoded.valor = parseFloat(val);
      } else if (tag === '59') {
        decoded.nomeRecebedor = val;
      } else if (tag === '60') {
        decoded.cidadeRecebedor = val;
      } else if (tag === '62') {
        let subCursor = 0;
        while (subCursor < val.length) {
          const subTag = val.slice(subCursor, subCursor + 2);
          const subLen = parseInt(val.slice(subCursor + 2, subCursor + 4), 10);
          const subVal = val.slice(subCursor + 4, subCursor + 4 + subLen);
          subCursor += 4 + subLen;
          if (subTag === '05') decoded.txid = subVal;
        }
      }
    }
  } catch (err) {
    // Decodificação parcial tolerada
  }

  return {
    isValid: crcValid,
    crcValid,
    calculatedCrc,
    foundCrc,
    decoded,
    error: crcValid ? undefined : `CRC16 divergente! Esperado ${calculatedCrc}, encontrado ${foundCrc}.`
  };
}

/**
 * Gera link direto para o aplicativo do Nubank (Deeplink / NuPay)
 */
export function generateNubankDeepLink(pixCode: string): string {
  // O app do Nubank aceita deeplink de Pix ou abertura direta
  return `nubank://pix?payload=${encodeURIComponent(pixCode)}`;
}

/**
 * Simulação e Verificação de Recebimento via API Nubank PJ
 */
export interface NubankReceiptStatus {
  confirmado: boolean;
  txid: string;
  e2eId: string;
  valor: number;
  chavePix: string;
  pagador: string;
  bancoRecebedor: string;
  instituicao: string;
  horario: string;
  codigoAutenticacao: string;
}

export function checkNubankPaymentStatus(
  txid: string, 
  valorEsperado: number,
  chavePix: string
): Promise<NubankReceiptStatus> {
  return new Promise((resolve) => {
    // Simula tempo de consulta na API NuPay / Nubank PJ
    setTimeout(() => {
      const e2eId = `E18236120${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const authCode = `NU-${Math.floor(100000 + Math.random() * 900000)}-BR`;
      
      resolve({
        confirmado: true,
        txid: txid || 'PED-DIRECT',
        e2eId,
        valor: valorEsperado,
        chavePix,
        pagador: 'Cliente Taverna',
        bancoRecebedor: 'Nubank (Nu Pagamentos S.A. - 260)',
        instituicao: 'Nu Pagamentos S.A. - ISPB 18236120',
        horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        codigoAutenticacao: authCode
      });
    }, 1200);
  });
}
