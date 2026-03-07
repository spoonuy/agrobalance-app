import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';

export default function Campaigns() {
  const { byCompany, activeCompany, addItem } = useApp();
  const rows = byCompany('campaigns');
  return (
    <div className="page-stack">
      <PageHeader title="Campañas" description="Gestiona años agrícolas como 2025/2026 o 2026/2027." />
      <SimpleForm
        fields={[
          { name: 'nombre', label: 'Nombre campaña' },
          { name: 'anioInicio', label: 'Año inicio', type: 'number' },
          { name: 'anioFin', label: 'Año fin', type: 'number' }
        ]}
        onSubmit={(form) => addItem('campaigns', { ...form, companyId: activeCompany.id, anioInicio: Number(form.anioInicio), anioFin: Number(form.anioFin) })}
        submitLabel="Agregar campaña"
      />
      <DataTable columns={[{ key: 'nombre', label: 'Campaña' }, { key: 'anioInicio', label: 'Inicio' }, { key: 'anioFin', label: 'Fin' }]} rows={rows} />
    </div>
  );
}
