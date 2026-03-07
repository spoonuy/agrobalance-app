import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Legend } from 'recharts';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import { money } from '../utils/helpers';

const colors = ['#2f6fed', '#4bae4f', '#f5a623', '#e15b3d', '#8756d2', '#9298a8'];

export default function Dashboard() {
  const { byCompany } = useApp();
  const crops = byCompany('crops');
  const expenses = byCompany('expenses');
  const incomes = byCompany('incomes');
  const grainStock = byCompany('grainStock');
  const suppliers = byCompany('suppliers');
  const customers = byCompany('customers');
  const salaryEntries = byCompany('employees').flatMap((employee) => byCompany('salaryEntries').filter((entry) => entry.employeeId === employee.id));
  const machinery = byCompany('machinery');
  const machineryMaintenance = byCompany('machineryMaintenance').filter((m) => machinery.some((item) => item.id === m.machineryId));

  const incomeTotal = incomes.reduce((sum, item) => sum + item.total, 0);
  const expenseTotal = expenses.reduce((sum, item) => sum + item.monto, 0);
  const personnelTotal = salaryEntries.reduce((sum, item) => sum + item.monto, 0);
  const machineryTotal = machineryMaintenance.reduce((sum, item) => sum + item.costo, 0);
  const annualBalance = incomeTotal - expenseTotal - personnelTotal - machineryTotal;
  const totalHa = crops.reduce((sum, item) => sum + Number(item.hectareas || 0), 0);
  const avgCostHa = totalHa ? expenseTotal / totalHa : 0;
  const grainValue = grainStock.reduce((sum, item) => sum + item.cantidadKg * 0.45, 0) / 1000;
  const receivables = incomes.filter((item) => item.estado !== 'cobrado').reduce((sum, item) => sum + item.total, 0);
  const payables = expenses.filter((item) => item.estado !== 'pagado').reduce((sum, item) => sum + item.monto, 0);
  const netToday = grainValue + receivables - payables;

  const expensesByCategory = Object.entries(expenses.reduce((acc, item) => {
    acc[item.categoria] = (acc[item.categoria] || 0) + item.monto;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const resultByCrop = crops.map((crop) => {
    const cropCosts = expenses.filter((expense) => expense.cropId === crop.id).reduce((sum, item) => sum + item.monto, 0);
    const cropIncome = incomes.filter((income) => income.cropId === crop.id).reduce((sum, item) => sum + item.total, 0);
    return {
      cultivo: `${crop.cultivo} ${crop.lote}`,
      costo: cropCosts,
      ingreso: cropIncome,
      margen: cropIncome - cropCosts
    };
  });

  const supplierRows = suppliers.map((supplier) => {
    const total = expenses.filter((expense) => expense.supplierId === supplier.id).reduce((sum, item) => sum + item.monto, 0);
    const pending = expenses.filter((expense) => expense.supplierId === supplier.id && expense.estado !== 'pagado').reduce((sum, item) => sum + item.monto, 0);
    return { ...supplier, total, pending };
  });

  const customerRows = customers.map((customer) => {
    const total = incomes.filter((income) => income.customerId === customer.id).reduce((sum, item) => sum + item.total, 0);
    const pending = incomes.filter((income) => income.customerId === customer.id && income.estado !== 'cobrado').reduce((sum, item) => sum + item.total, 0);
    return { ...customer, total, pending };
  });

  return (
    <div className="page-stack">
      <PageHeader title="Dashboard" description="Resultado del negocio, producción, cuentas corrientes y balance anual." />
      <section className="stats-grid five">
        <StatCard title="Ingresos totales" value={incomeTotal} />
        <StatCard title="Gastos totales" value={expenseTotal} tone="danger" />
        <StatCard title="Resultado anual" value={annualBalance} tone="success" />
        <StatCard title="Costo promedio / ha" value={`${money(avgCostHa)} / ha`} currency={false} />
        <StatCard title="Resultado del negocio hoy" value={netToday} tone="dark" />
      </section>

      <section className="stats-grid three">
        <StatCard title="Valor granos almacenados" value={grainValue} />
        <StatCard title="Cuentas por cobrar" value={receivables} tone="info" />
        <StatCard title="Deuda proveedores" value={payables} tone="danger" />
      </section>

      <section className="dashboard-grid">
        <article className="card chart-card">
          <h3>Gastos por categoría</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={expensesByCategory} dataKey="value" nameKey="name" innerRadius={65} outerRadius={100}>
                {expensesByCategory.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => money(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="card chart-card wide">
          <h3>Resultado por cultivo</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={resultByCrop}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cultivo" />
              <YAxis />
              <Tooltip formatter={(value) => money(value)} />
              <Legend />
              <Bar dataKey="costo" fill="#e15b3d" />
              <Bar dataKey="ingreso" fill="#2f6fed" />
              <Bar dataKey="margen" fill="#4bae4f" />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>

      <section className="dashboard-grid two-columns">
        <article className="card">
          <h3>Proveedores</h3>
          <DataTable
            columns={[
              { key: 'nombre', label: 'Proveedor' },
              { key: 'total', label: 'Compras', render: (row) => money(row.total) },
              { key: 'pending', label: 'Saldo', render: (row) => money(row.pending) }
            ]}
            rows={supplierRows}
          />
        </article>
        <article className="card">
          <h3>Clientes</h3>
          <DataTable
            columns={[
              { key: 'nombre', label: 'Cliente' },
              { key: 'total', label: 'Ventas', render: (row) => money(row.total) },
              { key: 'pending', label: 'A cobrar', render: (row) => money(row.pending) }
            ]}
            rows={customerRows}
          />
        </article>
      </section>
    </div>
  );
}
