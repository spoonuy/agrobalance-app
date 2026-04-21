import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';
import { money } from '../utils/helpers';

const yearFromDate = (value) => {
  if (!value) return null;
  const year = String(value).slice(0, 4);
  return /^\d{4}$/.test(year) ? year : null;
};

export default function Companies() {
  const { state, activeCompany, addItem, updateItem, getRemovalBlockers, removeItem } = useApp();
  const [editingCompany, setEditingCompany] = useState(null);

  const submitCompany = (form) => {
    const payload = { ...form, userId: state.currentUser.id };

    if (editingCompany) {
      updateItem('companies', editingCompany.id, payload);
      setEditingCompany(null);
      return;
    }

    addItem('companies', payload);
  };

  const handleDeleteCompany = (company) => {
    if (state.companies.length === 1) {
      window.alert('Debes mantener al menos una empresa activa.');
      return;
    }

    const blockers = getRemovalBlockers('companies', company.id);
    if (blockers.length) {
      window.alert(`No se puede eliminar la empresa porque tiene registros asociados: ${blockers.map((item) => `${item.count} ${item.label}`).join(', ')}.`);
      return;
    }

    if (window.confirm(`¿Eliminar la empresa "${company.nombre}"?`)) {
      removeItem('companies', company.id);
    }
  };

  const annualRows = useMemo(() => {
    if (!activeCompany?.id) return [];

    const companyCampaigns = state.campaigns.filter((item) => item.companyId === activeCompany.id);
    const companyCampaignIds = new Set(companyCampaigns.map((item) => item.id));
    const companyCrops = state.crops.filter((item) => item.companyId === activeCompany.id);
    const companyCropIds = new Set(companyCrops.map((item) => item.id));
    const companyMachineIds = new Set(state.machinery.filter((item) => item.companyId === activeCompany.id).map((item) => item.id));
    const companyEmployeeIds = new Set(state.employees.filter((item) => item.companyId === activeCompany.id).map((item) => item.id));

    const yearMap = new Map();
    const ensureYear = (year) => {
      if (!year) return null;
      if (!yearMap.has(year)) {
        yearMap.set(year, {
          id: year,
          anio: year,
          ingresos: 0,
          maquinaria: 0,
          personal: 0,
          otrasExtras: 0,
          campanas: new Set()
        });
      }
      return yearMap.get(year);
    };

    state.incomes
      .filter((item) => item.companyId === activeCompany.id)
      .forEach((item) => {
        const year = yearFromDate(item.fecha);
        const row = ensureYear(year);
        if (!row) return;
        row.ingresos += Number(item.total || 0);
        const crop = companyCrops.find((cropItem) => cropItem.id === item.cropId);
        const campaign = companyCampaigns.find((campaignItem) => campaignItem.id === crop?.campaignId);
        if (campaign?.nombre) row.campanas.add(campaign.nombre);
      });

    state.expenses
      .filter((item) => item.companyId === activeCompany.id)
      .forEach((item) => {
        const year = yearFromDate(item.fecha);
        const row = ensureYear(year);
        if (!row) return;
        const amount = Number(item.monto || 0);
        if (item.categoria === 'Maquinaria') {
          row.maquinaria += amount;
        } else if (item.categoria === 'Personal') {
          row.personal += amount;
        } else if (item.categoria === 'Gastos generales') {
          row.otrasExtras += amount;
        }
      });

    state.machineryMaintenance
      .filter((item) => item.companyId === activeCompany.id || companyMachineIds.has(item.machineryId))
      .forEach((item) => {
        const year = yearFromDate(item.fecha);
        const row = ensureYear(year);
        if (!row) return;
        row.maquinaria += Number(item.costo || 0);
      });

    state.salaryEntries
      .filter((item) => item.companyId === activeCompany.id || companyEmployeeIds.has(item.employeeId))
      .forEach((item) => {
        const year = yearFromDate(item.mes);
        const row = ensureYear(year);
        if (!row) return;
        row.personal += Number(item.monto || 0);
      });

    return Array.from(yearMap.values())
      .map((row) => {
        const extras = row.maquinaria + row.personal + row.otrasExtras;
        return {
          ...row,
          campanas: row.campanas.size ? Array.from(row.campanas).join(', ') : '-',
          extras,
          resultado: row.ingresos - extras
        };
      })
      .sort((a, b) => Number(b.anio) - Number(a.anio));
  }, [activeCompany, state]);

  return (
    <div className="page-stack">
      <PageHeader title="Empresas" description="Un usuario puede manejar varias empresas dentro de la misma cuenta." />
      <SimpleForm
        fields={[
          { name: 'nombre', label: 'Nombre' },
          { name: 'pais', label: 'País' },
          { name: 'moneda', label: 'Moneda', defaultValue: 'USD' }
        ]}
        initialValues={editingCompany}
        formKey={editingCompany?.id || 'new-company'}
        onSubmit={submitCompany}
        onCancel={editingCompany ? () => setEditingCompany(null) : undefined}
        submitLabel={editingCompany ? 'Guardar cambios' : 'Agregar empresa'}
      />

      <DataTable
        columns={[
          { key: 'nombre', label: 'Empresa' },
          { key: 'pais', label: 'País' },
          { key: 'moneda', label: 'Moneda' },
          {
            key: 'actions',
            label: 'Acciones',
            render: (row) => (
              <div className="inline-actions">
                <button type="button" className="ghost-button small" onClick={() => setEditingCompany(row)}>Editar</button>
                <button type="button" className="ghost-button small danger" onClick={() => handleDeleteCompany(row)}>Eliminar</button>
              </div>
            )
          }
        ]}
        rows={state.companies}
      />

      <section className="card company-year-panel">
        <div className="dashboard-section-header">
          <h3>Resumen anual de {activeCompany?.nombre || 'empresa activa'}</h3>
        </div>
        <p className="company-year-copy">
          Aquí ves por año calendario los ingresos registrados, los gastos extra de maquinaria y personal, y el resultado neto de la empresa.
        </p>
        <DataTable
          columns={[
            { key: 'anio', label: 'Año' },
            { key: 'campanas', label: 'Campañas con ingresos' },
            { key: 'ingresos', label: 'Ingresos', render: (row) => money(row.ingresos) },
            { key: 'maquinaria', label: 'Maquinaria', render: (row) => money(row.maquinaria) },
            { key: 'personal', label: 'Personal', render: (row) => money(row.personal) },
            { key: 'otrasExtras', label: 'Otros extras', render: (row) => money(row.otrasExtras) },
            { key: 'resultado', label: 'Resultado', render: (row) => money(row.resultado) }
          ]}
          rows={annualRows}
        />
      </section>
    </div>
  );
}
