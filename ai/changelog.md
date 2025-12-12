# Changelog

## 2025-11-26

### Added

- **[Backend] [Bugfix]**: Fixed `ReferenceError: getProfile is not defined` by adding missing import in `user.routes.ts`.
- **[Backend] [Bugfix]**: Fixed `ReferenceError: AppError is not defined` by adding missing import in `auth.controller.ts`.
- **[Backend] [Test]**: Updated `rawg.service.test.ts` to expect `page_size` parameter in screenshot requests.
- **[Backend] [Test]**: Created `wishlist.test.ts` ensuring CRUD coverage for user wishlists.
- **[Backend] [Test]**: Created `user.avatar.test.ts` verifying profile updates and image uploads.
- **[Backend] [Bugfix]**: Fixed 500 Error in file uploads by ensuring `uploads/` directory exists on startup (`server.ts`).
- **[Backend] [Bugfix]**: Fixed `req.file` parsing issue by reordering `multer` middleware before `express-validator` in `user.routes.ts`.
- **[Backend] [Bugfix]**: Fixed `auth.service.ts` to correctly apply profile picture updates to the database.
- **Documentation**: `docs/tutorial.md` - Comprehensive backend tutorial.
- **Game Model**:
  - Campos `developer` y `publisher` añadidos al catálogo global.
- **Game Catalog Architecture**:
  - `Game` model: Catálogo global de juegos (Título, Género, Plataforma, Developer, Publisher).
  - `UserGame` model: Colección personal (Estado, Horas, Favorito, Score, Review).
  - Rutas `/api/games` para buscar/crear en catálogo (con Paginación y Filtros).
  - Ruta `DELETE /api/games/:id` (Admin only) para eliminar juegos.
  - Ruta `PUT /api/games/:id` (Admin only) para actualizar juegos.
  - Rutas `/api/collection` para gestionar la colección personal (con Paginación y Filtros).
- **User Roles**:
  - Campo `role` en el modelo `User`.
  - Middleware `isAdmin`.
  - Ruta `DELETE /api/users/:id` (Admin only) para eliminar usuarios.
- **Seeding**: Script `npm run seed` para poblar el catálogo con juegos iniciales.
- **Security**: Helmet, CORS, Rate Limit.
- **Logger**: Morgan (dev mode) para registro de peticiones HTTP.

### Fixed

- **Server Startup**: Resolved `ERR_MODULE_NOT_FOUND` by aligning `package.json` with `tsconfig.json`.
- **TypeScript**: Fixed `req.userData` type error by correcting `express.d.ts` augmentation.

### Changed

- **Refactor**: Se separó el modelo único de `Game` en dos modelos (`Game` y `UserGame`) para permitir un catálogo compartido.
- **Seeding**: Refactorizado para usar `upsert` (no borra datos existentes) y leer desde `data/games.json`.
- **Registration**: Asigna rol 'user' por defecto.

### Notes

- `express-mongo-sanitize` deshabilitado temporalmente.

### Migrated (TypeScript)

- **Language**: Migración completa de JavaScript a TypeScript.
- **Configuration**:
  - `tsconfig.json`: Configuración estricta de TypeScript.
  - `jest.config.cjs`: Soporte para tests en TS con `ts-jest`.
- **Type Definitions**:
  - `src/types/express.d.ts`: Extensión global de `Express.Request` para incluir `userData` (JWT payload).
  - Eliminación de `AuthenticatedRequest` custom interface.
- **Testing**: Tests migrados a `.ts` y ejecutándose con `ts-jest`.

## 2025-12-03

### Added

- **Game Model**: Campo `image` (URL o Path local).
- **Game Controller**: Soporte híbrido para subida de imágenes (Multer) o URLs externas.
- **Data**: Actualización de `games.json` con URLs de imágenes reales de Steam (63%) y placeholders funcionales (37%).
- **Security**: Implementación de `express-validator` en rutas de Usuario y Juegos. Validación estricta de inputs (Email, Password, Título, etc.).
- **Auth**: Implementación de Refresh Tokens con estrategia de rotación. Endpoint `POST /refresh-token` añadido. Login ahora devuelve `refreshToken`.
- **Tests**: Añadidos Tests de Integración (`tests/integration/full-flow.test.ts`) cubriendo el ciclo de vida completo del usuario y juegos.
- **Model**: Añadido campo `score` (0-10) al modelo de Juego.
- **Fix**: Corrección de tests de regresión en `catalog.test.ts` para compatibilidad con nuevos requisitos de Admin.

## 2025-12-04

### Added

- **Purchase System**:
  - **Feature**: Implemented Game Purchase System (Backend).
  - Created `Order` model to track purchases.
  - Updated `UserGame` model with `isOwned` field.
  - Implemented `PaymentService` with **Mock Payment Simulation** (replaced initial Stripe integration for simplicity).
  - Added `POST /api/payments/checkout` endpoint for instant purchase simulation.
  - Verified system with integration tests. para distinguir juegos comprados de juegos en seguimiento.
  - Dependencia `stripe` instalada.

## 2025-12-05

### Changed

- **Documentation**: Standardized code comments across `src` and `tests` to comply with `PROMPT_AI.md` (added "Destination" and "Target" annotations).

## 2025-12-09

### Fixed

- **Data Integrity**: Implemented "Cascade Delete".
  - Deleting a User now automatically removes their Collection (`UserGame`) and Refresh Tokens.
  - Deleting a Game from the Catalog now automatically removes it from all User Collections to prevent frontend crashes.

## 2025-12-12

### Refactor

- **Test Infrastructure**: Centralized Mongoose connection management in `tests/setup.ts` and updated `jest.config.cjs`. Removed redundant connection code from 6 test suites.

### Added

- **Tests**: `tests/public.games.test.ts` for verifying unauthenticated access to the game catalog.
- **Tests**: `tests/order.integration.test.ts` for verifying checkout simulation and order history retrieval.

### Fixed

- **Compliance**: Added `@file` and `@description` headers to new test files to match strict project standards.
