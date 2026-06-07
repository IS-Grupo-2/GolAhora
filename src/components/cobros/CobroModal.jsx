// src/components/pagos/CobroModal.jsx
import { useState, useEffect } from 'react';

const FORM_VACIO = {
    clienteId: '', concepto: '', tipoCobro: '',
    monto: '', descuentoId: '', fecha: '', estado: 'pagado',
};

const ERRORES_VACIOS = { clienteId: '', concepto: '', tipoCobro: '', monto: '', fecha: '' };

function Field({ label, required, error, children }) {
    return (
        <div className="form-group">
            <label>{label} {required && <span className="req">*</span>}</label>
            {children}
            {error && <small className="form-error">{error}</small>}
        </div>
    );
}

export default function CobroModal({ open, modo, cobro, clientes, descuentos, onGuardar, onCerrar }) {
    const [form, setForm]       = useState(FORM_VACIO);
    const [errores, setErrores] = useState(ERRORES_VACIOS);
    const [montoFinalCalc, setMontoFinalCalc] = useState(0);

    const esNuevo = modo === 'nuevo';

    useEffect(() => {
        if (!open) return;
        if (esNuevo) {
            setForm({ ...FORM_VACIO, fecha: new Date().toISOString().split('T')[0] });
        } else if (cobro) {
            setForm({
                clienteId:   cobro.cliente.idUsuario || cobro.cliente.id || '',
                concepto:    cobro.concepto || '',
                tipoCobro:   cobro.tipoCobro || '',
                monto:       cobro.monto || '',
                descuentoId: cobro.descuento?.id || '',
                fecha:       cobro.fecha || '',
                estado:      cobro.estado || 'pagado',
            });
        }
        setErrores(ERRORES_VACIOS);
    }, [open, modo, cobro]);

    // Calcular el monto final en tiempo real (RF50)
    useEffect(() => {
        const base = parseFloat(form.monto) || 0;
        const descSeleccionado = descuentos.find(d => d.id === Number(form.descuentoId));
        const porcentaje = descSeleccionado ? descSeleccionado.porcentaje : 0;
        
        const descontado = base - (base * (porcentaje / 100));
        setMontoFinalCalc(descontado > 0 ? descontado : 0);
    }, [form.monto, form.descuentoId, descuentos]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onCerrar(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onCerrar]);

    useEffect(() => {
        if (open && window.lucide) window.lucide.createIcons();
    }, [open]);

    function set(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrores(prev => ({ ...prev, [field]: '' }));
    }

    function validar() {
        const errs = { ...ERRORES_VACIOS };
        let ok = true;
        if (!form.clienteId) { errs.clienteId = 'Seleccione un cliente'; ok = false; }
        if (form.concepto.trim().length < 3) { errs.concepto = 'Concepto muy corto'; ok = false; }
        if (!form.tipoCobro) { errs.tipoCobro = 'Seleccione el tipo'; ok = false; }
        if (!form.monto || form.monto <= 0) { errs.monto = 'Monto inválido'; ok = false; }
        if (!form.fecha) { errs.fecha = 'Ingrese fecha'; ok = false; }
        setErrores(errs);
        return ok;
    }

    function handleGuardar() {
        if (!validar()) return;

        const cliente = clientes.find(c => (c.idUsuario || c.id) === Number(form.clienteId));
        const descuento = descuentos.find(d => d.id === Number(form.descuentoId)) || null;

        const datos = {
            ...(cobro ? { idCobro: cobro.idCobro } : {}),
            cliente,
            concepto: form.concepto.trim(),
            tipoCobro: form.tipoCobro,
            monto: parseFloat(form.monto),
            montoFinal: montoFinalCalc,
            descuento,
            fecha: form.fecha,
            estado: form.estado,
        };
        onGuardar(datos);
    }

    if (!open) return null;

    return (
        <div className="dash-modal-overlay activo" onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}>
            <div className="dash-modal">
                <div className="dash-modal-header">
                    <h3>{esNuevo ? 'Registrar Nuevo Cobro' : 'Modificar Cobro'}</h3>
                    <button className="dash-modal-close" onClick={onCerrar}><i data-lucide="x" /></button>
                </div>

                <div className="dash-modal-body">
                    <Field label="Cliente" required error={errores.clienteId}>
                        <select value={form.clienteId} onChange={e => set('clienteId', e.target.value)} className={errores.clienteId ? 'input-error-field' : ''}>
                            <option value="">Buscar o seleccionar cliente...</option>
                            {clientes.map(c => (
                                <option key={c.idUsuario || c.id} value={c.idUsuario || c.id}>{c.nombre} {c.apellido} - DNI: {c.dni}</option>
                            ))}
                        </select>
                    </Field>

                    <div className="form-row">
                        <Field label="Concepto / Detalle" required error={errores.concepto}>
                            <input type="text" placeholder="Ej: Pago cuota mensual" value={form.concepto} onChange={e => set('concepto', e.target.value)} className={errores.concepto ? 'input-error-field' : ''} />
                        </Field>
                        <Field label="Tipo de Cobro" required error={errores.tipoCobro}>
                            <select value={form.tipoCobro} onChange={e => set('tipoCobro', e.target.value)} className={errores.tipoCobro ? 'input-error-field' : ''}>
                                <option value="">Seleccionar</option>
                                <option value="Reserva Cancha">Reserva Cancha</option>
                                <option value="Clase/Entrenamiento">Clase / Entrenamiento</option>
                                <option value="Inscripción Torneo">Inscripción Torneo</option>
                                <option value="Sanción/Multa">Sanción / Multa</option>
                            </select>
                        </Field>
                    </div>

                    <div className="form-row">
                        <Field label="Fecha de Cobro" required error={errores.fecha}>
                            <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} className={errores.fecha ? 'input-error-field' : ''} />
                        </Field>
                        {!esNuevo && (
                            <Field label="Estado">
                                <select value={form.estado} onChange={e => set('estado', e.target.value)}>
                                    <option value="pagado">Pagado / Acreditado</option>
                                    <option value="anulado">Anulado / Pendiente</option>
                                </select>
                            </Field>
                        )}
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '10px 0' }} />

                    <div className="form-row" style={{ alignItems: 'flex-end' }}>
                        <Field label="Monto Base ($)" required error={errores.monto}>
                            <input type="number" min="0" step="100" placeholder="0.00" value={form.monto} onChange={e => set('monto', e.target.value)} className={errores.monto ? 'input-error-field' : ''} />
                        </Field>
                        <Field label="Aplicar Descuento (Autorizado)">
                            <select value={form.descuentoId} onChange={e => set('descuentoId', e.target.value)}>
                                <option value="">Sin descuento</option>
                                {descuentos.map(d => (
                                    <option key={d.id} value={d.id}>{d.nombre} ({d.porcentaje}%)</option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <div style={{ background: 'rgba(22, 163, 74, 0.1)', border: '1px solid #16a34a', borderRadius: '10px', padding: '15px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)' }}>Total a cobrar:</span>
                        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>
                            ${montoFinalCalc.toFixed(2)}
                        </span>
                    </div>
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className="btn-modal-save" onClick={handleGuardar}>
                        <i data-lucide="save" /> Guardar Cobro
                    </button>
                </div>
            </div>
        </div>
    );
}
