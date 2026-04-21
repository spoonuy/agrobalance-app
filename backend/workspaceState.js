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

export const normalizeState = (input = {}) => {
  const nextState = {
    currentUser: input.currentUser || null,
    users: [],
    companies: [],
    activeCompanyId: input.activeCompanyId || null,
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
    salaryEntries: [],
    ...input
  };

  collectionKeys.forEach((key) => {
    nextState[key] = Array.isArray(nextState[key]) ? nextState[key] : [];
  });

  const hasActiveCompany = nextState.companies.some((company) => company.id === nextState.activeCompanyId);
  nextState.activeCompanyId = hasActiveCompany ? nextState.activeCompanyId : nextState.companies[0]?.id || null;

  return nextState;
};

export const uid = (prefix = 'id') => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
