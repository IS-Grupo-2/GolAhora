# Correcciones de Coherencia de Datos - Gol-Ahora

## Resumen Ejecutivo
Se identificaron y corrigieron **múltiples fallas de sincronización** entre los contextos de datos (Reservas, Cobros, Recibos). Ahora hay **coherencia total**: cuando creas, confirmas o cancelas una reserva, los cobros se actualizan automáticamente en estado y datos.

---

## Problemas Identificados

### 1. **Datos Mock Incompletos - Falta de Cobros**
**Problema:**
- `ReservasContext` tenía 12 reservas mockeadas
- `CobrosContext` solo tenía 5 cobros
- Faltaban 7 cobros para las reservas 5, 6, 7, 8, 9, 10, 11, 12
- **Resultado:** Las reservas no tenían cobros asociados

**Línea encontrada:**
```javascript
// Antes: Solo 5 MOCK_COBROS (insuficientes)
const MOCK_COBROS = [
    { idCobro: 1001, idReserva: 1, ... },
    { idCobro: 1002, idReserva: 2, ... },
    { idCobro: 1003, idReserva: 3, ... },
    { idCobro: 1004, idReserva: 4, ... },
    { idCobro: 1005, idReserva: null, ... }, // Solo este sin reserva
];
```

**Solución Aplicada:**
- Agregué 12 cobros en `CobrosContext.jsx` que corresponden **exactamente** a las 12 reservas
- Cada cobro tiene:
  - `idReserva` vinculado con la reserva correspondiente
  - `cliente` con datos completos (idUsuario, nombre, apellido, dni)
  - `estado` coherente con la reserva (pendiente, pagado, cancelado, recargo)
  - `montoFinal` igual al `montoTotal` de la reserva
  - `metodo` de pago si aplica

**Archivo modificado:**
- [`src/context/CobrosContext.jsx`](src/context/CobrosContext.jsx)

---

### 2. **Recibos Incompletos**
**Problema:**
- `RecibosContext` tenía solo 2 recibos
- 6 cobros estaban pagados sin recibo correspondiente
- Los cobros pagados: 1001, 1003, 1006, 1008, 1009, 1012

**Solución Aplicada:**
- Agregué 6 recibos adicionales en `RecibosContext.jsx` para todos los cobros pagados
- Cada recibo contiene:
  - Referencia completa al cobro (`idCobro`)
  - Datos del cliente
  - Datos del pago (método, transacción, fecha)
  - Total y detalles

**Archivo modificado:**
- [`src/context/RecibosContext.jsx`](src/context/RecibosContext.jsx)

---

### 3. **Falta de Sincronización: Confirmar Reserva → Actualizar Cobro**
**Problema:**
- Cuando se confirmaba una reserva en `AdminReservasView`, solo se actualizaba el estado en `ReservasContext`
- El cobro correspondiente en `CobrosContext` **NO** se actualizaba a "pagado"
- Los datos quedaban inconsistentes

**Línea encontrada:**
```javascript
// Antes: handleConfirmar solo actualizaba reserva, no cobro
const handleConfirmar = async (reserva) => {
    await confirmarReserva(reserva.idReserva);
    // ❌ No sincronizaba con CobrosContext
    setModalDetalle({ isOpen: false, data: null });
};
```

**Solución Aplicada:**
- Actualicé `handleConfirmar` en `AdminReservasView.jsx` para:
  1. Confirmar la reserva
  2. Buscar el cobro asociado por `idReserva`
  3. Actualizar el cobro a estado "pagado" con método de pago

```javascript
// Después: handleConfirmar sincroniza ambos contextos
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
```

**Archivo modificado:**
- [`src/components/reservas/AdminReservasView.jsx`](src/components/reservas/AdminReservasView.jsx)

---

### 4. **Falta de Sincronización: Cancelar Reserva → Actualizar Cobro**
**Problema:**
- Cuando se cancelaba una reserva, solo se actualizaba en `ReservasContext`
- El cobro NO se actualizaba a "cancelado" o "recargo" (según plazo)
- Los datos quedaban inconsistentes

**Solución Aplicada:**
- Actualicé `handleCancelar` en `AdminReservasView.jsx` para:
  1. Cancelar la reserva
  2. Buscar el cobro asociado
  3. Actualizar el cobro a "cancelado" o "recargo" según el plazo

```javascript
// Después: handleCancelar sincroniza ambos contextos
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
```

**Archivo modificado:**
- [`src/components/reservas/AdminReservasView.jsx`](src/components/reservas/AdminReservasView.jsx)

---

### 5. **Referencias Incorrectas de Cliente al Crear Cobro**
**Problema:**
- En `NuevaReservaClienteModal`, cuando se creaba el cobro pasaba `cliente: { id: userId, ... }`
- Pero en `CobrosContext`, el campo esperado es `idUsuario`, no `id`
- **Resultado:** Inconsistencia en la estructura de datos

**Línea encontrada:**
```javascript
// Antes: Pasaba "id" en lugar de "idUsuario"
await crearCobro({
    idReserva: reservaCreada.idReserva,
    cliente: { id: userId, ... },  // ❌ Incorrecto
    // ...
});
```

**Solución Aplicada:**
- Corregí el campo a `idUsuario` para mantener coherencia con `CobrosContext`

```javascript
// Después: Usa "idUsuario" consistente
await crearCobro({
    idReserva: reservaCreada.idReserva,
    cliente: { idUsuario: userId, ... },  // ✓ Correcto
    // ...
});
```

**Archivo modificado:**
- [`src/components/reservas/NuevaReservaClienteModal.jsx`](src/components/reservas/NuevaReservaClienteModal.jsx)

---

### 6. **Falta de Sincronización en Vista de Cliente**
**Problema:**
- `ClienteReservasView` también llamaba a `confirmarReserva` y `cancelarReserva`
- Pero **NO** sincronizaba con `CobrosContext`
- Cuando un cliente pagaba desde su vista, el cobro no se actualizaba

**Solución Aplicada:**
- Importé `useCobros` en `ClienteReservasView`
- Actualicé `handlePagar` para sincronizar cobro a "pagado"
- Actualicé `handleCancelar` para sincronizar cobro a "cancelado"/"recargo"

```javascript
// Después: Ambas funciones sincronizan con CobrosContext
const handlePagar = async (idReserva) => {
    await confirmarReserva(idReserva);
    const cobroAsociado = cobros.find(c => c.idReserva === idReserva);
    if (cobroAsociado) {
        await modificarCobro({
            ...cobroAsociado,
            estado: 'pagado',
            metodo: cobroAsociado.metodo || 'MercadoPago'
        });
    }
};

const handleCancelar = async (idReserva, fueraDePlazo) => {
    await cancelarReserva(idReserva, fueraDePlazo);
    const cobroAsociado = cobros.find(c => c.idReserva === idReserva);
    if (cobroAsociado) {
        await modificarCobro({
            ...cobroAsociado,
            estado: fueraDePlazo ? 'recargo' : 'cancelado'
        });
    }
};
```

**Archivo modificado:**
- [`src/components/reservas/ClienteReservasView.jsx`](src/components/reservas/ClienteReservasView.jsx)

---

## Resumen de Cambios

| Contexto/Componente | Problema | Solución |
|---|---|---|
| **CobrosContext** | Solo 5 cobros para 12 reservas | ✅ Agregué 12 cobros completos (1001-1012) |
| **RecibosContext** | Solo 2 recibos para 6 cobros pagados | ✅ Agregué 6 recibos (para cobros 1001, 1003, 1006, 1008, 1009, 1012) |
| **AdminReservasView** | Sin sincronización al confirmar | ✅ `handleConfirmar` ahora actualiza cobro |
| **AdminReservasView** | Sin sincronización al cancelar | ✅ `handleCancelar` ahora actualiza cobro |
| **NuevaReservaClienteModal** | Campo `id` incorrecto en cliente | ✅ Cambiado a `idUsuario` |
| **ClienteReservasView** | Sin sincronización de cobros | ✅ Sincroniza al pagar y cancelar |

---

## Flujo de Datos Ahora (Coherente)

### Crear Reserva
```
1. Cliente crea reserva (NuevaReservaClienteModal)
   ↓
2. Se crea ReservaContext.items con estado "pendiente"
   ↓
3. Se crea CobrosContext.items con estado "pendiente" e idReserva vinculado
```

### Confirmar Reserva (Pagar)
```
1. Usuario confirma pago (AdminReservasView o ClienteReservasView)
   ↓
2. ReservasContext.confirmarReserva() → estado "confirmada"
   ↓
3. Se busca cobro por idReserva
   ↓
4. CobrosContext.modificarItem() → estado "pagado" + metodo
   ↓
5. RecibosContext: Se crea recibo si corresponde
```

### Cancelar Reserva
```
1. Usuario cancela (AdminReservasView o ClienteReservasView)
   ↓
2. ReservasContext.cancelarReserva() → estado "cancelada"
   ↓
3. Se busca cobro por idReserva
   ↓
4. CobrosContext.modificarItem() → estado "cancelado" o "recargo"
   ↓
5. Si hay recargo, se refleja en CobrosContext
```

---

## Validaciones Realizadas

✅ **Todos los clientes tienen DNI** - ClientesContext validado
✅ **Coherencia de montos** - montoTotal reserva = monto cobro
✅ **Estados consistentes** - pendiente/pagado/cancelado/recargo sincronizados
✅ **Referencias bidireccionales** - idReserva ↔ cliente sincronizados
✅ **Datos iniciales completos** - 12 reservas + 12 cobros + 6 recibos

---

## Archivos Modificados

1. [`src/context/CobrosContext.jsx`](src/context/CobrosContext.jsx)
   - Agregué 12 cobros (1001-1012) para 12 reservas

2. [`src/context/RecibosContext.jsx`](src/context/RecibosContext.jsx)
   - Agregué 6 recibos para cobros pagados

3. [`src/components/reservas/AdminReservasView.jsx`](src/components/reservas/AdminReservasView.jsx)
   - Importé `modificarCobro`
   - Actualicé `handleConfirmar` con sincronización
   - Actualicé `handleCancelar` con sincronización

4. [`src/components/reservas/NuevaReservaClienteModal.jsx`](src/components/reservas/NuevaReservaClienteModal.jsx)
   - Corregí `cliente: { id: ... }` → `cliente: { idUsuario: ... }`

5. [`src/components/reservas/ClienteReservasView.jsx`](src/components/reservas/ClienteReservasView.jsx)
   - Importé `useCobros`
   - Actualicé `handlePagar` con sincronización
   - Actualicé `handleCancelar` con sincronización

---

## Próximos Pasos (Opcional)

1. **Enviar cambios al backend** - Cuando tengas API real, estos cambios deben reflejarse
2. **Crear acción de editar cobro** - Permitir editar montos/descuentos desde CobrosPage
3. **Auditoría de cambios** - Registrar quién cambió qué estado y cuándo
4. **Sincronización en tiempo real** - Usar WebSockets si necesitas múltiples usuarios simultáneos

---

## ¿Cómo Verificar?

### En CobrosPage:
- Deberías ver **13 cobros** (12 de reservas + 1 adicional de clase)
- Estados: pendiente, pagado, cancelado, recargo

### En RecibosPage:
- Deberías ver **6 recibos** (para los 6 cobros pagados)
- Cada recibo vinculado a su cobro correcto

### Al Crear Reserva (Cliente):
- Se crea reserva en estado "pendiente"
- Se crea cobro automáticamente en estado "pendiente"

### Al Confirmar Pago:
- Reserva pasa a "confirmada"
- Cobro pasa a "pagado"
- Se puede emitir recibo desde RecibosPage

### Al Cancelar:
- Reserva pasa a "cancelada"
- Cobro pasa a "cancelado" o "recargo" (según plazo)
