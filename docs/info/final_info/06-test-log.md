# 🧪 Log de Pruebas y Estrategia de QA

Este documento registra la evolución, estrategia y estado actual del sistema de pruebas del backend.

**Última Actualización**: 14 de Diciembre, 2025
**Estado Global**: 🟢 103/103 Tests Pasando

---

## 1. Filosofía de Testing: "Robustez sobre Fragilidad"

Hemos migrado recientemente de `jest.mock` a `jest.spyOn`.

### ❌ El Pasado (`jest.mock`)

Antiguamente, usábamos `jest.mock('../models/user')` al principio de los archivos.

- **Problema**: Jest "eleva" (hoisting) los mocks antes de que se ejecute cualquier código. Esto hacía que los tests fueran muy sensibles al orden de los imports y difíciles de depurar.
- **Fragilidad**: Si cambiabas el nombre de una exportación, el mock silenciosamente fallaba o se rompía el test suite entero.

### ✅ El Presente (`jest.spyOn`)

Ahora interceptamos las llamadas en el momento de la ejecución.

```typescript
// Patrón Estándar Actual
jest.spyOn(User, "findById").mockResolvedValue(mockUser);
// ... ejecución ...
expect(User.findById).toHaveBeenCalledWith(id);
```

- **Ventaja**: Mantiene el contrato de tipos de TypeScript. Si el método no existe en el Modelo, el test no compila.
- **Limpieza**: Usamos `afterEach(() => jest.restoreAllMocks())` para garantizar que un test no contamine al siguiente.

---

## 2. Cobertura de la Suite

### A. Integración (Routes)

Simulamos peticiones HTTP reales usando `supertest`.

- **Auth**: Registro, Login, Refresh Token Rotation.
- **Game**: CRUD completo, Búsqueda con filtros, Upload de imágenes.
- **Collection**: Gestión de librería personal.
- **Payment**:Flujo de simulación de compra.

### B. Unitarios (Services)

Aislamos la lógica de negocio.

- **GameService**: Verificación de filtros estrictos (`mongoose.mongo.Filter`).
- **PaymentService**: Cálculo de totales y generación de licencias.
- **AuthService**: Hashing de contraseñas y lógica de tokens.

### C. Seguridad y Middlewares

- **RoleMiddleware**: Intenta acceder a rutas de admin siendo usuario normal (debe dar 403).
- **ZodMiddleware**: Envía JSONs malformados (debe dar 400 con detalles).

---

## 3. Comandos de Ejecución

Para correr la suite completa:

```bash
npm test
```

Para correr un archivo específico (útil al desarrollar):

```bash
npm test -- src/services/game.service.test.ts
```

---

## 4. Historial de Mejoras

- **Fase 1**: Tests básicos de rutas.
- **Fase 2**: Integración completa de Auth.
- **Fase 3 (Refactorización)**: Migración masiva a `spyOn` y corrección de "Open Handles" (conexiones de DB que no se cerraban).
- **Fase 4 (Strict Types)**: Actualización de tests para soportar `mongoose.mongo.Filter`.
