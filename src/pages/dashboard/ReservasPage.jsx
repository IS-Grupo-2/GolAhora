// src/pages/dashboard/ReservasPage.jsx
import { ReservasProvider } from '../../context/ReservasContext';
import { CanchasProvider } from '../../context/CanchasContext';
import useRole from '../../hooks/useRole';

// Importamos las dos vistas
import AdminReservasView from '../../components/reservas/AdminReservasView'; 
import ClienteReservasView from '../../components/reservas/ClienteReservasView';

// Este componente funciona como un Switch: Admin/Empleado ven la tabla, Clientes ven las Cards.
function EnrutadorDeReservas() {
  const { isAdmin, isEmpleado } = useRole();

  if (isAdmin || isEmpleado) {
    return <AdminReservasView />; 
  }

  // Si es Cliente (o Profesor si quieres que vean esta misma vista), mostramos la vista de Cards
  return <ClienteReservasView />;
}

export default function ReservasPage() {
  return (
    // Agregamos CanchasProvider porque ClienteReservasView (y su modal) necesitan la info de las canchas para reservar
    <CanchasProvider>
      <ReservasProvider>
        <EnrutadorDeReservas />
      </ReservasProvider>
    </CanchasProvider>
  );
}