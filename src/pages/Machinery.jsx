import { useState } from 'react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';
import { money, dateFmt } from '../utils/helpers';

export default function Machinery() {
  const { byCompany, activeCompany, addItem, updateItem, getRemovalBlockers, removeItem } = useApp();
  const [editingMachine, setEditingMachine] = useState(null);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [isMachineFormOpen, setIsMachineFormOpen] = useState(false);
  const [isMaintenanceFormOpen, setIsMaintenanceFormOpen] = useState(false);
  const [serviceAlert, setServiceAlert] = useState(null);
  const companyId = activeCompany?.id;
  const machines = byCompany('machinery');
  const maint = byCompany('machineryMaintenance').filter((entry) => machines.some((machine) => machine.id === entry.machineryId));

  if (!companyId) {
    return <div className="card">No hay una empresa activa seleccionada.</div>;
  }

  const closeMachineForm = () => {
    setEditingMachine(null);
    setIsMachineFormOpen(false);
  };

  const closeMaintenanceForm = () => {
    setEditingMaintenance(null);
    setIsMaintenanceFormOpen(false);
  };

  const openNewMachineModal = () => {
    setEditingMachine(null);
    setIsMachineFormOpen(true);
  };

  const openEditMachineModal = (machine) => {
    setEditingMachine(machine);
    setIsMachineFormOpen(true);
  };

  const openNewMaintenanceModal = () => {
    setEditingMaintenance(null);
    setIsMaintenanceFormOpen(true);
  };

  const openEditMaintenanceModal = (entry) => {
    setEditingMaintenance(entry);
    setIsMaintenanceFormOpen(true);
  };

  const getPendingServices = (machineryId, currentHours, currentConcept, currentEntryId) =>
    maint.filter((entry) => {
      if (entry.machineryId !== machineryId) return false;
      if (!entry.proximoService || !entry.horas) return false;
      if (currentEntryId && entry.id === currentEntryId) return false;

      const dueHours = Number(entry.horas) + Number(entry.proximoService);
      if (Number(currentHours) < dueHours) return false;

      const sameServiceDoneLater = maint.some((candidate) =>
        candidate.machineryId === machineryId &&
        candidate.id !== entry.id &&
        candidate.concepto === entry.concepto &&
        candidate.id !== currentEntryId &&
        Number(candidate.horas || 0) >= dueHours
      );

      if (sameServiceDoneLater) return false;
      if (currentConcept && currentConcept === entry.concepto) return false;

      return true;
    });

  const submitMachine = (form) => {
    const payload = { ...form, companyId, horasActuales: Number(form.horasActuales) };

    if (editingMachine) {
      updateItem('machinery', editingMachine.id, payload);
      closeMachineForm();
      return;
    }

    addItem('machinery', payload);
    closeMachineForm();
  };

  const persistMaintenance = (form) => {
    const horas = Number(form.horas);
    const costo = Number(form.costo);
    const proximoService = form.proximoService ? Number(form.proximoService) : null;
    const payload = { ...form, companyId, horas, costo, proximoService };

    if (editingMaintenance) {
      updateItem('machineryMaintenance', editingMaintenance.id, payload);
    } else {
      addItem('machineryMaintenance', payload);
    }

    const machine = machines.find((item) => item.id === form.machineryId);
    if (machine && horas > Number(machine.horasActuales || 0)) {
      updateItem('machinery', machine.id, { horasActuales: horas });
    }

    closeMaintenanceForm();
  };

  const submitMaintenance = (form) => {
    const horas = Number(form.horas);
    const pendingServices = getPendingServices(form.machineryId, horas, form.concepto, editingMaintenance?.id);

    if (pendingServices.length) {
      const machineName = machines.find((item) => item.id === form.machineryId)?.nombre || 'la maquinaria';
      const details = pendingServices.map((item) => {
        const dueHours = Number(item.horas) + Number(item.proximoService);
        return {
          id: item.id,
          concepto: item.concepto,
          dueHours
        };
      });

      setServiceAlert({
        form,
        machineName,
        details
      });
      return;
    }

    persistMaintenance(form);
  };

  const handleDeleteMachine = (machine) => {
    const blockers = getRemovalBlockers('machinery', machine.id);
    if (blockers.length) {
      window.alert(`No se puede eliminar la maquinaria porque tiene registros asociados: ${blockers.map((item) => `${item.count} ${item.label}`).join(', ')}.`);
      return;
    }

    if (window.confirm(`¿Eliminar la maquinaria "${machine.nombre}"?`)) {
      removeItem('machinery', machine.id);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Maquinaria"
        description="Registra horas, mantenimientos y gastos que van al resultado anual."
        action={(
          <div className="inline-actions">
            <button type="button" className="ghost-button small" onClick={openNewMaintenanceModal}>Registrar mantenimiento</button>
            <button type="button" className="primary-button small" onClick={openNewMachineModal}>Agregar maquinaria</button>
          </div>
        )}
      />

      <section className="card dashboard-section-card">
        <div className="dashboard-section-header">
          <h3>Registro de maquinaria</h3>
        </div>
        <DataTable
          columns={[
            { key: 'nombre', label: 'Maquinaria' },
            { key: 'tipo', label: 'Tipo' },
            { key: 'marca', label: 'Marca' },
            { key: 'horasActuales', label: 'Horas' },
            {
              key: 'actions',
              label: 'Acciones',
              render: (row) => (
                <div className="inline-actions">
                  <button type="button" className="ghost-button small" onClick={() => openEditMachineModal(row)}>Editar</button>
                  <button
                    type="button"
                    className="ghost-button small danger"
                    onClick={() => handleDeleteMachine(row)}
                  >
                    Eliminar
                  </button>
                </div>
              )
            }
          ]}
          rows={machines}
        />
      </section>

      <section className="card dashboard-section-card">
        <div className="dashboard-section-header">
          <h3>Gastos de mantenimiento</h3>
        </div>
        <DataTable
          columns={[
            { key: 'fecha', label: 'Fecha', render: (row) => dateFmt(row.fecha) },
            {
              key: 'machineryId',
              label: 'Maquinaria',
              render: (row) => machines.find((item) => item.id === row.machineryId)?.nombre || '-'
            },
            { key: 'concepto', label: 'Mantenimiento' },
            { key: 'horas', label: 'Horas' },
            {
              key: 'proximoService',
              label: 'Próximo service',
              render: (row) => row.proximoService ? `${Number(row.horas) + Number(row.proximoService)} hs` : '-'
            },
            { key: 'costo', label: 'Costo', render: (row) => money(row.costo) },
            {
              key: 'actions',
              label: 'Acciones',
              render: (row) => (
                <div className="inline-actions">
                  <button type="button" className="ghost-button small" onClick={() => openEditMaintenanceModal(row)}>Editar</button>
                  <button
                    type="button"
                    className="ghost-button small danger"
                    onClick={() => window.confirm(`¿Eliminar el mantenimiento "${row.concepto}"?`) && removeItem('machineryMaintenance', row.id)}
                  >
                    Eliminar
                  </button>
                </div>
              )
            }
          ]}
          rows={maint}
        />
      </section>

      {isMachineFormOpen ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="dashboard-section-header">
              <h3>{editingMachine ? 'Editar maquinaria' : 'Agregar maquinaria'}</h3>
              <button type="button" className="ghost-button small" onClick={closeMachineForm}>Cerrar</button>
            </div>

            <SimpleForm
              fields={[
                { name: 'nombre', label: 'Nombre' },
                { name: 'tipo', label: 'Tipo' },
                { name: 'marca', label: 'Marca' },
                { name: 'modelo', label: 'Modelo' },
                { name: 'horasActuales', label: 'Horas actuales', type: 'number' }
              ]}
              initialValues={editingMachine || undefined}
              formKey={`${companyId}-${editingMachine?.id || 'new-machine'}`}
              onSubmit={submitMachine}
              onCancel={closeMachineForm}
              submitLabel={editingMachine ? 'Guardar cambios' : 'Agregar maquinaria'}
            />
          </div>
        </div>
      ) : null}

      {isMaintenanceFormOpen ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="dashboard-section-header">
              <h3>{editingMaintenance ? 'Editar mantenimiento' : 'Registrar mantenimiento'}</h3>
              <button type="button" className="ghost-button small" onClick={closeMaintenanceForm}>Cerrar</button>
            </div>

            <SimpleForm
              fields={[
                { name: 'machineryId', label: 'Maquinaria', type: 'select', options: machines.map((item) => ({ value: item.id, label: item.nombre })) },
                { name: 'fecha', label: 'Fecha', type: 'date' },
                { name: 'concepto', label: 'Trabajo' },
                { name: 'horas', label: 'Horas', type: 'number' },
                { name: 'costo', label: 'Costo', type: 'number' },
                { name: 'proximoService', label: 'Próximo service (horas)', type: 'number', required: false }
              ]}
              initialValues={editingMaintenance || undefined}
              formKey={`${companyId}-${editingMaintenance?.id || 'new-maintenance'}`}
              onSubmit={submitMaintenance}
              onCancel={closeMaintenanceForm}
              submitLabel={editingMaintenance ? 'Guardar cambios' : 'Registrar mantenimiento'}
            />
          </div>
        </div>
      ) : null}

      {serviceAlert ? (
        <div className="modal-backdrop">
          <div className="modal-card modal-card-alert">
            <div className="dashboard-section-header">
              <h3>Service vencido</h3>
              <button type="button" className="ghost-button small" onClick={() => setServiceAlert(null)}>Cerrar</button>
            </div>

            <div className="alert-copy">
              <p>
                En <strong>{serviceAlert.machineName}</strong> hay services pendientes antes de este nuevo registro.
              </p>
              <ul className="alert-list">
                {serviceAlert.details.map((item) => (
                  <li key={item.id}>
                    {item.concepto} vencido en {item.dueHours} horas
                  </li>
                ))}
              </ul>
              <p>Si quieres, puedes guardar igual el mantenimiento actual.</p>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="primary-button danger-button"
                onClick={() => {
                  const form = serviceAlert.form;
                  setServiceAlert(null);
                  persistMaintenance(form);
                }}
              >
                Guardar igual
              </button>
              <button type="button" className="ghost-button" onClick={() => setServiceAlert(null)}>
                Volver
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
