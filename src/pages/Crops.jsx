import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';
import { money, dateFmt, isDateBetween } from '../utils/helpers';

export default function Crops() {
  const { byCompany, activeCompany, addItem, updateItem, getRemovalBlockers, removeItem } = useApp();
  const [editingCrop, setEditingCrop] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const companyId = activeCompany?.id;
  const fields = byCompany('fields');
  const campaigns = byCompany('campaigns');
  const rainfallRecords = byCompany('rainfallRecords');
  const expenses = byCompany('expenses');

  const rows = useMemo(() => (
    byCompany('crops').map((crop) => {
      const cycleRainfall = rainfallRecords.filter((record) => isDateBetween(record.fecha, crop.siembra, crop.cosecha || today));
      const lluviaCiclo = cycleRainfall.reduce((sum, record) => sum + Number(record.mm || 0), 0);

      return {
        ...crop,
        lluviaCiclo,
        eventosLluvia: cycleRainfall.length
      };
    })
  ), [byCompany, rainfallRecords, today]);

  if (!companyId) {
    return <div className="card">No hay una empresa activa seleccionada.</div>;
  }

  const submitCrop = (form) => {
    const payload = {
      ...form,
      companyId,
      hectareas: Number(form.hectareas),
      rentaHa: Number(form.rentaHa)
    };

    if (editingCrop) {
      updateItem('crops', editingCrop.id, payload);
      setEditingCrop(null);
      setIsFormOpen(false);
      return;
    }

    addItem('crops', payload);
    addItem('expenses', {
      companyId,
      cropId: null,
      supplierId: null,
      fecha: form.siembra || new Date().toISOString().slice(0, 10),
      numeroFactura: '',
      categoria: 'Semillas',
      labor: 'Siembra',
      concepto: `Completar costo de siembra - ${form.cultivo} ${form.lote}`,
      monto: 0,
      estado: 'pendiente',
      horas: null,
      annual: false,
      costoHa: '',
      pendingSeedCost: true,
      pendingCropLabel: `${form.cultivo} ${form.lote}`,
      pendingCropFieldId: form.fieldId || null,
      pendingCropCampaignId: form.campaignId || null,
      pendingCropHectareas: Number(form.hectareas)
    });
    setIsFormOpen(false);
  };

  const handleDeleteCrop = (crop) => {
    const blockers = getRemovalBlockers('crops', crop.id).filter((blocker) => {
      if (blocker.collection !== 'expenses') return true;

      const realRelatedExpenses = expenses.filter(
        (expense) => expense.cropId === crop.id && !expense.pendingSeedCost
      );

      return realRelatedExpenses.length > 0;
    });

    if (blockers.length) {
      window.alert(`No se puede eliminar el cultivo porque tiene registros asociados: ${blockers.map((item) => `${item.count} ${item.label}`).join(', ')}.`);
      return;
    }

    if (window.confirm(`¿Eliminar el cultivo "${crop.cultivo}" del lote "${crop.lote}"?`)) {
      expenses
        .filter((expense) =>
          expense.pendingSeedCost && (
            expense.cropId === crop.id ||
            expense.pendingCropLabel === `${crop.cultivo} ${crop.lote}`
          )
        )
        .forEach((expense) => removeItem('expenses', expense.id));
      removeItem('crops', crop.id);
    }
  };

  const openNewCropModal = () => {
    setEditingCrop(null);
    setIsFormOpen(true);
  };

  const openEditCropModal = (crop) => {
    setEditingCrop(crop);
    setIsFormOpen(true);
  };

  const closeCropModal = () => {
    setEditingCrop(null);
    setIsFormOpen(false);
  };

  const cropFields = [
    { name: 'cultivo', label: 'Cultivo' },
    { name: 'lote', label: 'Lote' },
    { name: 'variedad', label: 'Variedad (opcional)', required: false },
    { name: 'densidad', label: 'Densidad (opcional)', required: false },
    { name: 'fieldId', label: 'Campo', type: 'select', options: fields.map((item) => ({ value: item.id, label: item.nombre })) },
    { name: 'campaignId', label: 'Campaña', type: 'select', options: campaigns.map((item) => ({ value: item.id, label: item.nombre })) },
    { name: 'hectareas', label: 'Hectáreas', type: 'number' },
    { name: 'rentaHa', label: 'Renta / ha', type: 'number' },
    { name: 'siembra', label: 'Siembra', type: 'date' },
    { name: 'cosecha', label: 'Cosecha (opcional)', type: 'date', required: false }
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title="Cultivos"
        description="Cada cultivo queda asociado a empresa, campo, campaña y lote."
        action={<button type="button" className="primary-button small" onClick={openNewCropModal}>Agregar cultivo</button>}
      />

      <DataTable
        columns={[
          { key: 'cultivo', label: 'Cultivo' },
          { key: 'lote', label: 'Lote' },
          { key: 'variedad', label: 'Variedad', render: (row) => row.variedad || '-' },
          { key: 'densidad', label: 'Densidad', render: (row) => row.densidad || '-' },
          { key: 'hectareas', label: 'Ha' },
          { key: 'lluviaCiclo', label: 'Lluvia ciclo', render: (row) => `${row.lluviaCiclo.toFixed(0)} mm` },
          { key: 'eventosLluvia', label: 'Eventos', render: (row) => row.eventosLluvia },
          { key: 'rentaHa', label: 'Renta/ha', render: (row) => money(row.rentaHa) },
          { key: 'siembra', label: 'Siembra', render: (row) => dateFmt(row.siembra) },
          { key: 'cosecha', label: 'Cosecha', render: (row) => dateFmt(row.cosecha) },
          {
            key: 'actions',
            label: 'Acciones',
            render: (row) => (
              <div className="inline-actions">
                <button type="button" className="ghost-button small" onClick={() => openEditCropModal(row)}>Editar</button>
                <button
                  type="button"
                  className="ghost-button small danger"
                  onClick={() => handleDeleteCrop(row)}
                >
                  Eliminar
                </button>
              </div>
            )
          }
        ]}
        rows={rows}
      />

      {isFormOpen ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="dashboard-section-header">
              <h3>{editingCrop ? 'Editar cultivo' : 'Agregar cultivo'}</h3>
              <button type="button" className="ghost-button small" onClick={closeCropModal}>Cerrar</button>
            </div>
            <SimpleForm
              fields={cropFields}
              initialValues={editingCrop || undefined}
              formKey={`${companyId}-${editingCrop?.id || 'new-crop'}`}
              onSubmit={submitCrop}
              onCancel={closeCropModal}
              submitLabel={editingCrop ? 'Guardar cambios' : 'Agregar cultivo'}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
