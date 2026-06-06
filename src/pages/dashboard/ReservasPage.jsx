import useRole from '../../hooks/useRole';
import AdminReservasView from '../../components/reservas/AdminReservasView'; 
import ClienteReservasView from '../../components/reservas/ClienteReservasView';

// Este componente funciona como un Switch: Admin/Empleado ven la tabla, Clientes ven las Cards.
export default function EnrutadorDeReservas() {
  const { isAdmin, isEmployee } = useRole();

  if (isAdmin || isEmployee) {
    return <AdminReservasView />; 
  }

  return <ClienteReservasView />;
}
