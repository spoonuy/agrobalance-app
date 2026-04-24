import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';
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

function AuthScreen() {
  const { signIn, isAuthEnabled } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      await signIn(form.email.trim(), form.password);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="intro-screen">
      <div className="intro-backdrop" />
      <div className="intro-panel auth-panel">
        <img className="intro-logo" src="/logo.png" alt="AgroBalance" />
        <div className="auth-copy">
          <h1>Iniciar sesión</h1>
          <p>
            {isAuthEnabled
              ? 'Accede con Firebase para usar AgroBalance con sesión real.'
              : 'Firebase Auth no está configurado todavía en este entorno.'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </label>

          <label>
            <span>Contraseña</span>
            <input type="password" name="password" value={form.password} onChange={handleChange} required />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" className="primary-button intro-enter-button" disabled={submitting || !isAuthEnabled}>
            {submitting ? 'Procesando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="intro-screen">
      <div className="intro-backdrop" />
      <div className="intro-panel auth-panel">
        <img className="intro-logo" src="/logo.png" alt="AgroBalance" />
        <div className="auth-copy">
          <h1>Verificando sesión</h1>
          <p>Espera un momento mientras validamos tu acceso.</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { authUser, authLoading, isAuthEnabled, signOutUser } = useAuth();

  if (isAuthEnabled && authLoading) {
    return <LoadingScreen />;
  }

  if (isAuthEnabled && !authUser) {
    return <AuthScreen />;
  }

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Layout onLogout={signOutUser}>
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
