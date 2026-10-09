import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateThermalPDF } from '../../utils/thermalPrinter';
import { QrCode, Printer, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';

interface QRCodeGeneratorProps {
  url?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ url: propUrl }) => {
  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://taverna-burger.com';
  const baseUrl = propUrl || `${currentHost}?mode=cardapio#cardapio`;

  const [selectedMesa, setSelectedMesa] = useState('Geral');
  const [copied, setCopied] = useState(false);
  const [paperFormat, setPaperFormat] = useState<'58mm' | '80mm'>('58mm');

  const fullUrl = selectedMesa === 'Geral' 
    ? baseUrl 
    : `${baseUrl}&mesa=${encodeURIComponent(selectedMesa)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintThermalDisplay = () => {
    const lines = [
      `CARDAPIO DIGITAL & PEDIDOS NA MESA`,
      `MESA / LOCAL: ${selectedMesa.toUpperCase()}`,
      `--------------------------------------------`,
      `Como pedir pelo celular:`,
      `1. Aponte a camera do celular para`,
      `   o QR Code no suporte da mesa.`,
      `2. Escolha os burgers, combos e pocos.`,
      `3. Personalize o ponto da carne e`,
      `   envie direto para a nossa chapa!`,
      `--------------------------------------------`,
      `Link direto:`,
      `${fullUrl}`,
      `--------------------------------------------`,
      `TAVERNA - HAMBURGUERIA ARTESANAL`,
      `Porto Velho - RO • Chapa & Brasa Quente`
    ];

    generateThermalPDF(
      `DISPLAY ${selectedMesa.toUpperCase()}`,
      lines,
      { format: paperFormat, headerSubtitle: 'Aponte a camera para pedir' }
    );
  };

  return (
    <div className="p-6 bg-stone-900 rounded-2xl border border-stone-800 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-600/20 text-amber-500 border border-amber-600/30">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-100 font-display">
              QR Code do Cardápio & Mesas
            </h3>
            <p className="text-xs text-stone-400">
              Gere QR Codes para colocar nos displays de acrílico das mesas e no balcão
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-400">Impressora:</span>
          <select
            value={paperFormat}
            onChange={(e) => setPaperFormat(e.target.value as '58mm' | '80mm')}
            className="bg-stone-950 border border-stone-800 text-stone-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="58mm">58mm (Padrão)</option>
            <option value="80mm">80mm (Larga)</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* QR Code Presentation */}
        <div className="flex flex-col items-center justify-center p-6 bg-stone-950 rounded-2xl border border-stone-800 space-y-4">
          <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
            <QRCodeSVG 
              value={fullUrl} 
              size={180}
              level="M"
              marginSize={2}
            />
          </div>

          <div className="text-center space-y-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
              {selectedMesa === 'Geral' ? 'Cardápio Geral' : `Mesa: ${selectedMesa}`}
            </span>
            <p className="text-[11px] text-stone-400 max-w-xs break-all font-mono">
              {fullUrl}
            </p>
          </div>
        </div>

        {/* Configuration and Actions */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-2">
              Selecione a Mesa ou Ponto de Atendimento:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Geral', 'Mesa 01', 'Mesa 02', 'Mesa 03', 'Mesa 04', 'Balcão'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMesa(m)}
                  className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedMesa === m
                      ? 'bg-amber-600/20 text-amber-400 border-amber-500 font-extrabold shadow-sm'
                      : 'bg-stone-950 text-stone-400 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-stone-950/70 border border-stone-800/80 rounded-xl space-y-1 text-xs text-stone-400">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Identificação Automática</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Ao escanear o QR Code de uma mesa específica, o sistema preenche automaticamente o campo comanda/mesa no checkout do cliente!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={handlePrintThermalDisplay}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Imprimir Display ({paperFormat})</span>
            </button>

            <button
              onClick={handleCopy}
              className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
