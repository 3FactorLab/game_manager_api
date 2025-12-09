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

- Define `/checkout`.
- Requiere autenticación.

---

## 📂 9. Utils (`src/utils/`)

Herramientas reutilizables.

### `src/utils/password.util.ts`

- **Qué hace**: Wrappers de `bcrypt` (`hashPassword`, `comparePassword`).
- **Por qué**: Para no repetir `bcrypt.hash` en todas partes.

### `src/utils/logger.ts`

- **Qué hace**: Sistema de logging profesional con **Winston**.
- **Detalle**: Genera logs estructurados con timestamp, niveles (INFO, ERROR) y colores. Reemplaza a `console.log` para mejor observabilidad.

---

## 📂 10. El Jefe (`src/server.ts`)

El archivo principal.

1. Inicia Express.
2. Conecta DB.
3. Configura CORS y JSON.
4. Define las rutas base (`/api/users`, `/api/games`, `/api/payments`).
5. Arranca el servidor (`app.listen`) usando `logger.info` para confirmar que todo está listo.

---

## 🐳 11. Docker (`Dockerfile` & `docker-compose.yml`)

La infraestructura como código.

### `Dockerfile`

- **Qué hace**: Empaqueta la aplicación en una imagen de Linux Alpine.
- **Pasos**: Copia el código, instala dependencias, compila TypeScript y deja lista la app para producción.

### `docker-compose.yml`

- **Qué hace**: Orquesta los contenedores.
- **Servicios**:
  - `backend`: Nuestra app Node.js (Puerto 3500).
  - `mongo`: La base de datos (Puerto 27017).
  - `mongo-express`: Interfaz web para ver la DB (Puerto 8081).

---

## 🧪 Testing (`tests/`)

Nuestra red de seguridad.

- **`integration/full-flow.test.ts`**: El test más importante. Simula un usuario real haciendo de todo.
- **`auth.service.test.ts`**: Prueba unitaria del registro.
- **`catalog.test.ts`**: Prueba específica del catálogo.
- **`payment.service.test.ts`**: Prueba la lógica de pagos y órdenes.

---

¡Y eso es todo! Cada archivo tiene un propósito. Nada sobra.
