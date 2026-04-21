import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';
import { dateFmt } from '../utils/helpers';

export default function DeliveryNotes() {
  const { byCompany, activeCompany, addItem, updateItem, removeItem } = useApp();
  const [editingNote, setEditingNote] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const companyId = activeCompany?.id;
  const crops = byCompany('crops');
  const deliveryNotes = byCompany('deliveryNotes');

  const rows = useMemo(() => (
    deliveryNotes
      .slice()
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))
      .map((row) => {
        const crop = crops.find((item) => item.id === row.cropId);
        return {
          ...row,
          cultivo: crop ? `${crop.cultivo} ${crop.lote}` : '-'
        };
      })
  ), [crops, deliveryNotes]);

  const summaryRows = useMemo(() => (
    crops
      .map((crop) => {
        const notes = deliveryNotes.filter((item) => item.cropId === crop.id);
        const totalKgReales = notes.reduce((sum, item) => sum + Number(item.kgReales || 0), 0);

        return {
          id: crop.id,
          cultivo: `${crop.cultivo} ${crop.lote}`,
          camiones: notes.length,
          kgReales: totalKgReales
        };
      })
      .filter((row) => row.camiones > 0)
  ), [crops, deliveryNotes]);

  if (!companyId) {
    return <div className="card">No hay una empresa activa seleccionada.</div>;
  }

  const closeForm = () => {
    setEditingNote(null);
    setIsFormOpen(false);
  };

  const openNewNoteModal = () => {
    setEditingNote(null);
    setIsFormOpen(true);
  };

  const openEditNoteModal = (note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const submitNote = (form) => {
    const payload = {
      ...form,
      companyId,
      kgAproximados: Number(form.kgAproximados || 0),
      kgReales: form.kgReales === '' ? null : Number(form.kgReales),
      humedad: form.humedad === '' ? null : Number(form.humedad)
    };

    if (editingNote) {
      updateItem('deliveryNotes', editingNote.id, payload);
      closeForm();
      return;
    }

    addItem('deliveryNotes', payload);
    closeForm();
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Remitos chacra"
        description="Registra cada viaje de cosecha y controla kilos aproximados, kilos reales y cantidad de camiones por cultivo."
        action={<button type="button" className="primary-button small" onClick={openNewNoteModal}>Agregar remito</button>}
      />

      <section className="card dashboard-section-card">
        <div className="dashboard-section-header">
          <h3>Resumen por cultivo</h3>
        </div>
        <DataTable
          columns={[
            { key: 'cultivo', label: 'Cultivo' },
            { key: 'camiones', label: 'Total camiones' },
            { key: 'kgReales', label: 'Kg reales', render: (row) => `${row.kgReales.toLocaleString('es-UY')} kg` }
          ]}
          rows={summaryRows}
        />
      </section>

      <section className="card dashboard-section-card">
        <div className="dashboard-section-header">
          <h3>Detalle de remitos</h3>
        </div>
        <DataTable
          columns={[
            { key: 'fecha', label: 'Fecha', render: (row) => dateFmt(row.fecha) },
            { key: 'cultivo', label: 'Cultivo' },
            { key: 'matricula', label: 'Matrícula' },
            { key: 'destino', label: 'Destino' },
            { key: 'kgAproximados', label: 'Kg aprox.', render: (row) => `${Number(row.kgAproximados || 0).toLocaleString('es-UY')} kg` },
            { key: 'kgReales', label: 'Kg reales', render: (row) => row.kgReales != null ? `${Number(row.kgReales).toLocaleString('es-UY')} kg` : '-' },
            { key: 'humedad', label: 'Humedad', render: (row) => row.humedad != null ? `${Number(row.humedad).toFixed(1)} %` : '-' },
            {
              key: 'actions',
              label: 'Acciones',
              render: (row) => (
                <div className="inline-actions">
                  <button type="button" className="ghost-button small" onClick={() => openEditNoteModal(row)}>Editar</button>
                  <button
                    type="button"
                    className="ghost-button small danger"
                    onClick={() => window.confirm('¿Eliminar este remito?') && removeItem('deliveryNotes', row.id)}
                  >
                    Eliminar
                  </button>
                </div>
              )
            }
          ]}
          rows={rows}
        />
      </section>

      {isFormOpen ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="dashboard-section-header">
              <h3>{editingNote ? 'Editar remito' : 'Agregar remito'}</h3>
              <button type="button" className="ghost-button small" onClick={closeForm}>Cerrar</button>
            </div>

            <SimpleForm
              fields={[
                { name: 'fecha', label: 'Fecha', type: 'date' },
                { name: 'cropId', label: 'Cultivo', type: 'select', options: crops.map((item) => ({ value: item.id, label: `${item.cultivo} ${item.lote}` })) },
                { name: 'matricula', label: 'Matrícula' },
                { name: 'destino', label: 'Destino' },
                { name: 'kgAproximados', label: 'Kg aproximados', type: 'number' },
                { name: 'kgReales', label: 'Kg reales (opcional)', type: 'number', required: false },
                { name: 'humedad', label: 'Humedad % (opcional)', type: 'number', required: false }
              ]}
              initialValues={editingNote || undefined}
              formKey={`${companyId}-${editingNote?.id || 'new-delivery-note'}`}
              onSubmit={submitNote}
              onCancel={closeForm}
              submitLabel={editingNote ? 'Guardar cambios' : 'Agregar remito'}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
