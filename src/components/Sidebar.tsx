import React from 'react';
import { 
  LayoutDashboard, 
  Flame, 
  FileSpreadsheet, 
  PackageCheck, 
  Scale, 
  TrendingUp, 
  Sparkles,
  ShieldCheck,
  Layers,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useBurger } from '../context/BakeryContext';

export type ActiveTab = 
  | 'dashboard'
  | 'chapa'
  | 'fichas'
  | 'estoque'
  | 'blends'
  | 'simulador'
  | 'menu';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { ordensChapa, insumos, currentUser, userRole, logout } = useBurger();

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
    },
    {
      id: 'menu' as ActiveTab,
      label: 'Cardápio Digital',
      icon: Layers,
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

      {/* User profile card & Logout */}
      <div className="p-3 m-3 rounded-xl bg-stone-950/90 border border-stone-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-stone-950 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'TA'}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-stone-100 truncate block">
                {currentUser?.name || 'Administrador'}
              </span>
              <span className="text-[10px] text-amber-400 font-medium truncate block">
                {userRole}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sair do Sistema"
            className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-stone-900 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            Conexão Segura
          </span>
          <span className="font-mono text-stone-300">v2.4</span>
        </div>
      </div>
    </aside>
  );
};
