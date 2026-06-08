import { useEffect, useMemo, useState } from 'react';
import { useDescuentos } from '../../context/DescuentosContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';

const FORM_INICIAL = {
    codigo: '',
    nombre: '',
    porcentaje: '',
    descripcion: '',
    activo: true,
};

function normalizarBusqueda(valor) {
    return String(valor || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function DescuentoModal({ open, modo, descuento, descuentos, onGuardar, onCerrar }) {
    const [form, setForm] = useState(FORM_INICIAL);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        if (!open) return;
        setForm(descuento ? {
            codigo: descuento.codigo || '',
            nombre: descuento.nombre || '',
            porcentaje: descuento.porcentaje || '',
            descripcion: descuento.descripcion || '',
            activo: descuento.activo !== false,
        } : FORM_INICIAL);
        setErrores({});
    }, [open, descuento]);

    useEffect(() => {
        if (open && typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    }, [open, form]);

    if (!open) return null;

    function set(campo, valor) {
        setForm(prev => ({ ...prev, [campo]: valor }));
        setErrores(prev => ({ ...prev, [campo]: '' }));
    }

    function guardar() {
        const codigo = form.codigo.trim().toUpperCase();
        const porcentaje = Number(form.porcentaje);
        const errs = {};

        if (codigo.length < 3) errs.codigo = 'Ingresá un código de al menos 3 caracteres.';
        if (form.nombre.trim().length < 3) errs.nombre = 'Ingresá un nombre.';
        if (!porcentaje || porcentaje <= 0 || porcentaje > 100) errs.porcentaje = 'Debe estar entre 1 y 100.';
        if (descuentos.some(d => d.codigo === codigo && d.id !== descuento?.id)) errs.codigo = 'Ese código ya existe.';

        setErrores(errs);
        if (Object.keys(errs).length > 0) return;

        onGuardar({
            ...(descuento ? { id: descuento.id } : {}),
            codigo,
            nombre: form.nombre.trim(),
            porcentaje,
            descripcion: form.descripcion.trim(),
            activo: form.activo,
        });
    }

    return (
        <div className="dash-modal-overlay activo" onClick={e => e.target === e.currentTarget && onCerrar()}>
            <div className="dash-modal">
                <div className="dash-modal-header">
                    <h3>{modo === 'editar' ? 'Modificar Descuento' : 'Nuevo Descuento'}</h3>
                    <button className="dash-modal-close" onClick={onCerrar}><i data-lucide="x" /></button>
                </div>
                <div className="dash-modal-body">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Código <span className="req">*</span></label>
                            <input value={form.codigo} onChange={e => set('codigo', e.target.value.toUpperCase())} placeholder="Ej: GOL10" />
                            <span className="form-error">{errores.codigo}</span>
                        </div>
                        <div className="form-group">
                            <label>Porcentaje <span className="req">*</span></label>
                            <input type="number" min="1" max="100" value={form.porcentaje} onChange={e => set('porcentaje', e.target.value)} placeholder="10" />
                            <span className="form-error">{errores.porcentaje}</span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Nombre <span className="req">*</span></label>
                        <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Promo bienvenida" />
                        <span className="form-error">{errores.nombre}</span>
                    </div>
                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea rows="3" value={form.descripcion} onChange={e => set('descripcion', e.target.value)} />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                        <input type="checkbox" checked={form.activo} onChange={e => set('activo', e.target.checked)} style={{ width: 'auto' }} />
                        Descuento activo
                    </label>
                </div>
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className="btn-modal-save" onClick={guardar}>
                        <i data-lucide="save" /> Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function DescuentosPage() {
    const { items: descuentos, loading, error, crearItem, modificarItem, eliminarItem } = useDescuentos();
    const [filtro, setFiltro] = useState('');
    const [modal, setModal] = useState({ open: false, modo: 'nuevo', data: null });

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    }, [descuentos, modal.open]);

    const descuentosFiltrados = useMemo(() => {
        const q = normalizarBusqueda(filtro.trim());
        const descuentosBase = Array.isArray(descuentos) ? descuentos : [];
        if (!q) return descuentosBase;
        return descuentosBase.filter(d => [
            d?.codigo,
            d?.nombre,
            d?.descripcion,
            d?.porcentaje,
        ].some(valor => normalizarBusqueda(valor).includes(q)));
    }, [descuentos, filtro]);

    async function guardar(datos) {
        if (modal.modo === 'editar') await modificarItem(datos);
        else await crearItem(datos);
        setModal({ open: false, modo: 'nuevo', data: null });
    }

    async function eliminar(descuento) {
        if (window.confirm(`¿Eliminar el descuento ${descuento.codigo}?`)) {
            await eliminarItem(descuento.id);
        }
    }

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <>
            <div className="crud-toolbar">
                <div className="crud-toolbar-left">
                    <h2 className="crud-title">Gestión de Descuentos</h2>
                    <span className="crud-count">{(Array.isArray(descuentos) ? descuentos : []).length} registrados</span>
                </div>
                <div className="crud-toolbar-right">
                    <div className="search-box">
                        <i data-lucide="search" />
                        <input value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Buscar descuento..." />
                    </div>
                    <button className="btn-primary-action" onClick={() => setModal({ open: true, modo: 'nuevo', data: null })}>
                        <i data-lucide="plus" /> Nuevo descuento
                    </button>
                </div>
            </div>

            <div className="panel-card tabla-panel">
                {descuentosFiltrados.length === 0 ? (
                    <EmptyState message="No hay descuentos registrados." />
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Nombre</th>
                                    <th>Porcentaje</th>
                                    <th>Estado</th>
                                    <th>Descripción</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {descuentosFiltrados.map(d => (
                                    <tr key={d.id}>
                                        <td><strong>{d.codigo}</strong></td>
                                        <td>{d.nombre}</td>
                                        <td><span className="badge info">{d.porcentaje}%</span></td>
                                        <td><span className={`badge ${d.activo ? 'success' : 'danger'}`}>{d.activo ? 'Activo' : 'Inactivo'}</span></td>
                                        <td>{d.descripcion || '-'}</td>
                                        <td>
                                            <div className="action-btns">
                                                <button className="action-btn edit" title="Editar" onClick={() => setModal({ open: true, modo: 'editar', data: d })}>
                                                    <i data-lucide="pencil" />
                                                </button>
                                                <button className="action-btn toggle" title="Eliminar" onClick={() => eliminar(d)}>
                                                    <i data-lucide="trash-2" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <DescuentoModal
                open={modal.open}
                modo={modal.modo}
                descuento={modal.data}
                descuentos={descuentos}
                onGuardar={guardar}
                onCerrar={() => setModal({ open: false, modo: 'nuevo', data: null })}
            />
        </>
    );
}
