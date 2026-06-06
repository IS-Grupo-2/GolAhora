import useRole from '../../hooks/useRole';
import AdminReservasView from '../../components/reservas/AdminReservasView';
import ClienteReservasView from '../../components/reservas/ClienteReservasView';

// Switch: Admin/Empleado ven tabla con CRUD completo. Clientes ven sus propias cards.
export default function EnrutadorDeReservas() {

    const { isAdmin, isEmpleado } = useRole();

    if (isAdmin || isEmpleado) {
        return <AdminReservasView />;
    }

    return <ClienteReservasView />;
}