// src/components/usuarios/UsuarioModalDetalle.jsx
import { useEffect } from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────────
function iniciales(u) {
    return (u.nombre[0] + u.apellido[0]).toUpperCase();
}

function formatFecha(fecha) {
    if (!fecha) return '—';
    const [y, m, d] = fecha.split('-');
    return `${d}/${m}/${y}`;
}

function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return '—';
    const hoy       = new Date();
    const nac       = new Date(fechaNacimiento);
    let edad        = hoy.getFullYear() - nac.getFullYear();
    const mes       = hoy.getMonth() - nac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
}

function Campo({ label, valor, full }) {
    return (
        <div className={`detalle-campo${full ? ' detalle-full' : ''}`}>
            <span className="detalle-label">{label}</span>
            <span className="detalle-valor">{valor}</span>
        </div>
    );
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function UsuarioModalDetalle({ open, usuario, onCerrar, onEditar }) {

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

    if (!open || !usuario) return null;

    return (
        <div
            className="dash-modal-overlay activo"
            role="dialog"
            aria-modal="true"
            onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}
        >
            <div className="dash-modal">
                {/* HEADER */}
                <div className="dash-modal-header">
                    <h3>Detalle del cliente</h3>
                    <button className="dash-modal-close" aria-label="Cerrar" onClick={onCerrar}>
                        <i data-lucide="x" />
                    </button>
                </div>

                {/* BODY */}
                <div className="dash-modal-body">
                    <div className={`detalle-avatar${usuario.estado === 'inactivo' ? ' inactive' : ''}`}>
                        {iniciales(usuario)}
                    </div>
                    <div className="detalle-nombre">
                        {usuario.nombre} {usuario.apellido}
                    </div>
                    <div className="detalle-username">
                        @{usuario.username}
                        &nbsp;·&nbsp;
                        <span className={`badge ${usuario.estado === 'activo' ? 'success' : 'danger'}`}>
                            {usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>

                    <div className="detalle-grid">
                        <Campo label="DNI"                valor={usuario.dni} />
                        <Campo label="Teléfono"           valor={usuario.telefono} />
                        <Campo label="Edad"               valor={`${calcularEdad(usuario.fechaNacimiento)} años`} />
                        <Campo label="Fecha de nacimiento" valor={formatFecha(usuario.fechaNacimiento)} />
                        <Campo label="N° Socio"           valor={usuario.nroSocio} />
                        <Campo label="Alta"               valor={formatFecha(usuario.fechaAlta)} />
                        <Campo label="Email"              valor={usuario.email} full />
                        <Campo label="ID"                 valor={`#${String(usuario.id).padStart(4, '0')}`} />
                    </div>
                </div>

                {/* FOOTER */}
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cerrar</button>
                    <button className="btn-modal-save" onClick={() => onEditar(usuario)}>
                        <i data-lucide="pencil" />
                        Editar
                    </button>
                </div>
            </div>
        </div>
    );
}