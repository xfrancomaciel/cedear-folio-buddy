import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InvestorDashboard } from "@/components/InvestorDashboard";
import Index from "./pages/Index";
import CedearPrices from "./pages/CedearPrices";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <InvestorDashboard>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/precios" element={<CedearPrices />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </InvestorDashboard>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
