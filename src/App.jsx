import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Fields from './pages/Fields';
import Campaigns from './pages/Campaigns';
import Crops from './pages/Crops';
import Expenses from './pages/Expenses';
import Incomes from './pages/Incomes';
import Grain from './pages/Grain';
import Rainfall from './pages/Rainfall';
import DeliveryNotes from './pages/DeliveryNotes';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Machinery from './pages/Machinery';
import Personnel from './pages/Personnel';
import Admin from './pages/Admin';

const INTRO_STORAGE_KEY = 'agrobalance-intro-entered-v2';

function IntroScreen({ onEnter }) {
  return (
    <div className="intro-screen">
      <div className="intro-backdrop" />
      <div className="intro-panel">
        <img className="intro-logo" src="/logo.png" alt="AgroBalance" />
        <button type="button" className="primary-button intro-enter-button" onClick={onEnter}>
          Ingresar
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [hasEntered, setHasEntered] = useState(() => localStorage.getItem(INTRO_STORAGE_KEY) === 'true');

  useEffect(() => {
    localStorage.setItem(INTRO_STORAGE_KEY, hasEntered ? 'true' : 'false');
  }, [hasEntered]);

  if (!hasEntered) {
    return <IntroScreen onEnter={() => setHasEntered(true)} />;
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Layout onLogout={() => setHasEntered(false)}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/fields" element={<Fields />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/crops" element={<Crops />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/incomes" element={<Incomes />} />
            <Route path="/grain" element={<Grain />} />
            <Route path="/rainfall" element={<Rainfall />} />
            <Route path="/delivery-notes" element={<DeliveryNotes />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/machinery" element={<Machinery />} />
            <Route path="/personnel" element={<Personnel />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
