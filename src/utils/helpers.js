export const money = (value) =>
  new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value || 0));

export const dateFmt = (value) => {
  if (!value) return '-';
  return new Date(value + 'T00:00:00').toLocaleDateString('es-UY');
};

export const uid = (prefix = 'id') => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export const monthLabel = (value) => {
  const [year, month] = String(value).split('-');
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('es-UY', {
    month: 'long',
    year: 'numeric'
  });
};

export const isDateBetween = (value, start, end) => {
  if (!value || !start || !end) return false;
  return String(value) >= String(start) && String(value) <= String(end);
};
