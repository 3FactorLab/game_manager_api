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
  1.  Usuario se registra.
  2.  Hace Login y obtiene token.
  3.  Busca un juego.
  4.  Añade el juego a su biblioteca.
  5.  Borra su cuenta.
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

## 5. Resumen de Cobertura

Actualmente contamos con **61 tests** que cubren:

- ✅ Autenticación (Registro, Login, Refresh Token).
- ✅ Gestión de Usuarios (Perfil, Borrado).
- ✅ Catálogo de Juegos (CRUD, Búsqueda).
- ✅ Integraciones (RAWG, Steam).
- ✅ Pagos (Flujo de Checkout simulado).
