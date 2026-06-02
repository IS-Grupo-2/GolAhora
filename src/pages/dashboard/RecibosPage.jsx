import { useState, useEffect } from 'react';
import { useRecibos } from '../../context/RecibosContext';
import { useCobros } from '../../context/CobrosContext';
import useRole from '../../hooks/useRole';
import Can from '../../components/Can';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import RecibosTable from '../../components/recibos/RecibosTable';
import ReciboModal from '../../components/recibos/ReciboModal';
import ReciboModalDetalle from '../../components/recibos/ReciboModalDetalle';
import ReciboModalBaja from '../../components/recibos/ReciboModalBaja';

export default function RecibosPageContent() {
    const { items: recibos, loading, error, crearItem, modificarItem } = useRecibos();
    const { items: cobros, modificarItem: modificarCobro} = useCobros();
    const { isAdmin } = useRole();
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

    const cobrosPendientes = cobros.filter(c => c.estado !== 'pagado');

    const recibosFiltrados = filtro ? recibos.filter(r => r.nroRecibo.includes(filtro)) : recibos;
     useEffect(() => {
            if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
        });

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <Can roles={['admin', 'empleado']}>
            <div className="crud-toolbar">
                <div className="crud-toolbar-left"><h2 className="crud-title">Recibos de Pago</h2></div>
                <div className="crud-toolbar-right">
                    <button className="btn-primary-action" onClick={() => setModalForm({ open: true, modo: 'nuevo', recibo: null })}>
                        <i data-lucide="receipt" /> Emitir Recibo
                    </button>
                </div>
            </div>

            <div className="panel-card tabla-panel">
                {recibos.length === 0 ? <EmptyState message="No hay recibos." /> : (
                    <RecibosTable recibos={recibosFiltrados} isAdmin={isAdmin} onVer={(r) => setModalDetalle({ open: true, recibo: r })} onEditar={(r) => setModalForm({ open: true, modo: 'editar', recibo: r })} onBaja={(r) => setModalBaja({ open: true, recibo: r })} onImprimir={() => window.print()} />
                )}
            </div>
            
            {/* Inyectamos cobrosPendientes desde CobrosContext */}
            <ReciboModal open={modalForm.open} modo={modalForm.modo} recibo={modalForm.recibo} cobrosPendientes={cobrosPendientes} onGuardar={handleGuardar} onCerrar={() => setModalForm({ open: false, modo: 'nuevo', recibo: null })} />
            <ReciboModalDetalle open={modalDetalle.open} recibo={modalDetalle.recibo} onImprimir={() => window.print()} onCerrar={() => setModalDetalle({ open: false, recibo: null })} />
            <ReciboModalBaja open={modalBaja.open} recibo={modalBaja.recibo} onConfirmar={handleToggleEstado} onCerrar={() => setModalBaja({ open: false, recibo: null })} />
        </Can>
    );
}
