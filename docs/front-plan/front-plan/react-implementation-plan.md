# 🎨 Standard React Implementation Plan (Premium Template)

> **Documento Vivo**: Estándar de calidad, arquitectura y flujo de trabajo para proyectos React de Antigravity.

## 🎯 Objetivo Global

Crear interfaces de usuario **Premium**, modernas y altamente interactivas. El estándar mínimo es una estética "Gamer/Futurista" (Dark Mode, Neón, Glassmorphism) y UX "God Mode".

## 📜 Mandamientos de Calidad (PROMPT_AI Compliant)

Estas reglas son **INNEGOCIABLES**:

### 1. Código y Documentación 📝

- **Comentarios Académicos**: JSDoc obligatorio en cada archivo (propósito) y en cada export (función/componente).
- **Logs**: Prohibido `console.log`. Usar Logger utility.
- **Limpieza**: Ejecutar `npm run lint:fix` tras mover archivos.
- **Tipado Estricto**: Prohibido `any`. Props explicitas. No usar `unknown[]` para listas de entidades.

### 2. Stack Prohibido 🚫

- **Estado**: PROHIBIDO `useEffect` para data fetching (Usar React Query). PROHIBIDO Redux/Zustand (Usar Context).
- **Estilos**: PROHIBIDO Tailwind o Inline Styles (Usar CSS Modules).
- **Testing**: PROHIBIDO Jest como runner (Usar Vitest). PROHIBIDO `jest.mock` (Usar `vi.mock`).

### 3. Validación y Automatización 🤖

- **VDD (Validation Driven Development)**: Script `validate-phaseX.js` obligatorio por fase.
- **Context Refactor**: Usar scripts `node scripts/split-context.js` y `update-imports.js` para migrar contextos legacy.
- **Verificación**: Revisar `package.json` antes de importar nada.

### 4. Testing Strategy (Vitest + RTL) 🧪

- **Interacciones**: Usar `userEvent` (simula usuario real) en lugar de `fireEvent` siempre que sea posible.
- **Aislamiento**: Tests independientes del backend (Mockear siempre `services/`).
- **Cobertura**: Tests obligatorios para nueva lógica (`.test.tsx`). Re-verificar tests existentes tras cambios.

---

## 🛠️ Tech Stack (Estándar 2025)

- **Core**: React 18+ (Vite), TypeScript (Strict).
- **Estilos**: CSS Modules (Vanilla).
- **Router**: React Router DOM v6+.
- **State**: Context API (2-File Pattern) + TanStack Query v5.
- **Forms**: React Hook Form + Zod.
- **Testing**: Vitest + React Testing Library.

---

## 🧩 Patrones Arquitectónicos Críticos

1.  **Context 2-File System**: `Context.tsx` (Definición + Hook) y `Provider.tsx` (Lógica) separados.
2.  **Service Pattern**: `services/` solo para HTTP (Axios). Lógica en Hooks.
3.  **Dual Token Auth**: Access Token (Memoria) + Refresh Token (HttpOnly/Storage).

---

## 📅 Roadmap de Implementación (Fase por Fase)

### Fase 1: Setup & Core Foundation 🏗️

**Objetivo**: Establecer la base técnica y de diseño.

1.  [ ] **Inicialización**: Vite + TS + ESLint + Prettier.
2.  [ ] **Infraestructura Core**:
    - Axios Instance (Interceptors, Auto-refresh logic).
    - QueryClient Setup (Stale defaults).
    - i18n Configuration.
3.  [ ] **Design System**: Variables CSS, Reset, Fuentes, Glassmorphism mixins.
4.  [ ] **UI Kit Base**: Buttons, Cards, Inputs, Loaders (Skeletons).
5.  [ ] **🛡️ Validación Phase 1**: Ejecutar `npm run validate:phase1`.

### Fase 2: Auth & Session Management 🔐

**Objetivo**: Gestión robusta de usuarios y seguridad.

1.  [ ] **Auth Services**: Endpoints para login, register, refresh, me.
2.  [ ] **Auth Context (2-File Pattern)**:
    - `AuthContext.tsx`: Interfaces y hook `useAuth`.
    - `AuthProvider.tsx`: Lógica de sesión y persistencia.
3.  [ ] **Pages**: Login y Register con Zod Validation.
4.  [ ] **Security**: `ProtectedRoute` component y redirecciones.
5.  [ ] **🛡️ Validación Phase 2**: verificando flujos de auth y estructura de Context.

### Fase 3: Core Domain Features 🚀

**Objetivo**: Funcionalidad principal del negocio (Ej: Catálogo, Feed).

1.  [ ] **Data Fetching**: Hooks con `useQuery` / `useInfiniteQuery`.
2.  [ ] **List Views**: Grid/List layout con Infinite Scroll y Skeletons.
3.  [ ] **Detail Views**: Routing dinámico (`/item/:id`) y optimización de assets.
4.  [ ] **Search & Filters**: Estado persistente en URL (Query Params).
5.  [ ] **🛡️ Validación Phase 3**: Tests de integración de listados y filtros.

### Fase 4: Personalización & UX "God Mode" 👤

**Objetivo**: Elevar la experiencia de usuario.

1.  [ ] **User Space**: Dashboard personal, Profile management.
2.  [ ] **Feedback Visual**:
    - **Optimistic UI**: Actualizaciones instantáneas (Likes, Wishlist).
    - **Micro-interacciones**: Framer Motion en hovers y transiciones.
    - **Toasts**: Notificaciones ricas "Achievement Style".
3.  [ ] **Error Handling**: Error Boundaries y páginas 404 "Gamified".
4.  [ ] **🛡️ Validación Phase 4**: Verificar accesibilidad y `console` limpio.

### Fase 5: Admin & Gestión (Panel de Control) 🛡️

**Objetivo**: Herramientas de administración.

1.  [ ] **Dashboard Admin**: Métricas y accesos rápidos.
2.  [ ] **CRUD Tables**: Gestión de usuarios y entidades con paginación server-side.
3.  [ ] **Role Guards**: Ocultar elementos UI basados en roles.
4.  [ ] **🛡️ Validación Phase 5**: Tests de seguridad y roles.

---

## 🧪 Estrategia de Testing (Vitest + RTL)

- **Unit**: Utils, Hooks complejos, Validadores Zod.
- **Integration**: Flujos críticos (Login, Checkout, Formularios clave).
- **Mocks**: Todo `services/` y `react-router-dom`.
- **Regla**: Testear comportamiento (Click -> Resultado visual), no implementación interna.

## 🚀 Definition of Done (Checklist Final)

- [ ] **VDD**: Todos los scripts `validate-phaseX.js` pasan.
- [ ] **Linting**: 0 warnings en `npm run lint`.
- [ ] **Types**: 0 `any` explícitos o implícitos.
- [ ] **Build**: `npm run build` exitoso y optimizado.
- [ ] **A11y**: Correcto uso de semántica y teclado.
