import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import { dateFmt, money } from '../utils/helpers';

const chartColors = ['#2f6fed', '#29a36a', '#e15b3d', '#8db255', '#f5a623', '#7a66cc'];

const downloadBlob = (content, type, filename) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const buildHtmlTable = (title, columns, rows) => `
  <h2>${escapeHtml(title)}</h2>
  <table>
    <thead>
      <tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}
    </tbody>
  </table>
`;

export default function Dashboard() {
  const { byCompany, activeCompany } = useApp();
  const campaigns = byCompany('campaigns');
  const fields = byCompany('fields');
  const crops = byCompany('crops');
  const expenses = byCompany('expenses');
  const incomes = byCompany('incomes');
  const suppliers = byCompany('suppliers');
  const customers = byCompany('customers');

  const [selectedCampaignId, setSelectedCampaignId] = useState('all');
  const [selectedCropId, setSelectedCropId] = useState('all');

  const campaignFilteredCrops = selectedCampaignId === 'all'
    ? crops
    : crops.filter((crop) => crop.campaignId === selectedCampaignId);

  const availableCrops = campaignFilteredCrops;
  const activeCropId = availableCrops.some((crop) => crop.id === selectedCropId) ? selectedCropId : 'all';
  const visibleCrops = activeCropId === 'all'
    ? campaignFilteredCrops
    : campaignFilteredCrops.filter((crop) => crop.id === activeCropId);
  const visibleCropIds = new Set(visibleCrops.map((crop) => crop.id));

  const filteredExpenses = expenses.filter((expense) => {
    if (activeCropId !== 'all') return expense.cropId === activeCropId;
    if (selectedCampaignId !== 'all') return expense.cropId ? visibleCropIds.has(expense.cropId) : Boolean(expense.annual);
    return true;
  });

  const filteredIncomes = incomes.filter((income) => {
    if (activeCropId !== 'all') return income.cropId === activeCropId;
    if (selectedCampaignId !== 'all') return visibleCropIds.has(income.cropId);
    return true;
  });

  const totalInvestment = filteredExpenses.reduce((sum, item) => sum + Number(item.monto || 0), 0);
  const totalIncome = filteredIncomes.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const totalMargin = totalIncome - totalInvestment;
  const totalHectares = visibleCrops.reduce((sum, item) => sum + Number(item.hectareas || 0), 0);
  const costPerHa = totalHectares ? totalInvestment / totalHectares : 0;
  const profitPerHa = totalHectares ? totalMargin / totalHectares : 0;
  const receivables = filteredIncomes.filter((item) => item.estado !== 'cobrado').reduce((sum, item) => sum + Number(item.total || 0), 0);
  const payables = filteredExpenses.filter((item) => item.estado !== 'pagado').reduce((sum, item) => sum + Number(item.monto || 0), 0);

  const expenseCategoryData = Object.entries(
    filteredExpenses.reduce((acc, item) => {
      const category = item.categoria || 'Sin categoría';
      acc[category] = (acc[category] || 0) + Number(item.monto || 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const cropPerformanceData = visibleCrops.map((crop) => {
    const cropExpenses = filteredExpenses.filter((expense) => expense.cropId === crop.id);
    const cropIncomes = filteredIncomes.filter((income) => income.cropId === crop.id);
    const cost = cropExpenses.reduce((sum, item) => sum + Number(item.monto || 0), 0);
    const income = cropIncomes.reduce((sum, item) => sum + Number(item.total || 0), 0);

    return {
      id: crop.id,
      cultivo: `${crop.cultivo} ${crop.lote}`,
      costo: cost,
      ingreso: income,
      margen: income - cost,
      gananciaHa: Number(crop.hectareas || 0) ? (income - cost) / Number(crop.hectareas || 0) : 0
    };
  });

  const cropRows = visibleCrops.map((crop) => ({
    id: crop.id,
    cultivo: crop.cultivo,
    lote: crop.lote,
    hectareas: crop.hectareas,
    campana: campaigns.find((campaign) => campaign.id === crop.campaignId)?.nombre || '-',
    fechas: `${dateFmt(crop.siembra)} - ${dateFmt(crop.cosecha)}`,
    campo: fields.find((field) => field.id === crop.fieldId)?.nombre || '-'
  }));

  const expenseRows = filteredExpenses
    .slice()
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
    .map((expense) => {
      const crop = crops.find((item) => item.id === expense.cropId);
      return { ...expense, cultivo: crop ? `${crop.cultivo} ${crop.lote}` : 'Anual' };
    });

  const incomeRows = filteredIncomes
    .slice()
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
    .map((income) => {
      const crop = crops.find((item) => item.id === income.cropId);
      return { ...income, cultivo: crop ? `${crop.cultivo} ${crop.lote}` : '-' };
    });

  const comparisonRows = crops
    .filter((crop) => activeCropId === 'all' || crop.id === activeCropId)
    .map((crop) => {
      const cropExpenses = expenses.filter((expense) => expense.cropId === crop.id);
      const cropIncomes = incomes.filter((income) => income.cropId === crop.id);
      const totalCost = cropExpenses.reduce((sum, item) => sum + Number(item.monto || 0), 0);
      const totalRevenue = cropIncomes.reduce((sum, item) => sum + Number(item.total || 0), 0);
      const totalTons = cropIncomes.reduce((sum, item) => sum + Number(item.toneladas || 0), 0);
      const hectares = Number(crop.hectareas || 0);

      return {
        id: `${crop.id}-comparison`,
        cultivo: `${crop.cultivo} ${crop.lote}`,
        campana: campaigns.find((campaign) => campaign.id === crop.campaignId)?.nombre || '-',
        rendimiento: hectares ? `${(totalTons / hectares).toFixed(1)} ton/ha` : '-',
        costoHa: hectares ? money(totalCost / hectares) : '-',
        gananciaHa: hectares ? money((totalRevenue - totalCost) / hectares) : '-',
        margen: money(totalRevenue - totalCost)
      };
    })
    .sort((a, b) => a.campana.localeCompare(b.campana));

  const alerts = [
    receivables > 0 ? { id: 'receivables', tone: 'warning', title: 'Cuentas por cobrar', text: `${money(receivables)} pendientes de cobro.` } : null,
    payables > 0 ? { id: 'payables', tone: 'danger', title: 'Pagos pendientes', text: `${money(payables)} aún sin pagar.` } : null,
    ...cropPerformanceData
      .filter((item) => item.margen < 0)
      .map((item) => ({
        id: `negative-${item.id}`,
        tone: 'danger',
        title: `Margen negativo en ${item.cultivo}`,
        text: `El cultivo está ${money(item.margen)} por debajo del punto de equilibrio.`
      })),
    suppliers.length === 0 ? { id: 'no-suppliers', tone: 'info', title: 'Faltan proveedores', text: 'Registra proveedores para mejorar el seguimiento de gastos.' } : null,
    customers.length === 0 ? { id: 'no-customers', tone: 'info', title: 'Faltan clientes', text: 'Registra clientes para analizar ventas y cobranzas.' } : null
  ].filter(Boolean);

  const reportMeta = [
    ['Empresa', activeCompany?.nombre || '-'],
    ['Campaña', selectedCampaignId === 'all' ? 'Todas' : campaigns.find((item) => item.id === selectedCampaignId)?.nombre || '-'],
    ['Cultivo', activeCropId === 'all' ? 'Todos' : crops.find((item) => item.id === activeCropId)?.cultivo || '-']
  ];

  const summaryRows = [
    ['Inversión total', money(totalInvestment)],
    ['Ingresos totales', money(totalIncome)],
    ['Margen total', money(totalMargin)],
    ['Costo / ha', totalHectares ? `${money(costPerHa)} / ha` : '-'],
    ['Ganancia / ha', totalHectares ? `${money(profitPerHa)} / ha` : '-']
  ];

  const exportExcel = () => {
    const workbook = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1, h2 { color: #082e17; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            th, td { border: 1px solid #cfd8cf; padding: 8px 10px; text-align: left; }
            th { background: #edf5ee; }
          </style>
        </head>
        <body>
          <h1>Reporte Dashboard AgroBalance</h1>
          ${buildHtmlTable('Contexto', ['Campo', 'Valor'], reportMeta)}
          ${buildHtmlTable('Resumen', ['Indicador', 'Valor'], summaryRows)}
          ${buildHtmlTable('Cultivos', ['Cultivo', 'Lote', 'Hectáreas', 'Campaña', 'Fechas'], cropRows.map((row) => [row.cultivo, row.lote, row.hectareas, row.campana, row.fechas]))}
          ${buildHtmlTable('Egresos', ['Fecha', 'Cultivo', 'Categoría', 'Importe'], expenseRows.map((row) => [dateFmt(row.fecha), row.cultivo, row.categoria, money(row.monto)]))}
          ${buildHtmlTable('Ingresos', ['Fecha', 'Cultivo', 'Toneladas', 'Precio', 'Total'], incomeRows.map((row) => [dateFmt(row.fecha), row.cultivo, row.toneladas, money(row.precio), money(row.total)]))}
          ${buildHtmlTable('Comparación de campañas', ['Cultivo', 'Campaña', 'Rendimiento', 'Costo / ha', 'Ganancia / ha', 'Margen'], comparisonRows.map((row) => [row.cultivo, row.campana, row.rendimiento, row.costoHa, row.gananciaHa, row.margen]))}
        </body>
      </html>
    `;

    downloadBlob(workbook, 'application/vnd.ms-excel;charset=utf-8;', 'agrobalance-dashboard.xls');
  };

  const exportPdf = () => {
    const printable = window.open('', '_blank', 'width=1100,height=800');
    if (!printable) return;

    printable.document.write(`
      <html>
        <head>
          <title>Reporte Dashboard AgroBalance</title>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 28px; color: #23313f; }
            h1, h2 { color: #082e17; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 22px; }
            th, td { border: 1px solid #d8e2d8; padding: 8px 10px; text-align: left; font-size: 12px; }
            th { background: #edf5ee; }
            .meta { margin-bottom: 22px; }
            .meta strong { display: inline-block; min-width: 90px; }
            @media print {
              body { padding: 12px; }
            }
          </style>
        </head>
        <body>
          <h1>Reporte Dashboard AgroBalance</h1>
          <div class="meta">
            ${reportMeta.map(([label, value]) => `<div><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</div>`).join('')}
          </div>
          ${buildHtmlTable('Resumen', ['Indicador', 'Valor'], summaryRows)}
          ${buildHtmlTable('Cultivos', ['Cultivo', 'Lote', 'Hectáreas', 'Campaña', 'Fechas'], cropRows.map((row) => [row.cultivo, row.lote, row.hectareas, row.campana, row.fechas]))}
          ${buildHtmlTable('Egresos', ['Fecha', 'Cultivo', 'Categoría', 'Importe'], expenseRows.map((row) => [dateFmt(row.fecha), row.cultivo, row.categoria, money(row.monto)]))}
          ${buildHtmlTable('Ingresos', ['Fecha', 'Cultivo', 'Toneladas', 'Precio', 'Total'], incomeRows.map((row) => [dateFmt(row.fecha), row.cultivo, row.toneladas, money(row.precio), money(row.total)]))}
          ${buildHtmlTable('Comparación de campañas', ['Cultivo', 'Campaña', 'Rendimiento', 'Costo / ha', 'Ganancia / ha', 'Margen'], comparisonRows.map((row) => [row.cultivo, row.campana, row.rendimiento, row.costoHa, row.gananciaHa, row.margen]))}
          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printable.document.close();
  };

  return (
    <div className="page-stack dashboard-page">
      <PageHeader
        title="Dashboard"
        description="Resultado del negocio, producción, cuentas corrientes y balance anual."
        action={(
          <div className="inline-actions">
            <Link className="ghost-button small dashboard-link-button" to="/crops">Agregar cultivo</Link>
            <Link className="ghost-button small dashboard-link-button" to="/incomes">Agregar ingreso</Link>
            <Link className="ghost-button small dashboard-link-button" to="/campaigns">Ver campañas</Link>
            <button type="button" className="primary-button small dashboard-export-button" onClick={exportExcel}>Exportar Excel</button>
            <button type="button" className="ghost-button small dashboard-link-button" onClick={exportPdf}>Exportar PDF</button>
          </div>
        )}
      />

      <section className="card dashboard-filters">
        <label className="dashboard-filter">
          <span>Campaña</span>
          <select
            value={selectedCampaignId}
            onChange={(event) => {
              setSelectedCampaignId(event.target.value);
              setSelectedCropId('all');
            }}
          >
            <option value="all">Todas las campañas</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>{campaign.nombre}</option>
            ))}
          </select>
        </label>

        <label className="dashboard-filter">
          <span>Cultivo</span>
          <select value={activeCropId} onChange={(event) => setSelectedCropId(event.target.value)}>
            <option value="all">Todos los cultivos</option>
            {availableCrops.map((crop) => (
              <option key={crop.id} value={crop.id}>{crop.cultivo} {crop.lote}</option>
            ))}
          </select>
        </label>
      </section>

      {alerts.length ? (
        <section className="dashboard-alerts">
          {alerts.map((alert) => (
            <article key={alert.id} className={`card dashboard-alert ${alert.tone}`}>
              <strong>{alert.title}</strong>
              <p>{alert.text}</p>
            </article>
          ))}
        </section>
      ) : null}

      <section className="dashboard-summary-grid">
        <article className="dashboard-summary-card">
          <span>Inversión total</span>
          <strong>{money(totalInvestment)}</strong>
        </article>
        <article className="dashboard-summary-card">
          <span>Ingresos totales</span>
          <strong>{money(totalIncome)}</strong>
        </article>
        <article className={`dashboard-summary-card ${totalMargin < 0 ? 'negative' : 'positive'}`}>
          <span>Margen total</span>
          <strong>{money(totalMargin)}</strong>
        </article>
        <article className="dashboard-summary-card">
          <span>Costo / ha</span>
          <strong>{totalHectares ? `${money(costPerHa)} / ha` : '-'}</strong>
        </article>
        <article className={`dashboard-summary-card ${profitPerHa < 0 ? 'negative' : 'positive'}`}>
          <span>Ganancia / ha</span>
          <strong>{totalHectares ? `${money(profitPerHa)} / ha` : '-'}</strong>
        </article>
      </section>

      <section className="dashboard-chart-grid">
        <article className="card chart-card">
          <h3>Gastos por categoría</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={expenseCategoryData}>
              <CartesianGrid stroke="#e8ede6" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickFormatter={(value) => `$${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => money(value)} />
              <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                {expenseCategoryData.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="card chart-card">
          <h3>Resultado por cultivo</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={cropPerformanceData}
                dataKey="margen"
                nameKey="cultivo"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={3}
              >
                {cropPerformanceData.map((entry, index) => (
                  <Cell key={entry.id} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => money(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className="card dashboard-section-card">
        <div className="dashboard-section-header">
          <h3>Cultivos</h3>
        </div>
        <DataTable
          columns={[
            { key: 'cultivo', label: 'Cultivo' },
            { key: 'lote', label: 'Lote' },
            { key: 'hectareas', label: 'Hectáreas' },
            { key: 'campana', label: 'Campaña' },
            { key: 'fechas', label: 'Fechas' }
          ]}
          rows={cropRows}
        />
      </section>

      <section className="dashboard-grid two-columns">
        <article className="card dashboard-section-card">
          <div className="dashboard-section-header">
            <h3>Egresos</h3>
          </div>
          <DataTable
            columns={[
              { key: 'fecha', label: 'Fecha', render: (row) => dateFmt(row.fecha) },
              { key: 'cultivo', label: 'Cultivo' },
              { key: 'categoria', label: 'Categoría' },
              { key: 'monto', label: 'Importe', render: (row) => money(row.monto) }
            ]}
            rows={expenseRows}
          />
        </article>

        <article className="card dashboard-section-card">
          <div className="dashboard-section-header">
            <h3>Ingresos</h3>
          </div>
          <DataTable
            columns={[
              { key: 'fecha', label: 'Fecha', render: (row) => dateFmt(row.fecha) },
              { key: 'cultivo', label: 'Cultivo' },
              { key: 'toneladas', label: 'Toneladas' },
              { key: 'precio', label: 'Precio', render: (row) => money(row.precio) },
              { key: 'total', label: 'Total', render: (row) => money(row.total) }
            ]}
            rows={incomeRows}
          />
        </article>
      </section>

      <section className="card dashboard-section-card">
        <div className="dashboard-section-header">
          <h3>Comparación de campañas</h3>
        </div>
        <DataTable
          columns={[
            { key: 'cultivo', label: 'Cultivo' },
            { key: 'campana', label: 'Campaña' },
            { key: 'rendimiento', label: 'Rendimiento' },
            { key: 'costoHa', label: 'Costo / ha' },
            { key: 'gananciaHa', label: 'Ganancia / ha' },
            { key: 'margen', label: 'Margen' }
          ]}
          rows={comparisonRows}
        />
      </section>
    </div>
  );
}
