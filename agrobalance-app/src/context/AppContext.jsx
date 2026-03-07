import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { seedData } from '../data/seed';
import { uid } from '../utils/helpers';

const AppContext = createContext(null);
const STORAGE_KEY = 'agrobalance-v1';

const loadData = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : seedData;
};

export function AppProvider({ children }) {
  const [state, setState] = useState(loadData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const activeCompany = useMemo(
    () => state.companies.find((company) => company.id === state.activeCompanyId) || state.companies[0],
    [state]
  );

  const byCompany = (collection, companyId = state.activeCompanyId) =>
    state[collection].filter((item) => item.companyId === companyId);

  const setActiveCompany = (companyId) => setState((prev) => ({ ...prev, activeCompanyId: companyId }));

  const addItem = (collection, payload) => {
    setState((prev) => ({
      ...prev,
      [collection]: [...prev[collection], { id: uid(collection), ...payload }]
    }));
  };

  const updateItem = (collection, id, patch) => {
    setState((prev) => ({
      ...prev,
      [collection]: prev[collection].map((item) => (item.id === id ? { ...item, ...patch } : item))
    }));
  };

  const removeItem = (collection, id) => {
    setState((prev) => ({
      ...prev,
      [collection]: prev[collection].filter((item) => item.id !== id)
    }));
  };

  const resetDemo = () => setState(seedData);

  const value = {
    state,
    activeCompany,
    byCompany,
    setActiveCompany,
    addItem,
    updateItem,
    removeItem,
    resetDemo
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
