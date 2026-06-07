import { useEffect, useMemo, useState } from 'react';
import { useDescuentos } from '../../context/DescuentosContext';

const CBU_TRANSFERENCIA = '0000003100015903634731';

const FORM_TARJETA_INICIAL = {
    numero: '',
    mes: '',
    anio: '',
    titular: '',
    seguridad: '',
    tipo: 'credito',
};

function limpiarNumero(valor) {
    return String(valor || '').replace(/\D/g, '');
}

function validarTarjeta(form) {
    const errores = {};
    const numero = limpiarNumero(form.numero);
    const mes = Number(form.mes);
    const anioIngresado = limpiarNumero(form.anio);
    const anio = anioIngresado.length === 2 ? Number(`20${anioIngresado}`) : Number(anioIngresado);
    const anioActual = new Date().getFullYear();

    if (numero.length !== 16) errores.numero = 'Ingresá los 16 dígitos de la tarjeta.';
    if (!mes || mes < 1 || mes > 12) errores.mes = 'Mes inválido.';
    if (![2, 4].includes(anioIngresado.length) || !anio || anio < anioActual) errores.anio = 'Año inválido.';
    if (!String(form.titular || '').trim().includes(' ')) errores.titular = 'Ingresá nombre y apellido.';
    if (!/^\d{3,4}$/.test(form.seguridad)) errores.seguridad = 'El código debe tener 3 o 4 dígitos.';

    return errores;
}

export default function PagoReservaModal({
    reserva,
    onClose,
    onConfirmar,
    titulo = 'Pagar Reserva',
    detalleLabel = 'Reserva',
    detalleTexto,
}) {
    const { buscarPorCodigo } = useDescuentos();
    const [metodo, setMetodo] = useState('transferencia');
    const [tarjeta, setTarjeta] = useState(FORM_TARJETA_INICIAL);
    const [errores, setErrores] = useState({});
    const [codigoPromo, setCodigoPromo] = useState('');
    const [descuentoAplicado, setDescuentoAplicado] = useState(null);
    const [errorPromo, setErrorPromo] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    }, [metodo, errores]);

    const total = reserva?.montoTotal || 0;
    const totalConDescuento = descuentoAplicado
        ? Math.max(total - (total * (descuentoAplicado.porcentaje / 100)), 0)
        : total;

    const metodoTexto = useMemo(() => {
        if (metodo === 'transferencia') return 'Transferencia';
        if (metodo === 'qr') return 'Pago QR';
        return tarjeta.tipo === 'debito' ? 'Tarjeta de débito' : 'Tarjeta de crédito';
    }, [metodo, tarjeta.tipo]);

    if (!reserva) return null;

    function actualizarTarjeta(campo, valor) {
        const soloNumeros = ['numero', 'mes', 'anio', 'seguridad'].includes(campo);
        setTarjeta(prev => ({
            ...prev,
            [campo]: soloNumeros ? limpiarNumero(valor) : valor
        }));
    }

    function confirmarPago() {
        if (metodo === 'tarjeta') {
            const nuevosErrores = validarTarjeta(tarjeta);
            setErrores(nuevosErrores);
            if (Object.keys(nuevosErrores).length > 0) return;
        }

        onConfirmar({
            metodo: metodoTexto,
            nroTransaccion: `${metodo.toUpperCase()}-${Date.now()}`,
            descuento: descuentoAplicado,
            montoFinal: totalConDescuento,
            detallePago: metodo === 'transferencia'
                ? `Transferencia al CBU ${CBU_TRANSFERENCIA}`
                : metodo === 'qr'
                    ? 'Pago realizado con QR ficticio'
                    : `Pago con ${metodoTexto} terminada en ${tarjeta.numero.slice(-4)}`
        });
    }

    function aplicarCodigoPromocional() {
        const descuento = buscarPorCodigo(codigoPromo);
        if (!descuento) {
            setDescuentoAplicado(null);
            setErrorPromo('Código inválido o inactivo.');
            return;
        }
        setDescuentoAplicado(descuento);
        setErrorPromo('');
    }

    function quitarCodigoPromocional() {
        setCodigoPromo('');
        setDescuentoAplicado(null);
        setErrorPromo('');
    }

    return (
        <div className="dash-modal-overlay activo" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="dash-modal">
                <div className="dash-modal-header">
                    <h3>{titulo}</h3>
                    <button className="dash-modal-close" type="button" onClick={onClose}>
                        <i data-lucide="x" />
                    </button>
                </div>

                <div className="dash-modal-body">
                    <div className="detalle-campo detalle-full" style={{ marginBottom: '14px' }}>
                        <span className="detalle-label">{detalleLabel}</span>
                        <span className="detalle-valor">
                            {detalleTexto || `${reserva.cancha?.nombre} - ${reserva.fechaUso} de ${reserva.horaInicio} a ${reserva.horaFin}`}
                        </span>
                    </div>

                    <div className="detalle-campo detalle-full" style={{ marginBottom: '16px', background: '#f8fafc', borderColor: '#cbd5e1' }}>
                        <span className="detalle-label">Total a pagar</span>
                        <strong style={{ fontSize: '1.35rem', color: 'var(--purple)' }}>${totalConDescuento.toLocaleString('es-AR')}</strong>
                    </div>

                    <div className="form-group">
                        <label>Código promocional</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                value={codigoPromo}
                                onChange={e => {
                                    setCodigoPromo(e.target.value.toUpperCase());
                                    setErrorPromo('');
                                }}
                                placeholder="Ej: GOL10"
                                disabled={!!descuentoAplicado}
                            />
                            {descuentoAplicado ? (
                                <button type="button" className="btn-modal-cancel" onClick={quitarCodigoPromocional}>Quitar</button>
                            ) : (
                                <button type="button" className="btn-modal-save" onClick={aplicarCodigoPromocional}>Aplicar</button>
                            )}
                        </div>
                        {descuentoAplicado && (
                            <small style={{ color: '#16a34a', fontWeight: 700 }}>
                                {descuentoAplicado.nombre}: {descuentoAplicado.porcentaje}% aplicado.
                            </small>
                        )}
                        <span className="form-error">{errorPromo}</span>
                    </div>

                    <div className="form-group">
                        <label>Método de pago</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                            <button type="button" className={`btn-modal-cancel ${metodo === 'transferencia' ? 'active' : ''}`} onClick={() => setMetodo('transferencia')}>
                                <i data-lucide="banknote" /> Transferencia
                            </button>
                            <button type="button" className={`btn-modal-cancel ${metodo === 'qr' ? 'active' : ''}`} onClick={() => setMetodo('qr')}>
                                <i data-lucide="qr-code" /> QR
                            </button>
                            <button type="button" className={`btn-modal-cancel ${metodo === 'tarjeta' ? 'active' : ''}`} onClick={() => setMetodo('tarjeta')}>
                                <i data-lucide="credit-card" /> Tarjeta
                            </button>
                        </div>
                    </div>

                    {metodo === 'transferencia' && (
                        <div className="cancel-policy">
                            <span className="detalle-label">CBU para transferir</span>
                            <strong style={{ display: 'block', marginTop: '6px', letterSpacing: '0.04em' }}>{CBU_TRANSFERENCIA}</strong>
                        </div>
                    )}

                    {metodo === 'qr' && (
                        <div className="cancel-policy" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div
                                aria-label="QR ficticio"
                                style={{
                                    width: '112px',
                                    height: '112px',
                                    border: '8px solid #111827',
                                    background:
                                        'linear-gradient(90deg, #111827 12px, transparent 12px) 0 0 / 28px 28px, linear-gradient(#111827 12px, transparent 12px) 0 0 / 28px 28px, #fff'
                                }}
                            />
                            <div>
                                <strong>QR de prueba</strong>
                                <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>Usado solo para simular el pago en la demo.</p>
                            </div>
                        </div>
                    )}

                    {metodo === 'tarjeta' && (
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <div className="form-group">
                                <label>Tipo de tarjeta</label>
                                <select value={tarjeta.tipo} onChange={e => actualizarTarjeta('tipo', e.target.value)}>
                                    <option value="credito">Crédito</option>
                                    <option value="debito">Débito</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Número de tarjeta</label>
                                <input value={tarjeta.numero} maxLength={16} onChange={e => actualizarTarjeta('numero', e.target.value)} placeholder="16 dígitos" />
                                <span className="form-error">{errores.numero}</span>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Mes</label>
                                    <input value={tarjeta.mes} maxLength={2} onChange={e => actualizarTarjeta('mes', e.target.value)} placeholder="MM" />
                                    <span className="form-error">{errores.mes}</span>
                                </div>
                                <div className="form-group">
                                    <label>Año</label>
                                    <input value={tarjeta.anio} maxLength={4} onChange={e => actualizarTarjeta('anio', e.target.value)} placeholder="AA o AAAA" />
                                    <span className="form-error">{errores.anio}</span>
                                </div>
                                <div className="form-group">
                                    <label>Código</label>
                                    <input value={tarjeta.seguridad} maxLength={4} onChange={e => actualizarTarjeta('seguridad', e.target.value)} placeholder="CVV" />
                                    <span className="form-error">{errores.seguridad}</span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Nombre y apellido</label>
                                <input value={tarjeta.titular} onChange={e => actualizarTarjeta('titular', e.target.value)} placeholder="Como figura en la tarjeta" />
                                <span className="form-error">{errores.titular}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="dash-modal-footer">
                    <button type="button" className="btn-modal-cancel" onClick={onClose}>Cancelar</button>
                    <button type="button" className="btn-modal-save" onClick={confirmarPago}>
                        <i data-lucide="check-circle" /> Confirmar pago
                    </button>
                </div>
            </div>
        </div>
    );
}
