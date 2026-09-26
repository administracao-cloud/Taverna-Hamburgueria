import React from 'react';
import { 
  LayoutDashboard, 
  Flame, 
  FileSpreadsheet, 
  PackageCheck, 
  Scale, 
  TrendingUp, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useBurger } from '../context/BakeryContext';

export type ActiveTab = 
  | 'dashboard'
  | 'chapa'
  | 'fichas'
  | 'estoque'
  | 'blends'
  | 'simulador';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { ordensChapa, insumos } = useBurger();

  const ordensAtivasCount = ordensChapa.filter(o => o.status !== 'pronto').length;
  const insumosBaixosCount = insumos.filter(i => i.estoqueAtual <= i.estoqueMinimo).length;

  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Visão Geral',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'chapa' as ActiveTab,
      label: 'Controle de Chapa',
      icon: Flame,
      badge: ordensAtivasCount > 0 ? `${ordensAtivasCount} ativas` : null,
      badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60'
    },
    {
      id: 'fichas' as ActiveTab,
      label: 'Fichas Técnicas',
      icon: FileSpreadsheet,
      badge: null
    },
    {
      id: 'estoque' as ActiveTab,
      label: 'Estoque de Insumos',
      icon: PackageCheck,
      badge: insumosBaixosCount > 0 ? `${insumosBaixosCount} baixos` : null,
      badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-800/60'
    },
    {
      id: 'blends' as ActiveTab,
      label: 'Calculadora de Blends',
      icon: Scale,
      badge: null
    },
    {
      id: 'simulador' as ActiveTab,
      label: 'Simulador & Margens',
      icon: TrendingUp,
      badge: null
    }
  ];

  return (
    <aside className="w-64 flex flex-col justify-between bg-stone-900 border-r border-stone-800 shrink-0 select-none">
      {/* Navigation Links */}
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-stone-300">
          Módulos de Gestão
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left ${
                isActive
                  ? 'bg-amber-600/15 text-amber-400 border border-amber-600/30 shadow-sm'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-300'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer strictly updated with artisanal burger terms */}
      <div className="p-4 m-3 rounded-xl bg-stone-950/70 border border-stone-800/80">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-bold text-stone-200">Hambúrgueres na Brasa</span>
        </div>
        <p className="text-[11px] text-stone-300 leading-relaxed">
          Blends artesanais diários, cortes nobres frescos e padronização técnica de grelha.
        </p>
        <div className="mt-3 pt-2.5 border-t border-stone-800/60 flex items-center justify-between text-[10px] text-stone-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            Fogo & Lenha 100%
          </span>
          <span className="font-mono">v2.4</span>
        </div>
      </div>
    </aside>
  );
};
