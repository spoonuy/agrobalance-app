import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';
import { money } from '../utils/helpers';

export default function Customers() {
  const { byCompany, activeCompany, addItem } = useApp();
  const rows = byCompany('customers').map((customer) => {
    const incomes = byCompany('incomes').filter((item) => item.customerId === customer.id);
    return {
      ...customer,
      ventas: incomes.reduce((sum, item) => sum + item.total, 0),
      saldo: incomes.filter((item) => item.estado !== 'cobrado').reduce((sum, item) => sum + item.total, 0)
    };
  });

  return (
    <div className="page-stack">
      <PageHeader title="Clientes" description="Controla ventas, cobros pendientes y saldo por comprador de grano." />
      <SimpleForm
        fields={[
          { name: 'nombre', label: 'Nombre' },
          { name: 'telefono', label: 'Teléfono', required: false },
          { name: 'email', label: 'Email', required: false }
        ]}
        onSubmit={(form) => addItem('customers', { ...form, companyId: activeCompany.id })}
        submitLabel="Agregar cliente"
      />
      <DataTable columns={[
        { key: 'nombre', label: 'Cliente' },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'ventas', label: 'Ventas', render: (row) => money(row.ventas) },
        { key: 'saldo', label: 'A cobrar', render: (row) => money(row.saldo) }
      ]} rows={rows} />
    </div>
  );
}
