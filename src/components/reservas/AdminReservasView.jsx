// src/components/reservas/AdminReservasView.jsx
import { useEffect, useMemo, useState } from 'react';
import { useReservas } from '../../context/ReservasContext';
import { useAuth } from '../../context/AuthContext';
import { useCobros } from '../../context/CobrosContext';
import useRole from '../../hooks/useRole';
import Can from '../Can';

import ReservasTable from './ReservasTable';
import ReservaModal from './ReservaModal';
import ReservaModalDetalle from './ReservaModalDetalle';
import ReservaModalCancelar from './ReservaModalCancelar';

import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorMessage from '../ui/ErrorMessage';
import EmptyState from '../ui/EmptyState';

export default function AdminReservasView() {
  const {
    reservas = [], loading, error, fetchReservas, crearReserva, modificarReserva,
    confirmarReserva, cancelarReserva,
  } = useReservas();

  const { crearItem: crearCobro, items: cobros, modificarItem: modificarCobro } = useCobros();
  const { user } = useAuth();
  const { isAdmin, isEmpleado, isProfesor, isCliente } = useRole();
  const [filtro, setFiltro] = useState('');

  const [modalForm, setModalForm] = useState({ isOpen: false, data: null });
  const [modalDetalle, setModalDetalle] = useState({ isOpen: false, data: null });
  const [modalCancelar, setModalCancelar] = useState({ isOpen: false, data: null });

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
  }, [reservas, loading, modalForm.isOpen, modalDetalle.isOpen, modalCancelar.isOpen]);

  const reservasVisibles = useMemo(() => {
    if (isAdmin || isEmpleado) return reservas;
    if (isCliente) return reservas.filter((r) => r.cliente?.idUsuario === user?.idUsuario);
    if (isProfesor) return reservas.filter((r) => r.profesor?.idUsuario === user?.idUsuario || r.clase?.profesor?.idUsuario === user?.idUsuario);
    return [];
  }, [reservas, isAdmin, isEmpleado, isProfesor, isCliente, user?.idUsuario]);

  const normalizarTexto = (texto) => {
      return texto
          .toString()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
  };

  const reservasFiltradas = useMemo(() => {
    const q = normalizarTexto(filtro);
    if (!q) return reservasVisibles;

    return reservasVisibles.filter((r) => {
      const nombre = normalizarTexto(r.cliente?.name || '');
      const apellido = normalizarTexto(r.cliente?.lastName || '');
      const cancha = normalizarTexto(r.cancha?.nombre || '');
      const estado = normalizarTexto(r.estado || '');
      const fecha = normalizarTexto(r.fechaUso || '');
      const numeroCancha = String(r.cancha?.numero || '');

      return (
        nombre.includes(q) ||
        apellido.includes(q) ||
        cancha.includes(q) ||
        estado.includes(q) ||
        fecha.includes(q) ||
        numeroCancha.includes(q)
      );
    });
  }, [reservasVisibles, filtro]);

  // NUEVO LOGICA DE GUARDADO ALINEADA
  const handleGuardar = async (reservaData) => {
    if (!reservaData?.idReserva) {
      // 1. Creamos la Reserva
      const reservaCreada = await crearReserva(reservaData);

      // 2. Sincronizamos creando el Cobro Pendiente automáticamente
      if (reservaCreada && reservaCreada.idReserva) {
          await crearCobro({
              idReserva: reservaCreada.idReserva,
              cliente: reservaData.cliente,
              concepto: `Reserva ${reservaData.cancha.nombre} - ${reservaData.fechaUso}`,
              tipoCobro: 'Reserva Cancha',
              monto: reservaData.montoTotal,
              montoFinal: reservaData.montoTotal,
              fecha: new Date().toISOString().split("T")[0],
              estado: 'pendiente',
              metodo: null
          });
      }
    } else {
      await modificarReserva(reservaData.idReserva, reservaData);
    }
    setModalForm({ isOpen: false, data: null });
  };

  const handleConfirmar = async (reserva) => {
    // 1. Confirmar reserva en ReservasContext
    await confirmarReserva(reserva.idReserva);
    
    // 2. Sincronizar: Actualizar cobro a "pagado"
    const cobroAsociado = cobros.find(c => c.idReserva === reserva.idReserva);
    if (cobroAsociado) {
      await modificarCobro({
        ...cobroAsociado,
        estado: 'pagado',
        metodo: cobroAsociado.metodo || 'MercadoPago'
      });
    }
    
    setModalDetalle({ isOpen: false, data: null });
  };

  const handleCancelar = async (idReserva, fueraDePlazo) => {
    // 1. Cancelar reserva en ReservasContext
    await cancelarReserva(idReserva, fueraDePlazo);
    
    // 2. Sincronizar: Actualizar cobro a "cancelado" o "recargo"
    const cobroAsociado = cobros.find(c => c.idReserva === idReserva);
    if (cobroAsociado) {
      const nuevoEstadoCobro = fueraDePlazo ? 'recargo' : 'cancelado';
      await modificarCobro({
        ...cobroAsociado,
        estado: nuevoEstadoCobro
      });
    }
    
    setModalCancelar({ isOpen: false, data: null });
  };

  if (loading && reservas.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  // ... (El resto del render (return) queda exactamente igual que antes) ...
  return (
    <div className="admin-reservas-container" style={{ width: '100%' }}>
      <div className="crud-toolbar" style={{ padding: '0 20px' }}>
        <div className="crud-toolbar-left">
          <h2 className="crud-title">Gestión de Reservas</h2>
          <span className="crud-count">{reservasFiltradas.length} totales</span>
        </div>

        <div className="crud-toolbar-right">
          <div className="search-box">
            <i data-lucide="search" />
            <input
              type="text"
              placeholder="Buscar cliente, cancha o estado…"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              autoComplete="off"
            />
          </div>

          <Can roles={['admin', 'empleado']}>
            <button className="btn-primary-action" onClick={() => setModalForm({ isOpen: true, data: null })}>
              <i data-lucide="plus" /> Nueva Reserva
            </button>
          </Can>
        </div>
      </div>

      <div className="tabla-panel">
        {reservasFiltradas.length === 0 ? (
          <EmptyState message={filtro ? 'No se encontraron reservas con ese criterio.' : 'No hay reservas registradas.'} />
        ) : (
          <ReservasTable
            reservas={reservasFiltradas}
            filtro={filtro}
            onVer={(r) => setModalDetalle({ isOpen: true, data: r })}
            onEditar={(r) => setModalForm({ isOpen: true, data: r })}
            onCancelar={(r) => setModalCancelar({ isOpen: true, data: r })}
            onConfirmar={handleConfirmar}
            canVer
            canEditar={isAdmin || isEmpleado}
            canCancelar={isAdmin || isEmpleado}
            canConfirmar={isAdmin || isEmpleado}
          />
        )}
      </div>

      {modalForm.isOpen && (
        <ReservaModal
          reserva={modalForm.data}
          onClose={() => setModalForm({ isOpen: false, data: null })}
          onSave={handleGuardar}
        />
      )}

      {modalDetalle.isOpen && (
        <ReservaModalDetalle
          reserva={modalDetalle.data}
          onClose={() => setModalDetalle({ isOpen: false, data: null })}
          onConfirm={handleConfirmar}
        />
      )}

      {modalCancelar.isOpen && (
        <ReservaModalCancelar
          reserva={modalCancelar.data}
          onClose={() => setModalCancelar({ isOpen: false, data: null })}
          onCancel={handleCancelar}
        />
      )}
    </div>
  );
}