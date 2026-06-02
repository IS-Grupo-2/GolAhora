import useRole from '../../hooks/useRole';
import AdminReservasView from '../../components/reservas/AdminReservasView'; 
import ClienteReservasView from '../../components/reservas/ClienteReservasView';

// Este componente funciona como un Switch: Admin/Empleado ven la tabla, Clientes ven las Cards.
export default function EnrutadorDeReservas() {
  const { isAdmin, isEmpleado } = useRole();

  if (isAdmin || isEmpleado) {
    return <AdminReservasView />; 
  }

  // Si es Cliente (o Profesor si quieres que vean esta misma vista), mostramos la vista de Cards
  return <ClienteReservasView />;
}
