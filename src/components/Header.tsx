import React from 'react';
import { useBurger } from '../context/BakeryContext';
import { UserRole } from '../types';
import { Flame, Plus, Bell, ChefHat, RefreshCw, Layers } from 'lucide-react';

interface HeaderProps {
  onOpenNewOrder: () => void;
  onOpenNewFicha: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewOrder, onOpenNewFicha }) => {
  const { userRole, setUserRole, ordensChapa, fichasTecnicas, resetToDefaults } = useBurger();

  const ordensAtivas = ordensChapa.filter(o => o.status === 'na_chapa' || o.status === 'na_fila').length;
  const cmvMedio = (
    fichasTecnicas.reduce((acc, f) => acc + (f.cmvPercentual || 0), 0) / (fichasTecnicas.length || 1)
  ).toFixed(1);

  const roles: UserRole[] = [
    'Chapeiro / Grelhador',
    'Chapeiro Chefe',
    'Gerente de Operações',
    'Administrador'
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-stone-900/95 backdrop-blur-md border-b border-stone-800">
      {/* Zone 1: Single text element / Brand lockup */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-orange-700 text-stone-950 font-black shadow-inner">
          <Flame className="w-5 h-5 text-stone-950 fill-stone-950" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-extrabold tracking-wider text-stone-100 font-display">
            TAVERNA
          </span>
          <span className="text-[11px] font-medium tracking-wide text-amber-500 uppercase">
            Hamburgueria Artesanal
          </span>
        </div>
      </div>

      {/* Zone 2: Clean metrics & quick context */}
      <div className="hidden md:flex items-center gap-6 text-xs text-stone-400">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="text-stone-300 font-medium">Chapa Ativa:</span>
          <span className="font-semibold text-stone-100 tabular-nums">{ordensAtivas} pedidos</span>
        </div>
        <span className="text-stone-700" aria-hidden="true">|</span>
        <div className="flex items-center gap-2">
          <span className="text-stone-300 font-medium">CMV Médio:</span>
          <span className="font-semibold text-emerald-400 tabular-nums">{cmvMedio}%</span>
        </div>
        <span className="text-stone-700" aria-hidden="true">|</span>
        <div className="flex items-center gap-2">
          <span className="text-stone-300 font-medium">Fichas Cadastradas:</span>
          <span className="font-semibold text-stone-100 tabular-nums">{fichasTecnicas.length}</span>
        </div>
      </div>

      {/* Zone 3: Role selector & primary actions */}
      <div className="flex items-center gap-3">
        {/* Role Selector */}
        <div className="flex items-center gap-2 bg-stone-950/80 border border-stone-800 rounded-lg px-2.5 py-1.5 text-xs text-stone-300">
          <ChefHat className="w-3.5 h-3.5 text-amber-500" />
          <select 
            value={userRole} 
            onChange={(e) => setUserRole(e.target.value as UserRole)}
            className="bg-transparent text-stone-200 font-medium focus:outline-none cursor-pointer"
          >
            {roles.map((r) => (
              <option key={r} value={r} className="bg-stone-900 text-stone-100">
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Quick action: Nova Ficha Técnica */}
        <button
          onClick={onOpenNewFicha}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 hover:text-white rounded-lg transition-colors border border-stone-700"
          title="Nova Ficha Técnica"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>+ Ficha</span>
        </button>

        {/* Primary Action Button */}
        <button
          onClick={onOpenNewOrder}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-stone-950 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 rounded-lg transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Novo Pedido</span>
        </button>

        {/* Reset Demo Data */}
        <button
          onClick={resetToDefaults}
          title="Restaurar dados de demonstração"
          className="p-1.5 text-stone-500 hover:text-stone-300 transition-colors rounded-md hover:bg-stone-800"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
