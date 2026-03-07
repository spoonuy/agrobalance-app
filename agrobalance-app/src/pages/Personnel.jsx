import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';
import { money, monthLabel } from '../utils/helpers';

export default function Personnel() {
  const { byCompany, activeCompany, addItem } = useApp();
  const employees = byCompany('employees');
  const salaryEntries = byCompany('salaryEntries').filter((entry) => employees.some((employee) => employee.id === entry.employeeId));
  return (
    <div className="page-stack">
      <PageHeader title="Personal" description="Sueldos, aguinaldos, licencias y otros costos asociados al personal." />
      <div className="split-grid">
        <SimpleForm
          fields={[
            { name: 'nombre', label: 'Nombre' },
            { name: 'cargo', label: 'Cargo' },
            { name: 'fechaIngreso', label: 'Fecha ingreso', type: 'date' },
            { name: 'sueldo', label: 'Sueldo mensual', type: 'number' }
          ]}
          onSubmit={(form) => addItem('employees', { ...form, companyId: activeCompany.id, sueldo: Number(form.sueldo) })}
          submitLabel="Agregar empleado"
        />
        <SimpleForm
          fields={[
            { name: 'employeeId', label: 'Empleado', type: 'select', options: employees.map((item) => ({ value: item.id, label: item.nombre })) },
            { name: 'mes', label: 'Mes', type: 'month' },
            { name: 'tipo', label: 'Tipo', type: 'select', options: [{ value: 'Sueldo', label: 'Sueldo' }, { value: 'Aguinaldo', label: 'Aguinaldo' }, { value: 'Licencia', label: 'Licencia' }, { value: 'Otro', label: 'Otro' }] },
            { name: 'monto', label: 'Monto', type: 'number' }
          ]}
          onSubmit={(form) => addItem('salaryEntries', { ...form, monto: Number(form.monto) })}
          submitLabel="Registrar costo"
        />
      </div>
      <DataTable columns={[
        { key: 'nombre', label: 'Empleado' },
        { key: 'cargo', label: 'Cargo' },
        { key: 'fechaIngreso', label: 'Ingreso' },
        { key: 'sueldo', label: 'Sueldo', render: (row) => money(row.sueldo) }
      ]} rows={employees} />
      <DataTable columns={[
        { key: 'mes', label: 'Mes', render: (row) => monthLabel(row.mes) },
        { key: 'tipo', label: 'Tipo' },
        { key: 'monto', label: 'Monto', render: (row) => money(row.monto) }
      ]} rows={salaryEntries} />
    </div>
  );
}
