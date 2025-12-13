# 🎮 Game Catalog & Integrations Log

## 1. Descripción General

El corazón de la aplicación es el Catálogo Global de Juegos. Este sistema no solo almacena juegos localmente, sino que es capaz de **importar y enriquecer** datos desde fuentes externas (RAWG y Steam) para ofrecer una experiencia completa.

## 2. Componentes Implementados

### A. Modelos (`src/models/game.model.ts`)

- **Schema de Juego**:
  - Datos básicos: Título, descripción, fecha lanzamiento.
  - Multimedia: Portada, capturas de pantalla.
  - Metadatos: Género, plataforma, desarrollador.
  - Metadatos: Género, plataforma, desarrollador.
  - **Precios**: Soporte Multi-moneda (USD/EUR), descuentos y precio base (Steam).
  - **IDs Externos**: `rawgId` y `steamAppId` para sincronización futura.

### B. Servicios de Integración (`src/services/`)

1. **RAWG Service (`rawg.service.ts`)**:
   - Conecta con la API de RAWG.
   - Obtiene: Metadatos ricos, imágenes HD, puntuaciones.
   - **Optimización**: Usa `node-cache` (TTL 24h) para evitar llamadas redundantes.
2. **Steam Service (`steam.service.ts`)**:
   - Conecta con la API de la Tienda de Steam.
   - Obtiene: Precios en tiempo real y moneda.
   - Utilidad: Extrae AppIDs de URLs de tienda.
3. **Game Aggregator (`game-aggregator.service.ts`)**:
   - **El Cerebro**: Orquesta la fusión de datos.
   - Flujo: RAWG (Datos) + Steam (Precios) = Juego Completo.

### C. Controladores (`src/controllers/game.controller.ts`)

- **Endpoints Públicos**:
  - `GET /api/games`: Búsqueda con filtros (género, plataforma) y paginación.
  - `GET /api/games/:id`: Detalle de un juego.
- **Endpoints de Administración**:
  - `POST /api/games`: Crear juego manual (con subida de imagen `multer`).
  - `PUT /api/games/:id`: Editar juego.
  - `DELETE /api/games/:id`: Borrar juego.
- **Endpoints de Importación**:
  - `GET /api/games/search`: Busca en RAWG en tiempo real.
  - `POST /api/games/from-rawg`: Importa un juego de RAWG a nuestra BD local.

### D. Automatización (`src/scripts/`)

- **`import-pc-games.ts`**: Script de consola para importaciones masivas o programadas. Utiliza los mismos servicios que la API.

## 3. Flujo de Importación Inteligente

1. Admin busca "Elden Ring" (`GET /search`).
2. El sistema muestra resultados de RAWG.
3. Admin selecciona el juego (`POST /from-rawg`).
4. **Aggregator Service**:
   - Descarga detalles de RAWG.
   - Busca enlace de Steam en los datos de RAWG.
   - Si encuentra Steam, descarga el precio actual.
   - Crea el juego en MongoDB con toda la info combinada.

## 4. Gestión de Archivos

- Usamos **Multer** para permitir la subida de imágenes de portada personalizadas cuando se crea un juego manualmente.
- Las imágenes se sirven estáticamente desde la carpeta `uploads/`.

## 5. 🔍 Deep Dive: Lógica de Búsqueda y Filtros

El endpoint `GET /api/games` no es un simple "Select All". Utiliza una estrategia de **Construcción Dinámica de Queries** para permitir filtrado complejo.

### A. Construcción de Query (Local)

En `GameService.getGames(filterParams)`, construimos el objeto de búsqueda de Mongoose paso a paso:

1.  **Texto**: Si hay `query`, usamos `$regex` (case-insensitive) sobre el campo `title`.
2.  **Filtros Flexibles**: `genre`, `platform`, `developer` se añaden al objeto solo si están presentes en la URL.
3.  **Rango de Precios**: `minPrice` y `maxPrice` crean un selector `{ $gte: min, $lte: max }`.

### B. Local vs Remoto

Es vital distinguir los dos modos de búsqueda:

| Característica | `GET /api/games` (Local)         | `GET /api/games/search` (Remoto)    |
| :------------- | :------------------------------- | :---------------------------------- |
| **Fuente**     | MongoDB (Nuestra BD)             | RAWG API (Internet)                 |
| **Velocidad**  | Inmediata (<50ms)                | Lenta (~500ms - 1s)                 |
| **Datos**      | Completos (Precios Steam, Stock) | Básicos (Solo Info)                 |
| **Uso**        | Catálogo principal para usuarios | Admin buscando juegos para importar |

### C. Ordenamiento (Sorting)

El frontend puede solicitar orden específico (`sortBy` y `order`).

- Por defecto: Fecha de lanzamiento (Más nuevos primero).
- Soportado: Precio (Asc/Desc), Metacritic Score.
