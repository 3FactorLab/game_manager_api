# Plan de Implementación: Sistema de Compra de Juegos

## Objetivo

Permitir a los usuarios comprar juegos del catálogo, gestionar su biblioteca de juegos comprados, y procesar pagos de forma segura.

---

## 1. Análisis de Requisitos

### Funcionalidades Core

- [ ] Usuario puede ver precio de juegos en el catálogo
- [ ] Usuario puede añadir juegos al carrito
- [ ] Usuario puede procesar pago (integración con pasarela)
- [ ] Usuario tiene biblioteca de juegos comprados
- [ ] Sistema de historial de compras/facturas
- [ ] Prevención de compras duplicadas

### Decisiones de Diseño a Tomar

1. **¿Qué pasarela de pago usar?**

   - Stripe (recomendado: fácil integración, bien documentado)
   - PayPal
   - Mercado Pago (si es para LATAM)

2. **¿Modelo de precios?**

   - Precio fijo por juego
   - Descuentos/promociones
   - Bundles de juegos

3. **¿Relación con colección actual?**
   - ¿Comprar un juego lo añade automáticamente a la colección?
   - ¿O son sistemas separados? (Comprado vs. En Colección)

---

## 2. Cambios en la Base de Datos

### 2.1 Modificar Modelo `Game`

```typescript
// Añadir campos de precio
price?: number;           // Precio en centavos (ej: 1999 = $19.99)
currency?: string;        // "USD", "EUR", etc.
discount?: number;        // Porcentaje de descuento (0-100)
onSale?: boolean;         // Si está en oferta
releaseDate?: Date;       // Fecha de lanzamiento
```

### 2.2 Nuevo Modelo: `Purchase` (Compra)

```typescript
interface IPurchase {
  user: ObjectId; // Usuario que compra
  game: ObjectId; // Juego comprado
  price: number; // Precio pagado (histórico)
  currency: string; // Moneda
  paymentMethod: string; // "stripe", "paypal", etc.
  paymentIntentId: string; // ID de la transacción en la pasarela
  status: PurchaseStatus; // "pending", "completed", "failed", "refunded"
  purchaseDate: Date;
  refundDate?: Date;
  refundReason?: string;
}

enum PurchaseStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}
```

### 2.3 Nuevo Modelo: `Cart` (Carrito)

```typescript
interface ICart {
  user: ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface ICartItem {
  game: ObjectId;
  price: number; // Precio en el momento de añadir
  addedAt: Date;
}
```

### 2.4 Nuevo Modelo: `Order` (Pedido/Factura)

```typescript
interface IOrder {
  user: ObjectId;
  orderNumber: string; // "ORD-20231204-001"
  items: IOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  paymentIntentId: string;
  status: OrderStatus;
  createdAt: Date;
  completedAt?: Date;
}

interface IOrderItem {
  game: ObjectId;
  title: string; // Snapshot del título
  price: number;
  discount: number;
}

enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}
```

---

## 3. Nuevas Rutas y Endpoints

### 3.1 Carrito (`/api/cart`)

```
GET    /api/cart                    - Obtener carrito del usuario
POST   /api/cart/items              - Añadir juego al carrito
DELETE /api/cart/items/:gameId      - Eliminar juego del carrito
DELETE /api/cart                    - Vaciar carrito
```

### 3.2 Compras (`/api/purchases`)

```
GET    /api/purchases               - Historial de compras del usuario
GET    /api/purchases/:id           - Detalle de una compra
POST   /api/purchases/refund/:id    - Solicitar reembolso (Admin)
```

### 3.3 Pedidos (`/api/orders`)

```
POST   /api/orders/create           - Crear pedido desde carrito
GET    /api/orders                  - Historial de pedidos
GET    /api/orders/:id              - Detalle de pedido
```

### 3.4 Pagos (`/api/payments`)

```
POST   /api/payments/create-intent  - Crear intención de pago (Stripe)
POST   /api/payments/confirm        - Confirmar pago
POST   /api/payments/webhook        - Webhook de Stripe
```

### 3.5 Biblioteca (`/api/library`)

```
GET    /api/library                 - Juegos comprados del usuario
GET    /api/library/:gameId         - Verificar si posee un juego
```

---

## 4. Servicios a Crear

### 4.1 `cart.service.ts`

- `getCart(userId)` - Obtener carrito
- `addToCart(userId, gameId)` - Añadir juego
- `removeFromCart(userId, gameId)` - Eliminar juego
- `clearCart(userId)` - Vaciar carrito
- `calculateTotal(userId)` - Calcular total

### 4.2 `payment.service.ts`

- `createPaymentIntent(userId, amount)` - Crear intención de pago en Stripe
- `confirmPayment(paymentIntentId)` - Confirmar pago
- `handleWebhook(event)` - Procesar webhook de Stripe
- `refundPayment(purchaseId)` - Procesar reembolso

### 4.3 `purchase.service.ts`

- `createPurchase(userId, gameId, paymentData)` - Registrar compra
- `getUserPurchases(userId)` - Historial de compras
- `verifyOwnership(userId, gameId)` - Verificar si posee el juego
- `requestRefund(purchaseId, reason)` - Solicitar reembolso

### 4.4 `order.service.ts`

- `createOrder(userId, cartItems)` - Crear pedido
- `getOrderById(orderId)` - Obtener pedido
- `updateOrderStatus(orderId, status)` - Actualizar estado
- `generateOrderNumber()` - Generar número único

---

## 5. Middleware y Validaciones

### 5.1 Validadores

```typescript
// validators/purchase.validator.ts
export const validatePurchase = [
  body("gameId").isMongoId().withMessage("Invalid game ID"),
  body("paymentMethodId").notEmpty().withMessage("Payment method required"),
  validate,
];

// validators/cart.validator.ts
export const validateAddToCart = [
  body("gameId").isMongoId().withMessage("Invalid game ID"),
  validate,
];
```

### 5.2 Middleware de Verificación

```typescript
// middleware/ownership.middleware.ts
export const checkGameOwnership = async (req, res, next) => {
  const { gameId } = req.params;
  const userId = req.userData.id;

  const alreadyOwns = await verifyOwnership(userId, gameId);
  if (alreadyOwns) {
    return res.status(400).json({ message: "You already own this game" });
  }
  next();
};
```

---

## 6. Integración con Stripe

### 6.1 Configuración

```bash
npm install stripe
```

### 6.2 Variables de Entorno

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 6.3 Flujo de Pago

1. Usuario añade juegos al carrito
2. Usuario inicia checkout
3. Backend crea `PaymentIntent` en Stripe
4. Frontend muestra formulario de Stripe
5. Usuario completa pago
6. Stripe envía webhook a backend
7. Backend verifica webhook y crea `Purchase`
8. Backend añade juegos a biblioteca del usuario

---

## 7. Seguridad y Validaciones

### 7.1 Prevención de Fraude

- [ ] Verificar que el precio no haya sido manipulado (calcular en backend)
- [ ] Validar webhook signature de Stripe
- [ ] Prevenir compras duplicadas
- [ ] Rate limiting en endpoints de pago

### 7.2 Manejo de Errores

- [ ] Transacciones atómicas (si pago falla, revertir todo)
- [ ] Logs detallados de transacciones
- [ ] Sistema de retry para webhooks fallidos

---

## 8. Testing

### 8.1 Tests Unitarios

- [ ] `cart.service.test.ts` - Lógica de carrito
- [ ] `payment.service.test.ts` - Integración con Stripe (mocked)
- [ ] `purchase.service.test.ts` - Creación de compras

### 8.2 Tests de Integración

- [ ] Flujo completo: Carrito → Pago → Compra → Biblioteca
- [ ] Manejo de pagos fallidos
- [ ] Webhooks de Stripe

---

## 9. Documentación

### 9.1 Swagger

- [ ] Documentar todos los nuevos endpoints
- [ ] Schemas para Cart, Purchase, Order
- [ ] Ejemplos de request/response

### 9.2 README

- [ ] Instrucciones de configuración de Stripe
- [ ] Flujo de compra explicado
- [ ] Testing con tarjetas de prueba

---

## 10. Orden de Implementación Recomendado

### Fase 1: Fundamentos (1-2 días)

1. Crear modelos: `Purchase`, `Cart`, `Order`
2. Migrar modelo `Game` (añadir precio)
3. Crear servicios básicos de carrito

### Fase 2: Integración de Pago (2-3 días)

4. Configurar Stripe
5. Crear `payment.service.ts`
6. Implementar endpoints de pago
7. Configurar webhooks

### Fase 3: Lógica de Negocio (1-2 días)

8. Implementar `purchase.service.ts`
9. Crear endpoint de biblioteca
10. Prevención de compras duplicadas

### Fase 4: Testing y Refinamiento (1-2 días)

11. Tests unitarios e integración
12. Documentación Swagger
13. Manejo de errores y edge cases

### Fase 5: Features Adicionales (Opcional)

14. Sistema de reembolsos
15. Descuentos y cupones
16. Historial de facturas

---

## 11. Consideraciones Adicionales

### 11.1 Relación con Colección Actual

**Opción A**: Comprar un juego lo añade automáticamente a la colección

- Pros: Simplicidad, UX fluida
- Contras: Mezcla conceptos (comprado vs. jugando)

**Opción B**: Sistemas separados (Biblioteca vs. Colección)

- Pros: Separación clara, más flexible
- Contras: Más complejidad

**Recomendación**: Opción B. La biblioteca es "juegos que posees", la colección es "juegos que estás jugando/rastreando".

### 11.2 Precios y Monedas

- Almacenar precios en **centavos** (evita problemas de punto flotante)
- Soportar múltiples monedas desde el inicio
- Considerar conversión de divisas (API externa)

### 11.3 Escalabilidad

- Usar transacciones de MongoDB para operaciones críticas
- Implementar cola de trabajos para procesamiento de webhooks (Bull/BullMQ)
- Cachear biblioteca de usuarios (Redis)

---

## 12. Recursos y Referencias

### Documentación

- [Stripe Docs](https://stripe.com/docs)
- [Stripe Node.js SDK](https://github.com/stripe/stripe-node)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

### Ejemplos de Código

- [Stripe Payment Intents](https://stripe.com/docs/payments/payment-intents)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)

---

## Próximos Pasos

1. **Decidir**: ¿Qué pasarela de pago usar? (Stripe recomendado)
2. **Diseñar**: ¿Cómo se relaciona biblioteca con colección?
3. **Prototipar**: Crear modelos y servicios básicos
4. **Integrar**: Configurar Stripe en modo test
5. **Testear**: Flujo completo con tarjetas de prueba
6. **Desplegar**: Configurar webhooks en producción

---

**Estimación Total**: 6-10 días de desarrollo (1 desarrollador)

**Prioridad**: Media-Alta (feature comercial importante)

**Riesgo**: Medio (integración con terceros, manejo de dinero)
