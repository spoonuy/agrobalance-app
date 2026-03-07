import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const navItems = [
  ['/', 'Dashboard'],
  ['/companies', 'Empresas'],
  ['/fields', 'Campos'],
  ['/campaigns', 'Campañas'],
  ['/crops', 'Cultivos'],
  ['/expenses', 'Gastos'],
  ['/incomes', 'Ingresos'],
  ['/grain', 'Stock de granos'],
  ['/suppliers', 'Proveedores'],
  ['/customers', 'Clientes'],
  ['/machinery', 'Maquinaria'],
  ['/personnel', 'Personal'],
  ['/admin', 'Admin']
];

export default function Layout({ children }) {
  const { state, activeCompany, setActiveCompany, resetDemo } = useApp();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img src="/logo.svg" alt="AgroBalance" />
        </div>
        <nav>
          {navItems.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="ghost-button small" onClick={resetDemo}>Restaurar demo</button>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>AgroBalance</h1>
            <p>{activeCompany?.nombre || 'Sin empresa'}</p>
          </div>
          <div className="topbar-controls">
            <select value={activeCompany?.id || ''} onChange={(e) => setActiveCompany(e.target.value)}>
              {state.companies.map((company) => (
                <option key={company.id} value={company.id}>{company.nombre}</option>
              ))}
            </select>
            <div className="user-pill">{state.currentUser.nombre}</div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
