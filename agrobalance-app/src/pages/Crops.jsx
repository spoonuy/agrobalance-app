import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';
import { money, dateFmt } from '../utils/helpers';

export default function Crops() {
  const { byCompany, activeCompany, addItem } = useApp();
  const fields = byCompany('fields');
  const campaigns = byCompany('campaigns');
  const rows = byCompany('crops');
  return (
    <div className="page-stack">
      <PageHeader title="Cultivos" description="Cada cultivo queda asociado a empresa, campo, campaña y lote." />
      <SimpleForm
        fields={[
          { name: 'cultivo', label: 'Cultivo' },
          { name: 'lote', label: 'Lote' },
          { name: 'fieldId', label: 'Campo', type: 'select', options: fields.map((item) => ({ value: item.id, label: item.nombre })) },
          { name: 'campaignId', label: 'Campaña', type: 'select', options: campaigns.map((item) => ({ value: item.id, label: item.nombre })) },
          { name: 'hectareas', label: 'Hectáreas', type: 'number' },
          { name: 'rentaHa', label: 'Renta / ha', type: 'number' },
          { name: 'siembra', label: 'Siembra', type: 'date' },
          { name: 'cosecha', label: 'Cosecha', type: 'date' }
        ]}
        onSubmit={(form) => addItem('crops', { ...form, companyId: activeCompany.id, hectareas: Number(form.hectareas), rentaHa: Number(form.rentaHa) })}
        submitLabel="Agregar cultivo"
      />
      <DataTable
        columns={[
          { key: 'cultivo', label: 'Cultivo' },
          { key: 'lote', label: 'Lote' },
          { key: 'hectareas', label: 'Ha' },
          { key: 'rentaHa', label: 'Renta/ha', render: (row) => money(row.rentaHa) },
          { key: 'siembra', label: 'Siembra', render: (row) => dateFmt(row.siembra) },
          { key: 'cosecha', label: 'Cosecha', render: (row) => dateFmt(row.cosecha) }
        ]}
        rows={rows}
      />
    </div>
  );
}
