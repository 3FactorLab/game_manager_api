# Plan de Acción: Compartir Proyecto en GitHub (Guía Definitiva)

Esta guía asegura que tú (Mac) y tu equipo (Windows) trabajen sin conflictos y con seguridad garantizada.

## 1. Archivo `.gitignore` Robusto (Cross-Platform)

Este archivo `.gitignore` está diseñado para ignorar la "basura" específica de Mac y Windows, evitando que se suban archivos que causan ruido en el control de versiones.

**Acción:** Copia esto en tu `.gitignore`.

```gitignore
# --- Dependencias ---
node_modules/
# package-lock.json <- ¡NO IGNORAR! Es vital para que todos tengan las mismas versiones.

# --- Seguridad y Secretos (CRÍTICO) ---
.env
.env.test
.env.production
.env.local

# --- Logs y Depuración ---
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs/
*.log

# --- Sistema Operativo: Mac (Tu PC) ---
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes

# --- Sistema Operativo: Windows (Tu Equipo) ---
Thumbs.db
ehthumbs.db
desktop.ini
$RECYCLE.BIN/

# --- Editores de Código (Configs personales) ---
.idea/             # IntelliJ / WebStorm
.vscode/           # VS Code settings personales
*.swp              # Vim
*.sublime-workspace # Sublime Text

# --- Archivos Generados / Build ---
dist/
build/
coverage/
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
