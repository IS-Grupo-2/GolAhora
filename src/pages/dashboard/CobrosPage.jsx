import { useState, useEffect } from 'react';
import { useCobros } from '../../context/CobrosContext';
import { useClientes } from '../../context/ClientesContext';
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
    const { isAdmin } = useRole();
    const [filtro, setFiltro] = useState('');
    const [modalForm, setModalForm] = useState({ open: false, modo: 'nuevo', cobro: null });
    const [modalDetalle, setModalDetalle] = useState({ open: false, cobro: null });
    const [modalBaja, setModalBaja] = useState({ open: false, cobro: null });

    const handleGuardar = (datos) => {
        if (modalForm.modo === 'editar') {
            modificarItem(datos);
        } else {
            crearItem(datos);
        }
        setModalForm({ open: false, modo: 'nuevo', cobro: null });
    };

    const handleToggleEstado = (cobro) => {
        modificarItem({ ...cobro, estado: cobro.estado === 'pagado' ? 'anulado' : 'pagado' });
        setModalBaja({ open: false, cobro: null });
    };

    const cobrosFiltrados = filtro ? cobros.filter(c => 
        c.cliente.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
        c.concepto.toLowerCase().includes(filtro.toLowerCase())
    ) : cobros;

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
                    {/* Crear cobro habilitado para admin y empleado */}
                    <button className="btn-primary-action" onClick={() => setModalForm({ open: true, modo: 'nuevo', cobro: null })}>
                        <i data-lucide="receipt" /> Registrar Cobro
                    </button>
                </div>
            </div>

            <div className="panel-card tabla-panel">
                {cobros.length === 0 ? <EmptyState message="No hay cobros registrados." /> : (
                    <CobrosTable
                        cobros={cobrosFiltrados}
                        isAdmin={isAdmin} // Pasamos isAdmin para ocultar botones de edición
                        onVer={(c) => setModalDetalle({ open: true, cobro: c })}
                        onEditar={(c) => setModalForm({ open: true, modo: 'editar', cobro: c })}
                        onBaja={(c) => setModalBaja({ open: true, cobro: c })}
                        onImprimir={() => window.print()}
                    />
                )}
            </div>

            <CobroModal open={modalForm.open} modo={modalForm.modo} cobro={modalForm.cobro} 
                clientes={clientes} descuentos={[]} onGuardar={handleGuardar} onCerrar={() => setModalForm({ open: false, modo: 'nuevo', cobro: null })} />
            <CobroModalDetalle open={modalDetalle.open} cobro={modalDetalle.cobro} onImprimir={() => window.print()} onCerrar={() => setModalDetalle({ open: false, cobro: null })} />
            <CobroModalBaja open={modalBaja.open} cobro={modalBaja.cobro} onConfirmar={handleToggleEstado} onCerrar={() => setModalBaja({ open: false, cobro: null })} />
        </Can>
    );
}
