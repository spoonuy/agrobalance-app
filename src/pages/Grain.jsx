import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import { money } from '../utils/helpers';

const initialSaleForm = {
  toneladas: '',
  customerId: '',
  precioTon: '',
  plazoVenta: 'Contado'
};

export default function Grain() {
  const { byCompany, activeCompany, addItem } = useApp();
  const [sellingRow, setSellingRow] = useState(null);
  const [saleForm, setSaleForm] = useState(initialSaleForm);
  const companyId = activeCompany?.id;
  const crops = byCompany('crops');
  const customers = byCompany('customers');
  const deliveryNotes = byCompany('deliveryNotes');
  const incomes = byCompany('incomes');

  const stockRows = useMemo(() => (
    crops
      .map((crop) => {
        const receivedKg = deliveryNotes
          .filter((note) => note.cropId === crop.id)
          .reduce((sum, note) => sum + Number(note.kgReales || 0), 0);
        const soldTons = incomes
          .filter((income) => income.cropId === crop.id && (income.categoria || 'Venta granos') === 'Venta granos')
          .reduce((sum, income) => sum + Number(income.toneladas || 0), 0);
        const stockTons = receivedKg / 1000 - soldTons;

        return {
          id: crop.id,
          cropId: crop.id,
          cultivo: `${crop.cultivo} ${crop.lote}`,
          toneladasRecibidas: receivedKg / 1000,
          toneladasVendidas: soldTons,
          stockTons: Math.max(stockTons, 0)
        };
      })
      .filter((row) => row.toneladasRecibidas > 0 || row.toneladasVendidas > 0)
  ), [crops, deliveryNotes, incomes]);

  if (!companyId) {
    return <div className="card">No hay una empresa activa seleccionada.</div>;
  }

  const openSaleModal = (row) => {
    setSellingRow(row);
    setSaleForm({
      ...initialSaleForm,
      toneladas: row.stockTons ? row.stockTons.toFixed(2) : ''
    });
  };

  const closeSaleModal = () => {
    setSellingRow(null);
    setSaleForm(initialSaleForm);
  };

  const handleSaleChange = (event) => {
    const { name, value } = event.target;
    setSaleForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitSale = (event) => {
    event.preventDefault();
    if (!sellingRow) return;

    const toneladas = Number(saleForm.toneladas || 0);
    const precioTon = Number(saleForm.precioTon || 0);
    const totalAntesDescuentos = toneladas * precioTon;

    if (!toneladas || toneladas <= 0) {
      window.alert('Ingresa una cantidad de toneladas válida.');
      return;
    }

    if (toneladas > Number(sellingRow.stockTons || 0)) {
      window.alert('No puedes vender más toneladas que el stock disponible.');
      return;
    }

    addItem('incomes', {
      companyId,
      fecha: new Date().toISOString().slice(0, 10),
      categoria: 'Venta granos',
      cropId: sellingRow.cropId,
      customerId: saleForm.customerId || null,
      detalle: `Venta desde stock - ${saleForm.plazoVenta}`,
      toneladas,
      precio: precioTon,
      precioFinal: '',
      totalAntesDescuentos,
      total: totalAntesDescuentos,
      plazoVenta: saleForm.plazoVenta,
      estado: 'pendiente'
    });

    closeSaleModal();
  };

  const totalStock = stockRows.reduce((sum, row) => sum + Number(row.stockTons || 0), 0);

  return (
    <div className="page-stack">
      <PageHeader title="Stock de granos" description="El stock se alimenta desde los remitos de chacra con kilos reales y se muestra en toneladas por cultivo." />

      <section className="dashboard-summary-grid">
        <article className="dashboard-summary-card positive">
          <span>Stock total disponible</span>
          <strong>{totalStock.toFixed(2)} ton</strong>
        </article>
      </section>

      <section className="card dashboard-section-card">
        <div className="dashboard-section-header">
          <h3>Stock por cultivo</h3>
        </div>
        <DataTable
          columns={[
            { key: 'cultivo', label: 'Cultivo' },
            { key: 'toneladasRecibidas', label: 'Ton recibidas', render: (row) => row.toneladasRecibidas.toFixed(2) },
            { key: 'toneladasVendidas', label: 'Ton vendidas', render: (row) => row.toneladasVendidas.toFixed(2) },
            { key: 'stockTons', label: 'Stock actual', render: (row) => `${row.stockTons.toFixed(2)} ton` },
            {
              key: 'actions',
              label: 'Acciones',
              render: (row) => (
                <div className="inline-actions">
                  <button type="button" className="primary-button small" onClick={() => openSaleModal(row)} disabled={row.stockTons <= 0}>
                    Vender
                  </button>
                </div>
              )
            }
          ]}
          rows={stockRows}
        />
      </section>

      {sellingRow ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="dashboard-section-header">
              <h3>Vender grano</h3>
              <button type="button" className="ghost-button small" onClick={closeSaleModal}>Cerrar</button>
            </div>
            <p className="company-year-copy">
              {sellingRow.cultivo} - Stock disponible: {sellingRow.stockTons.toFixed(2)} ton
            </p>
            <form className="form-grid modal-form" onSubmit={submitSale}>
              <label>
                <span>Toneladas a vender</span>
                <input type="number" step="0.01" name="toneladas" value={saleForm.toneladas} onChange={handleSaleChange} required />
              </label>
              <label>
                <span>Cliente</span>
                <select name="customerId" value={saleForm.customerId} onChange={handleSaleChange}>
                  <option value="">Seleccionar</option>
                  {customers.map((item) => (
                    <option key={item.id} value={item.id}>{item.nombre}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Precio por ton USD</span>
                <input type="number" step="0.01" name="precioTon" value={saleForm.precioTon} onChange={handleSaleChange} required />
              </label>
              <label>
                <span>Plazo de venta</span>
                <select name="plazoVenta" value={saleForm.plazoVenta} onChange={handleSaleChange}>
                  <option value="Contado">Contado</option>
                  <option value="15 días">15 días</option>
                  <option value="30 días">30 días</option>
                  <option value="45 días">45 días</option>
                  <option value="60 días">60 días</option>
                </select>
              </label>
              <label className="wide">
                <span>Total antes de descuentos</span>
                <input type="text" value={money(Number(saleForm.toneladas || 0) * Number(saleForm.precioTon || 0))} readOnly />
              </label>
              <div className="form-actions">
                <button type="submit" className="primary-button">Confirmar venta</button>
                <button type="button" className="ghost-button" onClick={closeSaleModal}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
