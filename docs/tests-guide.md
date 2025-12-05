# 🧪 Guía de Testing y Documentación API

Esta guía te explica cómo verificar que el backend funciona correctamente utilizando nuestra suite de tests automatizados y cómo explorar la API visualmente con Swagger.

---

## 1. Ejecutar los Tests

Usamos **Jest** como framework de testing. Tenemos configurados scripts en `package.json` para facilitarte la vida.

### ✅ Ejecutar TODOS los tests

Este es el comando principal. Ejecuta tanto pruebas unitarias como de integración.

```bash
npm test
```

> **Nota sobre Logs**: Verás logs detallados con colores y fechas (gracias a Winston). Esto es normal y te ayuda a depurar.
> **Importante**: Los tests también validan las variables de entorno. Si tu `.env` está mal configurado, los tests fallarán inmediatamente ("Fail-Fast").

### 🔍 Ejecutar un test específico

Si solo quieres probar un archivo (por ejemplo, el flujo de autenticación), puedes pasar la ruta del archivo:

```bash
npx jest tests/auth.routes.test.ts
```

O incluso filtrar por nombre del test:

```bash
npx jest -t "should register a new user"
```

---

## 2. Estructura de los Tests (`tests/`)

Nuestros tests están divididos por funcionalidad:

### 🚀 Tests de Integración (Los más importantes)

Simulan un flujo real de usuario de principio a fin.

- **`tests/integration/full-flow.test.ts`**:
  - Este es el "Jefe Final"
  - Crea un usuario Admin temporal
  - Se loguea y obtiene Tokens
  - Crea un juego real en la BD
  - Lo busca, lo edita y lo borra
  - **Si este test pasa, tu backend funciona**

### 🛡️ Tests de Autenticación

- **`auth.routes.test.ts`**: Prueba los endpoints `/register` y `/login`
- **`auth.service.test.ts`**: Prueba la lógica interna (hashing de contraseñas) sin llamar a la API

### 🎮 Tests de Juegos (Catálogo)

- **`catalog.test.ts`**: Verifica que se pueden listar y filtrar juegos
- **`game.delete.test.ts`**: Verifica que solo los Admins pueden borrar
- **`game.update.test.ts`**: Verifica la edición de juegos

### 💳 Tests de Pagos

- **`payment.service.test.ts`**: Verifica la creación de órdenes y el acceso a la librería.

---

## 3. Acceder a la Documentación Swagger

Swagger (OpenAPI) genera una página web interactiva donde puedes ver y probar todos los endpoints de tu API sin escribir código.

### Pasos para ver Swagger

1.  **Arranca el servidor** en modo desarrollo:

    ```bash
    npm run dev
    ```

    _(Verás un mensaje: `Server running on port 3500`)_

    > **Nota**: Si falta alguna variable de entorno crítica, el servidor no arrancará. Revisa tu consola.

2.  **Abre tu navegador** y ve a:
    👉 **[http://localhost:3500/api-docs](http://localhost:3500/api-docs)**

### ¿Qué puedes hacer ahí?

- **Ver Endpoints**: Lista de todas las rutas (`GET /games`, `POST /login`, etc.)
- **Probar la API**:
  1.  Haz clic en un endpoint (ej: `POST /api/users/login`)
  2.  Dale a **"Try it out"**
  3.  Rellena el JSON de ejemplo
  4.  Dale a **"Execute"**
  5.  ¡Verás la respuesta real del servidor!

### 🔐 Tip Pro: Usar el Candado (Authorize)

Muchos endpoints requieren estar logueado.

1.  Haz login en Swagger (`POST /login`) y copia el `accessToken` de la respuesta.
2.  Sube arriba del todo y dale al botón **"Authorize"** (el candado 🔓).
3.  Escribe: `Bearer TU_TOKEN_AQUI`.
4.  Dale a "Authorize".
5.  ¡Ahora puedes probar los endpoints protegidos (candado cerrado 🔒)!

---

## 4. Probando las Integraciones (RAWG/Steam)

Las nuevas funcionalidades de integración externa requieren un enfoque especial.

### 🛠️ Script de Ayuda: Crear Admin

Para probar los endpoints protegidos (como importar juegos de RAWG), necesitas ser Admin. Hemos creado un script para facilitarte esto:

```bash
npx ts-node src/scripts/setupTestAdmin.ts
```

Esto creará (o actualizará) al usuario `admin@test.com` con contraseña `admin123` y rol `admin`.

### 🧪 Pruebas Manuales Recomendadas

1.  **Buscador Externo**:

    - Endpoint: `GET /api/games/search?q=Mario`
    - Resultado esperado: Lista de juegos de RAWG con portadas.

2.  **Importador de Juegos**:
    - Endpoint: `POST /api/games/from-rawg`
    - Body: `{ "rawgId": 3498, "steamAppId": 271590 }` (GTA V)
    - Resultado esperado: Juego creado en tu DB con descripción, fecha y precio de Steam.
