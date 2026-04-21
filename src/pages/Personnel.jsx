import { useState } from 'react';
import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import SimpleForm from '../components/SimpleForm';
import DataTable from '../components/DataTable';
import { money, monthLabel } from '../utils/helpers';

export default function Personnel() {
  const { byCompany, activeCompany, addItem, updateItem, getRemovalBlockers, removeItem } = useApp();
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingSalaryEntry, setEditingSalaryEntry] = useState(null);
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [isSalaryFormOpen, setIsSalaryFormOpen] = useState(false);
  const companyId = activeCompany?.id;
  const employees = byCompany('employees');
  const salaryEntries = byCompany('salaryEntries').filter((entry) => employees.some((employee) => employee.id === entry.employeeId));

  if (!companyId) {
    return <div className="card">No hay una empresa activa seleccionada.</div>;
  }

  const closeEmployeeForm = () => {
    setEditingEmployee(null);
    setIsEmployeeFormOpen(false);
  };

  const closeSalaryForm = () => {
    setEditingSalaryEntry(null);
    setIsSalaryFormOpen(false);
  };

  const openNewEmployeeModal = () => {
    setEditingEmployee(null);
    setIsEmployeeFormOpen(true);
  };

  const openEditEmployeeModal = (employee) => {
    setEditingEmployee(employee);
    setIsEmployeeFormOpen(true);
  };

  const openNewSalaryModal = () => {
    setEditingSalaryEntry(null);
    setIsSalaryFormOpen(true);
  };

  const openEditSalaryModal = (entry) => {
    setEditingSalaryEntry(entry);
    setIsSalaryFormOpen(true);
  };

  const submitEmployee = (form) => {
    const payload = { ...form, companyId, sueldo: Number(form.sueldo) };

    if (editingEmployee) {
      updateItem('employees', editingEmployee.id, payload);
      closeEmployeeForm();
      return;
    }

    addItem('employees', payload);
    closeEmployeeForm();
  };

  const submitSalaryEntry = (form) => {
    const payload = { ...form, companyId, monto: Number(form.monto) };

    if (editingSalaryEntry) {
      updateItem('salaryEntries', editingSalaryEntry.id, payload);
      closeSalaryForm();
      return;
    }

    addItem('salaryEntries', payload);
    closeSalaryForm();
  };

  const handleDeleteEmployee = (employee) => {
    const blockers = getRemovalBlockers('employees', employee.id);
    if (blockers.length) {
      window.alert(`No se puede eliminar el empleado porque tiene registros asociados: ${blockers.map((item) => `${item.count} ${item.label}`).join(', ')}.`);
      return;
    }

    if (window.confirm(`¿Eliminar al empleado "${employee.nombre}"?`)) {
      removeItem('employees', employee.id);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Personal"
        description="Sueldos, aguinaldos, licencias y otros costos asociados al personal."
        action={(
          <div className="inline-actions">
            <button type="button" className="ghost-button small" onClick={openNewSalaryModal}>Registrar costo</button>
            <button type="button" className="primary-button small" onClick={openNewEmployeeModal}>Agregar empleado</button>
          </div>
        )}
      />

      <section className="card dashboard-section-card">
        <div className="dashboard-section-header">
          <h3>Registro de personal</h3>
        </div>
        <DataTable
          columns={[
            { key: 'nombre', label: 'Empleado' },
            { key: 'cargo', label: 'Cargo' },
            { key: 'fechaIngreso', label: 'Ingreso' },
            { key: 'sueldo', label: 'Sueldo', render: (row) => money(row.sueldo) },
            {
              key: 'actions',
              label: 'Acciones',
              render: (row) => (
                <div className="inline-actions">
                  <button type="button" className="ghost-button small" onClick={() => openEditEmployeeModal(row)}>Editar</button>
                  <button
                    type="button"
                    className="ghost-button small danger"
                    onClick={() => handleDeleteEmployee(row)}
                  >
                    Eliminar
                  </button>
                </div>
              )
            }
          ]}
          rows={employees}
        />
      </section>

      <section className="card dashboard-section-card">
        <div className="dashboard-section-header">
          <h3>Costos mensuales</h3>
        </div>
        <DataTable
          columns={[
            {
              key: 'employeeId',
              label: 'Empleado',
              render: (row) => employees.find((item) => item.id === row.employeeId)?.nombre || '-'
            },
            { key: 'mes', label: 'Mes', render: (row) => monthLabel(row.mes) },
            { key: 'tipo', label: 'Tipo' },
            { key: 'monto', label: 'Monto', render: (row) => money(row.monto) },
            {
              key: 'actions',
              label: 'Acciones',
              render: (row) => (
                <div className="inline-actions">
                  <button type="button" className="ghost-button small" onClick={() => openEditSalaryModal(row)}>Editar</button>
                  <button
                    type="button"
                    className="ghost-button small danger"
                    onClick={() => window.confirm(`¿Eliminar el registro de ${monthLabel(row.mes)}?`) && removeItem('salaryEntries', row.id)}
                  >
                    Eliminar
                  </button>
                </div>
              )
            }
          ]}
          rows={salaryEntries}
        />
      </section>

      {isEmployeeFormOpen ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="dashboard-section-header">
              <h3>{editingEmployee ? 'Editar empleado' : 'Agregar empleado'}</h3>
              <button type="button" className="ghost-button small" onClick={closeEmployeeForm}>Cerrar</button>
            </div>

            <SimpleForm
              fields={[
                { name: 'nombre', label: 'Nombre' },
                { name: 'cargo', label: 'Cargo' },
                { name: 'fechaIngreso', label: 'Fecha ingreso', type: 'date' },
                { name: 'sueldo', label: 'Sueldo mensual', type: 'number' }
              ]}
              initialValues={editingEmployee || undefined}
              formKey={`${companyId}-${editingEmployee?.id || 'new-employee'}`}
              onSubmit={submitEmployee}
              onCancel={closeEmployeeForm}
              submitLabel={editingEmployee ? 'Guardar cambios' : 'Agregar empleado'}
            />
          </div>
        </div>
      ) : null}

      {isSalaryFormOpen ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="dashboard-section-header">
              <h3>{editingSalaryEntry ? 'Editar costo' : 'Registrar costo'}</h3>
              <button type="button" className="ghost-button small" onClick={closeSalaryForm}>Cerrar</button>
            </div>

            <SimpleForm
              fields={[
                { name: 'employeeId', label: 'Empleado', type: 'select', options: employees.map((item) => ({ value: item.id, label: item.nombre })) },
                { name: 'mes', label: 'Mes', type: 'month' },
                { name: 'tipo', label: 'Tipo', type: 'select', options: [{ value: 'Sueldo', label: 'Sueldo' }, { value: 'Aguinaldo', label: 'Aguinaldo' }, { value: 'Licencia', label: 'Licencia' }, { value: 'Otro', label: 'Otro' }] },
                { name: 'monto', label: 'Monto', type: 'number' }
              ]}
              initialValues={editingSalaryEntry || undefined}
              formKey={`${companyId}-${editingSalaryEntry?.id || 'new-salary-entry'}`}
              onSubmit={submitSalaryEntry}
              onCancel={closeSalaryForm}
              submitLabel={editingSalaryEntry ? 'Guardar cambios' : 'Registrar costo'}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
