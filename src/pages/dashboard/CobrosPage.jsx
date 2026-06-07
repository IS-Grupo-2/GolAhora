import { useState, useEffect } from 'react';
import { useCobros } from '../../context/CobrosContext';
import { useClientes } from '../../context/ClientesContext';
import { useReservas } from '../../context/ReservasContext';
import { useClases } from '../../context/ClasesContext';
import { useTorneos } from '../../context/TorneosContext';
import { useDescuentos } from '../../context/DescuentosContext';
import useRole from '../../hooks/useRole';
import Can from '../../components/Can';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import CobrosTable from '../../components/cobros/CobrosTable';
import CobroModal from '../../components/cobros/CobroModal';
import CobroModalDetalle from '../../components/cobros/CobroModalDetalle';
import CobroModalBaja from '../../components/cobros/CobroModalBaja';

export default function CobrosPageContent() {
    const { items: cobros, loading, error, crearItem, modificarItem } = useCobros();
    const { clientes } = useClientes();
    const { reservas } = useReservas();
    const { clases } = useClases();
    const { competencias, equipos } = useTorneos();
    const { descuentos } = useDescuentos();
    const { isAdmin } = useRole();
    const [filtro, setFiltro] = useState('');
    const [modalForm, setModalForm] = useState({ open: false, modo: 'nuevo', cobro: null });
    const [modalDetalle, setModalDetalle] = useState({ open: false, cobro: null });
    const [modalBaja, setModalBaja] = useState({ open: false, cobro: null });

    const clienteId = (cliente) => cliente?.idUsuario || cliente?.id;
    const cobroYaPagado = (cliente, concepto) => cobros.some(c =>
        c.estado === 'pagado' &&
        clienteId(c.cliente) === clienteId(cliente) &&
        c.concepto === concepto
    );

    const operacionesPendientes = [
        ...cobros
            .filter(c => c.estado === 'pendiente')
            .map(c => ({
                id: `cobro-${c.idCobro}`,
                clienteId: clienteId(c.cliente),
                tipoCobro: c.tipoCobro || 'Reserva Cancha',
                concepto: c.concepto,
                monto: Number(c.montoFinal ?? c.monto ?? 0),
                referencia: { idCobro: c.idCobro, idReserva: c.idReserva },
                detalle: 'Cobro pendiente',
            })),
        ...reservas
            .filter(r =>
                r.estado !== 'cancelada' &&
                r.cobro?.estado !== 'pagado' &&
                !cobros.some(c => c.idReserva === r.idReserva)
            )
            .map(r => ({
                id: `reserva-${r.idReserva}`,
                clienteId: clienteId(r.cliente) || r.reservador?.id,
                tipoCobro: 'Reserva Cancha',
                concepto: `Reserva ${r.cancha?.nombre || 'Cancha'} - ${r.fechaUso} ${r.horaInicio || ''}`.trim(),
                monto: Number(r.montoTotal || 0),
                referencia: { idReserva: r.idReserva },
                detalle: 'Reserva pendiente de pago',
            })),
        ...clases.flatMap(clase => (clase.alumnos || []).map(alumno => {
            const concepto = `Inscripcion clase: ${clase.nombre}`;
            return {
                id: `clase-${clase.idClase}-${alumno.id}`,
                clienteId: alumno.id,
                tipoCobro: clase.tipoClase === 'Particular' ? 'Entrenamiento' : 'Clase/Entrenamiento',
                concepto,
                monto: Number(clase.precio || 0),
                referencia: { idClase: clase.idClase },
                detalle: `${clase.tipoClase} - ${clase.fecha} ${clase.horario || ''}`.trim(),
            };
        })),
        ...competencias.flatMap(comp => (comp.equipos || []).flatMap(idEquipo => {
            const equipo = equipos.find(e => e.idEquipo === idEquipo);
            const miembros = [equipo?.capitan, ...(equipo?.integrantes || [])].filter(Boolean);
            return miembros.map(nombreMiembro => {
                const cliente = clientes.find(c => `${c.nombre} ${c.apellido}`.trim() === nombreMiembro);
                const concepto = `Inscripcion competencia: ${comp.nombre}`;
                return cliente ? {
                    id: `torneo-${comp.id}-${idEquipo}-${clienteId(cliente)}`,
                    clienteId: clienteId(cliente),
                    tipoCobro: 'Inscripcion Torneo',
                    concepto,
                    monto: Number(comp.precioInscripcion || 10000),
                    referencia: { idCompetencia: comp.id, idEquipo },
                    detalle: `${comp.tipo} - ${equipo?.nombre || 'Equipo'}`,
                } : null;
            }).filter(Boolean);
        })),
    ].filter(op => {
        const cliente = clientes.find(c => clienteId(c) === op.clienteId);
        return op.monto > 0 && cliente && !cobroYaPagado(cliente, op.concepto);
    });

    const handleGuardar = (datos) => {
        if (modalForm.modo === 'editar') {
            modificarItem(datos);
        } else if (datos.referencia?.idCobro) {
            modificarItem({
                ...datos,
                idCobro: datos.referencia.idCobro,
                estado: 'pagado'
            });
        } else {
            crearItem(datos);
        }
        setModalForm({ open: false, modo: 'nuevo', cobro: null });
    };

    const handleToggleEstado = (cobro) => {
        modificarItem({ ...cobro, estado: cobro.estado === 'pagado' ? 'anulado' : 'pagado' });
        setModalBaja({ open: false, cobro: null });
    };

// RF49: Imprimir el Cobro 
    const handleImprimirCobro = (cobro) => {
        const contenidoTxt = `
============================================================
                        GOL AHORA                           
            Comprobante de Cobro Interno                 
============================================================
ID de Cobro:      #${String(cobro.idCobro || cobro.id).padStart(5, '0')}
Fecha de Emisión: ${cobro.fecha}
Estado:           ${cobro.estado.toUpperCase()}
------------------------------------------------------------
DATOS DEL CLIENTE:
Nombre y Apellido: ${cobro.cliente?.nombre} ${cobro.cliente?.apellido}
DNI:               ${cobro.cliente?.dni}
------------------------------------------------------------
DETALLE DE LA OPERACIÓN:
Concepto:         ${cobro.concepto}
Tipo de Cobro:    ${cobro.tipoCobro || 'Servicio'}
------------------------------------------------------------
TOTAL A ABONAR:   $${Number(cobro.montoFinal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
============================================================
        `.trim();

        const blob = new Blob([contenidoTxt], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Cobro_${String(cobro.idCobro || cobro.id).padStart(5, '0')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const normalizarTexto = (texto) => {
        return texto
            .toString()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    };

    const cobrosFiltrados = cobros.filter(c => {
        const busqueda = normalizarTexto(filtro);

        const nombreCompleto = normalizarTexto(`${c.cliente?.nombre || ''} ${c.cliente?.apellido || ''}`);
        const concepto = normalizarTexto(c.concepto || '');
        const idCobro = String(c.idCobro || '');

        return  nombreCompleto.includes(busqueda) || 
                concepto.includes(busqueda) ||
                idCobro.includes(busqueda);
    });

     useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    });

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <Can roles={['Admin', 'Employee']}>
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Gestión de Cobros</h2>
                </div>
                <div className="crud-toolbar-right">
                    <div className="search-box">
                        <i data-lucide="search" />
                        <input type="text" placeholder="Buscar..." value={filtro} onChange={e => setFiltro(e.target.value)} />
                    </div>
                    
                </div>
            </div>

            <div className="panel-card tabla-panel">
                {cobrosFiltrados.length === 0 ? <EmptyState message="No hay cobros registrados." /> : (
                    <CobrosTable
                        cobros={cobrosFiltrados}
                        isAdmin={isAdmin} // Pasamos isAdmin para ocultar botones de edición
                        onVer={(c) => setModalDetalle({ open: true, cobro: c })}
                        onEditar={(c) => setModalForm({ open: true, modo: 'editar', cobro: c })}
                        onBaja={(c) => setModalBaja({ open: true, cobro: c })}
                        onImprimir={handleImprimirCobro}
                        onCerrar={() => setModalDetalle({open: false, cobro: null})}
                    />
                )}
            </div>

            <CobroModal open={modalForm.open} modo={modalForm.modo} cobro={modalForm.cobro} 
                clientes={clientes} descuentos={descuentos.filter(d => d.activo)} operacionesPendientes={operacionesPendientes} onGuardar={handleGuardar} onCerrar={() => setModalForm({ open: false, modo: 'nuevo', cobro: null })} />
            <CobroModalDetalle open={modalDetalle.open} cobro={modalDetalle.cobro} onImprimir={() => window.print()} onCerrar={() => setModalDetalle({ open: false, cobro: null })} />
            <CobroModalBaja open={modalBaja.open} cobro={modalBaja.cobro} onConfirmar={handleToggleEstado} onCerrar={() => setModalBaja({ open: false, cobro: null })} />
        </Can>
    );
}
