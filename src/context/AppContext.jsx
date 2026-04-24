import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { seedData } from '../data/seed';
import { isSharedWorkspaceEnabled, workspaceDocRef, workspaceId } from '../firebase';
import { useAuth } from './AuthContext';
import { uid } from '../utils/helpers';

const AppContext = createContext(null);
const STORAGE_KEY = 'agrobalance-v2';
const collectionKeys = [
  'users',
  'companies',
  'fields',
  'campaigns',
  'crops',
  'suppliers',
  'customers',
  'expenses',
  'incomes',
  'grainLocations',
  'grainStock',
  'rainfallRecords',
  'deliveryNotes',
  'machinery',
  'machineryMaintenance',
  'employees',
  'salaryEntries'
];

const blankData = {
  ...seedData,
  users: [seedData.currentUser],
  companies: [],
  activeCompanyId: null,
  fields: [],
  campaigns: [],
  crops: [],
  suppliers: [],
  customers: [],
  expenses: [],
  incomes: [],
  grainLocations: [],
  grainStock: [],
  rainfallRecords: [],
  deliveryNotes: [],
  machinery: [],
  machineryMaintenance: [],
  employees: [],
  salaryEntries: []
};

const normalizeState = (input) => {
  const base = input && typeof input === 'object' ? input : blankData;
  const nextState = {
    ...blankData,
    ...base
  };

  collectionKeys.forEach((key) => {
    nextState[key] = Array.isArray(base[key]) ? base[key] : blankData[key];
  });

  const companies = nextState.companies;
  const hasActiveCompany = companies.some((company) => company.id === nextState.activeCompanyId);

  return {
    ...nextState,
    companies,
    activeCompanyId: hasActiveCompany ? nextState.activeCompanyId : companies[0]?.id || null
  };
};

const serializeState = (value) => JSON.stringify(normalizeState(value));

const loadData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeState(JSON.parse(saved)) : normalizeState(blankData);
  } catch {
    return normalizeState(blankData);
  }
};

const relationChecks = {
  companies: [
    ['fields', 'companyId', 'campos'],
    ['campaigns', 'companyId', 'campanas'],
    ['crops', 'companyId', 'cultivos'],
    ['suppliers', 'companyId', 'proveedores'],
    ['customers', 'companyId', 'clientes'],
    ['expenses', 'companyId', 'gastos'],
    ['incomes', 'companyId', 'ingresos'],
    ['grainLocations', 'companyId', 'ubicaciones de granos'],
    ['grainStock', 'companyId', 'stocks de granos'],
    ['rainfallRecords', 'companyId', 'registros de lluvia'],
    ['deliveryNotes', 'companyId', 'remitos de chacra'],
    ['machinery', 'companyId', 'maquinarias'],
    ['employees', 'companyId', 'empleados']
  ],
  campaigns: [
    ['crops', 'campaignId', 'cultivos']
  ],
  fields: [
    ['crops', 'fieldId', 'cultivos']
  ],
  crops: [
    ['expenses', 'cropId', 'gastos'],
    ['incomes', 'cropId', 'ingresos'],
    ['grainStock', 'cropId', 'stocks de granos'],
    ['deliveryNotes', 'cropId', 'remitos de chacra']
  ],
  suppliers: [
    ['expenses', 'supplierId', 'gastos']
  ],
  customers: [
    ['incomes', 'customerId', 'ingresos']
  ],
  machinery: [
    ['machineryMaintenance', 'machineryId', 'mantenimientos']
  ],
  employees: [
    ['salaryEntries', 'employeeId', 'registros salariales']
  ],
  grainLocations: [
    ['grainStock', 'locationId', 'stocks de granos']
  ]
};

export function AppProvider({ children }) {
  const { authUser, isAuthEnabled } = useAuth();
  const [state, setState] = useState(loadData);
  const lastRemoteSnapshot = useRef(null);
  const remoteReady = useRef(!isSharedWorkspaceEnabled);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!isAuthEnabled) return;

    setState((prev) => {
      const nextUser = authUser
        ? {
            id: authUser.uid,
            nombre: authUser.displayName || authUser.email || 'Usuario',
            email: authUser.email || '',
            rol: 'usuario',
            estado: 'activo'
          }
        : null;

      const nextUsers = nextUser
        ? [...prev.users.filter((item) => item.id !== nextUser.id), nextUser]
        : prev.users;

      const sameUser =
        JSON.stringify(prev.currentUser) === JSON.stringify(nextUser) &&
        JSON.stringify(prev.users) === JSON.stringify(nextUsers);

      return sameUser
        ? prev
        : {
            ...prev,
            currentUser: nextUser,
            users: nextUsers
          };
    });
  }, [authUser, isAuthEnabled]);

  useEffect(() => {
    if (!isSharedWorkspaceEnabled || !workspaceDocRef) return undefined;

    const unsubscribe = onSnapshot(workspaceDocRef, async (snapshot) => {
      if (!snapshot.exists()) {
        const initialState = normalizeState(loadData());
        const serialized = serializeState(initialState);
        lastRemoteSnapshot.current = serialized;
        remoteReady.current = true;
        await setDoc(workspaceDocRef, {
          state: initialState,
          workspaceId,
          updatedAt: serverTimestamp()
        });
        return;
      }

      const remoteState = normalizeState(snapshot.data()?.state);
      const serialized = serializeState(remoteState);
      lastRemoteSnapshot.current = serialized;
      remoteReady.current = true;

      setState((current) => (serializeState(current) === serialized ? current : remoteState));
    }, (error) => {
      console.error('No se pudo sincronizar con Firestore', error);
      remoteReady.current = true;
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isSharedWorkspaceEnabled || !workspaceDocRef || !remoteReady.current) return;

    const serialized = serializeState(state);
    if (serialized === lastRemoteSnapshot.current) return;

    lastRemoteSnapshot.current = serialized;
    setDoc(workspaceDocRef, {
      state: normalizeState(state),
      workspaceId,
      updatedAt: serverTimestamp()
    }, { merge: true }).catch((error) => {
      console.error('No se pudo guardar el workspace compartido', error);
    });
  }, [state]);

  useEffect(() => {
    const validActiveCompany = state.companies.some((company) => company.id === state.activeCompanyId);
    if (!validActiveCompany && state.companies.length) {
      setState((prev) => ({ ...prev, activeCompanyId: prev.companies[0].id }));
    }
  }, [state.activeCompanyId, state.companies]);

  const activeCompany = useMemo(
    () => state.companies.find((company) => company.id === state.activeCompanyId) || state.companies[0],
    [state]
  );

  const byCompany = (collection, companyId = state.activeCompanyId) =>
    state[collection].filter((item) => item.companyId === companyId);

  const setActiveCompany = (companyId) => setState((prev) => ({ ...prev, activeCompanyId: companyId }));

  const addItem = (collection, payload) => {
    setState((prev) => {
      const newItem = { id: uid(collection), ...payload };
      return {
        ...prev,
        [collection]: [...prev[collection], newItem],
        activeCompanyId: collection === 'companies' && !prev.activeCompanyId ? newItem.id : prev.activeCompanyId
      };
    });
  };

  const updateItem = (collection, id, patch) => {
    setState((prev) => ({
      ...prev,
      [collection]: prev[collection].map((item) => (item.id === id ? { ...item, ...patch } : item))
    }));
  };

  const getRemovalBlockers = (collection, id) => {
    const checks = relationChecks[collection] || [];
    return checks
      .map(([targetCollection, foreignKey, label]) => {
        const count = state[targetCollection].filter((item) => item[foreignKey] === id).length;
        return count ? { collection: targetCollection, count, label } : null;
      })
      .filter(Boolean);
  };

  const removeItem = (collection, id) => {
    setState((prev) => ({
      ...prev,
      [collection]: prev[collection].filter((item) => item.id !== id)
    }));
  };

  const resetDemo = () => setState(normalizeState(seedData));

  const value = {
    state,
    activeCompany,
    byCompany,
    setActiveCompany,
    addItem,
    updateItem,
    getRemovalBlockers,
    removeItem,
    resetDemo,
    isSharedWorkspaceEnabled
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
