import React, { useState } from 'react';
import { QRCodeGenerator } from '../menu/QRCodeGenerator';
import { MenuImporter } from '../menu/MenuImporter';
import { CustomerMenu } from '../menu/CustomerMenu';
import { MenuSettingsPanel } from '../menu/MenuSettingsPanel';
import { ItemManagementPanel } from '../menu/ItemManagementPanel';
import { useBurger } from '../../context/BakeryContext';
import { printFichaTecnicaThermal, printOrdemChapaThermal, generateThermalPDF } from '../../utils/thermalPrinter';
import { 
  Smartphone, 
  Globe, 
  Upload, 
  QrCode, 
  Printer, 
  ExternalLink, 
  Monitor, 
  CheckCircle2, 
  Sparkles,
  Flame,
  FileText,
  Settings,
  Bike,
  SlidersHorizontal,
  Send,
  Clock,
  MapPin,
  DollarSign
} from 'lucide-react';

type MenuTab = 'live_menu' | 'settings' | 'item_management' | 'importer' | 'order_test' | 'qrcode' | 'thermal_hub';

export const DigitalMenuView: React.FC = () => {
  const { 
    fichasTecnicas, 
    ordensChapa, 
    menuSettings, 
    updateMenuSettings,
    simulateIFoodOrder,
    simulateDigitalMenuOrder 
  } = useBurger();
  const [activeSubTab, setActiveSubTab] = useState<MenuTab>('live_menu');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [testLogMsg, setTestLogMsg] = useState<string | null>(null);

  const handleRunIFoodTest = () => {
    const order = simulateIFoodOrder();
    setTestLogMsg(`✓ Pedido de Teste iFood #${order.numeroMesaComanda} recebido no KDS e impresso com sucesso!`);
    setTimeout(() => setTestLogMsg(null), 5000);
  };

  const handleRunDigitalTest = () => {
    const order = simulateDigitalMenuOrder();
    setTestLogMsg(`✓ Pedido de Teste do Cardápio Digital #${order.numeroMesaComanda} recebido no KDS e impresso com sucesso!`);
    setTimeout(() => setTestLogMsg(null), 5000);
  };

  const currentHost = typeof window !== 'undefined' ? window.location.origin : '';
  const clientMenuUrl = `${currentHost}?mode=cardapio#cardapio`;

  const handleOpenClientLink = () => {
    window.open(clientMenuUrl, '_blank');
  };

  const handleTestThermalPrint = (format: '58mm' | '80mm') => {
    const lines = [
      `TESTE DE IMPRESSAO TERMICA ${format}`,
      `Data: ${new Date().toLocaleDateString('pt-BR')}`,
      `Hora: ${new Date().toLocaleTimeString('pt-BR')}`,
      `--------------------------------------------`,
      `Chapa & Brasa Quente - Taverna`,
      `Porto Velho - RO`,
      `Impressora configurada com sucesso!`
    ];
    generateThermalPDF(`Teste_${format}`, lines, { format });
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-stone-950 shadow-md">
            <Smartphone className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-stone-100 font-display">
              Cardápio Digital & Integração iFood
            </h1>
            <p className="text-xs text-stone-400">
              Site de pedidos para clientes, clonagem de cardápio do iFood (Beefood), QR Code e impressão térmica
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenClientLink}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-amber-400 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir Link do Cliente</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'live_menu' as const, label: '🌐 Cardápio ao Vivo (Visão do Cliente)', icon: Globe },
          { id: 'order_test' as const, label: '🧪 Testar Integração de Pedidos (iFood & Web)', icon: Send },
          { id: 'settings' as const, label: '⚙️ Configurações Gerais (Delivery, Ponto, Sachês & Preços)', icon: Settings },
          { id: 'item_management' as const, label: '📋 Gestão de Itens (Adicionais, Remoções & Sachês)', icon: SlidersHorizontal },
          { id: 'importer' as const, label: '⚡ Importador iFood (Cópia Beefood)', icon: Upload },
          { id: 'qrcode' as const, label: '📱 QR Code de Balcão & Mesas', icon: QrCode },
          { id: 'thermal_hub' as const, label: '🖨️ Central de Impressão Térmica (58/80mm)', icon: Printer }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-amber-600 text-stone-950 border-amber-500 shadow-md'
                  : 'bg-stone-900/60 text-stone-400 border-transparent hover:border-stone-800 hover:text-stone-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Live Menu with Mobile Device Frame Switcher */}
      {activeSubTab === 'live_menu' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/60 border border-stone-800 p-3 rounded-2xl">
            <div className="flex items-center gap-2 text-xs text-stone-300">
              <span className="font-bold text-amber-400">Modo de Exibição:</span>
              <span>Escolha como deseja pré-visualizar a experiência do seu cliente</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Botão de Controle de Status da Chapa - Exclusivo Administrador */}
              <button
                type="button"
                onClick={() => updateMenuSettings({ lojaAberta: !(menuSettings.lojaAberta !== false) })}
                className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-2 border transition-all shadow-sm ${
                  menuSettings.lojaAberta !== false
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/60'
                    : 'bg-rose-950/80 border-rose-500/50 text-rose-400 hover:bg-rose-900/60'
                }`}
                title="Alternar se a loja está aberta e recebendo pedidos dos clientes"
              >
                <span className={`w-2.5 h-2.5 rounded-full ${menuSettings.lojaAberta !== false ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <span>{menuSettings.lojaAberta !== false ? 'Chapa Aberta (Recebendo)' : 'Loja Fechada'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('settings')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-stone-950 transition-all flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Configurar Delivery & Sachês</span>
              </button>

              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  previewDevice === 'desktop'
                    ? 'bg-amber-600 text-stone-950'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Tela Cheia</span>
              </button>

              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  previewDevice === 'mobile'
                    ? 'bg-amber-600 text-stone-950'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Smartphone</span>
              </button>
            </div>
          </div>

          {previewDevice === 'mobile' ? (
            <div className="flex justify-center py-6 bg-stone-950/80 rounded-3xl border border-stone-800/80">
              {/* Smartphone Frame mockup */}
              <div className="w-[410px] h-[820px] bg-stone-900 rounded-[44px] border-[6px] border-stone-800 shadow-2xl overflow-hidden flex flex-col relative">
                {/* Speaker notch */}
                <div className="h-5 bg-stone-950 flex items-center justify-center shrink-0">
                  <div className="w-16 h-1 bg-stone-800 rounded-full" />
                </div>
                {/* Screen */}
                <div className="flex-1 overflow-y-auto">
                  <CustomerMenu />
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-stone-800/80 overflow-hidden shadow-2xl">
              <CustomerMenu />
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Settings Panel */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6">
          <MenuSettingsPanel />
        </div>
      )}

      {/* TAB: Gestão de Itens por Item (Adicionais, Remoções e Sachês) */}
      {activeSubTab === 'item_management' && (
        <div className="space-y-6">
          <ItemManagementPanel />
        </div>
      )}

      {/* TAB 3: iFood Importer & Beefood Clone */}
      {activeSubTab === 'importer' && (
        <div className="space-y-6">
          <MenuImporter />
        </div>
      )}

      {/* TAB: Order Integration Testing (iFood & Cardápio Digital) */}
      {activeSubTab === 'order_test' && (
        <div className="space-y-6 animate-fade-in">
          {/* Status Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold">API iFood (Polling / Webhook)</span>
                <p className="text-sm font-black text-rose-400 mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>Conectado & Operante</span>
                </p>
              </div>
              <span className="text-xl">🔴</span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold">KDS da Chapa (Cozinha)</span>
                <p className="text-sm font-black text-amber-400 mt-0.5">
                  {ordensChapa.length} Pedidos Sincronizados
                </p>
              </div>
              <Flame className="w-5 h-5 text-amber-500" />
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold">Impressão Térmica</span>
                <p className="text-sm font-black text-emerald-400 mt-0.5">Pronta (58mm / 80mm)</p>
              </div>
              <Printer className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold">Status do Cardápio</span>
                <p className="text-sm font-black text-emerald-400 mt-0.5">
                  {menuSettings.lojaAberta !== false ? 'Chapa Aberta (Recebendo)' : 'Loja Fechada'}
                </p>
              </div>
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {/* Test notification banner */}
          {testLogMsg && (
            <div className="p-4 bg-emerald-950/90 border border-emerald-500/60 rounded-2xl flex items-center justify-between gap-3 text-emerald-200 text-xs shadow-xl animate-fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-bold text-sm">{testLogMsg}</span>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-emerald-900 text-emerald-300 font-bold">
                ENVIADO AO KDS & TÉRMICA ✓
              </span>
            </div>
          )}

          {/* Action Trigger Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Testar Pedido iFood */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-950/40 to-stone-950 border border-rose-900/60 flex flex-col justify-between space-y-4 shadow-xl hover:border-rose-700/80 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    🔴 Canal iFood Delivery
                  </span>
                  <span className="text-xs text-rose-400 font-mono font-bold">Simulação Automática</span>
                </div>
                <h3 className="text-lg font-black text-stone-100 font-display">
                  Disparar Pedido de Teste do iFood
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Gera um pedido real com número oficial do iFood (ex: <strong>iFood #7842</strong>), cliente fictício, endereço completo de entrega em Porto Velho, hambúrguer com ponto da carne, sachês e adicionais. O pedido entra instantaneamente na fila do KDS da Chapa e gera a comanda térmica.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunIFoodTest}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Simular Recebimento de Pedido iFood</span>
              </button>
            </div>

            {/* Card 2: Testar Pedido Cardápio Digital */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/40 to-stone-950 border border-amber-900/60 flex flex-col justify-between space-y-4 shadow-xl hover:border-amber-700/80 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                    📱 Cardápio Digital (Web / QR Code)
                  </span>
                  <span className="text-xs text-amber-400 font-mono font-bold">Cliente Celular</span>
                </div>
                <h3 className="text-lg font-black text-stone-100 font-display">
                  Disparar Pedido do Cardápio Web
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Simula um cliente final finalizando uma compra pelo cardápio digital mobile (QR code ou link). Aplica taxa de entrega padrão, calcula o total com código Pix simulado e encaminha a comanda para a grelha.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunDigitalTest}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-950/50 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Smartphone className="w-4 h-4 stroke-[2.5]" />
                <span>Simular Pedido do Cardápio Digital</span>
              </button>
            </div>
          </div>

          {/* Feed de Pedidos Atuais Recebidos no Sistema */}
          <div className="p-6 bg-stone-900 rounded-3xl border border-stone-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-stone-100 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Fluxo de Pedidos no KDS da Chapa ({ordensChapa.length})</span>
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  Verifique os pedidos que chegaram tanto pelo iFood quanto pelo Cardápio Digital
                </p>
              </div>
            </div>

            {ordensChapa.length === 0 ? (
              <div className="text-center py-10 text-stone-500 text-xs">
                Nenhum pedido na fila no momento. Clique nos botões acima para disparar um pedido de teste!
              </div>
            ) : (
              <div className="space-y-2.5">
                {ordensChapa.map(ordem => (
                  <div
                    key={ordem.id}
                    className="p-4 bg-stone-950 rounded-2xl border border-stone-800 hover:border-stone-700/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-stone-100 font-mono text-sm">
                          {ordem.numeroMesaComanda}
                        </span>

                        {ordem.origem === 'ifood' ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px]">
                            🔴 iFood
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold text-[10px]">
                            📱 Cardápio Digital
                          </span>
                        )}

                        <span className="text-[10px] text-stone-400 font-mono">
                          {ordem.horaEntrada}
                        </span>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-stone-300 capitalize">
                          Status: {ordem.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-stone-300">
                        Cliente: <strong>{ordem.clienteNome || 'Cliente'}</strong>
                        {ordem.enderecoEntrega && <span className="text-stone-400 text-[11px] ml-2">📍 {ordem.enderecoEntrega}</span>}
                      </p>

                      <div className="text-[11px] text-stone-400 flex flex-wrap gap-2 pt-0.5">
                        {ordem.itens.map((it, idx) => (
                          <span key={idx} className="bg-stone-900 px-2 py-0.5 rounded border border-stone-800 text-stone-300">
                            {it.quantidade}x {it.nomeItem} {it.pontoCarne && `(${it.pontoCarne})`}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-900 justify-between md:justify-end">
                      {ordem.valorTotal && (
                        <span className="font-mono font-black text-amber-400 text-sm">
                          R$ {ordem.valorTotal.toFixed(2)}
                        </span>
                      )}

                      <button
                        onClick={() => printOrdemChapaThermal(ordem, '58mm')}
                        className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors font-bold text-xs flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Imprimir Cupom</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: QR Code Generator */}
      {activeSubTab === 'qrcode' && (
        <div className="space-y-6">
          <QRCodeGenerator url={clientMenuUrl} />
        </div>
      )}

      {/* TAB 4: Thermal Printing Center */}
      {activeSubTab === 'thermal_hub' && (
        <div className="space-y-6">
          <div className="p-6 bg-stone-900 rounded-2xl border border-stone-800 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-600/20 text-amber-500 border border-amber-600/30">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-100 font-display">
                    Central de Impressão Térmica (Bobinas 58mm & 80mm)
                  </h3>
                  <p className="text-xs text-stone-400">
                    Emita fichas técnicas para o chapeiro, comandas da chapa e comprovantes de pedidos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTestThermalPrint('58mm')}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl transition-colors"
                >
                  Testar 58mm
                </button>
                <button
                  onClick={() => handleTestThermalPrint('80mm')}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl transition-colors"
                >
                  Testar 80mm
                </button>
              </div>
            </div>

            {/* Print Fichas Técnicas Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <span>Fichas Técnicas de Hambúrgueres para Impressão (80mm)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {fichasTecnicas.slice(0, 9).map(ficha => (
                  <div
                    key={ficha.id}
                    className="p-3.5 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-stone-200 truncate">{ficha.nome}</p>
                      <p className="text-[11px] text-amber-400 font-mono">
                        R$ {ficha.precoVendaPraticado.toFixed(2)} • CMV {ficha.cmvPercentual}%
                      </p>
                    </div>

                    <button
                      onClick={() => printFichaTecnicaThermal(ficha, '80mm')}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-stone-950 transition-all font-bold text-[11px] shrink-0 flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>80mm</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Print Kitchen Orders */}
            <div className="space-y-3 pt-4 border-t border-stone-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Últimas Comandas da Chapa (58mm)</span>
              </h4>

              <div className="space-y-2">
                {ordensChapa.map(ordem => (
                  <div
                    key={ordem.id}
                    className="p-3 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-stone-200">
                        #{ordem.id.slice(-4)} • {ordem.numeroMesaComanda} ({ordem.clienteNome})
                      </p>
                      <p className="text-[11px] text-stone-400">
                        {ordem.itens.length} itens • {ordem.horaEntrada} • Status: {ordem.status}
                      </p>
                    </div>

                    <button
                      onClick={() => printOrdemChapaThermal(ordem, '58mm')}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors font-bold text-xs shrink-0 flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir Comanda 58mm</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
