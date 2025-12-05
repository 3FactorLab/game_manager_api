# Guía Completa de Uso de Swagger para Pruebas de API

Esta guía proporciona instrucciones detalladas para probar todos los endpoints de la API de **Game Manager** utilizando la interfaz interactiva de Swagger UI.

## 🔗 1. Acceso a la Documentación

**URL Principal:** [http://localhost:3500/api-docs](http://localhost:3500/api-docs)

> **Importante:** Asegúrate de que el backend esté ejecutándose (`npm run dev`) antes de acceder.

---

## 🔐 2. Autenticación (Paso Crucial)

La mayoría de los endpoints están protegidos por **JWT (JSON Web Token)**. Debes iniciar sesión para obtener un token y autorizarte en Swagger.

### Paso A: Obtener el Token

1.  Ve a la sección **Users** > `POST /api/users/login`.
2.  Haz clic en **Try it out**.
3.  Ingresa el JSON con credenciales válidas:
    ```json
    {
      "email": "admin@test.com",
      "password": "password123"
    }
    ```
4.  Haz clic en **Execute**.
5.  Copia el valor del campo `token` de la respuesta (sin las comillas).

### Paso B: Autorizar en Swagger

1.  Sube al inicio de la página y haz clic en el botón **Authorize** 🔓.
2.  En el cuadro de texto `Value`, escribe la palabra `Bearer` seguida de un espacio y tu token.
    - **Formato:** `Bearer eyJhbGciOiJIUzI1Ni...`
3.  Haz clic en **Authorize** y luego en **Close**.
4.  El candado ahora aparecerá cerrado 🔒, lo que significa que estás listo para probar endpoints protegidos.

---

## 👤 3. Usuarios (Users)

### Registro (`POST /api/users/register`)

Crea una nueva cuenta de usuario.

- **Auth:** No requerida.
- **Tipo:** `multipart/form-data` (Permite subir imagen de perfil).
- **Campos:**
  - `username`: (String) Nombre de usuario.
  - `email`: (String) Correo electrónico único.
  - `password`: (String) Contraseña segura.
  - `image`: (File) _Opcional_. Archivo de imagen para el avatar.
- **Prueba:**
  1.  Clic en **Try it out**.
  2.  Rellena los campos de texto.
  3.  Selecciona un archivo en el campo `image`.

### Perfil (`GET /api/users/profile`)

Obtiene los datos del usuario logueado.

- **Auth:** 🔒 Requerida.
- **Prueba:** Clic en **Try it out** > **Execute**.

### Actualizar Perfil (`PUT /api/users/update`)

Actualiza los datos del usuario logueado.

- **Auth:** 🔒 Requerida.
- **Tipo:** `multipart/form-data`.
- **Campos:** Puedes enviar `username`, `email` o una nueva `image`.

---

## 🎮 4. Juegos (Games)

Estos endpoints gestionan el catálogo global de juegos.

### Listar Juegos (`GET /api/games`)

Busca y filtra juegos del catálogo.

- **Auth:** No requerida.
- **Parámetros (Query):**
  - `query`: Texto para buscar por título.
  - `genre`: Filtrar por género (ej. "Action", "RPG").
  - `platform`: Filtrar por plataforma (ej. "PC", "PS5").
  - `page` y `limit`: Para paginación.

### Crear Juego (`POST /api/games`)

Agrega un juego manualmente al catálogo.

- **Auth:** 🔒 Requerida (Rol Admin).
- **Tipo:** `multipart/form-data`.
- **Campos Clave:**
  - `title`, `genre`, `platform`, `price`, `score` (0-10), `developer`.
  - `image`: Archivo de portada del juego.

### Importar desde RAWG (`POST /api/games/from-rawg`)

Crea un juego importando datos automáticamente desde la API externa de RAWG.

- **Auth:** 🔒 Requerida (Rol Admin).
- **Body (JSON):**
  ```json
  {
    "rawgId": 3498,
    "steamAppId": 12345
  }
  ```

### Buscar en RAWG (`GET /api/games/search`)

Busca juegos en la base de datos externa para obtener su ID.

- **Auth:** 🔒 Requerida.
- **Parámetro:** `q` (Nombre del juego a buscar).

### Eliminar Juego (`DELETE /api/games/{id}`)

- **Auth:** 🔒 Requerida (Rol Admin).
- **Param:** `id` (ID del juego en base de datos).

---

## 📚 5. Colección Personal (Collection)

Gestiona la biblioteca de juegos del usuario (sus juegos guardados).

### Ver Mi Colección (`GET /api/collection`)

- **Auth:** 🔒 Requerida.
- **Filtros:** Puedes filtrar por `status` (playing, completed, plan_to_play, etc.).

### Agregar a Colección (`POST /api/collection`)

Guarda un juego del catálogo global en tu lista personal.

- **Auth:** 🔒 Requerida.
- **Body (JSON):**
  ```json
  {
    "gameId": "651a2b3c4d5e6f...", // ID del juego del catálogo
    "status": "playing", // Opciones: playing, completed, dropped, plan_to_play
    "hoursPlayed": 10,
    "score": 9,
    "review": "Juego increíble"
  }
  ```

### Actualizar Item (`PUT /api/collection/{id}`)

Modifica el estado o reseña de un juego en tu colección.

- **Auth:** 🔒 Requerida.
- **Param:** `id` (Es el ID del _item de la colección_, no del juego global).
- **Body (JSON):**
  ```json
  {
    "status": "completed",
    "hoursPlayed": 50,
    "score": 10
  }
  ```

### Eliminar de Colección (`DELETE /api/collection/{id}`)

- **Auth:** 🔒 Requerida.
- **Param:** `id` (ID del item de colección).

---

## 💳 6. Pagos / Compras (Payments)

### Simular Compra (`POST /api/payments/checkout`)

Simula el proceso de pago para un carrito de compras.

- **Auth:** 🔒 Requerida.
- **Body (JSON):**
  ```json
  {
    "gameIds": ["651a2b3c4d5e6f...", "651a2b3c4d5e7g..."]
  }
  ```
- **Respuesta:** Devuelve `success: true` y un `orderId` simulado.

---

## 💡 Tips para Pruebas Exitosas

1.  **Códigos de Estado:**

    - 🟢 **200/201:** Éxito.
    - 🔴 **400:** Datos inválidos (revisa el JSON o campos faltantes).
    - 🔴 **401:** Token inválido o expirado (vuelve a hacer Login y Authorize).
    - 🔴 **403:** No tienes permisos (intentas acceder a ruta de Admin siendo User).
    - 🔴 **404:** Recurso no encontrado (ID incorrecto).

2.  **IDs:** Al probar endpoints que requieren `{id}`, asegúrate de copiar un ID válido de una respuesta anterior (ej. de `GET /api/games`).

3.  **Imágenes:** En endpoints `multipart/form-data`, Swagger provee un botón para seleccionar archivos desde tu computadora.
