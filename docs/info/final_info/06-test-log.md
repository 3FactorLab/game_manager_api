# 🧪 Testing Strategy & Implementation Log

## 1. Filosofía de Testing

En este proyecto, hemos adoptado una estrategia de **"Confianza Total"**. No buscamos el 100% de cobertura de líneas por vanidad, sino cubrir el 100% de los **casos de uso críticos**. Si los tests pasan, el despliegue a producción debe ser seguro.

## 2. Stack Tecnológico

- **Jest**: Framework principal (Runner, Assertions, Mocks).
- **Supertest**: Para peticiones HTTP reales a nuestra API Express (Integration Testing).
- **MongoMemoryServer** (Opcional/Configurable): Para bases de datos efímeras durante los tests, aunque en este entorno usamos una BD de test dedicada en Atlas para mayor realismo.

## 3. Tipos de Tests Implementados

### A. Unit Testing (Pruebas Unitarias)

- **Objetivo**: Probar funciones aisladas sin dependencias externas.
- **Ejemplo**: `auth.service.test.ts`
  - Probamos que la función de hashing genere strings diferentes.
  - Probamos que la validación de contraseñas falle con inputs incorrectos.
  - **Mocking**: Simulamos la base de datos para no tocar la real.

### B. Integration Testing (Pruebas de Integración)

- **Objetivo**: Probar que las piezas (Rutas -> Controladores -> Servicios -> BD) funcionen juntas.
- **Ejemplo**: `auth.routes.test.ts`
  - Enviamos un `POST /register` real con Supertest.
  - Verificamos que responda `201 Created`.
  - Verificamos que devuelva un JWT válido.
  - Verificamos que el usuario realmente se haya creado en MongoDB.

### C. End-to-End (E2E) / Flujos Completos

- **La Joya de la Corona**: `tests/integration/full-flow.test.ts`
- Simula una sesión de usuario completa:
  1. Usuario se registra.
  2. Hace Login y obtiene token.
  3. Busca un juego.
  4. Añade el juego a su biblioteca.
  5. Borra su cuenta.
- Este test garantiza que el sistema funciona como un todo coherente.

## 4. Estrategias Clave

### 🛡️ Fail-Fast

Los tests verifican las variables de entorno (`.env`) al inicio. Si falta la conexión a Mongo o la API Key de RAWG, fallan inmediatamente antes de intentar nada, ahorrando tiempo de depuración.

### 🧹 Limpieza Automática (Teardown)

Usamos los hooks `beforeAll` y `afterAll` de Jest para:

- Conectar a la BD antes de empezar.
- Limpiar las colecciones (borrar usuarios de test) al terminar.
- Cerrar conexiones para evitar que Jest se quede colgado (Open Handles).

### 🎭 Mocking de APIs Externas

Para evitar depender de que RAWG o Steam estén online (y para no gastar cuota de API), en muchos tests simulamos sus respuestas.

- Si pedimos "GTA V", nuestro Mock devuelve un JSON fijo predecible.
- Esto hace que los tests sean **rápidos** y **deterministas**.

## 5. Resumen de Cobertura y Métricas (Actualizado)

Contamos con una suite robusta de **85 tests** que garantizan la estabilidad del sistema:

- **Tests de Integración (Routes)**: Verifican flujos HTTP completos (`/register`, `/checkout`, `/games`).
- **Tests de Lógica (Services)**: Validan reglas de negocio complejas y cálculos.
- **Tests de Seguridad**: Roles, validación de tokens y manejo de errores.

### 🏆 Hitos de Calidad

1. **Global Setup**: Implementación de `tests/setup.ts` para gestión eficiente de conexiones MongoDB.
2. **100% Pass Rate**: Todos los tests de Auth, Catálogo, Pagos y Usuarios pasan en CI/CD local.
3. **Cobertura de Casos Borde**: Manejo de 404s, 401s, y errores de validación.

### Desglose de Tests Principales

- `auth.*`: Login, Registro, Refresh Token.
- `catalog.*` / `game.*`: CRUD de juegos, Búsqueda pública.
- `order.integration`: Flujo completo de compra y pagos simulados.
- `collection.service`: Lógica de biblioteca de usuario.
- `validation.test.ts`: Validación estricta de DTOs con Zod.
- `auth.refresh.test.ts`: Seguridad de rotación de tokens.
- `user.delete.test.ts`: Integridad referencial (Cascade Delete).
