# Plan de Acción: Migración a Zod y Estrategia de Testing

Este documento detalla la hoja de ruta para modernizar la validación del backend y robustecer los tests, priorizando la estabilidad del sistema actual.

## 1. Contexto y Estrategia 🎯

- **Objetivo**: Unificar lógica de validación (Frontend/Backend) y blindar servicios críticos con tests.
- **Estrategia**: **Migración Incremental (Soft Migration)**.
  - Sin Monorepo por ahora (menor complejidad).
  - Sincronización manual de schemas (backend como espejo del frontend).
  - Prioridad absoluta a la estabilidad (Tests primero).

---

## 2. Normativa Crítica de Seguridad y Desarrollo 🛡️

**Antes de escribir código, se deben respetar estas reglas inquebrantables:**

### A. Seguridad de Base de Datos (Lecciones Aprendidas)

> [!CAUTION] > **PROHIBIDO**: Usar `deleteMany({})` sin filtros en ningún entorno.
> **OBLIGATORIO**: Los **Tests Unitarios** deben usar `jest.mock` y nunca conectarse a la DB real.
> **OBLIGATORIO**: Los **Tests de Integración** deben usar limpiezas con scope (ej: borrar solo el usuario creado en el test).

### B. Estándares de Código (PROMPT_AI)

1.  **Idioma**: Todo comentario, documentación y nombre de variable debe estar en **Inglés**.
2.  **Documentación**:
    - **Archivos**: Cabecera `@file`, `@description`.
    - **Funciones**: Comentarios explicativos sobre el bloque.
    - **Exports**: Comentario `// Destination: ...` indicando dónde se usa.
3.  **Trazabilidad**:
    - Actualizar `ai/context.md` y `ai/changelog.md` tras cada tarea completada.

---

## 3. Fases de Ejecución 🚀

### Fase 1: Testing de Servicios Críticos (Riesgo Nulo)

_Objetivo: Proteger lógica compleja externa con Mocks._

1.  **Test API RAWG** (`tests/rawg.service.test.ts`):
    - Mockear `axios`. Validar transformación de datos.
2.  **Test API Steam** (`tests/steam.service.test.ts`):
    - Mockear timeouts y errores de red.
3.  **Verificación**: `npm test` (All Green).

### Fase 2: Infraestructura Zod (Riesgo Bajo)

_Objetivo: Preparar el terreno sin romper nada._

1.  **Instalación**: `npm install zod` en `backend`.
2.  **Middleware**: Crear `src/middleware/zod.middleware.ts`.
    - Adaptador que captura `ZodError` y devuelve formato estándar.
3.  **Schemas**: Crear `src/validators/zod/auth.schema.ts`.
    - **Acción Manual**: Copiar contenido exacto de `frontend/src/features/auth/schemas.ts`.

### Fase 3: Migración Piloto (Riesgo Medio)

_Objetivo: Validar en producción controlada._

1.  **Refactor**: En `auth.routes.ts`, cambiar `/register` para usar `validateZod`.
2.  **Validación**: Correr `tests/auth.routes.test.ts`. Debe pasar sin ser modificado.

---

## 4. Visión Futura (Largo Plazo) 🔮

Cuando el proyecto escale, esta preparación permitirá una transición fluida al **Monorepo**:

1.  **Beneficios**:
    - Eliminación de la "copia manual" de schemas.
    - Tipado automático end-to-end (`z.infer<Type>`).
2.  **Hoja de Ruta**:
    - Mover `frontend` y `backend` a raíz común.
    - Crear `packages/shared`.
    - Configurar NPM Workspaces.
