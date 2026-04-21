import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function SidebarIcon({ children }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const DashboardIcon = () => <SidebarIcon><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="11" width="7" height="10" rx="1.5" /><rect x="3" y="13" width="7" height="8" rx="1.5" /></SidebarIcon>;
const RainIcon = () => <SidebarIcon><path d="M7 7a5 5 0 1 1 10 0" /><path d="M5 11h14" /><path d="M8 15l-1 3" /><path d="M12 15l-1 4" /><path d="M16 15l-1 3" /></SidebarIcon>;
const CompanyIcon = () => <SidebarIcon><path d="M4 20V6l6-3 6 3v14" /><path d="M14 10h6v10" /><path d="M8 9h2" /><path d="M8 13h2" /><path d="M8 17h2" /></SidebarIcon>;
const FieldIcon = () => <SidebarIcon><path d="M3 19h18" /><path d="M4 19V8l8-4 8 4v11" /><path d="M8 12h8" /><path d="M8 16h8" /></SidebarIcon>;
const CampaignIcon = () => <SidebarIcon><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4" /><path d="M16 3v4" /><path d="M3 10h18" /></SidebarIcon>;
const CropIcon = () => <SidebarIcon><path d="M12 21V11" /><path d="M12 13c0-4 2-7 6-9 0 5-2 8-6 9Z" /><path d="M12 15c0-3-2-6-6-7 0 4 2 7 6 7Z" /></SidebarIcon>;
const ExpenseIcon = () => <SidebarIcon><path d="M6 4h12" /><path d="M6 20h12" /><path d="M9 8h8" /><path d="M7 12h10" /><path d="M9 16h8" /><path d="M5 8h.01" /><path d="M5 12h.01" /><path d="M5 16h.01" /></SidebarIcon>;
const IncomeIcon = () => <SidebarIcon><path d="M12 20V6" /><path d="m6 12 6-6 6 6" /><path d="M5 20h14" /></SidebarIcon>;
const GrainIcon = () => <SidebarIcon><path d="M12 20c-3-2.5-5-5.5-5-9a5 5 0 1 1 10 0c0 3.5-2 6.5-5 9Z" /><path d="M12 8v8" /><path d="M9 11c1 0 1.5.5 3 .5s2-.5 3-.5" /></SidebarIcon>;
const TruckIcon = () => <SidebarIcon><circle cx="7" cy="18" r="2.5" /><circle cx="17" cy="18" r="2.5" /><path d="M3 18V9h9v9" /><path d="M12 12h4l3 3v3" /><path d="M16 12v3h3" /></SidebarIcon>;
const SupplierIcon = () => <SidebarIcon><path d="M4 19v-9l8-5 8 5v9" /><path d="M9 19v-4h6v4" /><path d="M8 11h.01" /><path d="M12 11h.01" /><path d="M16 11h.01" /></SidebarIcon>;
const CustomerIcon = () => <SidebarIcon><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></SidebarIcon>;
const MachineryIcon = () => <SidebarIcon><circle cx="7" cy="17" r="3" /><circle cx="18" cy="16.5" r="2.2" /><path d="M4 17H2.5v-3.5L6 10h5.5v3.5h3.5l2 2v1.5" /><path d="M11.5 10V7h3.5l2 3" /><path d="M8 13.5h3.5" /></SidebarIcon>;
const PersonnelIcon = () => <SidebarIcon><circle cx="12" cy="7" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></SidebarIcon>;
const AdminIcon = () => <SidebarIcon><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.82-.33 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.12-1.58 1.7 1.7 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.67 8.4a1.7 1.7 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15.6 4.67a1.7 1.7 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.64.26 1.06.88 1.06 1.57V11a2 2 0 1 1 0 4h-.09c-.68 0-1.3.42-1.56 1.03Z" /></SidebarIcon>;
const CollapseIcon = ({ collapsed }) => (
  <SidebarIcon>
    {collapsed ? <path d="m10 6 6 6-6 6" /> : <path d="m14 6-6 6 6 6" />}
  </SidebarIcon>
);

const navItems = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon },
  { to: '/rainfall', label: 'Lluvias', icon: RainIcon },
  { to: '/companies', label: 'Empresas', icon: CompanyIcon },
  { to: '/fields', label: 'Campos', icon: FieldIcon },
  { to: '/campaigns', label: 'Campañas', icon: CampaignIcon },
  { to: '/crops', label: 'Cultivos', icon: CropIcon },
  { to: '/expenses', label: 'Gastos', icon: ExpenseIcon },
  { to: '/incomes', label: 'Ingresos', icon: IncomeIcon },
  { to: '/grain', label: 'Stock de granos', icon: GrainIcon },
  { to: '/delivery-notes', label: 'Remitos chacra', icon: TruckIcon },
  { to: '/suppliers', label: 'Proveedores', icon: SupplierIcon },
  { to: '/customers', label: 'Clientes', icon: CustomerIcon },
  { to: '/machinery', label: 'Maquinaria', icon: MachineryIcon },
  { to: '/personnel', label: 'Personal', icon: PersonnelIcon },
  { to: '/admin', label: 'Admin', icon: AdminIcon }
];

export default function Layout({ children, onLogout }) {
  const { state, activeCompany, setActiveCompany } = useApp();
  const [collapsed, setCollapsed] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 840 : false));

  useEffect(() => {
    const media = window.matchMedia('(max-width: 840px)');
    const syncCollapsed = (event) => {
      setCollapsed(event.matches);
    };

    syncCollapsed(media);
    if (media.addEventListener) {
      media.addEventListener('change', syncCollapsed);
      return () => media.removeEventListener('change', syncCollapsed);
    }

    media.addListener(syncCollapsed);
    return () => media.removeListener(syncCollapsed);
  }, []);

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? 'Expandir menú lateral' : 'Ocultar menú lateral'}
            title={collapsed ? 'Expandir menú lateral' : 'Ocultar menú lateral'}
          >
            <CollapseIcon collapsed={collapsed} />
          </button>
          <div className="brand">
            <img src="/logo.png" alt="AgroBalance" />
          </div>
        </div>
        <nav>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              end={to === '/'}
              onClick={() => {
                if (window.innerWidth <= 840) {
                  setCollapsed(true);
                }
              }}
            >
              <span className="nav-icon"><Icon /></span>
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>
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
            <div className="user-controls">
              <div className="user-pill">{state.currentUser.nombre}</div>
              <button type="button" className="ghost-button small" onClick={onLogout}>Cerrar sesión</button>
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
