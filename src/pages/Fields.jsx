import { useState } from 'react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';

export default function Fields() {
  const { byCompany, activeCompany, addItem, updateItem, getRemovalBlockers, removeItem } = useApp();
  const [editingField, setEditingField] = useState(null);
  const companyId = activeCompany?.id;
  const rows = byCompany('fields');

  if (!companyId) {
    return <div className="card">No hay una empresa activa seleccionada.</div>;
  }

  const submitField = (form) => {
    const payload = { ...form, hectareas: Number(form.hectareas), companyId };

    if (editingField) {
      updateItem('fields', editingField.id, payload);
      setEditingField(null);
      return;
    }

    addItem('fields', payload);
  };

  const handleDeleteField = (field) => {
    const blockers = getRemovalBlockers('fields', field.id);
    if (blockers.length) {
      window.alert(`No se puede eliminar el campo porque tiene registros asociados: ${blockers.map((item) => `${item.count} ${item.label}`).join(', ')}.`);
      return;
    }

    if (window.confirm(`¿Eliminar el campo "${field.nombre}"?`)) {
      removeItem('fields', field.id);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader title="Campos" description="Ubicación física y cantidad de hectáreas por empresa." />
      <SimpleForm
        fields={[
          { name: 'nombre', label: 'Nombre' },
          { name: 'hectareas', label: 'Hectáreas', type: 'number' },
          { name: 'ubicacion', label: 'Ubicación' }
        ]}
        initialValues={editingField}
        formKey={`${companyId}-${editingField?.id || 'new-field'}`}
        onSubmit={submitField}
        onCancel={editingField ? () => setEditingField(null) : undefined}
        submitLabel={editingField ? 'Guardar cambios' : 'Agregar campo'}
      />
      <DataTable
        columns={[
          { key: 'nombre', label: 'Campo' },
          { key: 'hectareas', label: 'Hectáreas' },
          { key: 'ubicacion', label: 'Ubicación' },
          {
            key: 'actions',
            label: 'Acciones',
            render: (row) => (
              <div className="inline-actions">
                <button type="button" className="ghost-button small" onClick={() => setEditingField(row)}>Editar</button>
                <button
                  type="button"
                  className="ghost-button small danger"
                  onClick={() => handleDeleteField(row)}
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
