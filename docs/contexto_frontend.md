# Prompt de Contexto para Frontend (React + Vite)

Este documento contiene toda la información necesaria para que otro agente o desarrollador comience a construir el Frontend de este proyecto.

---

## 🤖 Prompt para el Agente

Copia y pega el siguiente texto para dar contexto al agente de Frontend:

```markdown
Actúa como un Desarrollador Senior de Frontend especializado en React, TypeScript y Vite.
Tu tarea es construir la aplicación cliente para un backend existente de "Game Manager" (Gestor de Videojuegos).

## 🌍 Información del Entorno

-   **Backend URL**: http://localhost:3500
-   **Base API Path**: /api
-   **Documentación Swagger**: http://localhost:3500/api-docs (Úsalo para ver esquemas exactos)

## 🔑 Autenticación (JWT)

El backend utiliza JWT (Json Web Tokens).

-   **Login**: `POST /api/users/login`
    -   Retorna: `{ token, refreshToken, user }`
    -   **Acción**: Debes guardar estos tokens (preferiblemente localStorage o cookies) y el usuario en un Global Context (Zustand/Context API).
-   **Registro**: `POST /api/users/register`
    -   Retorna: `{ user }` (No retorna token, redirigir a Login).
-   **Refresh Token**: `POST /api/users/refresh-token`
    -   Enviar body: `{ token: "old_refresh_token" }`
-   **Headers**: En cada petición protegida, debes enviar el header:
    -   `Authorization: Bearer <tu_access_token>`

## 📡 Estructura de Endpoints Principales

### 1. Juegos (Catálogo Global)

-   `GET /api/public/games`: Obtener juegos públicos (home page).
-   `GET /api/games`: Búsqueda avanzada de juegos (requiere auth).
    -   Query Params soportados: `?page=1&limit=10&search=mario&genre=action`
-   `GET /api/games/:id`: Detalles de un juego.

### 2. Colección del Usuario (Mis Juegos)

-   `GET /api/collection`: Ver mi lista de juegos.
    -   Filter: `?status=playing` (o completed, backlog).
-   `POST /api/collection/add`: Añadir juego a colección.
    -   Body: `{ gameId: string, status: 'playing' }`
-   `PUT /api/collection/:id`: Actualizar estado/puntuación.
-   `DELETE /api/collection/:id`: Eliminar de colección.

### 3. Pagos (Mock)

-   `POST /api/payments/checkout`: Simular compra de juegos.

## 🛠️ Stack Tecnológico Recomendado

1.  **Vite + React + TypeScript**: Para velocidad y tipado.
2.  **TailwindCSS**: Para estilos modernos y rápidos.
3.  **Axios**: Para peticiones HTTP (Configurar interceptores para inyectar token y manejar 401 para refresh token automáticamente).
4.  **React Query (TanStack Query)**: Altamente recomendado para manejar caché de servidor, loading states y re-fetching.
5.  **React Router DOM**: Para navegación.

## 🎨 Requisitos de UI/UX

-   Diseño "Dark Mode" moderno (estilo Gaming).
-   **Dashboard**: Vista principal con juegos populares.
-   **My Collection**: Vista tipo "Grid" con las carátulas de los juegos.
-   **Feedback**: Usar "Toasts" (ej. Sonner o React Hot Toast) para errores/éxitos.
```

---

## 📂 Interfaces TypeScript (DTOs Clave)

Para que definas tus tipos en el frontend:

```typescript
// User
interface User {
    _id: string;
    username: string;
    email: string;
    role: "user" | "admin";
    avatarUrl?: string;
}

// Auth Response
interface AuthResponse {
    message: string;
    token: string;
    refreshToken: string;
    user: User;
}

// Game
interface Game {
    _id: string;
    title: string;
    description: string;
    imageUrl: string;
    platform: string[]; // ['PC', 'PS5', etc]
    genre: string[];
    releaseDate: string;
    price: number;
}

// Collection Item
interface CollectionItem {
    _id: string;
    game: Game; // Populated
    status: "pending" | "playing" | "completed" | "abandoned";
    rating?: number; // 0-5
    addedAt: string;
}
```
