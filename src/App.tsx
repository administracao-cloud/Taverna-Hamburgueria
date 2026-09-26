import React, { useState } from 'react';
import { BurgerProvider } from './context/BakeryContext';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { OverviewView } from './components/views/OverviewView';
import { ChapaControlView } from './components/views/ChapaControlView';
import { TechnicalSheetsView } from './components/views/TechnicalSheetsView';
import { InventoryView } from './components/views/InventoryView';
import { BlendCalculatorView } from './components/views/BlendCalculatorView';
import { FinancialSimView } from './components/views/FinancialSimView';
import { TechnicalSheetModal } from './components/modals/TechnicalSheetModal';
import { MaterialModal } from './components/modals/MaterialModal';
import { NewChapaOrderModal } from './components/modals/NewChapaOrderModal';
import { Insumo, FichaTecnica } from './types';

export function TavernaApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Modals state
  const [isFichaModalOpen, setIsFichaModalOpen] = useState(false);
  const [fichaParaEditar, setFichaParaEditar] = useState<FichaTecnica | null>(null);

  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [materialParaEditar, setMaterialParaEditar] = useState<Insumo | null>(null);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const handleOpenNewFicha = () => {
    setFichaParaEditar(null);
    setIsFichaModalOpen(true);
  };

  const handleEditFicha = (ficha: FichaTecnica) => {
    setFichaParaEditar(ficha);
    setIsFichaModalOpen(true);
  };

  const handleOpenNewMaterial = () => {
    setMaterialParaEditar(null);
    setIsMaterialModalOpen(true);
  };

  const handleEditMaterial = (insumo: Insumo) => {
    setMaterialParaEditar(insumo);
    setIsMaterialModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-stone-950 text-stone-100 overflow-hidden select-none">
      {/* Sidebar navigation */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main content container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          onOpenNewOrder={() => setIsOrderModalOpen(true)}
          onOpenNewFicha={handleOpenNewFicha}
        />

        <main className="flex-1 overflow-y-auto bg-stone-950">
          {activeTab === 'dashboard' && (
            <OverviewView 
              onNavigate={setActiveTab}
              onOpenNewOrder={() => setIsOrderModalOpen(true)}
              onOpenNewFicha={handleOpenNewFicha}
            />
          )}

          {activeTab === 'chapa' && (
            <ChapaControlView 
              onOpenNewOrder={() => setIsOrderModalOpen(true)}
            />
          )}

          {activeTab === 'fichas' && (
            <TechnicalSheetsView 
              onOpenNewFicha={handleOpenNewFicha}
              onEditFicha={handleEditFicha}
            />
          )}

          {activeTab === 'estoque' && (
            <InventoryView 
              onOpenNewMaterial={handleOpenNewMaterial}
              onEditMaterial={handleEditMaterial}
            />
          )}

          {activeTab === 'blends' && (
            <BlendCalculatorView />
          )}

          {activeTab === 'simulador' && (
            <FinancialSimView />
          )}
        </main>
      </div>

      {/* Modals */}
      <TechnicalSheetModal
        isOpen={isFichaModalOpen}
        onClose={() => {
          setIsFichaModalOpen(false);
          setFichaParaEditar(null);
        }}
        fichaParaEditar={fichaParaEditar}
      />

      <MaterialModal
        isOpen={isMaterialModalOpen}
        onClose={() => {
          setIsMaterialModalOpen(false);
          setMaterialParaEditar(null);
        }}
        materialParaEditar={materialParaEditar}
      />

      <NewChapaOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BurgerProvider>
      <TavernaApp />
    </BurgerProvider>
  );
}
