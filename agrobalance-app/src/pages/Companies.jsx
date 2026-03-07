import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';

export default function Companies() {
  const { state, addItem } = useApp();
  return (
    <div className="page-stack">
      <PageHeader title="Empresas" description="Un usuario puede manejar varias empresas dentro de la misma cuenta." />
      <SimpleForm
        fields={[
          { name: 'nombre', label: 'Nombre' },
          { name: 'pais', label: 'País' },
          { name: 'moneda', label: 'Moneda', defaultValue: 'USD' }
        ]}
        onSubmit={(form) => addItem('companies', { ...form, userId: state.currentUser.id })}
        submitLabel="Agregar empresa"
      />
      <DataTable columns={[{ key: 'nombre', label: 'Empresa' }, { key: 'pais', label: 'País' }, { key: 'moneda', label: 'Moneda' }]} rows={state.companies} />
    </div>
  );
}
