# Estrategia de Testing y Refactorización de Mocks

**Fecha:** 2025-12-14
**Contexto:** Transición hacia Monorepo y Hardening del Backend.

## 1. El Problema Detectado

Durante las tareas de limpieza de código (eliminación de variables no usadas) y verificación post-refactorización, se identificaron problemas críticos en la suite de tests existente:

- **Falsos Positivos**: Los tests pasaban "en verde", pero no estaban probando la lógica de manera aislada.
- **Fugas de API Real (Critical/High Priority)**: El servicio `SteamService` estaba realizando peticiones HTTP reales a la API de Steam durante los tests. Esto convertía la suite en "flaky" (inestable), dependiente de la conexión a internet y de la disponibilidad de un servicio externo.
- **Problemas de Hoisting**: La reubicación de archivos reveló fragilidad en la estrategia de mocking tradicional (`jest.mock`), causando errores de referencia (`ReferenceError`) y comportamientos inesperados donde los mocks no se aplicaban correctamente antes de la importación del módulo.

## 2. La Solución: Mocking Robusto con `jest.spyOn`

Se tomó la decisión técnica de migrar los tests afectados (`payment`, `steam`, `auth`, `rawg`) a una estrategia de mocks explícitos y espías (`spies`).

### Cambios Clave:

1.  **Aislamiento Total (Mocking de Red)**:

    - Se implementó `jest.spyOn(axios, 'get')` para interceptar todas las llamadas salientes.
    - **Beneficio**: Determinismo absoluto. Los tests pasan siempre, sin internet, y simulan todos los escenarios (éxito, error 404, error 500) sin depender de terceros.

2.  **Control de Hoisting**:

    - Se reestructuraron las fábricas de mocks para cumplir con el estándar ES Modules (`__esModule: true`).
    - **Beneficio**: Compatibilidad garantizada con TypeScript y compilación a `dist`.

3.  **Validación de Contratos**:
    - Se ajustaron las expectativas de los tests (e.g., `User` creation) para coincidir estrictamente con la implementación del servicio (e.g., inclusión automática de `role: "user"`).

## 3. Beneficios Estratégicos (Monorepo Vision)

Esta refactorización es un requisito previo indispensable para el plan de **Monorepo** (detallado en `frontend/docs/pendientes.md`):

- **Velocidad de CI/CD**: En un monorepo, los tests de backend se ejecutan frecuentemente. Eliminar latencia de red reduce el tiempo de ejecución de segundos a milisegundos.
- **Desacople Frontend-Backend**: Al garantizar que el backend es estable y sus tests son fiables, el desarrollo del frontend (que consume estas APIs) no se ve bloqueado por roturas "fantasma" en el backend.
- **Seguridad**: Prevenir que credenciales o keys reales se usen accidentalmente en entornos de test.

## 4. Estado Actual

- **Tests**: 100% Passing y Aislados.
- **Frontend Impact**: Nulo (Contrato de API intacto).
- **Deuda Técnica**: Eliminada la fragilidad en tests de servicios core.
