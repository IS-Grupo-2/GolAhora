import { useState, useEffect } from 'react';
import { useRecibos } from '../../context/RecibosContext';
import { useCobros } from '../../context/CobrosContext';
import { useAuth } from '../../context/AuthContext';
import useRole from '../../hooks/useRole';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import RecibosTable from '../../components/recibos/RecibosTable';
import ReciboModal from '../../components/recibos/ReciboModal';
import ReciboModalDetalle from '../../components/recibos/ReciboModalDetalle';
import ReciboModalBaja from '../../components/recibos/ReciboModalBaja';

function normalizarBusqueda(valor) {
    return String(valor || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

export default function RecibosPageContent() {
    const { items: recibos, loading, error, crearItem, modificarItem } = useRecibos();
    const { items: cobros, modificarItem: modificarCobro} = useCobros();
    const { user } = useAuth();
    const { isAdmin, isClient } = useRole();
    const [filtro, setFiltro] = useState('');
    const [modalForm, setModalForm] = useState({ open: false, modo: 'nuevo', recibo: null });
    const [modalDetalle, setModalDetalle] = useState({ open: false, recibo: null });
    const [modalBaja, setModalBaja] = useState({ open: false, recibo: null });

    const handleGuardar = (datos) => {
        if (modalForm.modo === 'editar') {
            modificarItem(datos);
        } else {
            crearItem(datos);
            
            if (datos.cobro) {
                modificarCobro({
                    ...datos.cobro,
                    estado: 'pagado'
                });
            }
        }
        setModalForm({ open: false, modo: 'nuevo', recibo: null });
    };

    const handleToggleEstado = (recibo) => {
        modificarItem({ ...recibo, estado: recibo.estado === 'emitido' ? 'anulado' : 'emitido' });
        setModalBaja({ open: false, recibo: null });
    };

    const recibosBase = Array.isArray(recibos) ? recibos : [];
    const cobrosBase = Array.isArray(cobros) ? cobros : [];
    const cobrosPendientes = cobrosBase.filter(c => c.estado !== 'pagado');

    const recibosVisibles = isClient
        ? recibosBase.filter(r =>
            r.cliente?.idUsuario === (user?.idUsuario || user?.id) ||
            r.cliente?.email === user?.email
        )
        : recibosBase;

    const busqueda = normalizarBusqueda(filtro.trim());
    const recibosFiltrados = busqueda
        ? recibosVisibles.filter(r => [
            r?.nroRecibo,
            r?.cobro?.concepto,
            r?.concepto,
            r?.cliente?.nombre,
            r?.cliente?.apellido,
            r?.cliente?.email,
        ].some(valor => normalizarBusqueda(valor).includes(busqueda)))
        : recibosVisibles;
     useEffect(() => {
            if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
        });

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <>
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">{isClient ? 'Mis Recibos' : 'Recibos de Pago'}</h2>
                    <span className="crud-count">{recibosFiltrados.length} emitidos</span>
                </div>
                <div className="crud-toolbar-right">
                    <div className="search-box">
                        <i data-lucide="search" />
                        <input
                            type="text"
                            placeholder="Buscar por número o concepto..."
                            value={filtro}
                            onChange={e => setFiltro(e.target.value)}
                        />
                    </div>
                    
                </div>
            </div>

            <div className="panel-card tabla-panel">
                {recibosFiltrados.length === 0 ? <EmptyState message={isClient ? 'Aún no tenés recibos emitidos.' : 'No hay recibos.'} /> : (
                    <RecibosTable recibos={recibosFiltrados} filtro={filtro} onLimpiarFiltro={() => setFiltro('')} isAdmin={isAdmin} onVer={(r) => setModalDetalle({ open: true, recibo: r })} onEditar={(r) => setModalForm({ open: true, modo: 'editar', recibo: r })} onBaja={(r) => setModalBaja({ open: true, recibo: r })} onImprimir={() => window.print()} />
                )}
            </div>
            
            {/* Inyectamos cobrosPendientes desde CobrosContext */}
            <ReciboModal open={modalForm.open} modo={modalForm.modo} recibo={modalForm.recibo} cobrosPendientes={cobrosPendientes} onGuardar={handleGuardar} onCerrar={() => setModalForm({ open: false, modo: 'nuevo', recibo: null })} />
            <ReciboModalDetalle open={modalDetalle.open} recibo={modalDetalle.recibo} onImprimir={() => window.print()} onCerrar={() => setModalDetalle({ open: false, recibo: null })} />
            <ReciboModalBaja open={modalBaja.open} recibo={modalBaja.recibo} onConfirmar={handleToggleEstado} onCerrar={() => setModalBaja({ open: false, recibo: null })} />
        </>
    );
}
