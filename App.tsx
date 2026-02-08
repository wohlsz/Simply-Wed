
import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useWedding } from './context/WeddingContext';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Checklist from './components/Checklist';
import GuestList from './components/GuestList';
import BudgetTracker from './components/BudgetTracker';
import CoupleArea from './components/CoupleArea';
import MusicPlanner from './components/MusicPlanner';
import LoginPage from './components/LoginPage';
import { useAuth } from './context/AuthContext';
import { DEFAULT_WEDDING_DATA } from './constants';

const App: React.FC = () => {
  const { weddingData, setWeddingData, loadingData } = useWedding();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-wedding-nude">
      <div className="animate-spin text-wedding-gold w-12 h-12 border-4 border-current border-t-transparent rounded-full" />
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      {/* Se não estiver logado, redireciona para login ao tentar acessar rotas protegidas */}
      <Route path="/dashboard/*" element={
        user ? (
          <div className="contents">
            {/* Se estiver logado mas não tiver Casamento criado, vai para Onboarding */}
            {(loadingData && !weddingData.onboarded) ? (
              <div className="min-h-screen flex items-center justify-center bg-wedding-nude">
                <div className="animate-spin text-wedding-gold w-12 h-12 border-4 border-current border-t-transparent rounded-full" />
              </div>
            ) : !weddingData.onboarded ? (
              <Onboarding />
            ) : (
              <Layout coupleName={weddingData.coupleName} onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/checklist" element={<Checklist />} />
                  <Route path="/guests" element={<GuestList />} />
                  <Route path="/budget" element={<BudgetTracker />} />
                  <Route path="/vendors" element={
                    <div className="p-8 text-center py-20">
                      <h1 className="text-4xl font-serif font-bold text-slate-800 mb-4">Fornecedores</h1>
                      <p className="text-slate-500">Módulo em breve...</p>
                    </div>
                  } />
                  <Route path="/couple" element={<CoupleArea />} />
                  <Route path="/music" element={<MusicPlanner />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            )}
          </div>
        ) : (
          <Navigate to="/" replace />
        )
      } />

      {/* Compatibility Redirects */}
      <Route path="/app" element={<Navigate to="/dashboard" replace />} />
      <Route path="/setup" element={<Navigate to="/dashboard" />} />
      <Route path="/welcome" element={<Navigate to="/" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
