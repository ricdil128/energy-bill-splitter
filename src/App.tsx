
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import { EnergyProvider } from "./context/EnergyContext";

const queryClient = new QueryClient();

// Determina se è in produzione
const isProduction = import.meta.env.MODE === 'production';

// Usa HashRouter in produzione, BrowserRouter in sviluppo
const Router = isProduction ? HashRouter : BrowserRouter;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <EnergyProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route 
              path="/dashboard" 
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              } 
            />
            <Route 
              path="/history" 
              element={
                <Layout>
                  <History />
                </Layout>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </EnergyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
