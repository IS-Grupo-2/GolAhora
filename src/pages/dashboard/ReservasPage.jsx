import { useEffect, useState } from 'react';
import '../../styles/pages/usuarios.css';
import ReservasTable from '../../components/reservas/ReservasTable';
import ReservaModal from '../../components/reservas/ReservaModal';
import ReservaModalDetalle from '../../components/reservas/ReservaModalDetalle';
import ReservaModalCancelar from '../../components/reservas/ReservaModalCancelar';

// Mock data basada en tu UML: RESERVA
const MOCK_RESERVAS = [
    {
        idReserva: 1,
        reservador: { id: 101, nombre: 'Juan Pérez', email: 'juan@mail.com', rol: 'cliente' },
        cancha: { id: 1, nombre: 'Cancha 1 (Fútbol 5)', numero: 1 },
        fechaCreacion: '2026-05-20T10:00:00',
        fechaUso: '2026-05-25',
        horaInicio: '18:00',
        horaFin: '19:00',
        duracionMin: 60,
        estado: 'confirmada', // confirmada, pendiente, cancelada
        montoTotal: 15000,
        cobro: { estado: 'pagado', metodo: 'MercadoPago' }
    },
    {
        idReserva: 2,
        reservador: { id: 102, nombre: 'María Gómez', email: 'maria@mail.com', rol: 'profesor' },
        cancha: { id: 2, nombre: 'Cancha 2 (Pádel)', numero: 2 },
        fechaCreacion: '2026-05-21T14:30:00',
        fechaUso: '2026-05-26',
        horaInicio: '20:00',
        horaFin: '21:30',
        duracionMin: 90,
        estado: 'pendiente', 
        montoTotal: 12000,
        cobro: { estado: 'pendiente', metodo: null }
    },
    {
        idReserva: 3,
        reservador: { id: 103, nombre: 'Lucas Medina', email: 'lucas@club.com', rol: 'empleado' },
        cancha: { id: 1, nombre: 'Cancha 1 (Fútbol 5)', numero: 1 },
        fechaCreacion: '2026-05-22T09:15:00',
        fechaUso: '2026-05-28',
        horaInicio: '17:00',
        horaFin: '18:30',
        duracionMin: 90,
        estado: 'confirmada',
        montoTotal: 18000,
        cobro: { estado: 'pagado', metodo: 'MercadoPago' }
    },
    {
        idReserva: 4,
        reservador: { id: 104, nombre: 'Ana Morales', email: 'ana@club.com', rol: 'admin' },
        cancha: { id: 2, nombre: 'Cancha 2 (Pádel)', numero: 2 },
        fechaCreacion: '2026-05-22T11:20:00',
        fechaUso: '2026-05-29',
        horaInicio: '19:00',
        horaFin: '20:00',
        duracionMin: 60,
        estado: 'pendiente',
        montoTotal: 13000,
        cobro: { estado: 'pendiente', metodo: null }
    }
];

export default function ReservasPage() {
    const [reservas, setReservas] = useState(MOCK_RESERVAS);
    const [filtro, setFiltro] = useState('');

    // Estados de modales
    const [modalForm, setModalForm] = useState({ isOpen: false, data: null });
    const [modalDetalle, setModalDetalle] = useState({ isOpen: false, data: null });
    const [modalCancelar, setModalCancelar] = useState({ isOpen: false, data: null });

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) {
            window.lucide.createIcons();
        }
    }, [modalForm.isOpen, modalDetalle.isOpen, modalCancelar.isOpen, reservas]);

    // Handlers
    const handleGuardar = (reserva) => {
        // RF19 (Registrar) y RF20 (Modificar)
        setReservas(prev => {
            if (!reserva?.idReserva) {
                const nuevaReserva = {
                    ...reserva,
                    idReserva: Date.now(),
                    reservador: reserva.reservador || { id: 999, nombre: 'Usuario Nuevo', email: 'nuevo@club.com', rol: 'cliente' },
                    cancha: reserva.cancha || { id: 1, nombre: 'Cancha 1 (Fútbol 5)', numero: 1 },
                    fechaUso: reserva.fechaUso || '2026-06-01',
                    horaInicio: reserva.horaInicio || '18:00',
                    horaFin: reserva.horaFin || '19:00',
                    duracionMin: reserva.duracionMin || 60,
                    estado: reserva.estado || 'pendiente',
                    montoTotal: reserva.montoTotal || 0,
                    cobro: reserva.cobro || { estado: 'pendiente', metodo: null }
                };
                return [nuevaReserva, ...prev];
            }
            return prev.map(item => item.idReserva === reserva.idReserva ? { ...item, ...reserva } : item);
        });
        setModalForm({ isOpen: false, data: null });
    };

    const handleConfirmarPago = (idReserva) => {
        // RF24 - Confirmar reserva solo cuando el pago esté validado
        setReservas(prev => prev.map(r => r.idReserva === idReserva ? {
            ...r,
            estado: 'confirmada',
            cobro: { ...r.cobro, estado: 'pagado', metodo: r.cobro?.metodo || 'MercadoPago' }
        } : r));
        setModalDetalle({ isOpen: false, data: null });
    };

    const handleCancelar = (idReserva, aplicaCargo) => {
        // RF22, RF25, RF26 - Cancelación, penalidades y reembolsos
        setReservas(prev => prev.map(r => {
            if (r.idReserva !== idReserva) return r;
            const estadoCobro = aplicaCargo ? 'cancelado' : (r.cobro?.estado === 'pagado' ? 'reembolsado' : 'cancelado');
            return {
                ...r,
                estado: 'cancelada',
                cobro: { ...r.cobro, estado: estadoCobro }
            };
        }));
        setModalCancelar({ isOpen: false, data: null });
    };

    const confirmadas = reservas.filter(r => r.estado === 'confirmada').length;
    const pendientes = reservas.filter(r => r.estado === 'pendiente').length;
    const reservasFiltradas = reservas.filter(r => {
        if (!filtro) return true;
        const q = filtro.toLowerCase().trim();
        return [
            r.reservador.nombre,
            r.reservador.email,
            r.reservador.rol,
            r.cancha.nombre,
            String(r.cancha.numero),
            r.estado
        ].some(field => field?.toLowerCase().includes(q));
    });

    return (
        <>
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Reservas</h2>
                    <span className="crud-count">{reservas.length} totales</span>
                </div>
                <div className="crud-toolbar-right">
                    <div className="search-box">
                        <i data-lucide="search" />
                        <input
                            type="text"
                            placeholder="Buscar usuario, rol o cancha…"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    <button className="btn-primary-action" onClick={() => setModalForm({ isOpen: true, data: null })}>
                        <i data-lucide="plus" /> Nueva Reserva
                    </button>
                </div>
            </div>

            <div className="crud-mini-stats">
                <div className="mini-stat">
                    <span className="mini-stat-num">{reservas.length}</span>
                    <span className="mini-stat-label">Totales</span>
                </div>
                <div className="mini-stat green">
                    <span className="mini-stat-num">{confirmadas}</span>
                    <span className="mini-stat-label">Confirmadas</span>
                </div>
                <div className="mini-stat red">
                    <span className="mini-stat-num">{pendientes}</span>
                    <span className="mini-stat-label">Pendientes</span>
                </div>
            </div>

            <div className="panel-card tabla-panel">
                <ReservasTable 
                    reservas={reservasFiltradas}
                    filtro={filtro}
                    onVer={(r) => setModalDetalle({ isOpen: true, data: r })}
                    onEditar={(r) => setModalForm({ isOpen: true, data: r })}
                    onCancelar={(r) => setModalCancelar({ isOpen: true, data: r })}
                />
            </div>

            {/* Modales */}
            {modalForm.isOpen && (
                <ReservaModal 
                    reserva={modalForm.data} 
                    onClose={() => setModalForm({ isOpen: false, data: null })}
                    onSave={handleGuardar}
                />
            )}

            {modalDetalle.isOpen && (
                <ReservaModalDetalle 
                    reserva={modalDetalle.data} 
                    onClose={() => setModalDetalle({ isOpen: false, data: null })}
                    onConfirm={handleConfirmarPago}
                />
            )}

            {modalCancelar.isOpen && (
                <ReservaModalCancelar 
                    reserva={modalCancelar.data} 
                    onClose={() => setModalCancelar({ isOpen: false, data: null })}
                    onCancel={handleCancelar}
                />
            )}
        </>
    );
}