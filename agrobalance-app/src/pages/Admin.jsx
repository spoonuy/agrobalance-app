import { useApp } from '../context/AppContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';

export default function Admin() {
  const { state, updateItem } = useApp();
  const rows = state.users;
  return (
    <div className="page-stack">
      <PageHeader title="Admin" description="Aprueba nuevos usuarios y controla el acceso a la plataforma." />
      <DataTable columns={[
        { key: 'nombre', label: 'Usuario' },
        { key: 'email', label: 'Email' },
        { key: 'rol', label: 'Rol' },
        { key: 'estado', label: 'Estado' },
        { key: 'actions', label: 'Acciones', render: (row) => row.estado === 'pendiente' ? <div className='inline-actions'><button className='ghost-button small' onClick={() => updateItem('users', row.id, { estado: 'activo' })}>Aprobar</button><button className='ghost-button small danger' onClick={() => updateItem('users', row.id, { estado: 'bloqueado' })}>Bloquear</button></div> : '-' }
      ]} rows={rows} />
    </div>
  );
}
