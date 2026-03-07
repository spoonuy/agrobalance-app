import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';
import { money, dateFmt } from '../utils/helpers';

export default function Expenses() {
  const { byCompany, activeCompany, addItem } = useApp();
  const suppliers = byCompany('suppliers');
  const crops = byCompany('crops');
  const rows = byCompany('expenses');
  return (
    <div className="page-stack">
      <PageHeader title="Gastos" description="Registra gastos por cultivo o gastos anuales estructurales como personal y maquinaria." />
      <SimpleForm
        fields={[
          { name: 'fecha', label: 'Fecha', type: 'date' },
          { name: 'cropId', label: 'Cultivo', type: 'select', required: false, options: crops.map((item) => ({ value: item.id, label: `${item.cultivo} ${item.lote}` })) },
          { name: 'supplierId', label: 'Proveedor', type: 'select', required: false, options: suppliers.map((item) => ({ value: item.id, label: item.nombre })) },
          { name: 'categoria', label: 'Categoría' },
          { name: 'labor', label: 'Labor' },
          { name: 'concepto', label: 'Concepto' },
          { name: 'monto', label: 'Monto USD', type: 'number' },
          { name: 'estado', label: 'Estado', type: 'select', options: [{ value: 'pagado', label: 'Pagado' }, { value: 'pendiente', label: 'Pendiente' }] },
          { name: 'annual', label: 'Gasto anual', type: 'select', options: [{ value: 'false', label: 'No' }, { value: 'true', label: 'Sí' }] },
          { name: 'horas', label: 'Horas (opcional)', type: 'number', required: false }
        ]}
        onSubmit={(form) => addItem('expenses', { ...form, companyId: activeCompany.id, monto: Number(form.monto), horas: form.horas ? Number(form.horas) : null, annual: form.annual === 'true' })}
        submitLabel="Agregar gasto"
      />
      <DataTable columns={[
        { key: 'fecha', label: 'Fecha', render: (row) => dateFmt(row.fecha) },
        { key: 'categoria', label: 'Categoría' },
        { key: 'concepto', label: 'Concepto' },
        { key: 'monto', label: 'Monto', render: (row) => money(row.monto) },
        { key: 'estado', label: 'Estado' }
      ]} rows={rows} />
    </div>
  );
}
