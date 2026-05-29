// src/components/reservas/ClienteReservasView.jsx
import { useEffect, useMemo, useState } from 'react';
import { useReservas } from '../../context/ReservasContext';
import { useAuth } from '../../context/AuthContext';
import ReservaCard from './ReservaCard';
import NuevaReservaClienteModal from './NuevaReservaClienteModal';
import ReservaModalCancelar from './ReservaModalCancelar';
import LoadingSpinner from '../ui/LoadingSpinner';
import EmptyState from '../ui/EmptyState';

export default function ClienteReservasView() {
    const { reservas, loading, fetchReservas, cancelarReserva, confirmarReserva } = useReservas();
    const { user } = useAuth();
    
    const [modalNueva, setModalNueva] = useState(false);
    const [modalCancelar, setModalCancelar] = useState({ isOpen: false, data: null });

    useEffect(() => {
        fetchReservas();
    }, [fetchReservas]);

    // Filtrar solo las reservas del usuario logueado
    const misReservas = useMemo(() => {
        return reservas.filter(r => r.cliente?.idUsuario === user?.id || r.reservador?.email === user?.email);
    }, [reservas, user]);

    const handleCancelar = async (idReserva, fueraDePlazo) => {
        await cancelarReserva(idReserva, fueraDePlazo);
        setModalCancelar({ isOpen: false, data: null });
    };

    const handlePagar = async (idReserva) => {
        alert("Redirigiendo a MercadoPago...");
        setTimeout(async () => {
            await confirmarReserva(idReserva);
            alert("Pago validado. Reserva confirmada exitosamente.");
        }, 1500);
    };

    if (loading && misReservas.length === 0) return <LoadingSpinner />;

    return (
        <div className="cliente-reservas-container" style={{ width: '100%', padding: '0 20px' }}>
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Mis Reservas</h2>
                    <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0'}}>
                        Gestioná tus turnos y pagos.
                    </p>
                </div>
                <div className="crud-toolbar-right">
                    <button className="btn-primary-action" onClick={() => setModalNueva(true)}>
                        <i data-lucide="calendar-plus" /> Reservar Cancha
                    </button>
                </div>
            </div>

            {misReservas.length === 0 ? (
                <EmptyState message="Aún no tienes canchas reservadas. ¡Animate a jugar!" />
            ) : (
                <div className="reservas-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                    {misReservas.map(reserva => (
                        <ReservaCard 
                            key={reserva.idReserva} 
                            reserva={reserva} 
                            onCancelar={() => setModalCancelar({ isOpen: true, data: reserva })}
                            onPagar={() => handlePagar(reserva.idReserva)}
                        />
                    ))}
                </div>
            )}

            {modalNueva && (
                <NuevaReservaClienteModal onClose={() => setModalNueva(false)} />
            )}

            {modalCancelar.isOpen && (
                <ReservaModalCancelar
                    reserva={modalCancelar.data}
                    onClose={() => setModalCancelar({ isOpen: false, data: null })}
                    onCancel={handleCancelar}
                />
            )}
        </div>
    );
}