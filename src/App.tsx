
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import History from './pages/History';
import Index from './pages/Index';
import { Toaster } from './components/ui/toaster';
import { EnergyProvider } from './context/EnergyContext';
import React from 'react';
import { AuthProvider } from './hooks/useAuth';

function App() {
  return (
    <AuthProvider>
      <EnergyProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Outlet /></Layout>}>
              <Route index element={<Index />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="auth" element={<Auth />} />
              <Route path="history" element={<History />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <Toaster />
        </BrowserRouter>
      </EnergyProvider>
    </AuthProvider>
  );
}

export default App;
