# 🤖 Automation & Scripts Log

## 1. Descripción General

Además de la API REST, el backend incluye una suite de scripts de automatización ubicados en `src/scripts/`. Estos programas se ejecutan "offline" (fuera del ciclo de vida de HTTP) y son esenciales para el mantenimiento, carga de datos y corrección de errores.

## 2. Scripts Implementados

### A. Importador de Juegos (`import-pc-games.ts`)

- **Objetivo**: Poblar la base de datos con juegos reales.
- **Funcionamiento**:
  1.  Se conecta a la API pública de **RAWG**.
  2.  Itera por páginas de resultados.
  3.  Para cada juego, busca su precio en **Steam**.
  4.  Guarda o actualiza el juego en MongoDB.
- **Uso**:
  ```bash
  npm run import:games
  ```

### B. Restaurador de Datos (`seed.ts`)

- **Objetivo**: Resetear la base de datos a un estado conocido.
- **Funcionamiento**:
  1.  Borra todas las colecciones (¡Peligro!).
  2.  Carga juegos desde un archivo JSON local (`data/games.json`).
  3.  Crea usuarios de prueba por defecto (Admin y User).
- **Uso**:
  ```bash
  npm run seed
  ```

### C. Generador de Admin de Test (`setupTestAdmin.ts`)

- **Objetivo**: Crear un usuario administrador rápidamente para pruebas manuales.
- **Uso**:
  ```bash
  npm run create:admin <email> <password>
  ```

### D. Corrector de Precios (`fix-prices.ts`)

- **Objetivo**: Mantenimiento. Recorre la base de datos y corrige precios que estén en formato incorrecto o actualiza precios antiguos consultando a Steam de nuevo.

## 3. Mejores Prácticas en Scripts

1.  **Independencia**: Cada script inicia su propia conexión a la DB y la cierra limpiamente al terminar.
2.  **Reutilización**: Los scripts importan los mismos Servicios (`GameService`, `SteamService`) que la API, garantizando que la lógica de negocio sea idéntica en ambos lados.
3.  **Logging**: Usan el logger del sistema para registrar progreso y errores en consola.
