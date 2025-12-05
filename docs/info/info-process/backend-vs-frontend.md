# Separación Backend vs Frontend: Sistema de Compras

## 🔧 BACKEND (Node.js/Express) - LO QUE TÚ HARÁS AQUÍ

### 1. Modelos de Base de Datos (Mongoose)

```typescript
✅ Purchase.model.ts      // Registro de compras
✅ Cart.model.ts          // Carrito de compras
✅ Order.model.ts         // Pedidos/Facturas
✅ Game.model.ts          // MODIFICAR: añadir price, currency, onSale
```

### 2. Servicios (Lógica de Negocio)

```typescript
✅ cart.service.ts
   - getCart(userId)
   - addToCart(userId, gameId)
   - removeFromCart(userId, gameId)
   - clearCart(userId)
   - calculateTotal(userId)

✅ payment.service.ts
   - createPaymentIntent(userId, amount)      // Stripe
   - confirmPayment(paymentIntentId)
   - handleWebhook(stripeEvent)
   - refundPayment(purchaseId)

✅ purchase.service.ts
   - createPurchase(userId, gameId, paymentData)
   - getUserPurchases(userId)
   - verifyOwnership(userId, gameId)
   - getPurchaseById(purchaseId)

✅ order.service.ts
   - createOrder(userId, cartItems)
   - getOrderById(orderId)
   - updateOrderStatus(orderId, status)
   - generateOrderNumber()
```

### 3. Controladores (Endpoints HTTP)

```typescript
✅ cart.controller.ts
   - getCart()           // GET /api/cart
   - addItem()           // POST /api/cart/items
   - removeItem()        // DELETE /api/cart/items/:gameId
   - clearCart()         // DELETE /api/cart

✅ payment.controller.ts
   - createIntent()      // POST /api/payments/create-intent
   - confirmPayment()    // POST /api/payments/confirm
   - handleWebhook()     // POST /api/payments/webhook (Stripe)

✅ purchase.controller.ts
   - getUserPurchases()  // GET /api/purchases
   - getPurchaseById()   // GET /api/purchases/:id

✅ order.controller.ts
   - createOrder()       // POST /api/orders/create
   - getOrders()         // GET /api/orders
   - getOrderById()      // GET /api/orders/:id

✅ library.controller.ts
   - getLibrary()        // GET /api/library
   - checkOwnership()    // GET /api/library/:gameId
```

### 4. Rutas (Express Router)

```typescript
✅ cart.routes.ts         // /api/cart/*
✅ payment.routes.ts      // /api/payments/*
✅ purchase.routes.ts     // /api/purchases/*
✅ order.routes.ts        // /api/orders/*
✅ library.routes.ts      // /api/library/*
```

### 5. Middleware

```typescript
✅ ownership.middleware.ts
   - checkGameOwnership()  // Prevenir comprar juego que ya posees

✅ validators/purchase.validator.ts
   - validatePurchase
   - validateAddToCart
```

### 6. Integración con Stripe

```typescript
✅ Configurar Stripe SDK
✅ Crear Payment Intents
✅ Manejar Webhooks (confirmación de pago)
✅ Procesar reembolsos
```

### 7. Seguridad Backend

```typescript
✅ Verificar precios en backend (no confiar en frontend)
✅ Validar webhook signature de Stripe
✅ Prevenir compras duplicadas
✅ Transacciones atómicas (MongoDB)
✅ Rate limiting en endpoints de pago
```

---

## 🎨 FRONTEND (React/Angular/Vue) - LO QUE HARÁS EN OTRO PROYECTO

### 1. Páginas/Vistas

```typescript
❌ CatalogPage.tsx          // Mostrar juegos con precios
❌ GameDetailPage.tsx       // Detalle de juego + botón "Comprar"
❌ CartPage.tsx             // Ver carrito, modificar cantidades
❌ CheckoutPage.tsx         // Formulario de pago (Stripe)
❌ LibraryPage.tsx          // Juegos comprados del usuario
❌ OrderHistoryPage.tsx     // Historial de pedidos
❌ OrderDetailPage.tsx      // Detalle de un pedido
```

### 2. Componentes UI

```typescript
❌ GameCard.tsx             // Tarjeta de juego con precio
❌ AddToCartButton.tsx      // Botón "Añadir al carrito"
❌ CartIcon.tsx             // Icono de carrito con badge (cantidad)
❌ CartItem.tsx             // Item del carrito (eliminar, ver precio)
❌ PriceTag.tsx             // Mostrar precio con descuento
❌ PaymentForm.tsx          // Formulario de Stripe Elements
❌ OrderSummary.tsx         // Resumen de pedido (subtotal, tax, total)
❌ PurchaseConfirmation.tsx // Confirmación post-compra
```

### 3. Servicios/API Calls (Frontend)

```typescript
❌ cartService.ts
   - getCart()              // GET /api/cart
   - addToCart(gameId)      // POST /api/cart/items
   - removeFromCart(gameId) // DELETE /api/cart/items/:gameId
   - clearCart()            // DELETE /api/cart

❌ paymentService.ts
   - createPaymentIntent()  // POST /api/payments/create-intent
   - confirmPayment(data)   // POST /api/payments/confirm

❌ purchaseService.ts
   - getPurchases()         // GET /api/purchases
   - getPurchaseById(id)    // GET /api/purchases/:id

❌ orderService.ts
   - createOrder()          // POST /api/orders/create
   - getOrders()            // GET /api/orders
   - getOrderById(id)       // GET /api/orders/:id

❌ libraryService.ts
   - getLibrary()           // GET /api/library
   - checkOwnership(gameId) // GET /api/library/:gameId
```

### 4. Estado Global (Redux/Zustand/Context)

```typescript
❌ cartStore.ts
   - cart: ICart
   - addToCart(gameId)
   - removeFromCart(gameId)
   - clearCart()
   - totalItems
   - totalPrice

❌ libraryStore.ts
   - ownedGames: Game[]
   - checkIfOwned(gameId)
```

### 5. Integración con Stripe (Frontend)

```typescript
❌ Instalar @stripe/stripe-js
❌ Instalar @stripe/react-stripe-js (si usas React)
❌ Crear componente de formulario de pago
❌ Manejar confirmación de pago
❌ Redirigir tras compra exitosa
```

### 6. Lógica de UI

```typescript
❌ Mostrar badge de carrito con cantidad de items
❌ Deshabilitar botón "Comprar" si ya posee el juego
❌ Mostrar "En tu biblioteca" si ya lo compró
❌ Animaciones de añadir al carrito
❌ Notificaciones de compra exitosa
❌ Manejo de errores de pago
```

---

## 📊 FLUJO COMPLETO: Backend ↔ Frontend

### Ejemplo: Usuario compra un juego

#### 1️⃣ Usuario ve el catálogo (Frontend)

```typescript
// Frontend llama a:
GET /api/games?page=1&limit=10

// Backend responde:
{
  games: [
    { _id: "123", title: "Elden Ring", price: 5999, currency: "USD" }
  ]
}
```

#### 2️⃣ Usuario añade al carrito (Frontend → Backend)

```typescript
// Frontend envía:
POST /api/cart/items
{ gameId: "123" }

// Backend:
✅ Verifica que el juego existe
✅ Verifica que no lo posee ya
✅ Añade al carrito en DB
✅ Responde con carrito actualizado
```

#### 3️⃣ Usuario va al checkout (Frontend → Backend)

```typescript
// Frontend envía:
POST /api/payments/create-intent
{ cartId: "cart123" }

// Backend:
✅ Calcula total (NO confía en frontend)
✅ Crea PaymentIntent en Stripe
✅ Responde con clientSecret

// Frontend:
❌ Muestra formulario de Stripe
❌ Usuario ingresa tarjeta
```

#### 4️⃣ Usuario confirma pago (Frontend → Stripe → Backend)

```typescript
// Frontend:
❌ Llama a stripe.confirmCardPayment(clientSecret)

// Stripe:
✅ Procesa pago
✅ Envía webhook a backend

// Backend (webhook):
✅ Verifica signature
✅ Crea Purchase en DB
✅ Añade juegos a biblioteca del usuario
✅ Vacía carrito
✅ Crea Order/Factura

// Frontend:
❌ Redirige a página de confirmación
❌ Muestra "¡Compra exitosa!"
```

#### 5️⃣ Usuario ve su biblioteca (Frontend)

```typescript
// Frontend llama a:
GET / api / library;

// Backend responde:
{
  games: [{ _id: "123", title: "Elden Ring", purchaseDate: "2024-12-04" }];
}
```

---

## 🎯 RESUMEN RÁPIDO

### BACKEND (Tu trabajo actual)

- ✅ **Modelos**: Purchase, Cart, Order
- ✅ **Servicios**: Lógica de negocio
- ✅ **Controladores**: Endpoints HTTP
- ✅ **Rutas**: Definir URLs
- ✅ **Stripe**: Crear intents, webhooks
- ✅ **Seguridad**: Validaciones, precios

### FRONTEND (Proyecto separado)

- ❌ **Páginas**: Catálogo, Carrito, Checkout, Biblioteca
- ❌ **Componentes**: Botones, formularios, tarjetas
- ❌ **API Calls**: Consumir endpoints del backend
- ❌ **Stripe UI**: Formulario de pago
- ❌ **Estado**: Gestionar carrito en memoria

---

## 📝 EJEMPLO CONCRETO

### Backend crea esto:

```typescript
// POST /api/cart/items
router.post("/items", checkAuth, validateAddToCart, async (req, res) => {
  const { gameId } = req.body;
  const userId = req.userData.id;

  const cart = await addToCart(userId, gameId);
  res.json({ cart });
});
```

### Frontend consume esto:

```typescript
// cartService.ts
export const addToCart = async (gameId: string) => {
  const response = await fetch("/api/cart/items", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ gameId }),
  });
  return response.json();
};

// CartButton.tsx
const handleAddToCart = async () => {
  await addToCart(game._id);
  showNotification("Añadido al carrito!");
};
```

---

## ✅ CHECKLIST PARA TI (Backend)

- [ ] Crear modelos (Purchase, Cart, Order)
- [ ] Crear servicios (cart, payment, purchase, order)
- [ ] Crear controladores (cart, payment, purchase, order, library)
- [ ] Crear rutas (definir endpoints)
- [ ] Integrar Stripe (SDK, webhooks)
- [ ] Añadir validaciones y middleware
- [ ] Documentar en Swagger
- [ ] Escribir tests

**El frontend solo consumirá tus endpoints. Tú no tienes que hacer UI.**
