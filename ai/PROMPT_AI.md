# Prompt de Comportamiento para IA

Este documento define las reglas y expectativas para la IA asistente integrada en Antigravity, con foco en desarrollo frontend y pruebas.

## 1. Formato y estilo de codigo

- Usa tabulacion para formatear el codigo de forma consistente.
- Prioriza soluciones simples y legibles.
- Evita la duplicacion; reutiliza logica existente antes de crear nuevas funciones.
- Hay que tener en cuenta la refactorizacion del codigo para que sea mas mantenible y escalable, coherencia con la limpieza que hemos realizado previamente para no tener deuda tecnica.
- Siempre agregar comentarios para explicar el codigo que se ha creado, siempre los comentarios en inglés. En el inicio del archivo debe haber un breve resumen de lo que hace el archivo.
- Agregar comentarios explicativos a cada funcion y/o cada bloque de codigo.
- En el el caso de haber un export debe haber un comentario explicando a donde va destinado

## 2. Gestion de servidores y entornos

- Al realizar cambios, inicia siempre un servidor nuevo para las pruebas correspondientes.
- Elimina servidores de pruebas anteriores antes de iniciar uno nuevo.
- Escribe codigo que contemple los entornos de desarrollo, pruebas y produccion.

## 3. Validacion y pruebas

- **Validación**: Se utiliza **Zod** como estándar único de validación.
  - Los schemas deben estar en `src/validators/zod/`.
  - Usar `validateZod` middleware.
  - Mantener paridad con los schemas del frontend cuando aplique.
- **Validación Automatizada (NUEVO ESTÁNDAR)**:
  - **OBLIGATORIO**: Para cada fase mayor de implementación o refactor, se debe crear un script de validación `scripts/validate-phaseX.js`.
  - Este script debe verificar integridad, prohibiciones (logs, imports) y ejecutar tests críticos.
  - Objetivo: "Validation Driven Development" - Asegurar la ejecución de los planes mediante código.
- Asegurate de que los cambios realizados sean los solicitados o que esten plenamente comprendidos.
- No introduzcas nuevas tecnologias o patrones al corregir errores sin agotar primero las opciones actuales.
- Si introduces una nueva tecnologia, elimina la implementacion anterior para evitar logica duplicada.
- No quiero que se borre la base de datos al crear tests. nunca uses deleteMany({}) si va a crear borrados innecesarios de la base de datos.
- **NUNCA WIPEAR LA BASE DE DATOS**: Bajo ninguna circunstancia se debe borrar la base de datos de desarrollo o produccion. Los tests deben correr en un entorno aislado.
- **Creación de Tests (OBLIGATORIO)**:
  - Siempre que se cree una nueva lógica, se deben crear los tests correspondientes (Unitarios/Integración).
  - Si los tests ya existen, verificar si necesitan ser actualizados, especialmente al realizar refactorización o cambios de lógica.
  - No dar por terminada una tarea sin verificar que los tests asociados pasen.

## 4. Organizacion y mantenimiento

- Manten la base de codigo limpia y bien organizada.
- Evita escribir scripts directamente en entornos si solo se ejecutaran una vez.
- Documenta cada cambio relevante con comentarios claros y concisos.

## 5. Comportamiento de la IA

- Sugiere soluciones basadas en codigo existente antes de proponer nuevas implementaciones.
- Prioriza la seguridad, la estabilidad y la claridad del codigo.
- No realices acciones destructivas sin confirmacion explicita del usuario.
- Proporciona explicaciones breves y educativas al sugerir cambios o mejoras.

## 6. Registro y trazabilidad (obligatorio)

- Manten un registro vivo ai/context.md`. En cada respuesta que implique decisiones, cambios o proximos pasos, anade una entrada con:
  - Fecha (ISO) y hora
  - Acciones realizadas
  - Decisiones tomadas y pendientes
  - Proximos pasos
  - Archivos tocados (ruta:linea si aplica)
  - Notas o riesgos
- Si el entorno no permite escribir archivos, incluye el bloque de actualizacion ai/context.md` en la respuesta y solicita permiso para persistirlo.
- El objetivo es que otra IA o persona pueda continuar el trabajo con minima friccion.

## 7. Actualizar CHANGELOG

- Tras cada iteracion que cambia el comportamiento de la aplicacion deja constancia actualizando `ai/changelog.md`.
- Elimina del comportamiento las formas previas de funcionamiento de los elementos que se cambiaron para no causar confusion.

## 8. Hardening & Best Practices (NUEVAS LEYES)

- **Testing Strategy (Zero-Fragility)**:

  - **Módulos Internos**: **PROHIBIDO** usar `jest.mock()` para servicios o modelos propios. **OBLIGATORIO** usar `jest.spyOn(Object, 'method')` para mantener tipado y evitar problemas de hoisting.
  - **Dependencias Externas**: **PERMITIDO** usar `jest.mock()` para librerías externas (ej: `axios`, `bcrypt`, `node-cache`, `logger`).
  - **Limpieza**: Usar siempre `restorMocks: true` en config o `afterEach(() => jest.restoreAllMocks())`.

- **Logging (Observabilidad)**:

  - **PROHIBIDO**: `console.log` o `console.error` en código de producción (Services/Controllers).
  - **OBLIGATORIO**: Usar `src/utils/logger.ts` (Winston). `logger.info()`, `logger.error()`.

- **Type Safety (Strict)**:

  - **NO ANY TYPES**: Prohibido el uso de `any` en código de producción.
  - **Error Middleware**: Debe usar Union Types (`Error | AppError | MongooseError`) y Type Guards, nunca `any`.
  - **Mongoose**: Tipar explícitamente filtros con `mongoose.mongo.Filter<T>`.

- **Verificación de Dependencias (Seguridad)**:
  - **OBLIGATORIO**: Antes de usar "importar" cualquier librería, verificar siempre `package.json` para confirmar que está instalada.
  - **PROHIBIDO**: Asumir que una librería existe o usar librerías no listadas en `dependencies` o `devDependencies`.

## 9. Arquitectura y Patrones

- **Arquitectura en Capas**: Respetar estrictamente la separación:
  - **Controllers**: Solo manejan HTTP (req/res, status codes). No contienen lógica de negocio.
  - **Services**: Contienen toda la lógica de negocio. Son agnósticos de HTTP (no reciben `req` ni `res`).
- **Manejo de Errores Async**: Todas las funciones asíncronas en controladores deben usar `asyncHandler` (`src/utils`). No usar `try/catch` manual en controladores.
- **DTOs**: Usar interfaces DTO (`src/dtos`) para tipar datos de entrada/salida. Evitar `any` en controladores y servicios.

## 10. API Standards (Standardization)

- **Paginación (List Endpoints)**:

  - Estructura de respuesta obligatoria:
    ```typescript
    {
      data: T[],
      pagination: {
        total: number,
        pages: number,
        page: number,
        limit: number
      }
    }
    ```
  - Parámetros query estándar: `page`, `limit`, `sortBy`, `order`, `query` (search).
  - **NOTA IMPORTANTE**: Cualquier nuevo endpoint que devuelva una lista de entidades DEBE adherirse rigurosamente a este patrón. No devolver arrays planos `[]`.

- **VDD (Validation Driven Development)**:
  - Cada feature core debe tener su script `scripts/validate-feature.js` que verifique la integridad y reglas de negocio sin intervención manual.
