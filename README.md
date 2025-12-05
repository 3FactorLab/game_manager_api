# 🎮 Game Manager Backend

> **API RESTful profesional para la gestión de catálogos de videojuegos y colecciones de usuarios.** > _Seguridad robusta, arquitectura escalable y documentación exhaustiva._

![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-v5+-blue.svg?style=flat-square)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg?style=flat-square)
![Express](https://img.shields.io/badge/Express-v4.18+-lightgrey.svg?style=flat-square)
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

- **JWT Access Tokens**: Corta duración (15 min) para minimizar riesgos.
- **Refresh Tokens con Rotación**: Detección automática de robo de tokens y revocación en cascada.
- **RBAC (Role-Based Access Control)**: Middleware estricto para diferenciar entre `Admin` y `User`.

### 🛠️ Ingeniería de Software

- **Dockerizado**: Entorno de desarrollo y producción reproducible con `docker-compose`.
- **TypeScript**: Código tipado, seguro y mantenible.
- **Arquitectura por Capas**: Separación clara entre Rutas, Controladores, Servicios y Modelos.
- **Validación Estricta**: DTOs y `express-validator` aseguran que nunca entren datos corruptos.
- **Manejo de Errores Centralizado**: Middleware global para capturar y formatear excepciones.
- **Fail-Fast**: Validación estricta de variables de entorno al arranque.
- **Logging Profesional**: Logs estructurados con Winston para máxima observabilidad.
- **Desacoplamiento**: Servicios agnósticos a la infraestructura (ej. `FileService`).

### 🤖 Funcionalidades Avanzadas

- **Catálogo Híbrido**: Soporta juegos importados de RAWG/Steam y juegos creados manualmente con subida de imágenes.
- **Colección Personal**: Gestión de estados (Playing, Completed), puntuaciones y reseñas.
- **Paginación y Filtros**: Búsqueda avanzada por género, plataforma y estado.
- **Pagos Simulados**: Sistema de checkout completo con historial de órdenes.
- **Integraciones Externas**: Sincronización automática con **RAWG** (Metadata) y **Steam** (Precios).
- **Cron Jobs**: Actualización automática de precios de Steam cada madrugada.

---

## 🚀 Stack Tecnológico

- **Infraestructura**: Docker, Docker Compose
- **Runtime**: Node.js
- **Framework**: Express.js
- **Lenguaje**: TypeScript
- **Base de Datos**: MongoDB (Atlas o Local) + Mongoose ODM
- **Testing**: Jest + Supertest
- **Documentación**: Swagger (OpenAPI 3.0)
- **Utilidades**: `bcrypt`, `multer`, `dotenv`, `cors`, `helmet`, `node-cron`

---

## ⚡️ Quick Start (Recomendado con Docker)

### 1. Requisitos Previos

- Docker Desktop instalado y corriendo.

### 2. Instalación y Ejecución

```bash
git clone https://github.com/andydev/game-manager-back.git
cd game-manager-back
docker compose up --build
```

¡Listo! El sistema estará corriendo en:

- **API**: `http://localhost:3500`
- **Swagger Docs**: `http://localhost:3500/api-docs`
- **Mongo Express (DB UI)**: `http://localhost:8081`

---

## ⚡️ Quick Start (Manual / Sin Docker)

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
├── utils/          # Helpers (Logger, Password hashing)
├── validators/     # Reglas de validación (express-validator)
└── server.ts       # Punto de entrada de la aplicación
Dockerfile          # Definición de la imagen Docker
docker-compose.yml  # Orquestación de servicios
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

---

## 👤 Autor

Desarrollado con ❤️ por **AndyDev**.

---
# game_manager_api
