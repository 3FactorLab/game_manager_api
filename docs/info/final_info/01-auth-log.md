# 🔐 Authentication Implementation Log

## 1. Descripción General

El sistema de autenticación es la puerta de entrada segura a la API. Utiliza un **Sistema de Dual Token (Access + Refresh)** para mantener sesiones seguras y escalables, minimizando la ventana de exposición en caso de robo de credenciales.

## 2. Componentes Implementados

### A. Modelos (`src/models/user.model.ts`)

- **Schema de Usuario**: Define la estructura de datos (email, password, role, etc.).
- **Middleware Pre-Save**: Antes de guardar un usuario, interceptamos la contraseña y la hasheamos usando `bcrypt`.
- **Métodos de Instancia**:
  - `comparePassword(candidatePassword)`: Compara una contraseña en texto plano con el hash almacenado.

### B. Servicios (`src/services/auth.service.ts`)

- **Lógica de Negocio Pura**:
  - `register(userData)`: Valida duplicados, crea el usuario y genera tokens.
  - `login(email, password)`: Verifica credenciales y emite tokens.
  - `refreshToken(token)`: Renueva el access token usando un refresh token válido.
- **Generación de Tokens**:
  - `accessToken`: Validez corta (15 min). Contiene ID y Role.
  - `refreshToken`: Validez larga (7 días). Se usa para obtener nuevos access tokens.

### C. Controladores (`src/controllers/auth.controller.ts`)

- **Manejo de HTTP**: Recibe `req` y devuelve `res`.
- **Endpoints**:
  - `POST /register`: Registro de nuevos usuarios.
  - `POST /login`: Inicio de sesión.
  - `POST /refresh-token`: Rotación de tokens.

### D. Middleware (`src/middleware/auth.middleware.ts`)

- **Guardián de Rutas**: Intercepta peticiones a rutas protegidas.
- **Validación**: Verifica que el header `Authorization: Bearer <token>` sea válido.
- **Inyección de Contexto**: Añade `req.userData` con la info del usuario para que los controladores sepan quién hace la petición.

## 3. Flujo de Datos (Login)

1. **Cliente** envía `POST /login` con email/pass.
2. **Controller** llama a `AuthService.login`.
3. **Service** busca usuario en BD y compara hashes con `bcrypt`.
4. **Service** genera JWTs firmados con `JWT_SECRET`.
5. **Controller** responde con `{ user, accessToken, refreshToken }`.

## 4. Seguridad

- **Hashing**: Las contraseñas nunca se guardan en texto plano.
- **Validación de Entradas**: Usamos **Zod** para asegurar que los datos cumplan estrictamente con el esquema esperado ("Fail-Fast").
- **Protección de Rutas**: Solo usuarios con token válido pueden acceder a recursos privados.
