import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';
import { money, dateFmt } from '../utils/helpers';

export default function Incomes() {
  const { byCompany, activeCompany, addItem } = useApp();
  const customers = byCompany('customers');
  const crops = byCompany('crops');
  const rows = byCompany('incomes');
  return (
    <div className="page-stack">
      <PageHeader title="Ingresos" description="Permite múltiples ventas por cultivo y control de cuentas a cobrar." />
      <SimpleForm
        fields={[
          { name: 'fecha', label: 'Fecha', type: 'date' },
          { name: 'cropId', label: 'Cultivo', type: 'select', options: crops.map((item) => ({ value: item.id, label: `${item.cultivo} ${item.lote}` })) },
          { name: 'customerId', label: 'Cliente', type: 'select', options: customers.map((item) => ({ value: item.id, label: item.nombre })) },
          { name: 'toneladas', label: 'Toneladas', type: 'number' },
          { name: 'precio', label: 'Precio USD', type: 'number' },
          { name: 'estado', label: 'Estado', type: 'select', options: [{ value: 'cobrado', label: 'Cobrado' }, { value: 'pendiente', label: 'Pendiente' }] }
        ]}
        onSubmit={(form) => addItem('incomes', { ...form, companyId: activeCompany.id, toneladas: Number(form.toneladas), precio: Number(form.precio), total: Number(form.toneladas) * Number(form.precio) })}
        submitLabel="Agregar ingreso"
      />
      <DataTable columns={[
        { key: 'fecha', label: 'Fecha', render: (row) => dateFmt(row.fecha) },
        { key: 'toneladas', label: 'Ton' },
        { key: 'precio', label: 'Precio', render: (row) => money(row.precio) },
        { key: 'total', label: 'Total', render: (row) => money(row.total) },
        { key: 'estado', label: 'Estado' }
      ]} rows={rows} />
    </div>
  );
}
