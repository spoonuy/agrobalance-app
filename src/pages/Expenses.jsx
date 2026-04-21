import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';
import { money, dateFmt } from '../utils/helpers';

export default function Expenses() {
  const { byCompany, activeCompany, addItem, updateItem, removeItem } = useApp();
  const [editingExpense, setEditingExpense] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const companyId = activeCompany?.id;
  const suppliers = byCompany('suppliers');
  const crops = byCompany('crops');
  const allExpenses = byCompany('expenses');
  const rows = allExpenses.filter((row) => !row.pendingSeedCost);

  const categoryOptions = [
    { value: 'Semillas', label: 'Semillas' },
    { value: 'Fertilizantes', label: 'Fertilizantes' },
    { value: 'Agroquímicos', label: 'Agroquímicos' },
    { value: 'Gasoil', label: 'Gasoil' },
    { value: 'Flete', label: 'Flete' },
    { value: 'Maquinaria', label: 'Maquinaria' },
    { value: 'Personal', label: 'Personal' },
    { value: 'Otros', label: 'Otros' },
    { value: 'Gastos generales', label: 'Gastos generales' }
  ];

  const pendingExpenseRows = useMemo(() => (
    allExpenses
      .filter((row) => row.pendingSeedCost)
      .map((row) => {
        const linkedCrop = crops.find((crop) => crop.id === row.cropId);
        return {
          ...row,
          cultivo: linkedCrop ? `${linkedCrop.cultivo} ${linkedCrop.lote}` : row.pendingCropLabel || '-',
          hectareas: row.pendingCropHectareas || linkedCrop?.hectareas || 0
        };
      })
  ), [allExpenses, crops]);

  if (!companyId) {
    return <div className="card">No hay una empresa activa seleccionada.</div>;
  }

  const openManualExpenseModal = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const openExpenseModal = (expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const closeExpenseModal = () => {
    setEditingExpense(null);
    setIsFormOpen(false);
  };

  const getCropArea = (expenseForm) => {
    const selectedCrop = crops.find((crop) => crop.id === expenseForm.cropId);
    if (selectedCrop) return Number(selectedCrop.hectareas || 0);
    return Number(expenseForm.pendingCropHectareas || editingExpense?.pendingCropHectareas || 0);
  };

  const submitExpense = (form) => {
    const cropArea = getCropArea(form);
    const costoHa = form.costoHa === '' || form.costoHa == null ? null : Number(form.costoHa);
    const montoCalculado = costoHa != null && cropArea > 0 ? costoHa * cropArea : Number(form.monto || 0);

    const payload = {
      ...form,
      companyId,
      monto: montoCalculado,
      horas: form.horas ? Number(form.horas) : null,
      annual: false,
      costoHa: costoHa ?? '',
      pendingSeedCost: false
    };

    if (editingExpense?.pendingSeedCost) {
      addItem('expenses', {
        ...payload,
        pendingSeedCost: false
      });
      closeExpenseModal();
      return;
    }

    if (editingExpense) {
      updateItem('expenses', editingExpense.id, payload);
      closeExpenseModal();
      return;
    }

    addItem('expenses', payload);
    closeExpenseModal();
  };

  const editingInitialValues = editingExpense
    ? {
        ...editingExpense,
        costoHa: editingExpense.costoHa !== '' && editingExpense.costoHa != null
          ? editingExpense.costoHa
          : (editingExpense.pendingCropHectareas && editingExpense.monto ? (editingExpense.monto / Number(editingExpense.pendingCropHectareas)).toFixed(2) : '')
      }
    : undefined;

  const expenseFields = [
    { name: 'fecha', label: 'Fecha', type: 'date' },
    { name: 'cropId', label: 'Cultivo', type: 'select', required: false, options: crops.map((item) => ({ value: item.id, label: `${item.cultivo} ${item.lote}` })) },
    { name: 'supplierId', label: 'Proveedor', type: 'select', required: false, options: suppliers.map((item) => ({ value: item.id, label: item.nombre })) },
    { name: 'numeroFactura', label: 'Número de factura', required: false },
    { name: 'categoria', label: 'Categoría', type: 'select', options: categoryOptions },
    { name: 'labor', label: 'Labor' },
    { name: 'concepto', label: 'Concepto (opcional)', required: false },
    { name: 'costoHa', label: 'Costo USD/ha (opcional)', type: 'number', required: false },
    { name: 'monto', label: 'Monto USD', type: 'number', required: false },
    { name: 'estado', label: 'Estado', type: 'select', options: [{ value: 'pagado', label: 'Pagado' }, { value: 'pendiente', label: 'Pendiente' }] },
    { name: 'horas', label: 'Horas (opcional)', type: 'number', required: false }
  ];

  return (
    <div className="page-stack">
      <PageHeader title="Gastos" description="Registra gastos por cultivo o gastos generales como personal, maquinaria y estructura de la empresa." />

      {pendingExpenseRows.length ? (
        <section className="card dashboard-section-card">
          <div className="dashboard-section-header">
            <h3>Gastos a completar</h3>
          </div>
          <DataTable
            columns={[
              { key: 'fecha', label: 'Fecha', render: (row) => dateFmt(row.fecha) },
              { key: 'cultivo', label: 'Cultivo' },
              { key: 'hectareas', label: 'Ha' },
              { key: 'concepto', label: 'Pendiente' },
              { key: 'monto', label: 'Monto actual', render: (row) => money(row.monto) },
              {
                key: 'actions',
                label: 'Acciones',
                render: (row) => (
                  <div className="inline-actions">
                    <button type="button" className="primary-button small" onClick={() => openExpenseModal(row)}>Agregar gasto</button>
                    <button
                      type="button"
                      className="ghost-button small danger"
                      onClick={() => window.confirm('¿Borrar este gasto sugerido?') && removeItem('expenses', row.id)}
                    >
                      Borrar
                    </button>
                  </div>
                )
              }
            ]}
            rows={pendingExpenseRows}
          />
        </section>
      ) : null}

      <section className="card dashboard-section-card">
        <div className="dashboard-section-header">
          <h3>Listado de gastos</h3>
          <button type="button" className="primary-button small" onClick={openManualExpenseModal}>Agregar gasto manual</button>
        </div>
        <DataTable
          columns={[
            { key: 'fecha', label: 'Fecha', render: (row) => dateFmt(row.fecha) },
            { key: 'numeroFactura', label: 'Factura', render: (row) => row.numeroFactura || '-' },
            { key: 'categoria', label: 'Categoría' },
            { key: 'concepto', label: 'Concepto', render: (row) => row.concepto || '-' },
            { key: 'monto', label: 'Monto', render: (row) => money(row.monto) },
            { key: 'estado', label: 'Estado' },
            {
              key: 'actions',
              label: 'Acciones',
              render: (row) => (
                <div className="inline-actions">
                  <button type="button" className="ghost-button small" onClick={() => openExpenseModal(row)}>Editar</button>
                  <button
                    type="button"
                    className="ghost-button small danger"
                    onClick={() => window.confirm(`¿Eliminar el gasto "${row.concepto || 'sin concepto'}"?`) && removeItem('expenses', row.id)}
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
              <h3>{editingExpense ? (editingExpense.pendingSeedCost ? 'Completar gasto sugerido' : 'Editar gasto') : 'Agregar gasto manual'}</h3>
              <button type="button" className="ghost-button small" onClick={closeExpenseModal}>Cerrar</button>
            </div>
            <SimpleForm
              fields={expenseFields}
              initialValues={editingInitialValues}
              formKey={`${companyId}-${editingExpense?.id || 'new-expense'}`}
              onSubmit={submitExpense}
              onCancel={closeExpenseModal}
              submitLabel={editingExpense ? 'Guardar cambios' : 'Agregar gasto'}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
