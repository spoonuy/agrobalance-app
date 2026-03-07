import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';
import { money, dateFmt } from '../utils/helpers';

export default function Machinery() {
  const { byCompany, activeCompany, addItem } = useApp();
  const machines = byCompany('machinery');
  const maint = byCompany('machineryMaintenance').filter((entry) => machines.some((machine) => machine.id === entry.machineryId));
  return (
    <div className="page-stack">
      <PageHeader title="Maquinaria" description="Registra horas, mantenimientos y gastos que van al resultado anual." />
      <div className="split-grid">
        <SimpleForm
          fields={[
            { name: 'nombre', label: 'Nombre' },
            { name: 'tipo', label: 'Tipo' },
            { name: 'marca', label: 'Marca' },
            { name: 'modelo', label: 'Modelo' },
            { name: 'horasActuales', label: 'Horas actuales', type: 'number' }
          ]}
          onSubmit={(form) => addItem('machinery', { ...form, companyId: activeCompany.id, horasActuales: Number(form.horasActuales) })}
          submitLabel="Agregar maquinaria"
        />
        <SimpleForm
          fields={[
            { name: 'machineryId', label: 'Maquinaria', type: 'select', options: machines.map((item) => ({ value: item.id, label: item.nombre })) },
            { name: 'fecha', label: 'Fecha', type: 'date' },
            { name: 'concepto', label: 'Trabajo' },
            { name: 'horas', label: 'Horas', type: 'number' },
            { name: 'costo', label: 'Costo', type: 'number' }
          ]}
          onSubmit={(form) => addItem('machineryMaintenance', { ...form, horas: Number(form.horas), costo: Number(form.costo) })}
          submitLabel="Registrar mantenimiento"
        />
      </div>
      <DataTable columns={[
        { key: 'nombre', label: 'Maquinaria' },
        { key: 'tipo', label: 'Tipo' },
        { key: 'marca', label: 'Marca' },
        { key: 'horasActuales', label: 'Horas' }
      ]} rows={machines} />
      <DataTable columns={[
        { key: 'fecha', label: 'Fecha', render: (row) => dateFmt(row.fecha) },
        { key: 'concepto', label: 'Mantenimiento' },
        { key: 'horas', label: 'Horas' },
        { key: 'costo', label: 'Costo', render: (row) => money(row.costo) }
      ]} rows={maint} />
    </div>
  );
}
