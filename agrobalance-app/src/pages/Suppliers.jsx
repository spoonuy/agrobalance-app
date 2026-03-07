import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';
import { money } from '../utils/helpers';

export default function Suppliers() {
  const { byCompany, activeCompany, addItem } = useApp();
  const rows = byCompany('suppliers').map((supplier) => {
    const expenses = byCompany('expenses').filter((item) => item.supplierId === supplier.id);
    return {
      ...supplier,
      compras: expenses.reduce((sum, item) => sum + item.monto, 0),
      saldo: expenses.filter((item) => item.estado !== 'pagado').reduce((sum, item) => sum + item.monto, 0)
    };
  });

  return (
    <div className="page-stack">
      <PageHeader title="Proveedores" description="Cuenta corriente simple con compras y saldo pendiente por proveedor." />
      <SimpleForm
        fields={[
          { name: 'nombre', label: 'Nombre' },
          { name: 'telefono', label: 'Teléfono', required: false },
          { name: 'email', label: 'Email', required: false }
        ]}
        onSubmit={(form) => addItem('suppliers', { ...form, companyId: activeCompany.id })}
        submitLabel="Agregar proveedor"
      />
      <DataTable columns={[
        { key: 'nombre', label: 'Proveedor' },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'compras', label: 'Compras', render: (row) => money(row.compras) },
        { key: 'saldo', label: 'Saldo', render: (row) => money(row.saldo) }
      ]} rows={rows} />
    </div>
  );
}
