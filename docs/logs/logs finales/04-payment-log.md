# 💳 Payment System Implementation Log

## 1. Descripción General

El sistema de pagos implementado es una **Simulación (Mock)** diseñada para permitir el flujo completo de "Checkout" sin depender de pasarelas reales (Stripe/PayPal) durante la fase de desarrollo. Esto permite probar la creación de órdenes y la asignación de juegos sin fricción.

## 2. Componentes Implementados

### A. Modelos (`src/models/order.model.ts`)

- **Schema de Orden**:
  - `user`: Quién compra.
  - `games`: Array de IDs de juegos comprados.
  - `totalAmount`: Precio total calculado en el backend.
  - `status`: Enum (`pending`, `completed`, `failed`).
  - `stripePaymentIntentId`: Campo reservado para el ID real de la transacción (ahora usamos un mock ID).

### B. Servicios (`src/services/payment.service.ts`)

- **Lógica de Simulación**:
  - `processPayment(user, games)`:
    1.  Calcula el total sumando los precios de los juegos (con fallback de seguridad).
    2.  Crea la Orden en estado `COMPLETED` inmediatamente.
    3.  Genera un ID de transacción falso (`mock_pi_...`).
    4.  **Entrega de Producto**: Llama a la base de datos para añadir los juegos a la colección del usuario (`UserGame`) con estado `PENDING` (listo para jugar).

### C. Controladores (`src/controllers/payment.controller.ts`)

- **Endpoints**:
  - `POST /api/payments/checkout`:
    - Recibe: `{ gameIds: ["id1", "id2"] }`.
    - Valida: Que los juegos existan y el usuario esté autenticado.
    - Ejecuta: Llama al servicio de pago.
    - Responde: `{ success: true, orderId: "..." }`.

## 3. Flujo de Compra

1.  **Frontend**: Usuario hace clic en "Comprar" en el carrito.
2.  **Backend**:
    - Recibe la lista de juegos.
    - Verifica precios en BD (nunca confía en el cliente).
    - Crea el registro de venta.
    - Actualiza la biblioteca del usuario.
3.  **Resultado**: El usuario ve inmediatamente los juegos en su perfil.

## 4. Futura Migración a Stripe

La arquitectura está preparada para ser reemplazada fácilmente:

- Solo será necesario modificar `payment.service.ts`.
- En lugar de crear la orden `COMPLETED` directamente, se creará un `PaymentIntent` de Stripe y se devolverá el `clientSecret` al frontend.
- Se necesitará un Webhook para escuchar la confirmación de Stripe y entonces liberar los juegos.
