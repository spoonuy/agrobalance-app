import { useState } from 'react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';

export default function Campaigns() {
  const { byCompany, activeCompany, addItem, updateItem, getRemovalBlockers, removeItem } = useApp();
  const [editingCampaign, setEditingCampaign] = useState(null);
  const companyId = activeCompany?.id;
  const rows = byCompany('campaigns');

  if (!companyId) {
    return <div className="card">No hay una empresa activa seleccionada.</div>;
  }

  const submitCampaign = (form) => {
    const payload = {
      ...form,
      companyId,
      anioInicio: Number(form.anioInicio),
      anioFin: Number(form.anioFin)
    };

    if (editingCampaign) {
      updateItem('campaigns', editingCampaign.id, payload);
      setEditingCampaign(null);
      return;
    }

    addItem('campaigns', payload);
  };

  const handleDeleteCampaign = (campaign) => {
    const blockers = getRemovalBlockers('campaigns', campaign.id);
    if (blockers.length) {
      window.alert(`No se puede eliminar la campaña porque tiene registros asociados: ${blockers.map((item) => `${item.count} ${item.label}`).join(', ')}.`);
      return;
    }

    if (window.confirm(`¿Eliminar la campaña "${campaign.nombre}"?`)) {
      removeItem('campaigns', campaign.id);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader title="Campañas" description="Gestiona años agrícolas como 2025/2026 o 2026/2027." />
      <SimpleForm
        fields={[
          { name: 'nombre', label: 'Nombre campaña' },
          { name: 'anioInicio', label: 'Año inicio', type: 'number' },
          { name: 'anioFin', label: 'Año fin', type: 'number' }
        ]}
        initialValues={editingCampaign}
        formKey={`${companyId}-${editingCampaign?.id || 'new-campaign'}`}
        onSubmit={submitCampaign}
        onCancel={editingCampaign ? () => setEditingCampaign(null) : undefined}
        submitLabel={editingCampaign ? 'Guardar cambios' : 'Agregar campaña'}
      />
      <DataTable
        columns={[
          { key: 'nombre', label: 'Campaña' },
          { key: 'anioInicio', label: 'Inicio' },
          { key: 'anioFin', label: 'Fin' },
          {
            key: 'actions',
            label: 'Acciones',
            render: (row) => (
              <div className="inline-actions">
                <button type="button" className="ghost-button small" onClick={() => setEditingCampaign(row)}>Editar</button>
                <button
                  type="button"
                  className="ghost-button small danger"
                  onClick={() => handleDeleteCampaign(row)}
                >
                  Eliminar
                </button>
              </div>
            )
          }
        ]}
        rows={rows}
      />
    </div>
  );
}
