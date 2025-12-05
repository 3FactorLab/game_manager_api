# 🎨 Frontend Implementation Plan (React)

## 🎯 Objetivo

Crear una interfaz de usuario **Premium**, moderna y altamente interactiva para el Game Manager. El diseño debe ser vibrante, con estética "Gamer" (Dark Mode, Neón, Glassmorphism) y animaciones fluidas.

## 🛠️ Tech Stack

- **Core**: React 18 (via Vite)
- **Lenguaje**: TypeScript
- **Estilos**: Vanilla CSS (Variables CSS + Flexbox/Grid) para máximo control y diseño custom.
- **Routing**: React Router DOM v6
- **Estado**: Context API (Auth) + Custom Hooks
- **HTTP Client**: Fetch API (o Axios si es necesario)
- **Iconos**: React Icons (Fa/Bi)

## 📱 Diseño & UX (Premium Aesthetics)

Siguiendo las directrices de "Rich Aesthetics":

- **Paleta**: Fondos oscuros profundos (`#0f172a`), acentos neón (Cian, Púrpura), textos blancos/grises.
- **Efectos**:
  - **Glassmorphism**: Paneles semitransparentes con `backdrop-filter: blur`.
  - **Micro-interacciones**: Hover effects, escalas suaves, transiciones de color.
  - **Animaciones**: Fade-in al cargar, slide-in en menús.
- **Tipografía**: Fuentes modernas (ej: 'Inter' o 'Outfit') desde Google Fonts.

## 📂 Estructura del Proyecto

```text
src/
├── assets/         # Imágenes, fuentes
├── components/     # Componentes Reutilizables
│   ├── ui/         # Botones, Inputs, Cards, Modales (Design System)
│   ├── layout/     # Navbar, Sidebar, Footer
│   └── game/       # GameCard, GameGrid
├── context/        # AuthContext, ThemeContext
├── hooks/          # useAuth, useGames, useCollection
├── pages/          # Vistas principales
│   ├── Auth/       # Login, Register
│   ├── Home/       # Landing + Catálogo Público
│   ├── Dashboard/  # Colección Privada
│   └── Profile/    # Configuración de Usuario
├── services/       # Llamadas a la API (Backend Dockerizado)
└── styles/         # Variables CSS globales, Reset
```

## 📅 Fases de Desarrollo

### Fase 1: Setup & Design System 🏗️

1.  Inicializar proyecto con Vite.
2.  Configurar variables CSS globales (Colores, Espaciado).
3.  Crear componentes base "Atomic":
    - `Button` (Variantes: Neon, Ghost)
    - `Input` (Animado)
    - `Card` (Glassmorphism)

### Fase 2: Autenticación 🔐

1.  Implementar `AuthService` (Login, Register, Refresh Token).
2.  Crear `AuthContext` para manejar la sesión global.
3.  Páginas de Login/Register con diseño impactante (pantalla dividida o centrado con blur).

### Fase 3: Catálogo & Navegación 🎮

1.  **Navbar**: Responsiva, con avatar de usuario.
2.  **Home**: Hero section + Grid de juegos (Paginado).
3.  **Buscador**: Barra de búsqueda en tiempo real con filtros (Género, Plataforma).

### Fase 4: Colección & Gestión 📚

1.  **Dashboard**: Vista de "Mis Juegos".
2.  **Interacciones**:
    - Añadir a colección.
    - Editar estado (Playing, Completed).
    - Poner nota (Score).

### Fase 5: Pagos & Checkout 💳

1.  Integrar flujo de compra simulada.
2.  Modal de Checkout con resumen de orden.
3.  Feedback visual de éxito/error.

## 🔗 Integración con Backend

- **Base URL**: `http://localhost:3500/api`
- **Auth**: Manejo de JWT en `localStorage` (o cookies httpOnly si ajustamos el back).
- **Imágenes**: Servir desde `http://localhost:3500/uploads`.

## 🚀 Siguientes Pasos

1.  Crear carpeta `frontend` (fuera del backend).
2.  Ejecutar `npm create vite@latest`.
3.  Empezar con el Design System.
