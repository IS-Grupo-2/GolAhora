import { useEffect, useMemo, useState } from 'react';
import { ReservasProvider, useReservas } from '../../context/ReservasContext';
import { useAuth } from '../../context/AuthContext';
import useRole from '../../hooks/useRole';
import Can from '../../components/Can';

import ReservasTable from '../../components/reservas/ReservasTable';
import ReservaModal from '../../components/reservas/ReservaModal';
import ReservaModalDetalle from '../../components/reservas/ReservaModalDetalle';
import ReservaModalCancelar from '../../components/reservas/ReservaModalCancelar';

import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';

function ReservasPageContent() {
  const {
    reservas = [],
    loading,
    error,
    fetchReservas,
    crearReserva,
    modificarReserva,
    confirmarReserva,
    cancelarReserva,
  } = useReservas();

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
    if (typeof window !== 'undefined' && window.lucide) {
      window.lucide.createIcons();
    }
  }, [reservas, loading, modalForm.isOpen, modalDetalle.isOpen, modalCancelar.isOpen]);

  const reservasVisibles = useMemo(() => {
    if (isAdmin || isEmpleado) return reservas;

    if (isCliente) {
      return reservas.filter((r) => r.cliente?.idUsuario === user?.idUsuario);
    }

    if (isProfesor) {
      // Importante: esto depende de que la reserva tenga relación con la clase/profesor.
      // Si todavía no existe ese vínculo, acá después lo enchufás.
      return reservas.filter(
        (r) =>
          r.profesor?.idUsuario === user?.idUsuario ||
          r.clase?.profesor?.idUsuario === user?.idUsuario
      );
    }

    return [];
  }, [reservas, isAdmin, isEmpleado, isProfesor, isCliente, user?.idUsuario]);

  const reservasFiltradas = useMemo(() => {
    const q = filtro.toLowerCase().trim();
    if (!q) return reservasVisibles;

    return reservasVisibles.filter((r) =>
      [
        r.cliente?.nombre,
        r.cliente?.apellido,
        r.cancha?.nombre,
        String(r.cancha?.numero ?? ''),
        r.estado,
        r.fechaUso,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    );
  }, [reservasVisibles, filtro]);

  const handleGuardar = async (reservaData) => {
    if (!reservaData?.idReserva) {
      await crearReserva(reservaData);
    } else {
      await modificarReserva(reservaData.idReserva, reservaData);
    }
    setModalForm({ isOpen: false, data: null });
  };

  const handleConfirmar = async (reserva) => {
    await confirmarReserva(reserva.idReserva);
    setModalDetalle({ isOpen: false, data: null });
  };

  const handleCancelar = async (idReserva, fueraDePlazo) => {
    await cancelarReserva(idReserva, fueraDePlazo);
    setModalCancelar({ isOpen: false, data: null });
  };

  if (loading && reservas.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <>
      <div className="crud-toolbar">
        <div className="crud-toolbar-left">
          <h2 className="crud-title">Reservas</h2>
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

          <Can roles={['admin', 'empleado', 'cliente']}>
            <button className="btn-primary-action" onClick={() => setModalForm({ isOpen: true, data: null })}>
              <i data-lucide="plus" /> Nueva Reserva
            </button>
          </Can>
        </div>
      </div>

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
          canCancelar={isAdmin || isEmpleado || isCliente}
          canConfirmar={isAdmin || isEmpleado}
        />
      )}

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
    </>
  );
}

export default function ReservasPage() {
  return (
    <ReservasProvider>
      <ReservasPageContent />
    </ReservasProvider>
  );
}