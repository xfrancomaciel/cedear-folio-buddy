import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { InvestorDashboard } from "@/components/InvestorDashboard";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import TradingViewTickerTape from "@/components/TradingView/TradingViewTickerTape";
import Index from "./pages/Index";
import CedearPrices from "./pages/CedearPrices";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Formaciones from "./pages/Formaciones";
import Graficador from "./pages/Graficador";
import Mapa from "./pages/Mapa";
import Screener from "./pages/Screener";
import Analizador from "./pages/Analizador";
import YouTube from "./pages/YouTube";
import AdminUsers from "./pages/AdminUsers";
import AdminReports from "./pages/AdminReports";
import Optimizador from "./pages/Optimizador";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/acciones" 
              element={
                <ProtectedRoute>
                  <AppLayout><CedearPrices /></AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/portfolio" 
              element={
                <ProtectedRoute>
                  <AppLayout><Index /></AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/configuracion" 
              element={
                <ProtectedRoute>
                  <AppLayout><Settings /></AppLayout>
                </ProtectedRoute>
              } 
            />
          <Route
            path="/reportes"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Reports />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/formaciones"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Formaciones />
                </AppLayout>
              </ProtectedRoute>
            }
          />
            <Route
              path="/portfolio/optimizador"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Optimizador />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/youtube"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <YouTube />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AdminUsers />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AdminReports />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/herramientas/graficador"
            element={
              <ProtectedRoute>
                <GraficadorLayout>
                  <Graficador />
                </GraficadorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/herramientas/mapa"
            element={
              <ProtectedRoute>
                <MapaLayout>
                  <Mapa />
                </MapaLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/herramientas/screener"
            element={
              <ProtectedRoute>
                <ScreenerLayout>
                  <Screener />
                </ScreenerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/herramientas/analizador"
            element={
              <ProtectedRoute>
                <AnalizadorLayout>
                  <Analizador />
                </AnalizadorLayout>
              </ProtectedRoute>
            }
          />
            <Route
              path="/" 
              element={
                <ProtectedRoute>
                  <AppLayout><Index /></AppLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="*" 
              element={
                <ProtectedRoute>
                  <AppLayout><NotFound /></AppLayout>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
        <PWAInstallBanner />
        <OfflineIndicator />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full">
      <InvestorDashboard />
      <main className="flex-1 flex flex-col">
        <div className="sticky top-0 z-50 bg-background border-b">
          <TradingViewTickerTape />
        </div>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <img src="/lovable-uploads/2d8b7a93-0b3f-463a-a0eb-d828b39eff2b.png" alt="BDI Suite" className="h-6 w-6 object-contain" />
            <span className="font-semibold text-foreground">BDI Suite</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  </SidebarProvider>
);

const GraficadorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full">
      <InvestorDashboard />
      <main className="flex-1 h-screen flex flex-col">
        <div className="sticky top-0 z-50 bg-background border-b">
          <TradingViewTickerTape />
        </div>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <img src="/lovable-uploads/2d8b7a93-0b3f-463a-a0eb-d828b39eff2b.png" alt="BDI Suite" className="h-6 w-6 object-contain" />
            <span className="font-semibold text-foreground">Graficador TradingView</span>
          </div>
        </header>
        <div className="h-[calc(100vh-7rem)] w-full">
          {children}
        </div>
      </main>
    </div>
  </SidebarProvider>
);

const MapaLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full">
      <InvestorDashboard />
      <main className="flex-1 h-screen flex flex-col">
        <div className="sticky top-0 z-50 bg-background border-b">
          <TradingViewTickerTape />
        </div>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <img src="/lovable-uploads/2d8b7a93-0b3f-463a-a0eb-d828b39eff2b.png" alt="BDI Suite" className="h-6 w-6 object-contain" />
            <span className="font-semibold text-foreground">Mapa de Calor</span>
          </div>
        </header>
        <div className="h-[calc(100vh-7rem)] w-full">
          {children}
        </div>
      </main>
    </div>
  </SidebarProvider>
);

const ScreenerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full">
      <InvestorDashboard />
      <main className="flex-1 h-screen flex flex-col">
        <div className="sticky top-0 z-50 bg-background border-b">
          <TradingViewTickerTape />
        </div>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <img src="/lovable-uploads/2d8b7a93-0b3f-463a-a0eb-d828b39eff2b.png" alt="BDI Suite" className="h-6 w-6 object-contain" />
            <span className="font-semibold text-foreground">Screener de Acciones</span>
          </div>
        </header>
        <div className="h-[calc(100vh-7rem)] w-full">
          {children}
        </div>
      </main>
    </div>
  </SidebarProvider>
);

const AnalizadorLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full">
      <InvestorDashboard />
      <main className="flex-1 h-screen flex flex-col">
        <div className="sticky top-0 z-50 bg-background border-b">
          <TradingViewTickerTape />
        </div>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <img src="/lovable-uploads/2d8b7a93-0b3f-463a-a0eb-d828b39eff2b.png" alt="BDI Suite" className="h-6 w-6 object-contain" />
            <span className="font-semibold text-foreground">Analizador de Acciones</span>
          </div>
        </header>
        <div className="h-[calc(100vh-7rem)] w-full overflow-auto">
          {children}
        </div>
      </main>
    </div>
  </SidebarProvider>
);

export default App;
