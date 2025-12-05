# Plan de Acción: Compartir Proyecto en GitHub (Guía Definitiva)

Esta guía asegura que tú (Mac) y tu equipo (Windows) trabajen sin conflictos y con seguridad garantizada.

## 1. Archivo `.gitignore` Robusto (Cross-Platform)

Este archivo `.gitignore` está diseñado para ignorar la "basura" específica de Mac y Windows, evitando que se suban archivos que causan ruido en el control de versiones.

**Acción:** Copia esto en tu `.gitignore`.

```gitignore
# Dependencias
node_modules/
# package-lock.json NO se ignora, se debe subir para asegurar versiones.

# Variables de entorno (¡Muy importante!)
.env
.env.test
.env.production
.env.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs/
*.log

# Sistema Operativo (Evita archivos basura de Mac/Windows)
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDEs y Editores (Configuraciones personales de cada desarrollador)
.idea/
.vscode/
*.swp
*.swo
*.sublime-project
*.sublime-workspace

# Archivos de subida (Contenido generado dinámicamente)
uploads/
# data/*.json # 'data/games.json' se comparte como Seed Data.

# Build (Cada dev debe generar su propio build)
dist/
build/
out/

# Testing
coverage/
test_output.txt
junit.xml

# Docker
# ¡NO ignorar .dockerignore! Es esencial para el build.
# .dockerignore
```

## 2. Archivos para Compartir Manualmente

Debido a que ignoramos `.env` por seguridad, tus compañeros necesitarán configurar sus propias credenciales.

**He creado un archivo automáticamente llamado `.env.example` en la raíz.** Este archivo se subirá al repositorio y les servirá de plantilla (tiene las llaves, pero no tus datos reales).

### Datos Privados a pasar por Canal Seguro (Slack/Discord/WhatsApp)

Diles que copien el archivo `.env.example` a uno nuevo llamado `.env` y rellenen estos valores que tú les pasarás:

| Variable       | Descripción              | ¿Compartir valor real?                                                                                        |
| :------------- | :----------------------- | :------------------------------------------------------------------------------------------------------------ |
| `PORT`         | Puerto del servidor      | Sí, usen `3500` por defecto.                                                                                  |
| `MONGODB_URI`  | Conexión a Base de Datos | **SÍ (Privado)**. Pásales tu string de conexión si van a usar tu misma DB de desarrollo, o que creen la suya. |
| `JWT_SECRET`   | Firma de tokens          | **SÍ (Privado)**. Pásales el valor `banumerchantman654321` (o cambienlo todos).                               |
| `RAWG_API_KEY` | API de Videojuegos       | **SÍ**. Necesitan una key válida. Pásales la tuya o que saquen una gratis.                                    |
| `NODE_ENV`     | Entorno                  | `development`                                                                                                 |

## 3. Resumen de Flujo de Trabajo

1. **Tú**: Actualizas `.gitignore` y subes `.env.example`.
2. **Tú**: Haces commit y push.
3. **Tú**: Les envías los valores secretos por privado.
4. **Ellos**: Clonan el repo.
5. **Ellos**: Renombran `.env.example` a `.env` y pegan los secretos.
6. **Resultado**: ¡Todos corriendo el proyecto sin conflictos de archivos basura!
