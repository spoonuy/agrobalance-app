import { useState } from 'react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';
import { money } from '../utils/helpers';

export default function Customers() {
  const { byCompany, activeCompany, addItem, updateItem, getRemovalBlockers, removeItem } = useApp();
  const [editingCustomer, setEditingCustomer] = useState(null);
  const companyId = activeCompany?.id;
  const rows = byCompany('customers').map((customer) => {
    const incomes = byCompany('incomes').filter((item) => item.customerId === customer.id);
    return {
      ...customer,
      ventas: incomes.reduce((sum, item) => sum + item.total, 0),
      saldo: incomes.filter((item) => item.estado !== 'cobrado').reduce((sum, item) => sum + item.total, 0)
    };
  });

  if (!companyId) {
    return <div className="card">No hay una empresa activa seleccionada.</div>;
  }

  const submitCustomer = (form) => {
    const payload = { ...form, companyId };

    if (editingCustomer) {
      updateItem('customers', editingCustomer.id, payload);
      setEditingCustomer(null);
      return;
    }

    addItem('customers', payload);
  };

  const handleDeleteCustomer = (customer) => {
    const blockers = getRemovalBlockers('customers', customer.id);
    if (blockers.length) {
      window.alert(`No se puede eliminar el cliente porque tiene registros asociados: ${blockers.map((item) => `${item.count} ${item.label}`).join(', ')}.`);
      return;
    }

    if (window.confirm(`¿Eliminar el cliente "${customer.nombre}"?`)) {
      removeItem('customers', customer.id);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader title="Clientes" description="Controla ventas, cobros pendientes y saldo por comprador de grano." />
      <SimpleForm
        fields={[
          { name: 'nombre', label: 'Nombre' },
          { name: 'telefono', label: 'Teléfono', required: false },
          { name: 'email', label: 'Email', required: false }
        ]}
        initialValues={editingCustomer}
        formKey={`${companyId}-${editingCustomer?.id || 'new-customer'}`}
        onSubmit={submitCustomer}
        onCancel={editingCustomer ? () => setEditingCustomer(null) : undefined}
        submitLabel={editingCustomer ? 'Guardar cambios' : 'Agregar cliente'}
      />
      <DataTable
        columns={[
          { key: 'nombre', label: 'Cliente' },
          { key: 'telefono', label: 'Teléfono' },
          { key: 'ventas', label: 'Ventas', render: (row) => money(row.ventas) },
          { key: 'saldo', label: 'A cobrar', render: (row) => money(row.saldo) },
          {
            key: 'actions',
            label: 'Acciones',
            render: (row) => (
              <div className="inline-actions">
                <button type="button" className="ghost-button small" onClick={() => setEditingCustomer(row)}>Editar</button>
                <button
                  type="button"
                  className="ghost-button small danger"
                  onClick={() => handleDeleteCustomer(row)}
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
