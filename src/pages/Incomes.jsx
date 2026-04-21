import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import { money, dateFmt } from '../utils/helpers';

const buildInitialForm = (income) => {
  const categoria = income?.categoria || 'Venta granos';
  return {
    fecha: income?.fecha || '',
    categoria,
    cropId: income?.cropId || '',
    customerId: income?.customerId || '',
    detalle: income?.detalle || income?.concepto || '',
    toneladas: income?.toneladas ?? '',
    precio: income?.precio ?? '',
    totalFinalManual: income?.total ?? income?.precioFinal ?? '',
    totalAntesDescuentos: income?.totalAntesDescuentos ?? '',
    monto: categoria === 'Otros' ? income?.total ?? '' : '',
    estado: income?.estado || 'pendiente',
    plazoVenta: income?.plazoVenta || 'Contado'
  };
};

export default function Incomes() {
  const { byCompany, activeCompany, addItem, updateItem, removeItem } = useApp();
  const [editingIncome, setEditingIncome] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(buildInitialForm());
  const companyId = activeCompany?.id;
  const customers = byCompany('customers');
  const crops = byCompany('crops');

  useEffect(() => {
    setForm(buildInitialForm(editingIncome));
  }, [editingIncome]);

  const rows = useMemo(() => (
    byCompany('incomes').map((row) => {
      const crop = crops.find((item) => item.id === row.cropId);
      const customer = customers.find((item) => item.id === row.customerId);
      return {
        ...row,
        categoria: row.categoria || 'Venta granos',
        cultivo: crop ? `${crop.cultivo} ${crop.lote}` : '-',
        cliente: customer?.nombre || '-',
        detalle: row.detalle || row.concepto || '-',
        totalAntesDescuentos: row.totalAntesDescuentos ?? row.total
      };
    })
  ), [byCompany, crops, customers]);

  if (!companyId) {
    return <div className="card">No hay una empresa activa seleccionada.</div>;
  }

  const isOtherIncome = form.categoria === 'Otros';

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const closeForm = () => {
    setEditingIncome(null);
    setForm(buildInitialForm());
    setIsFormOpen(false);
  };

  const openNewIncomeModal = () => {
    setEditingIncome(null);
    setForm(buildInitialForm());
    setIsFormOpen(true);
  };

  const openEditIncomeModal = (income) => {
    setEditingIncome(income);
    setIsFormOpen(true);
  };

  const toneladas = Number(form.toneladas || 0);
  const precio = Number(form.precio || 0);
  const totalFinalManual = form.totalFinalManual === '' ? null : Number(form.totalFinalManual);
  const totalAntesDescuentos = isOtherIncome ? Number(form.monto || 0) : (form.totalAntesDescuentos === '' ? toneladas * precio : Number(form.totalAntesDescuentos));
  const totalFinal = isOtherIncome ? Number(form.monto || 0) : (totalFinalManual != null ? totalFinalManual : totalAntesDescuentos);
  const precioRealTon = !isOtherIncome && toneladas > 0 ? totalFinal / toneladas : null;

  const submitIncome = (event) => {
    event.preventDefault();

    const payload = {
      companyId,
      fecha: form.fecha,
      categoria: form.categoria,
      cropId: isOtherIncome ? null : form.cropId || null,
      customerId: form.customerId || null,
      detalle: form.detalle || '',
      toneladas: isOtherIncome ? 0 : toneladas,
      precio: isOtherIncome ? 0 : precio,
      precioFinal: isOtherIncome ? null : precioRealTon,
      totalAntesDescuentos,
      total: totalFinal,
      plazoVenta: isOtherIncome ? null : form.plazoVenta,
      estado: form.estado
    };

    if (editingIncome) {
      updateItem('incomes', editingIncome.id, payload);
      closeForm();
      return;
    }

    addItem('incomes', payload);
    closeForm();
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Ingresos"
        description="Registra ventas de granos y otros ingresos. Las ventas desde stock entran con total antes de descuentos y luego puedes cerrar el valor final."
        action={<button type="button" className="primary-button small" onClick={openNewIncomeModal}>Agregar ingreso</button>}
      />

      <DataTable
        columns={[
          { key: 'fecha', label: 'Fecha', render: (row) => dateFmt(row.fecha) },
          { key: 'categoria', label: 'Categoría' },
          { key: 'cultivo', label: 'Cultivo' },
          { key: 'cliente', label: 'Cliente' },
          { key: 'plazoVenta', label: 'Plazo', render: (row) => row.plazoVenta || '-' },
          { key: 'toneladas', label: 'Ton', render: (row) => (row.categoria === 'Otros' ? '-' : row.toneladas) },
          { key: 'precio', label: 'Precio base', render: (row) => (row.categoria === 'Otros' ? '-' : money(row.precio)) },
          { key: 'totalAntesDescuentos', label: 'Total antes desc.', render: (row) => money(row.totalAntesDescuentos) },
          { key: 'total', label: 'Total final', render: (row) => money(row.total) },
          { key: 'estado', label: 'Estado' },
          {
            key: 'actions',
            label: 'Acciones',
            render: (row) => (
              <div className="inline-actions">
                <button type="button" className="ghost-button small" onClick={() => openEditIncomeModal(row)}>Editar</button>
                <button
                  type="button"
                  className="ghost-button small danger"
                  onClick={() => window.confirm(`¿Eliminar el ingreso del ${dateFmt(row.fecha)}?`) && removeItem('incomes', row.id)}
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
              <h3>{editingIncome ? 'Editar ingreso' : 'Agregar ingreso'}</h3>
              <button type="button" className="ghost-button small" onClick={closeForm}>Cerrar</button>
            </div>

            <form className="form-grid modal-form" onSubmit={submitIncome}>
              <label>
                <span>Fecha</span>
                <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
              </label>

              <label>
                <span>Categoría</span>
                <select name="categoria" value={form.categoria} onChange={handleChange} required>
                  <option value="Venta granos">Venta granos</option>
                  <option value="Otros">Otros</option>
                </select>
              </label>

              {!isOtherIncome ? (
                <label>
                  <span>Cultivo</span>
                  <select name="cropId" value={form.cropId} onChange={handleChange} required>
                    <option value="">Seleccionar</option>
                    {crops.map((item) => (
                      <option key={item.id} value={item.id}>{`${item.cultivo} ${item.lote}`}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <label>
                  <span>Detalle (opcional)</span>
                  <input type="text" name="detalle" value={form.detalle} onChange={handleChange} />
                </label>
              )}

              <label>
                <span>Cliente</span>
                <select name="customerId" value={form.customerId} onChange={handleChange}>
                  <option value="">Seleccionar</option>
                  {customers.map((item) => (
                    <option key={item.id} value={item.id}>{item.nombre}</option>
                  ))}
                </select>
              </label>

              {!isOtherIncome ? (
                <>
                  <label>
                    <span>Toneladas</span>
                    <input type="number" step="0.01" name="toneladas" value={form.toneladas} onChange={handleChange} required />
                  </label>

                  <label>
                    <span>Precio por ton USD</span>
                    <input type="number" step="0.01" name="precio" value={form.precio} onChange={handleChange} required />
                  </label>

                  <label>
                    <span>Plazo de venta</span>
                    <select name="plazoVenta" value={form.plazoVenta} onChange={handleChange}>
                      <option value="Contado">Contado</option>
                      <option value="15 días">15 días</option>
                      <option value="30 días">30 días</option>
                      <option value="45 días">45 días</option>
                      <option value="60 días">60 días</option>
                    </select>
                  </label>

                  <label>
                    <span>Total final real (opcional)</span>
                    <input type="number" step="0.01" name="totalFinalManual" value={form.totalFinalManual} onChange={handleChange} />
                  </label>
                </>
              ) : (
                <label>
                  <span>Monto USD</span>
                  <input type="number" name="monto" value={form.monto} onChange={handleChange} required />
                </label>
              )}

              <label>
                <span>Estado</span>
                <select name="estado" value={form.estado} onChange={handleChange} required>
                  <option value="cobrado">Cobrado</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </label>

              {!isOtherIncome ? (
                <>
                  <label>
                    <span>Total antes de descuentos</span>
                    <input type="text" value={money(totalAntesDescuentos)} readOnly />
                  </label>
                  <label>
                    <span>Total final</span>
                    <input type="text" value={money(totalFinal)} readOnly />
                  </label>
                  <label>
                    <span>Precio real / ton</span>
                    <input type="text" value={precioRealTon != null ? money(precioRealTon) : '-'} readOnly />
                  </label>
                </>
              ) : null}

              <div className="form-actions">
                <button type="submit" className="primary-button">{editingIncome ? 'Guardar cambios' : 'Agregar ingreso'}</button>
                <button type="button" className="ghost-button" onClick={closeForm}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
