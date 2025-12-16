# 📘 La Biblia del Game Manager Backend: Explicación Archivo por Archivo

Este documento es la guía definitiva. Vamos a recorrer **cada carpeta y cada archivo** del proyecto, explicando por qué existe, qué hace y cómo se conecta con los demás.

Si alguna vez te pierdes, vuelve aquí.

---

## 📂 1. Configuración (`src/config/`)

Aquí definimos las reglas del juego antes de empezar.

### `src/config/env.ts`

- **Qué hace**: Lee el archivo `.env` y aplica una validación **"Fail-Fast"**.
- **Por qué**: Si falta una variable crítica (`JWT_SECRET`, `MONGO_URI`), la app **se niega a arrancar** y lanza un error fatal inmediato. Esto evita que despliegues una app insegura o rota.
- **Detalle**: Usa una función `getEnv` personalizada que lanza error si no encuentra la variable y no tiene valor por defecto.

### `src/config/db.ts`

- **Qué hace**: Conecta a MongoDB.
- **Por qué**: Separamos esto para no ensuciar el `server.ts`.
- **Detalle**: Usa `mongoose.connect()`. Si falla, mata el proceso (`process.exit(1)`).

### `src/config/swagger.ts`

- **Qué hace**: Configura la documentación automática.
- **Por qué**: Para que el frontend sepa qué endpoints existen sin tener que leer tu código. Genera una web en `/api-docs`.

---

## 📂 2. Modelos (`src/models/`)

Definen la forma de los datos en la base de datos. Usamos **Tipado Estricto** con Mongoose, definiendo explícitamente `_id` como `Types.ObjectId` para evitar errores de tipo comunes.

### `src/models/user.model.ts`

- **Qué hace**: Define el usuario (`email`, `password`, `role`).
- **Detalle**: `role` es un enum ('user' | 'admin'). La contraseña se guarda encriptada (hash).

### `src/models/game.model.ts`

- **Qué hace**: Define los juegos del catálogo global.
- **Detalle**: Tiene `title`, `genre`, `platform`, `image` (URL) y `score` (0-10).

### `src/models/userGame.model.ts` (Colección)

- **Qué hace**: Relaciona un Usuario con un Juego.
- **Por qué**: No guardamos los juegos _dentro_ del usuario. Guardamos referencias.
- **Detalle**: Tiene `status` ('playing', 'completed', etc.) y `progress`. Es la "tabla intermedia".

### `src/models/refreshToken.model.ts`

- **Qué hace**: Guarda los tokens de larga duración.
- **Detalle**: Tiene una fecha de `expires` y un campo `revoked`. Es crucial para la seguridad (Refresh Tokens).

### `src/models/index.ts`

- **Qué hace**: Un "Barrel File".
- **Por qué**: Nos permite importar todo desde `../models` en lugar de `../models/user.model`.

---

## 📂 3. DTOs (`src/dtos/`)

Contratos de datos. Definen qué JSON esperamos recibir del frontend.

### `src/dtos/auth.dto.ts`

- **Qué hace**: Define `RegisterUserDto` (email, password, username) y `LoginUserDto`.
- **Por qué**: TypeScript nos avisa si intentamos usar una propiedad que no existe.

### `src/dtos/game.dto.ts`

- **Qué hace**: Define `CreateGameDto` (title, genre...) y `UpdateGameDto`.
- **Detalle**: `UpdateGameDto` tiene todos los campos opcionales (`?`), porque al editar no siempre cambias todo.

### `src/dtos/collection.dto.ts`

- **Qué hace**: Define cómo añadir un juego a tu colección (`AddGameToCollectionDto`) y actualizar progreso (`UpdateCollectionItemDto`).

---

## 📂 4. Validadores (`src/validators/`)

Reglas de validación para `express-validator`.

### `src/validators/auth.validator.ts`

- **Qué hace**: Dice "El email debe ser un email válido" y "La contraseña debe tener min 6 caracteres".
- **Por qué**: Antes de molestar al controlador, nos aseguramos de que los datos tengan sentido.

### `src/validators/game.validator.ts`

- **Qué hace**: Valida que al crear un juego, el título no esté vacío y el score sea un número entre 0 y 10.

---

## 📂 5. Middlewares (`src/middleware/`)

Los guardianes que se ejecutan antes de los controladores.

### `src/middleware/auth.middleware.ts`

- **Misión**: Proteger rutas privadas.
- **Cómo**: Busca el token en el header `Authorization`. Lo verifica con `jwt.verify`. Si es válido, añade el usuario a la request. Si no, error 401.

### `src/middleware/role.middleware.ts`

- **Misión**: Proteger rutas de Admin.
- **Cómo**: Verifica si `req.user.role === 'admin'`. Si no, error 403.

### `src/middleware/validate.middleware.ts`

- **Misión**: Ejecutar las validaciones.
- **Cómo**: Revisa si `express-validator` encontró errores en los pasos anteriores. Si hay errores, devuelve un 400 con la lista.

### `src/middleware/upload.middleware.ts`

- **Misión**: Manejar subida de archivos.
- **Cómo**: Usa `multer` para recibir imágenes y guardarlas en `uploads/` o memoria.

### `src/middleware/error.middleware.ts`

- **Misión**: Capturar cualquier crash.
- **Cómo**: Si un controlador hace `next(error)`, este middleware lo atrapa y devuelve un JSON bonito en lugar de colgar el servidor.

---

## 📂 6. Servicios (`src/services/`)

La lógica de negocio pura. El cerebro.

### `src/services/auth.service.ts`

- **Funciones**: `register`, `login`, `refreshToken`.
- **Lógica**: Hashea contraseñas, genera tokens JWT, gestiona la rotación de Refresh Tokens.
- **Cascade Delete**: Al llamar a `deleteUser`, se encarga de orquestar el borrado de imágenes (`FileService`) y la limpieza de datos asociados (UserGames, Orders, Tokens).

### `src/services/file.service.ts`

- **Qué hace**: Abstrae las operaciones del sistema de archivos (como borrar imágenes).
- **Por qué**: Desacopla la lógica de negocio de la infraestructura. Si mañana cambiamos a S3, solo tocamos este archivo.

### `src/services/game.service.ts`

- **Funciones**: `createGame`, `findAllGames`, `updateGame`, `deleteGame`.
- **Lógica**: Habla con `GameModel`. Aquí es donde se decide si se puede borrar un juego o no.

### `src/services/collection.service.ts`

- **Funciones**: `addToCollection`, `getMyCollection`.
- **Lógica**: Gestiona la relación Usuario-Juego. Evita duplicados (no puedes tener el mismo juego dos veces).

### `src/services/rawg.service.ts` y `steam.service.ts`

- **Qué hacen**: Hablan con las APIs externas.
- **Detalle**: Implementan **Caché** (`node-cache`) para no saturar las APIs y responder rápido.

### `src/services/game-aggregator.service.ts`

- **Qué hace**: El Director de Orquesta.
- **Lógica**: Llama a RAWG, luego a Steam, combina los datos y te devuelve el "Juego Perfecto" con precio y descripción.

### `src/services/cron.service.ts`

- **Qué hace**: Tareas programadas.
- **Detalle**: Se despierta cada noche (03:00 AM) para actualizar los precios de Steam.
- **Nota**: En `server.ts`, envolvemos su inicialización en un `if (process.env.NODE_ENV !== 'test')` para que no interfiera con los tests (evitando "Open Handles").

### `src/services/payment.service.ts`

- **Qué hace**: Simula una pasarela de pagos.
- **Funciones**: `createCheckoutSession`, `processPayment`.
- **Lógica**: Crea una Orden de compra y añade los juegos a la colección del usuario automáticamente.

---

## 📂 7. Controladores (`src/controllers/`)

Los coordinadores HTTP.

### `src/controllers/auth.controller.ts`

- **Qué hace**: Recibe `req.body`, llama a `AuthService.register`, y responde `201 Created`.
- **Detalle**: Maneja las cookies o headers de respuesta.

### `src/controllers/game.controller.ts`

- **Qué hace**: CRUD de juegos.
- **Detalle**: Si hay una imagen subida (`req.file`), se la pasa al servicio. Soporta paginación (`?page=1`) y filtros.

### `src/controllers/collection.controller.ts`

- **Qué hace**: Gestiona la colección personal del usuario.
- **Detalle**: Soporta filtros avanzados (estado, género) y paginación.

### `src/controllers/payment.controller.ts`

- **Qué hace**: Gestiona el proceso de checkout.
- **Endpoint**: `POST /api/payments/checkout`.

---

## 📂 8. Rutas (`src/routes/`)

El mapa de URLs.

### `src/routes/user.routes.ts`

- Define `/register`, `/login`, `/profile`.
- **Nuevo**: Define `GET /api/users` (Admin) para listar todos los usuarios.
- Conecta: Ruta -> Validador -> Middleware Auth -> Controlador.

### `src/routes/game.routes.ts`

- Define `/games` (GET, POST).
- Protege el POST/PUT/DELETE con `isAdmin`.

### `src/routes/collection.routes.ts`

- Define `/collection`.
- Todas requieren `authenticate`.

### `src/routes/payment.routes.ts`

- Define `/checkout` y `/checkout/simulate` (Simulación de compra).
- Requiere autenticación.

### `src/routes/order.routes.ts`

- Define `/my-orders`.
- Permite al usuario ver su historial de compras.

---

## 📂 9. Utils (`src/utils/`)

Herramientas reutilizables.

### `src/utils/password.util.ts`

- **Qué hace**: Wrappers de `bcrypt` (`hashPassword`, `comparePassword`).
- **Por qué**: Para no repetir `bcrypt.hash` en todas partes.

### `src/utils/logger.ts`

- **Qué hace**: Sistema de logging profesional con **Winston**.
- **Detalle**: Genera logs estructurados con timestamp, niveles (INFO, ERROR) y colores.
- **Regla de Oro**: **Nunca uses `console.log`**. El logger permite filtrar errores en producción y guarda un historial limpio, mientras que `console.log` es ruido no estructurado.

### `src/utils/AppError.ts`

- **Qué hace**: Clase personalizada de errores operacionales.
- **Detalle**: Extiende la clase nativa `Error` con códigos de estado HTTP y tipos de error.

---

## 📂 10. Estándares de Documentación (`ai/PROMPT_AI.md`)

**Todos los archivos del proyecto siguen convenciones académicas estrictas**:

### Anatomía de un Archivo Bien Documentado

Cada archivo `.ts` en el proyecto incluye:

#### 1. Comentario de Cabecera (Obligatorio)

```typescript
/**
 * @file filename.ts
 * @description Explains what this file does and its role in the system
 */
```

**Ejemplo real** (`src/services/auth.service.ts`):

```typescript
/**
 * @file auth.service.ts
 * @description Handles all authentication-related business logic:
 * registration, login, token management, and profile updates.
 */
```

#### 2. Comentarios de Función (Obligatorio)

```typescript
/**
 * Function description
 * Additional context if needed
 */
export const functionName = () => { ... }
```

**Ejemplo real** (`src/services/game.service.ts`):

```typescript
/**
 * Search games with filters and pagination
 * Destination: Used by GameController.search (src/controllers/game.controller.ts).
 * Supports filtering by title (regex), genre, and platform.
 * Implements pagination.
 */
export const searchGames = async (query, page, limit, genre, platform) => {
  // Implementation...
};
```

#### 3. Comentarios de Destino en Exports (Obligatorio)

Cada export debe indicar dónde se usa:

```typescript
// Destination: Used by ControllerName.methodName (src/path/to/file.ts)
export const myFunction = () => { ... }
```

**Ejemplo real** (`src/middleware/auth.middleware.ts`):

```typescript
// Authentication Middleware
// Destination: Used in routes (e.g., user.routes.ts, collection.routes.ts) to protect endpoints.
// Intercepts requests to check for a valid Bearer token.
// If valid, populates req.userData with the decoded payload.
const checkAuth = (req, res, next) => { ... }
```

#### 4. Comentarios Inline para Lógica Compleja

```typescript
// Calculate total with multi-currency support
const totalAmount = games.reduce((sum, game) => {
  return sum + (game.price || 1999); // Default 19.99 if no price
}, 0);
```

### ¿Por Qué Estos Estándares?

1. **Onboarding Instantáneo**: Un nuevo desarrollador puede entender cualquier archivo en minutos.
2. **Mapa de Dependencias**: Los comentarios "Destination:" crean un grafo mental de cómo fluyen los datos.
3. **Mantenibilidad**: Cuando modificas una función, sabes exactamente qué controladores se verán afectados.
4. **Documentación Viva**: Los comentarios se actualizan con el código, nunca quedan obsoletos.
5. **Consistencia**: 100% de la codebase sigue el mismo estilo académico.

### Verificación de Cumplimiento

El proyecto ha sido auditado:

- ✅ **73 archivos TypeScript** revisados
- ✅ **100% de cumplimiento** con `ai/PROMPT_AI.md`
- ✅ Verificado con `npm run build` y `npm test`

### Reglas de Oro

1. **Idioma**: Todos los comentarios en **inglés**.
2. **Claridad**: Explica el "por qué", no solo el "qué".
3. **Actualización**: Si cambias código, actualiza los comentarios.
4. **Destino**: Siempre indica dónde se usa un export.

## 📂 10. El Motor (`src/app.ts` vs `src/server.ts`)

Separamos la **definición** de la **ejecución**.

### `src/app.ts` (La Fábrica)

- **Qué hace**: Configura la aplicación Express.
- **Detalle**:
  - Monta los middlewares globales (Helmet, CORS, JSON, Gzip/Compression).
  - Monta las rutas (`/api/...`).
  - Configura el manejador global de errores.
  - **No** arranca el servidor (no hace `listen`). Esto permite importarla en los tests sin ocupar puertos.

### `src/server.ts` (El Ejecutor)

- **Qué hace**: Arranca todo.
- **Pasos**:
  1.  Importa `app`.
  2.  Conecta a la Base de Datos (`connectDB`).
  3.  Inicia tarear programadas (Cron Jobs).
  4.  Llama a `app.listen(PORT)`.

---

## 🤖 11. Scripts ('src/scripts/')

Herramientas de automatización para mantenimiento y carga de datos.

- **`import-pc-games.ts`**: El "Importador". Obtiene juegos de RAWG y precios de Steam, y los guarda en MongoDB y `data/games.json`.
- **`seed.ts`**: El "Restaurador". Lee `data/games.json` y repobla la base de datos limpia. Ideal para resets.
- **`setupTestAdmin.ts`**: Crea un usuario admin para pruebas.
- **`fix-prices.ts`**: Script de utilidad para corregir discrepancias de precios.
- **`validate-phaseX.js`**: Scripts de integridad para el estándar "Validation Driven Development" (VDD).

---

## 🚀 12. Despliegue (Deployment Real)

Cómo llevar tu código del ordenador a un servidor de verdad (Production).

### Pasos para Desplegar

1.  **Construir (Build)**:
    TypeScript no corre directamente en producción. Debemos compilarlo a JavaScript.

    ```bash
    npm run build
    ```

    Esto crea la carpeta `dist/`.

2.  **Configurar Entorno**:
    En tu servidor, crea un archivo `.env` con las variables de producción (DB real, Claves secretas de verdad).

3.  **Ejecutar**:
    Usamos el script de inicio que apunta al código compilado.
    ```bash
    npm run start
    ```
    _(Ejecuta `node dist/server.js`)_

### Recomendación Pro: PM2

En producción, no lanzamos el comando y cruzamos los dedos. Usamos un "Gestor de Procesos" como **PM2**.

- Mantiene la app viva si crashea.
- Se reinicia si reinicias el servidor.
- `pm2 start dist/server.js --name "game-manager-api"`

---

## 🧪 Testing (`tests/`)

Nuestra red de seguridad.

- **`setup.ts`**: Configuración global de tests. Conecta y desconecta la BD automáticamente antes/después de todos los tests.
- **`integration/full-flow.test.ts`**: El "Jefe Final". Simula un flujo completo: Login -> Crear Juego -> Buscar -> Borrar.
- **`auth.refresh.test.ts`**: Valida la seguridad de la rotación de tokens y detección de robos.
- **`rawg.service.test.ts` y `steam.service.test.ts`**: Verifican que la conexión con APIs externas funciona.
- **`order.integration.test.ts`**: Prueba el flujo completo de compra (Mock) y el historial de pedidos.
- **`validation.test.ts`**: Asegura que los DTOs rechacen datos basura (Zod).

---

¡Y eso es todo! Cada archivo tiene un propósito. Nada sobra.
