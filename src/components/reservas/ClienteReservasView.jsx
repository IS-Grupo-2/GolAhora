import { useEffect, useMemo, useState } from 'react';
import { useReservas } from '../../context/ReservasContext';
import { useCobros } from '../../context/CobrosContext';
import { useRecibos } from '../../context/RecibosContext';
import { useAuth } from '../../context/AuthContext';
import { calcularPoliticaReembolso, crearReciboReembolsoReserva, reservaEstaPagada } from '../../utils/reservasReembolso';
import ReservaCard from './ReservaCard';
import NuevaReservaClienteModal from './NuevaReservaClienteModal';
import ReservaModalCancelar from './ReservaModalCancelar';
import PagoReservaModal from './PagoReservaModal';
import LoadingSpinner from '../ui/LoadingSpinner';
import EmptyState from '../ui/EmptyState';
import { formatearFecha } from '../../utils/fechas';

export default function ClienteReservasView() {
    const { reservas, loading, fetchReservas, cancelarReserva, confirmarReserva } = useReservas();
    const { items: cobros, modificarItem: modificarCobro, crearItem: crearCobro } = useCobros();
    const { items: recibos, crearItem: crearRecibo } = useRecibos();
    const { user } = useAuth();

    const [modalNueva, setModalNueva] = useState(false);
    const [modalCancelar, setModalCancelar] = useState({ isOpen: false, data: null });
    const [modalPago, setModalPago] = useState({ isOpen: false, data: null });

    useEffect(() => {
        fetchReservas();
    }, [fetchReservas]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    });

    const misReservas = useMemo(() => {
        return reservas.filter(r =>
            r.cliente?.idUsuario === user?.idUsuario ||
            r.cliente?.idUsuario === user?.id ||
            r.reservador?.email === user?.email
        );
    }, [reservas, user]);

    const handleCancelar = async (idReserva) => {
        const reserva = reservas.find(r => r.idReserva === idReserva);
        const cobroAsociado = cobros.find(c => c.idReserva === idReserva);

        if (reserva && reservaEstaPagada(reserva, cobroAsociado)) {
            const politica = calcularPoliticaReembolso(reserva);
            const yaTieneReembolso = recibos.some(r => r.tipo === 'reembolso' && r.idReserva === idReserva);

            if (!yaTieneReembolso) {
                await crearRecibo(crearReciboReembolsoReserva({ reserva, cobroAsociado, politica }));
            }
        }

        await cancelarReserva(idReserva);

        if (cobroAsociado) {
            await modificarCobro({
                ...cobroAsociado,
                estado: 'cancelado'
            });
        }

        setModalCancelar({ isOpen: false, data: null });
    };

    const handleConfirmarPago = async (datosPago) => {
        const reserva = modalPago.data;
        if (!reserva) return;

        await confirmarReserva(reserva.idReserva, datosPago);

        const cobroAsociado = cobros.find(c => c.idReserva === reserva.idReserva);
        if (cobroAsociado) {
            await modificarCobro({
                ...cobroAsociado,
                estado: 'pagado',
                metodo: datosPago.metodo,
                nroTransaccion: datosPago.nroTransaccion,
                detallePago: datosPago.detallePago,
                descuento: datosPago.descuento,
                montoFinal: datosPago.montoFinal ?? cobroAsociado.montoFinal ?? cobroAsociado.monto
            });
        } else {
            await crearCobro({
                idReserva: reserva.idReserva,
                cliente: reserva.cliente,
                concepto: `Reserva ${reserva.cancha?.nombre || 'Cancha'} - ${formatearFecha(reserva.fechaUso)}`,
                tipoCobro: 'Reserva Cancha',
                monto: reserva.montoTotal,
                montoFinal: datosPago.montoFinal ?? reserva.montoTotal,
                descuento: datosPago.descuento,
                estado: 'pagado',
                metodo: datosPago.metodo,
                nroTransaccion: datosPago.nroTransaccion,
                detallePago: datosPago.detallePago
            });
        }

        setModalPago({ isOpen: false, data: null });
    };

    if (loading && misReservas.length === 0) return <LoadingSpinner />;

    return (
        <div className="cliente-reservas-container" style={{ width: '100%', padding: '0 20px' }}>
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Mis Reservas</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0' }}>
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
                <EmptyState message="Aún no tenés canchas reservadas. Animate a jugar." />
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    marginTop: '1.5rem'
                }}>
                    {misReservas.map(reserva => (
                        <ReservaCard
                            key={reserva.idReserva}
                            reserva={reserva}
                            onCancelar={() => setModalCancelar({ isOpen: true, data: reserva })}
                            onPagar={() => setModalPago({ isOpen: true, data: reserva })}
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

            {modalPago.isOpen && (
                <PagoReservaModal
                    reserva={modalPago.data}
                    onClose={() => setModalPago({ isOpen: false, data: null })}
                    onConfirmar={handleConfirmarPago}
                />
            )}
        </div>
    );
}
