// src/components/reservas/ClienteReservasView.jsx
import { useEffect, useMemo, useState } from 'react';
import { useReservas } from '../../context/ReservasContext';
import { useCobros } from '../../context/CobrosContext';
import { useAuth } from '../../context/AuthContext';
import ReservaCard from './ReservaCard';
import NuevaReservaClienteModal from './NuevaReservaClienteModal';
import ReservaModalCancelar from './ReservaModalCancelar';
import LoadingSpinner from '../ui/LoadingSpinner';
import EmptyState from '../ui/EmptyState';

export default function ClienteReservasView() {
    const { reservas, loading, fetchReservas, cancelarReserva, confirmarReserva } = useReservas();
    const { items: cobros, modificarItem: modificarCobro } = useCobros();
    const { user } = useAuth();
    
    const [modalNueva, setModalNueva] = useState(false);
    const [modalCancelar, setModalCancelar] = useState({ isOpen: false, data: null });

    useEffect(() => {
        fetchReservas();
    }, [fetchReservas]);

    // Filtrar solo las reservas del usuario logueado
    const misReservas = useMemo(() => {
        return reservas.filter(r => r.cliente?.idUsuario === user?.idUsuario || r.reservador?.email === user?.email);
    }, [reservas, user]);

    const handleCancelar = async (idReserva, fueraDePlazo) => {
        // 1. Cancelar reserva
        await cancelarReserva(idReserva, fueraDePlazo);
        
        // 2. Sincronizar: Actualizar cobro asociado
        const cobroAsociado = cobros.find(c => c.idReserva === idReserva);
        if (cobroAsociado) {
            const nuevoEstadoCobro = fueraDePlazo ? 'recargo' : 'cancelado';
            await modificarCobro({
                ...cobroAsociado,
                estado: nuevoEstadoCobro
            });
        }
        
        setModalCancelar({ isOpen: false, data: null });
    };

    const handlePagar = async (idReserva) => {
        alert("Redirigiendo a MercadoPago...");
        setTimeout(async () => {
            // 1. Confirmar reserva
            await confirmarReserva(idReserva);
            
            // 2. Sincronizar: Actualizar cobro a "pagado"
            const cobroAsociado = cobros.find(c => c.idReserva === idReserva);
            if (cobroAsociado) {
                await modificarCobro({
                    ...cobroAsociado,
                    estado: 'pagado',
                    metodo: cobroAsociado.metodo || 'MercadoPago'
                });
            }
            
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