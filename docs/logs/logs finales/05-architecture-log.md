# 🏗️ Project Architecture & Patterns Log

## 1. Filosofía de Diseño

El proyecto sigue una arquitectura **Layered (por capas)** clásica, diseñada para separar responsabilidades, facilitar el testing y permitir la escalabilidad. Cada pieza del código tiene un lugar predecible.

## 2. Estructura de Directorios (`src/`)

### 📂 `models/` (La Capa de Datos)

- **Responsabilidad**: Definir la estructura de la base de datos (Schemas de Mongoose).
- **Ejemplos**: `User`, `Game`, `Order`.
- **Regla**: Solo aquí se habla directamente con MongoDB.

### 📂 `controllers/` (La Capa de Entrada)

- **Responsabilidad**: Manejar la petición HTTP (`req`) y la respuesta (`res`).
- **Ejemplos**: `auth.controller.ts`, `game.controller.ts`.
- **Regla**: Los controladores deben ser "tontos". No deben tener lógica de negocio compleja, solo validar datos, llamar al servicio y responder.

### 📂 `services/` (La Capa de Negocio)

- **Responsabilidad**: La lógica real de la aplicación.
- **Ejemplos**: `auth.service.ts` (hashing, tokens), `game-aggregator.service.ts` (mezclar APIs).
- **Regla**: Aquí es donde ocurre la magia. Los servicios son independientes de HTTP (no saben qué es `req` o `res`), lo que facilita su testeo unitario.

### 📂 `routes/` (El Enrutador)

- **Responsabilidad**: Definir las URLs y asignarles controladores y middlewares.
- **Ejemplos**: `user.routes.ts` (`GET /profile` -> `authMiddleware` -> `getProfile`).

### 📂 `middleware/` (Los Guardianes)

- **Responsabilidad**: Ejecutar código antes de llegar al controlador.
- **Ejemplos**: `auth.middleware.ts` (verifica tokens), `error.middleware.ts` (manejo centralizado de errores).

## 3. Patrones Utilizados

### 🏭 Service Pattern

Separamos la lógica (Service) del transporte (Controller). Esto nos permite, por ejemplo, llamar a `createGame` desde una API REST hoy, y desde un script de consola mañana, reutilizando el mismo servicio.

### 💉 Dependency Injection (Manual)

Aunque no usamos un contenedor IoC complejo, nuestros servicios son modulares y se importan donde se necesitan, manteniendo el acoplamiento bajo.

### 🛡️ Repository Pattern (Simplificado con Mongoose)

Mongoose actúa como nuestro ORM/Repository, abstrayendo las consultas SQL/NoSQL en métodos fáciles (`findById`, `create`).

### 🔌 Adapter/Facade Pattern (Integraciones)

Los servicios `rawg.service.ts` y `steam.service.ts` actúan como adaptadores que "traducen" las APIs externas complejas a un formato simple que nuestra aplicación entiende.

## 4. Stack Tecnológico

- **Runtime**: Node.js
- **Lenguaje**: TypeScript (Tipado estático para robustez)
- **Framework**: Express.js
- **Base de Datos**: MongoDB (con Mongoose)
- **Testing**: Jest + Supertest
- **Validación**: express-validator + Zod (opcional)
