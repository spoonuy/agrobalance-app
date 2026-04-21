import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';
import { dateFmt, isDateBetween } from '../utils/helpers';

const monthFormatter = new Intl.DateTimeFormat('es-UY', { month: 'short' });

const monthName = (monthIndex) =>
  monthFormatter.format(new Date(2026, monthIndex, 1)).replace('.', '');

export default function Rainfall() {
  const { byCompany, activeCompany, addItem, updateItem, removeItem } = useApp();
  const [editingRecord, setEditingRecord] = useState(null);
  const today = new Date().toISOString().slice(0, 10);
  const companyId = activeCompany?.id;
  const crops = byCompany('crops');
  const rainfallRecords = byCompany('rainfallRecords')
    .slice()
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));

  const availableYears = useMemo(() => {
    const years = Array.from(new Set(rainfallRecords.map((item) => String(item.fecha).slice(0, 4)).filter(Boolean)));
    return years.sort((a, b) => Number(b) - Number(a));
  }, [rainfallRecords]);

  const [selectedYear, setSelectedYear] = useState(() => availableYears[0] || String(new Date().getFullYear()));
  const activeYear = availableYears.includes(selectedYear) ? selectedYear : availableYears[0] || String(new Date().getFullYear());

  const monthlyData = useMemo(() => {
    const base = Array.from({ length: 12 }, (_, index) => ({
      mes: monthName(index),
      mm: 0
    }));

    rainfallRecords
      .filter((item) => String(item.fecha).startsWith(activeYear))
      .forEach((item) => {
        const month = Number(String(item.fecha).slice(5, 7)) - 1;
        if (month >= 0 && month < 12) {
          base[month].mm += Number(item.mm || 0);
        }
      });

    return base;
  }, [activeYear, rainfallRecords]);

  const yearlyData = useMemo(() => {
    const grouped = rainfallRecords.reduce((acc, item) => {
      const year = String(item.fecha).slice(0, 4);
      acc[year] = (acc[year] || 0) + Number(item.mm || 0);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([anio, mm]) => ({ anio, mm }))
      .sort((a, b) => Number(a.anio) - Number(b.anio));
  }, [rainfallRecords]);

  const totalYearMm = monthlyData.reduce((sum, item) => sum + item.mm, 0);
  const totalRecordsYear = rainfallRecords.filter((item) => String(item.fecha).startsWith(activeYear)).length;
  const cropRainfallRows = useMemo(() => (
    crops.map((crop) => {
      const cycleRainfall = rainfallRecords.filter((record) => isDateBetween(record.fecha, crop.siembra, crop.cosecha || today));
      const totalMm = cycleRainfall.reduce((sum, record) => sum + Number(record.mm || 0), 0);

      return {
        id: crop.id,
        cultivo: `${crop.cultivo} ${crop.lote}`,
        periodo: `${dateFmt(crop.siembra)} - ${crop.cosecha ? dateFmt(crop.cosecha) : 'En curso'}`,
        eventos: cycleRainfall.length,
        mm: totalMm,
        promedioEvento: cycleRainfall.length ? totalMm / cycleRainfall.length : 0
      };
    })
  ), [crops, rainfallRecords, today]);

  if (!companyId) {
    return <div className="card">No hay una empresa activa seleccionada.</div>;
  }

  const submitRainfall = (form) => {
    const payload = {
      ...form,
      companyId,
      mm: Number(form.mm)
    };

    if (editingRecord) {
      updateItem('rainfallRecords', editingRecord.id, payload);
      setEditingRecord(null);
      return;
    }

    addItem('rainfallRecords', payload);
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Registro de lluvias"
        description="Carga los milímetros de lluvia por día y revisa el comportamiento mensual y anual."
      />

      <SimpleForm
        fields={[
          { name: 'fecha', label: 'Fecha', type: 'date' },
          { name: 'mm', label: 'Milímetros (mm)', type: 'number' },
          { name: 'observaciones', label: 'Observaciones', required: false, wide: true }
        ]}
        initialValues={editingRecord || undefined}
        formKey={`${companyId}-${editingRecord?.id || 'new-rainfall-record'}`}
        onSubmit={submitRainfall}
        onCancel={editingRecord ? () => setEditingRecord(null) : undefined}
        submitLabel={editingRecord ? 'Guardar cambios' : 'Registrar lluvia'}
      />

      <section className="dashboard-summary-grid">
        <article className="dashboard-summary-card positive">
          <span>Total del año {activeYear}</span>
          <strong>{totalYearMm.toFixed(0)} mm</strong>
        </article>
        <article className="dashboard-summary-card">
          <span>Registros cargados</span>
          <strong>{totalRecordsYear}</strong>
        </article>
      </section>

      <section className="card dashboard-filters">
        <label className="dashboard-filter">
          <span>Año para resumen mensual</span>
          <select value={activeYear} onChange={(event) => setSelectedYear(event.target.value)}>
            {availableYears.length ? (
              availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))
            ) : (
              <option value={activeYear}>{activeYear}</option>
            )}
          </select>
        </label>
      </section>

      <section className="dashboard-chart-grid">
        <article className="card chart-card">
          <h3>Lluvias por mes</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid stroke="#e8ede6" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} unit=" mm" />
              <Tooltip formatter={(value) => [`${value} mm`, 'Lluvia']} />
              <Bar dataKey="mm" fill="#2f8e50" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="card chart-card">
          <h3>Lluvias por año</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={yearlyData}>
              <CartesianGrid stroke="#e8ede6" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="anio" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} unit=" mm" />
              <Tooltip formatter={(value) => [`${value} mm`, 'Lluvia']} />
              <Bar dataKey="mm" fill="#7dbd45" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className="card dashboard-section-card">
        <div className="dashboard-section-header">
          <h3>Lluvias por cultivo</h3>
        </div>
        <DataTable
          columns={[
            { key: 'cultivo', label: 'Cultivo' },
            { key: 'periodo', label: 'Período' },
            { key: 'eventos', label: 'Eventos' },
            { key: 'mm', label: 'Lluvia total', render: (row) => `${row.mm.toFixed(0)} mm` },
            { key: 'promedioEvento', label: 'Promedio / evento', render: (row) => `${row.promedioEvento.toFixed(1)} mm` }
          ]}
          rows={cropRainfallRows}
        />
      </section>

      <section className="card dashboard-section-card">
        <div className="dashboard-section-header">
          <h3>Registros diarios</h3>
        </div>
        <DataTable
          columns={[
            { key: 'fecha', label: 'Fecha', render: (row) => dateFmt(row.fecha) },
            { key: 'mm', label: 'Lluvia', render: (row) => `${Number(row.mm || 0).toFixed(0)} mm` },
            { key: 'observaciones', label: 'Observaciones', render: (row) => row.observaciones || '-' },
            {
              key: 'actions',
              label: 'Acciones',
              render: (row) => (
                <div className="inline-actions">
                  <button type="button" className="ghost-button small" onClick={() => setEditingRecord(row)}>Editar</button>
                  <button
                    type="button"
                    className="ghost-button small danger"
                    onClick={() => window.confirm('¿Eliminar este registro de lluvia?') && removeItem('rainfallRecords', row.id)}
                  >
                    Eliminar
                  </button>
                </div>
              )
            }
          ]}
          rows={rainfallRecords}
        />
      </section>
    </div>
  );
}
