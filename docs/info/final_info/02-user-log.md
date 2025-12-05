# 👤 User Management & Library Log

## 1. Descripción General

Este módulo gestiona la identidad del usuario más allá de la autenticación, centrándose en su perfil y, lo más importante, en su **Biblioteca de Juegos Personal**.

## 2. Componentes Implementados

### A. Modelos

- **User (`src/models/user.model.ts`)**:
  - Almacena datos básicos (nombre, email, avatar).
  - Define el rol (`user` o `admin`).
- **UserGame (`src/models/userGame.model.ts`)**:
  - **Tabla Pivote**: Relaciona `User` <-> `Game`.
  - Almacena metadatos personales:
    - `isOwned`: Si lo ha comprado.
    - `hoursPlayed`: Tiempo de juego.
    - `status`: Estado actual (Playing, Completed, Backlog).
    - `isFavorite`: Marcado como favorito.

### B. Servicios (`src/services/collection.service.ts`)

- **Gestión de Colección**:
  - `addToLibrary(userId, gameId)`: Añade un juego a la colección del usuario.
  - `updateGameStatus(userId, gameId, status)`: Cambia estado (ej: de "Playing" a "Completed").
  - `getUserLibrary(userId)`: Recupera todos los juegos del usuario con sus estados.
  - `removeGame(userId, gameId)`: Elimina un juego de la biblioteca (no del catálogo global).

### C. Controladores (`src/controllers/collection.controller.ts`)

- **Endpoints de Usuario**:
  - `GET /api/collection`: Obtiene la biblioteca completa.
  - `POST /api/collection`: Añade un juego manualmente (útil para pruebas o juegos gratuitos).
  - `PATCH /api/collection/:gameId`: Actualiza horas jugadas o estado.
  - `DELETE /api/collection/:gameId`: Borra de la biblioteca.

## 3. Características Clave

- **Relación Muchos a Muchos**: Un usuario tiene muchos juegos, un juego lo tienen muchos usuarios. Usamos un modelo intermedio (`UserGame`) para guardar datos extra de esa relación.
- **Seguridad de Datos**: Un usuario solo puede ver y editar **su propia** biblioteca. El middleware `auth` garantiza que `req.userData.id` sea la única referencia usada para consultas.
- **Validación de Existencia**: Antes de añadir un juego, verificamos que exista en el Catálogo Global.

## 4. Casos de Uso

1.  **Ver Biblioteca**: El usuario entra a "Mis Juegos" y ve su lista filtrada por estado.
2.  **Actualizar Progreso**: El usuario juega 2 horas y marca el juego como "Completado".
3.  **Favoritos**: El usuario marca un juego con una estrella para que salga arriba.
