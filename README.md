# 🎮 Game Manager Backend

> **API RESTful profesional para la gestión de catálogos de videojuegos y colecciones de usuarios.** > _Seguridad robusta, arquitectura escalable y documentación exhaustiva._

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-v5+-blue.svg?style=flat-square)

![Express](https://img.shields.io/badge/Express-v5.0-lightgrey.svg?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green.svg?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)

---

## 📖 Documentación Completa

Este proyecto no es solo código; es un recurso educativo. Hemos preparado tres guías detalladas:

| Guía                                              | Descripción                                                              |
| :------------------------------------------------ | :----------------------------------------------------------------------- |
| **🏗️ [Arquitectura](docs/architecture.md)**       | Entiende el diseño MVC, el flujo de datos y las decisiones de seguridad. |
| **📘 [Manual Maestro](docs/tutorial.md)**         | Aprende a construir este backend desde cero, archivo por archivo.        |
| **🧪 [Testing & Swagger](docs/tests-guide.md)**   | Aprende a ejecutar la suite de tests y a probar la API visualmente.      |
| **🛠️ [Refactoring Log](docs/refactoring-log.md)** | Historial de mejoras técnicas y deuda técnica saldada.                   |

---

## ✨ Características Principales

### 🔐 Seguridad de Grado Empresarial

- **State-of-the-Art Security**: Implementación de **Helmet** (Headers HTTP seguros) y **Rate Limiting** (protección DDOS) global.
- **JWT Access Tokens**: Corta duración (15 min) para minimizar riesgos.
- **Refresh Tokens con Rotación**: Detección automática de robo de tokens y revocación en cascada.
- **RBAC (Role-Based Access Control)**: Middleware estricto para diferenciar entre `Admin` y `User`.
- **Cascade Delete**: Eliminación inteligente de datos. Si se borra un usuario, se eliminan sus sesiones, órdenes y biblioteca.

### 🛠️ Ingeniería de Software

- **TypeScript**: Código tipado, seguro y mantenible.
- **Arquitectura por Capas**: Separación clara entre Rutas, Controladores, Servicios y Modelos.
- **Validación Estricta**: **Zod** asegura que nunca entren datos corruptos ("Fail-Fast").
- **Manejo de Errores Centralizado**: Middleware global para capturar y formatear excepciones.
- **Fail-Fast**: Validación estricta de variables de entorno al arranque.
- **Logging Profesional**: Logs estructurados con Winston para máxima observabilidad.
- **Desacoplamiento**: Servicios agnósticos a la infraestructura (ej. `FileService`).

### 🤖 Funcionalidades Avanzadas

- **Catálogo Híbrido**: Soporta juegos importados de RAWG/Steam y juegos creados manualmente con subida de imágenes.
- **Colección Personal**: Gestión de estados (Playing, Completed), puntuaciones y reseñas.
- **Paginación y Filtros**: Búsqueda avanzada por género, plataforma y estado.
- **Pagos Simulados**: Sistema de checkout completo con historial de órdenes y **Notificaciones por Email**.
- **Integraciones Externas**: Sincronización automática con **RAWG** (Metadata) y **Steam** (Precios).
- **Cron Jobs**: Actualización automática de precios de Steam cada madrugada.
- **Gestión Masiva**: Endpoint de administración para listar y gestionar todos los usuarios del sistema.
- **Automatización**: Suite de scripts en `src/scripts/` para importación de datos y mantenimiento.

---

## 🚀 Stack Tecnológico

- **Runtime**: Node.js
- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **Base de Datos**: MongoDB (Atlas o Local) + Mongoose ODM
- **Testing**: Jest + Supertest
- **Documentación**: Swagger (OpenAPI 3.0)
- **Utilidades**: `bcrypt`, `multer`, `dotenv`, `cors`, `helmet`, `node-cron`, `nodemailer`, `zod`

---

---

## ⚡️ Quick Start

### 1. Requisitos Previos

- Node.js v18+
- MongoDB URI (Local o Atlas)

### 2. Instalación

```bash
npm install
```

### 3. Variables de Entorno

Crea un archivo `.env` en la raíz (puedes copiar `.env.example` si existe):

```env
PORT=3500
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/db
JWT_SECRET=tu_clave_secreta_super_segura
RAWG_API_KEY=tu_api_key_de_rawg
NODE_ENV=development
```

### 4. Ejecución

| Comando         | Descripción                                             |
| :-------------- | :------------------------------------------------------ |
| `npm run dev`   | Inicia el servidor en modo desarrollo (con hot-reload). |
| `npm run build` | Compila el código TypeScript a JavaScript (`dist/`).    |
| `npm start`     | Inicia el servidor compilado (Producción).              |
| `npm test`      | Ejecuta la suite completa de tests.                     |
| `npm run seed`  | Puebla la base de datos con juegos iniciales.           |

---

## 📂 Estructura del Proyecto

```text
src/
├── config/         # Configuración de DB, Swagger y Env
├── controllers/    # Manejo de peticiones HTTP (Req -> Res)
├── dtos/           # Definición de tipos de entrada (Data Transfer Objects)
├── middleware/     # Auth, Roles, Uploads, Validaciones, Errores
├── models/         # Esquemas de Base de Datos (Mongoose)
├── routes/         # Definición de Endpoints
├── services/       # Lógica de Negocio Pura (incl. Cron y Pagos)
├── scripts/        # Tareas de automatización (Importación, Seed)
├── utils/          # Helpers (Logger, Password hashing)
├── validators/     # Reglas de validación (Zod)
└── server.ts       # Punto de entrada de la aplicación
```

---

## 🧪 API & Testing

### Swagger UI

Una vez iniciado el servidor, visita:
👉 **[http://localhost:3500/api-docs](http://localhost:3500/api-docs)**

### Tests Automatizados

El proyecto cuenta con una cobertura de tests de integración crítica.

```bash
npm test
```

> La suite incluye **85+ tests** que cubren autenticación, pagos, catálogo y colecciones, con **Global Setup** para gestión eficiente de conexiones.

---

## 👤 Autor

Desarrollado con ❤️ por **AndyDev**.

---

# game_manager_api

## 📊 Diagrama de Arquitectura

```mermaid
flowchart TD
    %% Nodos Externos
    Client([👤 Cliente / Frontend])
    DB[(🗄️ MongoDB)]
    ExternalAPIs[☁️ APIs Externas<br/>RAWG / Steam]
    FileSystem[💾 Sistema de Archivos<br/>uploads/]

    %% Capas del Backend
    Routes["📍 Rutas (Routes)<br/>/api/games, /public, /orders"]
    Docs["📘 Swagger UI<br/>/api-docs"]

    %% Middlewares (Pipeline)
    AuthMW["🔑 Auth Middleware"]
    RoleMW["👮 Role Middleware"]
    UploadMW["📤 Upload Middleware<br/>(Multer)"]
    ValidMW["✅ Validator Middleware"]
    ErrorMW["🚨 Error Middleware"]

    %% Componentes Principales
    Controller["🤵 Controlador<br/>(Auth/Game/Collection/Payment/User/Order)"]
    DTO["📦 DTOs<br/>(Validación de Tipos)"]

    %% Servicios Core
    AuthService["🔐 Auth Service<br/>(Login/Register/Tokens)"]
    GameService["🎮 Game Service<br/>(CRUD Catálogo)"]
    CollectionService["📚 Collection Service<br/>(UserGame CRUD)"]
    PaymentService["💳 Payment Service<br/>(Mock Checkout)"]

    %% Servicios de Integración
    IntegrationService["🔌 Integration Services<br/>(RAWG/Steam + Caché)"]
    AggregatorService["🎯 Aggregator Service<br/>(Combina RAWG+Steam)"]

    %% Servicios Auxiliares
    FileService["📁 File Service<br/>(Gestión Archivos)"]
    CronService["⏱️ Cron Service<br/>(Actualización Precios)"]
    MailService["📧 Mail Service<br/>(Nodemailer)"]

    %% Modelos (Base de Datos)
    UserModel["👤 User Model"]
    GameModel["🎮 Game Model"]
    UserGameModel["📚 UserGame Model<br/>(Collection)"]
    OrderModel["🧾 Order Model"]
    RefreshTokenModel["🔑 RefreshToken Model"]

    %% Flujo Principal
    Client -->|1. Request| Routes
    Client -.->|Ver Docs| Docs

    %% Bifurcación: Pública vs Privada
    Routes -->|Ruta Privada| AuthMW
    Routes -->|Ruta Pública<br/>/api/public| Controller

    %% Pipeline de Middlewares (Orden Secuencial)
    AuthMW --> RoleMW
    RoleMW --> UploadMW
    UploadMW --> ValidMW
    ValidMW --> Controller

    %% Validaciones con DTOs
    ValidMW -.->|Valida contra| DTO
    Controller -.->|Usa| DTO

    %% Controlador llama a Servicios
    Controller -->|2. Llama| AuthService
    Controller -->|2. Llama| GameService
    Controller -->|2. Llama| CollectionService
    Controller -->|2. Llama| PaymentService

    %% Servicios Core interactúan con Modelos
    AuthService -->|CRUD| UserModel
    AuthService -->|Gestiona| RefreshTokenModel
    AuthService -.->|Cascade Delete| UserGameModel
    AuthService -.->|Cascade Delete| OrderModel

    GameService -->|CRUD| GameModel
    GameService -.->|Cascade Delete| UserGameModel

    CollectionService -->|CRUD| UserGameModel
    CollectionService -->|Lee| GameModel

    PaymentService -->|Crea| OrderModel
    PaymentService -->|Actualiza| UserGameModel
    PaymentService -->|Notifica| MailService

    %% Servicios usan FileService
    AuthService -.->|Borra imágenes| FileService
    FileService -->|Operaciones| FileSystem

    %% Servicios de Integración
    Controller -->|2. Llama| AggregatorService
    AggregatorService -->|Consulta| IntegrationService
    IntegrationService -->|API Calls| ExternalAPIs
    AggregatorService -->|Guarda| GameModel

    %% Cron Service (Automatización)
    CronService -.->|Actualiza Precios<br/>Diariamente 03:00| GameModel

    %% Modelos persisten en DB
    UserModel <-->|5. DB Ops| DB
    GameModel <-->|5. DB Ops| DB
    UserGameModel <-->|5. DB Ops| DB
    OrderModel <-->|5. DB Ops| DB
    RefreshTokenModel <-->|5. DB Ops| DB

    %% Retorno al Cliente
    AuthService -->|6. Retorna| Controller
    GameService -->|6. Retorna| Controller
    CollectionService -->|6. Retorna| Controller
    PaymentService -->|6. Retorna| Controller
    AggregatorService -->|6. Retorna| Controller

    Controller -->|7. Response JSON| Client

    %% Manejo de Errores (Global)
    Controller -.->|Si falla| ErrorMW
    ErrorMW -.->|Error Response| Client

    %% Estilos - Externos
    style Client fill:#FFF9C4,stroke:#FBC02D,stroke-width:2px,color:#000
    style DB fill:#C8E6C9,stroke:#388E3C,stroke-width:2px,color:#000
    style ExternalAPIs fill:#E1BEE7,stroke:#8E24AA,stroke-width:2px,color:#000
    style FileSystem fill:#FFE0B2,stroke:#F57C00,stroke-width:2px,color:#000

    %% Estilos - Infraestructura
    style Routes fill:#FFFFFF,stroke:#333,stroke-width:2px,color:#000
    style Docs fill:#E3F2FD,stroke:#2196F3,stroke-width:2px,color:#000

    %% Estilos - Middlewares
    style AuthMW fill:#FFEBEE,stroke:#C62828,stroke-width:2px,color:#000
    style RoleMW fill:#FFEBEE,stroke:#C62828,stroke-width:2px,color:#000
    style UploadMW fill:#F3E5F5,stroke:#6A1B9A,stroke-width:2px,color:#000
    style ValidMW fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
    style ErrorMW fill:#FFCDD2,stroke:#D32F2F,stroke-width:2px,color:#000

    %% Estilos - Controlador y DTOs
    style Controller fill:#E3F2FD,stroke:#1565C0,stroke-width:3px,color:#000
    style DTO fill:#FFF9C4,stroke:#F9A825,stroke-width:2px,color:#000

    %% Estilos - Servicios Core
    style AuthService fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#000
    style GameService fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#000
    style CollectionService fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#000
    style PaymentService fill:#E1F5FE,stroke:#0277BD,stroke-width:2px,color:#000

    %% Estilos - Servicios de Integración
    style IntegrationService fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:#000
    style AggregatorService fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:#000

    %% Estilos - Servicios Auxiliares
    style FileService fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#000
    style CronService fill:#FFECB3,stroke:#FFA000,stroke-width:2px,color:#000
    style MailService fill:#FFECB3,stroke:#FFA000,stroke-width:2px,color:#000

    %% Estilos - Modelos
    style UserModel fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
    style GameModel fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
    style UserGameModel fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
    style OrderModel fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
    style RefreshTokenModel fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#000
```
