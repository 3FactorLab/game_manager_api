# 📖 Explicación del Proyecto (Backend)

> **Proyecto**: Game Manager API
> **Versión**: 1.0.0 (Production Ready)
> **Stack**: Node.js, Express, TypeScript Strict, MongoDB

## 🌟 Resumen Ejecutivo

Este backend es una **API RESTful de alto rendimiento** diseñada para servir como el núcleo transaccional y analítico de una plataforma de comercio electrónico.

Más allá de un simple CRUD, implementa patrones avanzados de ingeniería de software como **Dependency Injection** (a través de capas), **Strategies** para integración externa, y un motor de **Business Intelligence (BI)** nativo sobre MongoDB Aggregations. Su diseño prioriza la seguridad (Defense in Depth), la escalabilidad y la integridad de datos.

---

## 🏛️ Filosofía de Ingeniería: Los 4 Pilares

### 1. Layered Architecture (Separation of Concerns)

El sistema implementa una arquitectura estricta de 3 capas para desacoplar responsabilidades y facilitar el testing unitario.

- **Routes**: "Entry Layer". Definen endpoints y aplican la cadena de seguridad (Auth -> Role -> Upload -> Validator).
- **Controllers**: "Dumb layer". Orquestadores HTTP. Extraen datos, llaman al servicio y devuelven respuestas estandarizadas.
- **Services**: "Smart layer". Núcleo de la lógica de negocio.
- **Models**: "Persistence layer". Esquemas de Mongoose con validación estricta de datos.

### 2. Validation Driven Development (VDD)

Garantizamos la estabilidad del sistema mediante validación en tiempo de compilación y ejecución.

- **DTOs & Zod**: Validación estricta de entrada ("Fail-Fast"). Si los datos no son válidos, la ejecución se detiene antes de tocar la lógica.
- **Strict Typing**: TypeScript configurado en modo estricto. Prohibido el uso de `any` en capas de servicio y base de datos (`mongoose.Filter<T>`).
- **Scripts de Integridad**: Automatización que audita el código en busca de anti-patrones antes de cada release.

### 3. Híbrido: Transaccional + Analítico

El backend no solo gestiona transacciones; actúa como un motor de descubrimiento y análisis.

- **Discovery Engine**: Sistema de sincronización "Eager Sync" con APIs externas (RAWG/Steam). Importa metadatos bajo demanda, enriqueciendo el catálogo orgánicamente.
- **Analytics Pipeline**: Utiliza MongoDB Aggregation Framework para calcular KPIs financieros (Revenue, Churn, ARPU) en tiempo real, sin necesidad de herramientas de BI externas.

### 4. Defense in Depth (Seguridad)

La seguridad no es un feature, es la base.

- **Dual Token Auth**: Rotación de credenciales con Access Tokens de corta vida y Refresh Tokens seguros.
- **Centralized Error Handling**: Unificación de errores mediante `AppError` y middleware global. Nunca exponemos stack traces en producción.
- **Audit Logging**: Winston Logger registra eventos críticos para trazabilidad y forense.

---

## 🛠️ Stack Tecnológico de Vanguardia

| Tecnología             | Rol en el Proyecto  | ¿Por qué esta elección?                                                  |
| :--------------------- | :------------------ | :----------------------------------------------------------------------- |
| **Node.js + Express**  | Runtime & Framework | I/O no bloqueante ideal para APIs de alta concurrencia.                  |
| **TypeScript**         | Lenguaje            | Tipado estático que reduce bugs en runtime en un 15%.                    |
| **MongoDB (Mongoose)** | Base de Datos       | Flexible schema ideal para almacenar metadatos heterogéneos de juegos.   |
| **Zod**                | Validación          | Runtime type checking y parsing seguro de esquemas.                      |
| **Jest / Supertest**   | Testing             | Suite robusta para Unit y Integration testing.                           |
| **Winston**            | Observability       | Logging estructurado JSON para fácil ingestión en sistemas de monitoreo. |
| **Compression**        | Performance         | Gzip middleware para reducir el tamaño de respuestas JSON hasta un 70%.  |

---

## 🔄 Flujo de Datos: La Vida de una Petición

El sistema sigue un pipeline lineal y predecible:

1.  **Request**: El cliente envía JSON + Token.
2.  **Middleware Chain**:
    - `AuthMiddleware`: Verifica JWT.
    - `RoleMiddleware`: Verifica permisos (Admin).
    - `ZodValidator`: Valida el payload estáticamente (400 Bad Request si falla).
3.  **Controller**: Recibe datos **ya validados**. Delega a Servicio.
4.  **Service**: Ejecuta lógica (CRUD, Cálculos, 3rd Party APIs).
5.  **Model**: Persiste en MongoDB.
6.  **Response**: El controlador devuelve JSON 200/201.

_Si ocurre un error en cualquier punto, el `GlobalErrorHandler` lo captura y formatea una respuesta segura._

---

## 🧠 Flujos de Lógica Crítica

### 1. Motor de Descubrimiento (External API Sync)

Cuando un administrador busca un juego que no existe localmente:

1.  **Search**: Consulta a la API externa (RAWG).
2.  **Map**: Transforma la respuesta externa al DTO interno mediante adaptadores.
3.  **Persist**: Guarda automáticamente el juego en MongoDB para futuras consultas (Cache-Through).

### 2. Sistema de Ventas y Stock

Gestión de concurrencia optimista para compras:

1.  **Validate**: Verifica stock y balance de usuario.
2.  **Transact**: Ejecuta la orden y decrementa stock atómicamente.
3.  **Update Stats**: Recalcula KPIs financieros en tiempo real.

---

## 🚀 Cómo Empezar (Developer Experience)

El proyecto está docker-ready y configurado para CI/CD local:

1.  **Instalación**:

    ```bash
    npm install
    ```

2.  **Entorno**:
    Configura `.env` basándote en `.env.example`.

3.  **Desarrollo**:

    ```bash
    npm run dev      # Inicia con ts-node-dev (Hot Reload)
    ```

4.  **Calidad**:

    ```bash
    npm test         # Suite completa (120+ tests)
    npm test         # Suite completa (120+ tests)
    npm run validate # Script de integridad VDD
    npm run seed     # Poblar base de datos con datos de prueba
    ```

5.  **Documentación Viva**:
    Visita `http://localhost:5000/api-docs` para interactuar con la API mediante **Swagger UI**.

---

## 📚 Mapa de Documentación

Para detalles técnicos profundos, consulte `docs/principal/`:

- 🏗️ **[architecture.md](./architecture.md)**: Diagramas y patrones de diseño backend.
- 📓 **[tutorial.md](./tutorial.md)**: Guía archivo por archivo del código fuente.
- 🧪 **[tests-guide.md](./tests-guide.md)**: Estrategia de Mocks, Spies y Tests de Integración.
- 📜 **[final_info/audit_certificate.md](./final_info/audit_certificate.md)**: Estado de certificación "Production Ready".
