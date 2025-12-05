# Registro de Implementación: Sistema de Compras de Juegos

**Fecha:** 4 de Diciembre de 2025
**Estado:** Completado
**Tipo:** Simulación Interna (Mock)

## 1. Objetivo

Implementar un sistema que permita a los usuarios adquirir juegos del catálogo, generando un historial de transacciones y actualizando su biblioteca personal, sin depender de pasarelas de pago externas complejas.

## 2. Arquitectura Implementada

### Modelo de Datos

- **`Order` (Nuevo Modelo)**:
  - Registra cada transacción.
  - Campos: `user`, `games` (array de IDs), `totalAmount`, `currency`, `status` (siempre "completed"), `createdAt`.
  - Propósito: Mantener un historial auditoriable de compras.
- **`UserGame` (Actualizado)**:
  - Nuevo campo: `isOwned: boolean`.
  - Propósito: Diferenciar entre juegos que el usuario simplemente sigue o tiene en "wishlist" de los que ha comprado legítimamente.

### Lógica de Negocio (`PaymentService`)

Se ha implementado un servicio de **Simulación de Pagos** (`PaymentService.ts`) que actúa como un "banco interno":

1.  **Cálculo de Precio**: Suma el precio de todos los juegos solicitados. Si un juego no tiene precio, asume un valor por defecto (19.99€).
2.  **Procesamiento Instantáneo**:
    - Crea el documento `Order` en la base de datos.
    - Genera un ID de transacción simulado (`mock_pi_...`).
3.  **Entrega de Producto**:
    - Busca o crea la entrada en `UserGame` para cada juego.
    - Marca `isOwned = true`.
    - Establece el estado inicial como `PENDING` (listo para jugar).

### API Endpoints

- **`POST /api/payments/checkout`**:
  - **Entrada**: `{ gameIds: ["id1", "id2"] }`
  - **Proceso**: Valida usuario, busca juegos, ejecuta la simulación.
  - **Salida**: `{ success: true, orderId: "...", message: "Payment successful (Mock)" }`

## 3. Flujo de Usuario

1.  El usuario selecciona juegos en el Frontend y hace clic en "Comprar".
2.  El Frontend envía los IDs al Backend.
3.  El Backend procesa la "compra" instantáneamente.
4.  El usuario recibe confirmación y los juegos aparecen inmediatamente en su biblioteca como "En Propiedad".

## 4. Ventajas de esta Implementación

- **Simplicidad**: Cero configuración externa (sin API Keys de Stripe).
- **Robustez**: No depende de servicios de terceros ni de conexión a internet para validar pagos.
- **Rapidez**: Ideal para demostraciones y entornos de desarrollo, ya que el feedback es inmediato.
