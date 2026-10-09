import React, { useState, useEffect } from 'react';
import { BurgerProvider, useBurger } from './context/BakeryContext';
import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { OverviewView } from './components/views/OverviewView';
import { ChapaControlView } from './components/views/ChapaControlView';
import { TechnicalSheetsView } from './components/views/TechnicalSheetsView';
import { InventoryView } from './components/views/InventoryView';
import { BlendCalculatorView } from './components/views/BlendCalculatorView';
import { FinancialSimView } from './components/views/FinancialSimView';
import { DigitalMenuView } from './components/views/DigitalMenuView';
import { CustomerMenu } from './components/menu/CustomerMenu';
import { LoginView } from './components/auth/LoginView';
import { TechnicalSheetModal } from './components/modals/TechnicalSheetModal';
import { MaterialModal } from './components/modals/MaterialModal';
import { NewChapaOrderModal } from './components/modals/NewChapaOrderModal';
import { Insumo, FichaTecnica } from './types';

export function TavernaApp() {
  const { isAuthenticated, currentUser } = useBurger();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Standalone customer menu mode (e.g. for customers scanning QR code)
  const [isStandaloneMenu, setIsStandaloneMenu] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      const hash = window.location.hash;
      return search.includes('mode=cardapio') || search.includes('menu=true') || hash === '#cardapio' || hash === '#menu';
    }
    return false;
  });

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      if (search.includes('mode=cardapio') || search.includes('menu=true') || hash === '#cardapio' || hash === '#menu') {
        setIsStandaloneMenu(true);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  // 1. Standalone Customer Menu View (accessed by QR Code, customer URL, or test shortcut)
  // Strictly isolated: no buttons or navigation links to the administration panel or login
  if (isStandaloneMenu) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
        <div className="flex-1">
          <CustomerMenu />
        </div>
      </div>
    );
  }

  // 2. Authentication Gate: If not authenticated, show the Login View
  if (!isAuthenticated) {
    return (
      <LoginView 
        onOpenCustomerMenu={() => setIsStandaloneMenu(true)} 
      />
    );
  }

  // 3. Authenticated Internal Management Panel
  return (
    <div className="flex h-screen bg-stone-950 text-stone-100 overflow-hidden select-none">
      {/* Sidebar navigation */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main content container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          onOpenNewOrder={() => setIsOrderModalOpen(true)}
          onOpenNewFicha={handleOpenNewFicha}
          onOpenCustomerMenu={() => setIsStandaloneMenu(true)}
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

          {activeTab === 'menu' && (
            <DigitalMenuView />
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
