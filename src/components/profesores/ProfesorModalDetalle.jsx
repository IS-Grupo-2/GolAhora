// src/components/profesores/ProfesorModalDetalle.jsx
import { useEffect } from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────────
function iniciales(p) {
    return (p.nombre[0] + p.apellido[0]).toUpperCase();
}

function formatFecha(fecha) {
    if (!fecha) return '—';
    const [y, m, d] = fecha.split('-');
    return `${d}/${m}/${y}`;
}

// ✅ FIX: convierte el array de objetos {nombre, ...} a string legible
function formatCerts(certs) {
    if (!certs) return '—';
    if (Array.isArray(certs)) return certs.map(c => c.nombre).join(', ') || '—';
    return certs;
}

function Campo({ label, valor, full }) {
    return (
        <div className={`detalle-campo${full ? ' detalle-full' : ''}`}>
            <span className="detalle-label">{label}</span>
            <span className="detalle-valor">{valor || '—'}</span>
        </div>
    );
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function ProfesorModalDetalle({ open, profesor, onCerrar }) {

    // Escape para cerrar
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCerrar(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCerrar]);

    // Bloquear scroll del body
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    // Lucide icons
    useEffect(() => {
        if (open && window.lucide) window.lucide.createIcons();
    }, [open]);

    if (!open || !profesor) return null;
    const estaActivo = profesor.activo ?? profesor.estado === 'activo';

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
                    <h3>Detalle del profesor</h3>
                    <button className="dash-modal-close" aria-label="Cerrar" onClick={onCerrar}>
                        <i data-lucide="x" />
                    </button>
                </div>

                {/* BODY */}
                <div className="dash-modal-body">
                    {/* Avatar */}
                    <div className={`detalle-avatar${estaActivo ? ' active' : ' inactive'}`}>
                        {iniciales(profesor)}
                    </div>
                    <div className="detalle-nombre">
                        {profesor.nombre} {profesor.apellido}
                    </div>
                    <div className="detalle-username">
                        @{profesor.username}
                        &nbsp;·&nbsp;
                        <span className={`badge ${estaActivo ? 'success' : 'danger'}`}>
                            {estaActivo ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>

                    {/* Grid de datos */}
                    <div className="detalle-grid">
                        <Campo label="Legajo"       valor={profesor.legajo} />
                        <Campo label="Especialidad" valor={profesor.especialidad} />
                        <Campo label="Turno"        valor={profesor.turno} />
                        <Campo label="DNI"          valor={profesor.dni} />
                        <Campo label="Teléfono"     valor={profesor.telefono} />
                        <Campo label="Nacimiento"  valor={formatFecha(profesor.fechaNacimiento)} />
                        <Campo label="Ingreso"      valor={formatFecha(profesor.fechaRegistro)} />
                        <Campo label="Email"        valor={profesor.email}                        full />
                        <Campo label="Certificaciones" valor={formatCerts(profesor.certificaciones)} full />
                        <Campo
                            label="Cert. verificada"
                            valor={profesor.verificacionCertificacion ? '✓ Verificada' : '✗ Sin verificar'}
                        />
                        <Campo label="ID" valor={`#${String(profesor.idUsuario).padStart(4, '0')}`} />
                    </div>
                </div>

                {/* FOOTER */}
                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cerrar</button>
                </div>
            </div>
        </div>
    );
}
