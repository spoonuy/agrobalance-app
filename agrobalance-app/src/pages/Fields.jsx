import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';

export default function Fields() {
  const { byCompany, activeCompany, addItem } = useApp();
  const rows = byCompany('fields');
  return (
    <div className="page-stack">
      <PageHeader title="Campos" description="Ubicación física y cantidad de hectáreas por empresa." />
      <SimpleForm
        fields={[
          { name: 'nombre', label: 'Nombre' },
          { name: 'hectareas', label: 'Hectáreas', type: 'number' },
          { name: 'ubicacion', label: 'Ubicación' }
        ]}
        onSubmit={(form) => addItem('fields', { ...form, hectareas: Number(form.hectareas), companyId: activeCompany.id })}
        submitLabel="Agregar campo"
      />
      <DataTable columns={[{ key: 'nombre', label: 'Campo' }, { key: 'hectareas', label: 'Hectáreas' }, { key: 'ubicacion', label: 'Ubicación' }]} rows={rows} />
    </div>
  );
}
