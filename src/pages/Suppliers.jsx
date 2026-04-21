import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';
import { dateFmt, money } from '../utils/helpers';

const downloadBlob = (content, type, filename) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const buildHtmlTable = (title, columns, rows) => `
  <h2>${escapeHtml(title)}</h2>
  <table>
    <thead>
      <tr>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}
    </tbody>
  </table>
`;

const getInvoiceNumber = (expense) =>
  expense.numeroFactura || expense.factura || expense.nroFactura || expense.numero_de_factura || expense.numeroDeFactura || '';

export default function Suppliers() {
  const { byCompany, activeCompany, addItem, updateItem, getRemovalBlockers, removeItem } = useApp();
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCropId, setSelectedCropId] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedExpenseIds, setSelectedExpenseIds] = useState([]);
  const companyId = activeCompany?.id;
  const expenses = byCompany('expenses');
  const suppliers = byCompany('suppliers');
  const crops = byCompany('crops');

  const rows = suppliers.map((supplier) => {
    const supplierExpenses = expenses.filter((item) => item.supplierId === supplier.id);
    return {
      ...supplier,
      compras: supplierExpenses.reduce((sum, item) => sum + item.monto, 0),
      saldo: supplierExpenses.filter((item) => item.estado !== 'pagado').reduce((sum, item) => sum + item.monto, 0)
    };
  });

  const accountRows = useMemo(() => {
    return expenses
      .filter((item) => item.supplierId)
      .filter((item) => selectedSupplierId === 'all' || item.supplierId === selectedSupplierId)
      .filter((item) => statusFilter === 'all' || item.estado === statusFilter)
      .filter((item) => selectedCropId === 'all' || item.cropId === selectedCropId)
      .filter((item) => !fromDate || String(item.fecha || '') >= fromDate)
      .filter((item) => !toDate || String(item.fecha || '') <= toDate)
      .map((item) => {
        const supplier = suppliers.find((entry) => entry.id === item.supplierId);
        const crop = crops.find((entry) => entry.id === item.cropId);
        return {
          ...item,
          proveedor: supplier?.nombre || '-',
          cultivo: crop ? `${crop.cultivo} ${crop.lote}` : '-'
        };
      })
      .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  }, [crops, expenses, fromDate, selectedCropId, selectedSupplierId, statusFilter, suppliers, toDate]);

  if (!companyId) {
    return <div className="card">No hay una empresa activa seleccionada.</div>;
  }

  const visibleExpenseIds = accountRows.map((row) => row.id);
  const selectedVisibleCount = visibleExpenseIds.filter((id) => selectedExpenseIds.includes(id)).length;
  const exportRows = selectedExpenseIds.length
    ? accountRows.filter((row) => selectedExpenseIds.includes(row.id))
    : accountRows;

  const submitSupplier = (form) => {
    const payload = { ...form, companyId };

    if (editingSupplier) {
      updateItem('suppliers', editingSupplier.id, payload);
      setEditingSupplier(null);
      return;
    }

    addItem('suppliers', payload);
  };

  const handleDeleteSupplier = (supplier) => {
    const blockers = getRemovalBlockers('suppliers', supplier.id);
    if (blockers.length) {
      window.alert(`No se puede eliminar el proveedor porque tiene registros asociados: ${blockers.map((item) => `${item.count} ${item.label}`).join(', ')}.`);
      return;
    }

    if (window.confirm(`¿Eliminar el proveedor "${supplier.nombre}"?`)) {
      removeItem('suppliers', supplier.id);
    }
  };

  const markAsPaid = (expense) => {
    const suggestedDate = expense.fechaPago || new Date().toISOString().slice(0, 10);
    const paymentDate = window.prompt('Fecha de pago (YYYY-MM-DD)', suggestedDate);
    if (!paymentDate) return;

    updateItem('expenses', expense.id, { estado: 'pagado', fechaPago: paymentDate });
  };

  const markAsPending = (expense) => {
    updateItem('expenses', expense.id, { estado: 'pendiente', fechaPago: null });
  };

  const toggleExpenseSelection = (expenseId) => {
    setSelectedExpenseIds((prev) =>
      prev.includes(expenseId) ? prev.filter((id) => id !== expenseId) : [...prev, expenseId]
    );
  };

  const toggleSelectAllVisible = () => {
    if (!visibleExpenseIds.length) return;

    setSelectedExpenseIds((prev) => {
      const allVisibleSelected = visibleExpenseIds.every((id) => prev.includes(id));
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleExpenseIds.includes(id));
      }

      return Array.from(new Set([...prev, ...visibleExpenseIds]));
    });
  };

  const bulkMarkAsPaid = () => {
    const selectedExpenses = accountRows.filter((row) => selectedExpenseIds.includes(row.id) && row.estado !== 'pagado');
    if (!selectedExpenses.length) {
      window.alert('Selecciona al menos un movimiento pendiente.');
      return;
    }

    const paymentDate = window.prompt('Fecha de pago para los movimientos seleccionados (YYYY-MM-DD)', new Date().toISOString().slice(0, 10));
    if (!paymentDate) return;

    selectedExpenses.forEach((expense) => {
      updateItem('expenses', expense.id, { estado: 'pagado', fechaPago: paymentDate });
    });

    setSelectedExpenseIds([]);
  };

  const supplierLabel = selectedSupplierId === 'all'
    ? 'Todos los proveedores'
    : suppliers.find((supplier) => supplier.id === selectedSupplierId)?.nombre || '-';
  const statusLabel = statusFilter === 'all' ? 'Todos' : statusFilter;
  const selectedCrop = crops.find((crop) => crop.id === selectedCropId);
  const cropLabel = selectedCropId === 'all'
    ? 'Todos los cultivos'
    : selectedCrop
      ? `${selectedCrop.cultivo} ${selectedCrop.lote}`
      : '-';
  const dateRangeLabel = fromDate || toDate
    ? `${fromDate ? dateFmt(fromDate) : 'Inicio'} a ${toDate ? dateFmt(toDate) : 'Hoy'}`
    : 'Todas las fechas';

  const exportExcel = () => {
    const workbook = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1, h2 { color: #082e17; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            th, td { border: 1px solid #cfd8cf; padding: 8px 10px; text-align: left; }
            th { background: #edf5ee; }
          </style>
        </head>
        <body>
          <h1>Estado de cuenta de proveedores</h1>
          ${buildHtmlTable('Filtros', ['Campo', 'Valor'], [
            ['Proveedor', supplierLabel],
            ['Estado', statusLabel],
            ['Cultivo', cropLabel],
            ['Fechas', dateRangeLabel],
            ['Exportación', selectedExpenseIds.length ? 'Solo movimientos seleccionados' : 'Movimientos filtrados']
          ])}
          ${buildHtmlTable(
            'Movimientos',
            ['Fecha', 'Proveedor', 'Cultivo', 'Factura', 'Categoría', 'Concepto', 'Monto', 'Estado', 'Fecha pago'],
            exportRows.map((row) => [
              dateFmt(row.fecha),
              row.proveedor,
              row.cultivo,
              getInvoiceNumber(row) || '-',
              row.categoria,
              row.concepto || '-',
              money(row.monto),
              row.estado,
              row.fechaPago ? dateFmt(row.fechaPago) : '-'
            ])
          )}
        </body>
      </html>
    `;

    downloadBlob(workbook, 'application/vnd.ms-excel;charset=utf-8;', 'agrobalance-proveedores.xls');
  };

  const exportPdf = () => {
    const printable = window.open('', '_blank', 'width=1100,height=800');
    if (!printable) return;

    printable.document.write(`
      <html>
        <head>
          <title>Estado de cuenta de proveedores</title>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 28px; color: #23313f; }
            h1, h2 { color: #082e17; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 22px; }
            th, td { border: 1px solid #d8e2d8; padding: 8px 10px; text-align: left; font-size: 12px; }
            th { background: #edf5ee; }
            .meta { margin-bottom: 22px; }
            .meta strong { display: inline-block; min-width: 90px; }
          </style>
        </head>
        <body>
          <h1>Estado de cuenta de proveedores</h1>
          <div class="meta">
            <div><strong>Proveedor:</strong> ${escapeHtml(supplierLabel)}</div>
            <div><strong>Estado:</strong> ${escapeHtml(statusLabel)}</div>
            <div><strong>Cultivo:</strong> ${escapeHtml(cropLabel)}</div>
            <div><strong>Fechas:</strong> ${escapeHtml(dateRangeLabel)}</div>
            <div><strong>Exportación:</strong> ${escapeHtml(selectedExpenseIds.length ? 'Solo movimientos seleccionados' : 'Movimientos filtrados')}</div>
          </div>
          ${buildHtmlTable(
            'Movimientos',
            ['Fecha', 'Proveedor', 'Cultivo', 'Factura', 'Categoría', 'Concepto', 'Monto', 'Estado', 'Fecha pago'],
            exportRows.map((row) => [
              dateFmt(row.fecha),
              row.proveedor,
              row.cultivo,
              getInvoiceNumber(row) || '-',
              row.categoria,
              row.concepto || '-',
              money(row.monto),
              row.estado,
              row.fechaPago ? dateFmt(row.fechaPago) : '-'
            ])
          )}
          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printable.document.close();
  };

  return (
    <div className="page-stack">
      <PageHeader title="Proveedores" description="Cuenta corriente con saldo por proveedor y detalle de movimientos para ir controlando pagos." />
      <SimpleForm
        fields={[
          { name: 'nombre', label: 'Nombre' },
          { name: 'telefono', label: 'Teléfono', required: false },
          { name: 'email', label: 'Email', required: false }
        ]}
        initialValues={editingSupplier}
        formKey={`${companyId}-${editingSupplier?.id || 'new-supplier'}`}
        onSubmit={submitSupplier}
        onCancel={editingSupplier ? () => setEditingSupplier(null) : undefined}
        submitLabel={editingSupplier ? 'Guardar cambios' : 'Agregar proveedor'}
      />

      <DataTable
        columns={[
          { key: 'nombre', label: 'Proveedor' },
          { key: 'telefono', label: 'Teléfono' },
          { key: 'compras', label: 'Compras', render: (row) => money(row.compras) },
          { key: 'saldo', label: 'Saldo', render: (row) => money(row.saldo) },
          {
            key: 'actions',
            label: 'Acciones',
            render: (row) => (
              <div className="inline-actions">
                <button type="button" className="ghost-button small" onClick={() => setEditingSupplier(row)}>Editar</button>
                <button type="button" className="ghost-button small" onClick={() => setSelectedSupplierId(row.id)}>Ver cuenta</button>
                <button type="button" className="ghost-button small danger" onClick={() => handleDeleteSupplier(row)}>Eliminar</button>
              </div>
            )
          }
        ]}
        rows={rows}
      />

      <section className="card">
        <div className="dashboard-section-header">
          <h3>Estado de cuenta por proveedor</h3>
          <div className="inline-actions">
            <button type="button" className="ghost-button small" onClick={toggleSelectAllVisible}>
              {visibleExpenseIds.length && selectedVisibleCount === visibleExpenseIds.length ? 'Quitar selección' : 'Seleccionar visibles'}
            </button>
            <button type="button" className="primary-button small" onClick={bulkMarkAsPaid}>
              Marcar seleccionados como pagados
            </button>
            <button type="button" className="primary-button small" onClick={exportExcel}>
              Exportar Excel
            </button>
            <button type="button" className="ghost-button small" onClick={exportPdf}>
              Exportar PDF
            </button>
          </div>
        </div>
        <div className="dashboard-filters">
          <label className="dashboard-filter">
            <span>Proveedor</span>
            <select value={selectedSupplierId} onChange={(event) => setSelectedSupplierId(event.target.value)}>
              <option value="all">Todos los proveedores</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.nombre}</option>
              ))}
            </select>
          </label>
          <label className="dashboard-filter">
            <span>Estado</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
            </select>
          </label>
          <label className="dashboard-filter">
            <span>Cultivo</span>
            <select value={selectedCropId} onChange={(event) => setSelectedCropId(event.target.value)}>
              <option value="all">Todos los cultivos</option>
              {crops.map((crop) => (
                <option key={crop.id} value={crop.id}>{`${crop.cultivo} ${crop.lote}`}</option>
              ))}
            </select>
          </label>
          <label className="dashboard-filter">
            <span>Desde</span>
            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} />
          </label>
          <label className="dashboard-filter">
            <span>Hasta</span>
            <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          </label>
        </div>
        <DataTable
          columns={[
            {
              key: 'selected',
              label: '',
              render: (row) => (
                <input
                  type="checkbox"
                  checked={selectedExpenseIds.includes(row.id)}
                  onChange={() => toggleExpenseSelection(row.id)}
                />
              )
            },
            { key: 'fecha', label: 'Fecha', render: (row) => dateFmt(row.fecha) },
            { key: 'proveedor', label: 'Proveedor' },
            { key: 'cultivo', label: 'Cultivo' },
            {
              key: 'numeroFactura',
              label: 'Factura',
              render: (row) => <span className="factura-chip">{getInvoiceNumber(row) || '-'}</span>
            },
            { key: 'categoria', label: 'Categoría' },
            { key: 'concepto', label: 'Concepto', render: (row) => row.concepto || '-' },
            { key: 'monto', label: 'Monto', render: (row) => money(row.monto) },
            { key: 'estado', label: 'Estado' },
            { key: 'fechaPago', label: 'Fecha pago', render: (row) => row.fechaPago ? dateFmt(row.fechaPago) : '-' },
            {
              key: 'actions',
              label: 'Cuenta',
              render: (row) => (
                <div className="inline-actions">
                  {row.estado !== 'pagado' ? (
                    <button type="button" className="ghost-button small" onClick={() => markAsPaid(row)}>Marcar pagado</button>
                  ) : (
                    <button type="button" className="ghost-button small" onClick={() => markAsPending(row)}>Marcar pendiente</button>
                  )}
                </div>
              )
            }
          ]}
          rows={accountRows}
        />
      </section>
    </div>
  );
}
