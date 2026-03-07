import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';
import { money, dateFmt } from '../utils/helpers';

export default function Grain() {
  const { byCompany, activeCompany, addItem } = useApp();
  const locations = byCompany('grainLocations');
  const crops = byCompany('crops');
  const rows = byCompany('grainStock').map((row) => ({
    ...row,
    cultivo: crops.find((crop) => crop.id === row.cropId)?.cultivo || '-',
    ubicacion: locations.find((location) => location.id === row.locationId)?.nombre || '-'
  }));

  return (
    <div className="page-stack">
      <PageHeader title="Stock de granos" description="Registra ubicación y cantidad física almacenada por cultivo." />
      <div className="split-grid">
        <SimpleForm
          fields={[
            { name: 'nombre', label: 'Ubicación' },
            { name: 'tipo', label: 'Tipo' }
          ]}
          onSubmit={(form) => addItem('grainLocations', { ...form, companyId: activeCompany.id })}
          submitLabel="Agregar ubicación"
        />
        <SimpleForm
          fields={[
            { name: 'cropId', label: 'Cultivo', type: 'select', options: crops.map((item) => ({ value: item.id, label: `${item.cultivo} ${item.lote}` })) },
            { name: 'locationId', label: 'Ubicación', type: 'select', options: locations.map((item) => ({ value: item.id, label: item.nombre })) },
            { name: 'cantidadKg', label: 'Cantidad kg', type: 'number' },
            { name: 'fecha', label: 'Fecha', type: 'date' }
          ]}
          onSubmit={(form) => addItem('grainStock', { ...form, companyId: activeCompany.id, cantidadKg: Number(form.cantidadKg) })}
          submitLabel="Registrar stock"
        />
      </div>
      <DataTable columns={[
        { key: 'cultivo', label: 'Cultivo' },
        { key: 'ubicacion', label: 'Ubicación' },
        { key: 'cantidadKg', label: 'Kg' },
        { key: 'valor', label: 'Valor estimado', render: (row) => money((row.cantidadKg * 0.45) / 1000) },
        { key: 'fecha', label: 'Fecha', render: (row) => dateFmt(row.fecha) }
      ]} rows={rows} />
    </div>
  );
}
