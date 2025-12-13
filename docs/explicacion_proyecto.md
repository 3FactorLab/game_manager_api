# 📘 Explicación del Proyecto: Game Manager API

¡Hola! 👋 Bienvenido al proyecto. Al ser un programador junior, es normal que al principio ver tantas carpetas abrume un poco, pero verás que este proyecto sigue una estructura muy limpia y estándar en la industria llamada **Arquitectura por Capas** (Layered Architecture).

Este documento sirve como guía para entender qué hace cada pieza del engranaje. Dado que la carpeta `logs/` suele estar ignorada por git (para no subir archivos de depuración basura), he colocado esta documentación aquí en `docs/`, que es su lugar natural.

---

## 1. ¿Qué es este proyecto?

Es una **API RESTful** construida con **Node.js** y **TypeScript**.
Su función principal es servir datos a un Frontend (como una web de React o Vue). Gestiona:

- 👥 **Usuarios**: Registro, login, roles (Admin/User).
- 🎮 **Videojuegos**: Catálogo, precios, géneros.
- 📦 **Colecciones**: Qué juegos tiene cada usuario y en qué estado (jugando, completado).

---

## 2. El Flujo de la Información (Arquitectura)

Para entender el código, sigue el viaje de un dato desde que entra hasta que se guarda. Usamos el patrón **Controller-Service-Repository (Model)**.

1. **Route (Ruta)**: El "router" recibe la petición (ej. `GET /games`). Decide a qué controlador enviarla.
2. **Middleware** (Opcional): "Porteros" que revisan si tienes permiso o si los datos son válidos antes de dejarte pasar.
3. **Controller (Controlador)**: Es el "recepcionista". Recibe la petición HTTP (`req`), saca los datos necesarios, y llama al experto (Servicio). **Nunca** hace lógica de negocio compleja, solo orquesta.
4. **Service (Servicio)**: Es el "experto/cerebro". Aquí están las reglas del negocio, cálculos y la magia de **Integración** (llamadas a APIs como Steam/RAWG).
5. **Model (Modelo)**: Es el "bibliotecario". Sabe cómo hablar con la Base de Datos (MongoDB) para guardar o recuperar información.

---

## 3. Estructura de Carpetas (`src/`)

Aquí te detallo qué encontrarás en cada carpeta dentro de `src`:

### 🧱 Core

- **`server.ts`**: El "Ejecutor". Inicia la DB y pone al servidor a escuchar (`listen`).
- **`app.ts`**: La "Fábrica". Configura Express, rutas y seguridad, pero no lo arranca (ideal para tests).
- **`config/`**: Configuraciones globales. Aquí verás cómo se conecta a MongoDB o cómo se cargan las variables de entorno (`.env`).

### 🚦 Tráfico y Peticiones

- **`routes/`**: Definen las URLs disponibles (ej. `/api/auth`, `/api/games`).
- **`controllers/`**: Funciones que reciben `req` y `res`. Su trabajo es responder al cliente "Ok, aquí tienes tus datos" o "Error, algo salió mal".
- **`dtos/`** (Data Transfer Objects): Son moldes (interfaces de TypeScript) que definen qué datos esperamos recibir o enviar. Ayudan a que no falte información.
- **`validators/`**: Reglas de validación. Usamos **Zod** para asegurar que los datos sean perfectos ("Fail-Fast").

### 🧠 Lógica y Datos

- **`services/`**: La parte más importante. Aquí ocurre la magia. Si hay que calcular un precio, enviar un correo o filtrar juegos, se hace aquí. Evita poner esta lógica en los controladores.
- **`models/`**: Esquemas de Mongoose. Definen cómo se ven los datos en MongoDB (ej. Un `User` tiene `name`, `email`, `password`).

### 🛡️ Seguridad y Utilidades

- **`middleware/`**: Funciones que se ejecutan _antes_ de llegar al controlador.
  - `auth.ts`: Verifica si el usuario está logueado (Dual Token System: Access + Refresh).
  - `roles.ts`: Verifica si es Admin.
- **`utils/`**: Herramientas genéricas (Logger, Bcrypt, AppError).

### 🤖 Automatización

- **`scripts/`**: Programas que corren fuera del servidor. Aquí está el **Importador** de juegos y los **Seeds** para restaurar la DB.

---

## 4. Ejemplo Práctico: "Crear un Usuario"

Imagina que alguien hace una petición `POST /api/auth/register`. Así fluye por el código:

6. **Server (`server.ts`)** recibe la petición y ve que empieza por `/api/auth`. La manda al router de Auth.
7. **Router (`routes/auth.routes.ts`)** ve que es `/register` y `POST`.
   - Primero pasa por el **Validator** (`registerValidator`) para ver si el email es válido.
   - Si pasa, le entrega el control al **Controller**.
8. **Controller (`controllers/auth.controller.ts`)** en la función `register()`:
   - Recoge `email` y `password` del cuerpo de la petición.
   - Llama a `AuthService.registerUser(email, password)`.
9. **Service (`services/auth.service.ts`)**:
   - Comprueba si el email ya existe en la DB.
   - Encripta la contraseña (hashing).
   - Crea el usuario usando el **Model**.
10. **Model (`models/User.ts`)**: Guarda el documento JSON en MongoDB.
11. **De vuelta**: El Servicio retorna el usuario creado -> El Controlador recibe el usuario y responde con un JSON `201 Created` al cliente.

---

## 5. Tecnologías que debes conocer aquí

- **Mongoose**: Librería para hablar con MongoDB de forma fácil.
- **JWT (Json Web Tokens)**: El "carnet de identidad" digital que usamos para saber quién es quién en cada petición.
- **Swagger**: Si entras a `/api-docs` verás una web para probar la API sin programar nada. ¡Muy útil!

---

¡Ánimo! Es un proyecto muy profesional. Si entiendes este flujo, entenderás el 90% de los backends modernos en Node.js.
