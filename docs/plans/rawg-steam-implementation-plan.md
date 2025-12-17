# Plan de Implementación: RAWG API + Steam Store API

## Objetivo

Integrar RAWG API para obtener datos de juegos (covers, metadata, búsqueda) y Steam Store API para precios, creando un sistema completo de catálogo de juegos.

---

## Fase 1: Configuración Inicial (15 minutos)

### 1.1 Obtener API Key de RAWG

- [ ] Ir a https://rawg.io/apidocs
- [ ] Crear cuenta en RAWG
- [ ] Obtener API Key
- [ ] Guardar en `.env`:
  ```env
  RAWG_API_KEY=tu_api_key_aqui
  ```

### 1.2 Instalar Dependencias

```bash
npm install axios
```

### 1.3 Actualizar Variables de Entorno

```typescript
// src/config/env.ts
export const RAWG_API_KEY = process.env.RAWG_API_KEY || "";
```

---

## Fase 2: Crear Servicios (1-2 horas)

### 2.1 Servicio RAWG

**Archivo**: `src/services/rawg.service.ts`

**Funciones a implementar**:

- `searchGames(query: string)` - Buscar juegos por nombre
- `getGameDetails(rawgId: number)` - Obtener detalles completos
- `getScreenshots(rawgId: number)` - Obtener capturas de pantalla

**Datos que retorna**:

- Nombre del juego
- Cover (background_image)
- Plataformas
- Géneros
- Rating
- Metacritic score
- Desarrollador/Publisher
- Fecha de lanzamiento
- Descripción

### 2.2 Servicio Steam

**Archivo**: `src/services/steam.service.ts`

**Funciones a implementar**:

- `getSteamGameDetails(appId: number)` - Obtener detalles de Steam
- `getSteamCoverUrl(appId: number)` - Construir URL de cover
- `extractSteamAppId(url: string)` - Extraer App ID de URL

**Datos que retorna**:

- Precio (en centavos)
- Moneda
- Descuento (%)
- Precio original
- Si está en oferta

### 2.3 Servicio Agregador

**Archivo**: `src/services/game-aggregator.service.ts`

**Función principal**:

- `getCompleteGameData(gameName: string)` - Combinar RAWG + Steam

**Flujo**:

1. Buscar en RAWG por nombre
2. Obtener datos completos de RAWG
3. Detectar si está en Steam (buscar en stores)
4. Si está en Steam, obtener precio
5. Retornar datos combinados

---

## Fase 3: Actualizar Modelo de Datos (30 minutos)

### 3.1 Modificar Game Model

**Archivo**: `src/models/game.model.ts`

**Nuevos campos**:

```typescript
interface IGame {
  // Campos existentes
  title: string;
  genre: string;
  platform: string;
  developer?: string;
  publisher?: string;
  image?: string;
  score?: number;

  // 🆕 Nuevos campos para RAWG
  rawgId?: number;
  description?: string;
  released?: Date;
  metacritic?: number;
  screenshots?: string[];

  // 🆕 Nuevos campos para Steam
  steamAppId?: number;
  price?: number;
  currency?: string;
  discount?: number;
  onSale?: boolean;
  originalPrice?: number;

  createdAt: Date;
  updatedAt: Date;
}
```

---

## Fase 4: Crear Endpoints (1 hora)

### 4.1 Endpoint de Búsqueda

**Ruta**: `GET /api/games/search?q={query}`

**Controller**: `src/controllers/game.controller.ts`

**Funcionalidad**:

- Buscar en RAWG por nombre
- Retornar lista de resultados con covers

**Respuesta**:

```json
{
  "results": [
    {
      "rawgId": 3498,
      "title": "Elden Ring",
      "cover": "https://media.rawg.io/media/games/...",
      "rating": 4.5,
      "platforms": ["PC", "PlayStation 5"],
      "genres": ["Action", "RPG"]
    }
  ]
}
```

### 4.2 Endpoint de Creación desde RAWG

**Ruta**: `POST /api/games/from-rawg`

**Body**:

```json
{
  "rawgId": 3498,
  "steamAppId": 1245620 // Opcional
}
```

**Funcionalidad**:

1. Obtener datos de RAWG
2. Si steamAppId, obtener precio de Steam
3. Crear juego en DB con todos los datos

### 4.3 Endpoint de Actualización de Precios

**Ruta**: `PUT /api/games/:id/update-price`

**Funcionalidad**:

- Actualizar precio desde Steam
- Solo si el juego tiene steamAppId

---

## Fase 5: Integración con Sistema Actual (1 hora)

### 5.1 Actualizar Rutas

**Archivo**: `src/routes/game.routes.ts`

**Nuevas rutas**:

```typescript
router.get("/search", search); // Buscar en RAWG
router.post("/from-rawg", createFromRAWG); // Crear desde RAWG
router.put("/:id/update-price", updatePrice); // Actualizar precio
```

### 5.2 Middleware de Validación

**Archivo**: `src/validators/game.validator.ts`

**Validaciones**:

- `rawgId` debe ser número
- `steamAppId` debe ser número (opcional)
- `query` de búsqueda debe tener mínimo 2 caracteres

---

## Fase 6: Testing (30 minutos)

### 6.1 Probar Búsqueda

```bash
curl "http://localhost:3500/api/games/search?q=zelda"
```

### 6.2 Probar Creación desde RAWG

```bash
curl -X POST "http://localhost:3500/api/games/from-rawg" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rawgId": 3498, "steamAppId": 1245620}'
```

### 6.3 Verificar en DB

```bash
# Conectar a MongoDB y verificar
use gameManager
db.games.find({ rawgId: { $exists: true } })
```

---

## Fase 7: Documentación Swagger (30 minutos)

### 7.1 Documentar Endpoints

**Archivo**: `src/routes/game.routes.ts`

**Añadir anotaciones**:

```typescript
/**
 * @swagger
 * /api/games/search:
 *   get:
 *     summary: Search games in RAWG database
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of games
 */
```

---

## Fase 8: Script de Migración (Opcional - 1 hora)

### 8.1 Actualizar Juegos Existentes

**Archivo**: `src/scripts/migrateToRAWG.ts`

**Funcionalidad**:

1. Leer todos los juegos existentes
2. Buscar cada uno en RAWG
3. Actualizar con datos de RAWG
4. Si está en Steam, añadir precio

---

## Checklist de Implementación

### Configuración

- [ ] Obtener API Key de RAWG
- [ ] Añadir a `.env`
- [ ] Instalar axios
- [ ] Actualizar `env.ts`

### Servicios

- [ ] Crear `rawg.service.ts`
- [ ] Crear `steam.service.ts`
- [ ] Crear `game-aggregator.service.ts`
- [ ] Probar servicios individualmente

### Modelo

- [ ] Actualizar `game.model.ts`
- [ ] Añadir campos de RAWG
- [ ] Añadir campos de Steam
- [ ] Migrar DB (si es necesario)

### Controllers y Rutas

- [ ] Crear endpoint de búsqueda
- [ ] Crear endpoint de creación desde RAWG
- [ ] Crear endpoint de actualización de precio
- [ ] Añadir validaciones

### Testing

- [ ] Probar búsqueda en RAWG
- [ ] Probar obtener detalles
- [ ] Probar obtener precio de Steam
- [ ] Probar creación completa
- [ ] Verificar en DB

### Documentación

- [ ] Documentar en Swagger
- [ ] Actualizar README
- [ ] Ejemplos de uso

---

## Estimación de Tiempo

| Fase          | Tiempo        |
| ------------- | ------------- |
| Configuración | 15 min        |
| Servicios     | 1-2 horas     |
| Modelo        | 30 min        |
| Endpoints     | 1 hora        |
| Integración   | 1 hora        |
| Testing       | 30 min        |
| Documentación | 30 min        |
| **TOTAL**     | **4-5 horas** |

---

## Próximos Pasos

1. **Ahora**: Obtener API Key de RAWG
2. **Después**: Crear servicios base
3. **Luego**: Integrar con sistema actual
4. **Finalmente**: Testing y documentación

---

## Recursos

- **RAWG API Docs**: https://rawg.io/apidocs
- **RAWG API Key**: https://rawg.io/login?forward=developer
- **Steam Store API**: https://wiki.teamfortress.com/wiki/User:RJackson/StorefrontAPI

¿Listo para empezar? 🚀
