// src/components/recibos/ReciboModal.jsx
import { useState, useEffect } from 'react';

const FORM_VACIO = {
    cobroId: '', metodoPago: '', nroTransaccion: '',
    fecha: '', detalles: '', estado: 'emitido',
};

const ERRORES_VACIOS = { cobroId: '', metodoPago: '', fecha: '' };

function Field({ label, required, error, children }) {
    return (
        <div className="form-group">
            <label>{label} {required && <span className="req">*</span>}</label>
            {children}
            {error && <small className="form-error">{error}</small>}
        </div>
    );
}

export default function ReciboModal({ open, modo, recibo, cobrosPendientes, onGuardar, onCerrar }) {
    const [form, setForm] = useState(FORM_VACIO);
    const [errores, setErrores] = useState(ERRORES_VACIOS);
    const [cobroSeleccionado, setCobroSeleccionado] = useState(null);

    const esNuevo = modo === 'nuevo';

    useEffect(() => {
        if (!open) return;
        if (esNuevo) {
            setForm({ ...FORM_VACIO, fecha: new Date().toISOString().split('T')[0] });
            setCobroSeleccionado(null);
        } else if (recibo) {
            setForm({
                cobroId:        recibo.cobro.idCobro || '',
                metodoPago:     recibo.pago.metodoPago || '',
                nroTransaccion: recibo.pago.nroTransaccion || '',
                fecha:          recibo.fecha || '',
                detalles:       recibo.detalles || '',
                estado:         recibo.estado || 'emitido',
            });
            setCobroSeleccionado(recibo.cobro);
        }
        setErrores(ERRORES_VACIOS);
    }, [open, modo, recibo]);

    // Autocompletar datos visuales si cambia el cobro seleccionado
    useEffect(() => {
        if (form.cobroId) {
            const c = cobrosPendientes.find(c => c.idCobro === Number(form.cobroId)) || (recibo?.cobro);
            setCobroSeleccionado(c);
        } else {
            setCobroSeleccionado(null);
        }
    }, [form.cobroId, cobrosPendientes, recibo]);

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
        if (!form.cobroId) { errs.cobroId = 'Debe seleccionar un cobro'; ok = false; }
        if (!form.metodoPago) { errs.metodoPago = 'Seleccione método de pago'; ok = false; }
        if (!form.fecha) { errs.fecha = 'Ingrese la fecha'; ok = false; }
        setErrores(errs);
        return ok;
    }

    function handleGuardar() {
        if (!validar()) return;

        const cobroDefinitivo = cobroSeleccionado;
        
        const datos = {
            ...(recibo ? { idRecibo: recibo.idRecibo, nroRecibo: recibo.nroRecibo } : {}),
            cobro: cobroDefinitivo,
            cliente: cobroDefinitivo.cliente,
            total: cobroDefinitivo.montoFinal,
            fecha: form.fecha,
            detalles: form.detalles.trim(),
            estado: form.estado,
            // Objeto Pago embebido para respetar UML
            pago: {
                metodoPago: form.metodoPago,
                nroTransaccion: form.nroTransaccion.trim() || 'N/A',
                fechaPago: form.fecha,
                estado: 'Completado'
            }
        };
        onGuardar(datos);
    }

    if (!open) return null;

    return (
        <div className="dash-modal-overlay activo" onClick={e => { if (e.target === e.currentTarget) onCerrar(); }}>
            <div className="dash-modal">
                

                <div className="dash-modal-body">
                    <Field label="Cobro Asociado (Referencia)" required error={errores.cobroId}>
                        <select 
                            value={form.cobroId} 
                            onChange={e => set('cobroId', e.target.value)} 
                            className={errores.cobroId ? 'input-error-field' : ''}
                            disabled={!esNuevo} // No se debe cambiar el cobro de un recibo ya emitido
                        >
                            <option value="">Seleccionar cobro a rendir...</option>
                            {esNuevo && cobrosPendientes.map(c => (
                                <option key={c.idCobro} value={c.idCobro}>
                                    #{String(c.idCobro).padStart(5, '0')} - {c.cliente.nombre} {c.cliente.apellido} (${c.montoFinal})
                                </option>
                            ))}
                            {!esNuevo && recibo && (
                                <option value={recibo.cobro.idCobro}>
                                    #{String(recibo.cobro.idCobro).padStart(5, '0')} - {recibo.cliente.nombre} ({recibo.cobro.concepto})
                                </option>
                            )}
                        </select>
                    </Field>

                    {/* Resumen del Cobro seleccionado */}
                    {cobroSeleccionado && (
                        <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', fontSize: '0.85rem', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Concepto:</span>
                                <strong>{cobroSeleccionado.concepto}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Total a Rendir:</span>
                                <strong style={{ color: '#16a34a', fontSize: '1rem' }}>${cobroSeleccionado.montoFinal}</strong>
                            </div>
                        </div>
                    )}

                    <div className="form-row">
                        <Field label="Método de Pago" required error={errores.metodoPago}>
                            <select value={form.metodoPago} onChange={e => set('metodoPago', e.target.value)} className={errores.metodoPago ? 'input-error-field' : ''}>
                                <option value="">Seleccionar</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia Bancaria</option>
                                <option value="Mercado Pago">Mercado Pago / Billetera Virtual</option>
                                <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                                <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                            </select>
                        </Field>
                        <Field label="N° Transacción / Comprobante">
                            <input 
                                type="text" 
                                placeholder="Ej: TRX-987654" 
                                value={form.nroTransaccion} 
                                onChange={e => set('nroTransaccion', e.target.value)} 
                                disabled={form.metodoPago === 'Efectivo'} 
                            />
                        </Field>
                    </div>

                    <div className="form-row">
                        <Field label="Fecha de Emisión" required error={errores.fecha}>
                            <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} className={errores.fecha ? 'input-error-field' : ''} />
                        </Field>
                        {!esNuevo && (
                            <Field label="Estado">
                                <select value={form.estado} onChange={e => set('estado', e.target.value)}>
                                    <option value="emitido">Emitido</option>
                                    <option value="anulado">Anulado</option>
                                </select>
                            </Field>
                        )}
                    </div>

                    <Field label="Detalles Adicionales">
                        <textarea 
                            rows="2" 
                            placeholder="Observaciones del recibo o pago..." 
                            value={form.detalles} 
                            onChange={e => set('detalles', e.target.value)} 
                            style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--border)', padding: '0.5rem', background: 'var(--bg)', color: 'var(--text)', outline: 'none' }}>
                        </textarea>
                    </Field>
                </div>

                <div className="dash-modal-footer">
                    <button className="btn-modal-cancel" onClick={onCerrar}>Cancelar</button>
                    <button className="btn-modal-save" onClick={handleGuardar}>
                        <i data-lucide="save" /> Generar Recibo
                    </button>
                </div>
            </div>
        </div>
    );
}