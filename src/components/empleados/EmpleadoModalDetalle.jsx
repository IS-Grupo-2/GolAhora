// src/components/empleados/EmpleadoModalDetalle.jsx
import { useEffect } from 'react';

function iniciales(e) {
    return (e.nombre[0] + e.apellido[0]).toUpperCase();
}

function formatFecha(fecha) {
    if (!fecha) return '—';
    const [y, m, d] = fecha.split('-');
    return `${d}/${m}/${y}`;
}

function Campo({ label, valor, full }) {
    return (
        <div className={`detalle-campo${full ? ' detalle-full' : ''}`}>
            <span className="detalle-label">{label}</span>
            <span className="detalle-valor">{valor || '—'}</span>
        </div>
    );
}

export default function EmpleadoModalDetalle({ open, empleado, onCerrar, onEditar }) {

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCerrar(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCerrar]);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    useEffect(() => {
        if (open && window.lucide) window.lucide.createIcons();
    }, [open]);

    if (!open || !empleado) return null;

    return (
        <div className="dash-modal-overlay activo" role="dialog" aria-modal="true" onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}>
            <div className="dash-modal">
                <div className="dash-modal-header">
                    <h3>Detalle del Empleado</h3>
                    <button className="dash-modal-close" onClick={onCerrar}><i data-lucide="x" /></button>
                </div>

                <div className="dash-modal-body">
                    <div className={`detalle-avatar${!empleado.activo ? ' inactive' : ''}`}>
                        {iniciales(empleado)}
                    </div>
                    <div className="detalle-nombre">
                        {empleado.nombre} {empleado.apellido}
                    </div>
                    <div className="detalle-username">
                        @{empleado.userName}
                        &nbsp;·&nbsp;
                        <span className={`badge ${empleado.activo ? 'success' : 'danger'}`}>
                            {empleado.activo ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>

                    <div className="detalle-grid">
                        <Campo label="DNI" valor={empleado.dni} />
                        <Campo label="Legajo" valor={empleado.legajo} />
                        <Campo label="Cargo" valor={empleado.cargo} />
                        <Campo label="Turno" valor={empleado.turno} />
                        <Campo label="Email" valor={empleado.email} full />
                        <Campo label="Teléfono" valor={empleado.telefono} />
                        <Campo label="Sector" valor={empleado.sector} />
                        <Campo label="Fecha Ingreso" valor={formatFecha(empleado.fechaIngreso)} />
                    </div>
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cerrar</button>
                    {onEditar && (
                        <button className="btn-modal-save" onClick={() => onEditar(empleado)}>
                            <i data-lucide="pencil" /> Editar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}