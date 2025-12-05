# Planes Futuros

## Pendiente

- [ ] **Dockerización**: Crear `Dockerfile` y `docker-compose.yml` para facilitar el despliegue y desarrollo local.

# 🔮 Planes Futuros y Mejoras Técnicas

Este documento recopila ideas, estrategias y mejoras técnicas identificadas durante el desarrollo para ser implementadas en fases futuras.

---

## 🛠️ Robustez de Datos (Dependencia de IDs)

Actualmente, el sistema confía en que el `steamAppId` almacenado es correcto y perpetuo. Esto genera riesgos si Steam cambia IDs, retira juegos o si nuestra búsqueda inicial falló.

### 1. Validación de Tipo en Cron Jobs

- **Problema**: A veces un ID apunta a una Banda Sonora o DLC en lugar del juego base.
- **Solución**: Al actualizar precios, verificar que `data.type === "game"`.
- **Acción**: Si detectamos un tipo incorrecto, marcar el juego con un flag `review_needed: true` para revisión manual.

### 2. Panel de Administración (Backoffice)

- **Problema**: Errores humanos o algorítmicos al asignar IDs.
- **Solución**: Crear una interfaz en el Frontend para Admins.
- **Feature**: Un campo input editable para `steamAppId` junto a un botón "Probar ID" que muestre el JSON de Steam en tiempo real antes de guardar.

### 3. Fallback de Búsqueda Automática

- **Problema**: Un juego es retirado de Steam o cambia de ID (raro, pero posible en remakes).
- **Solución**: Si el Cron Job recibe un `404 Not Found` para un ID existente:
  1.  Lanzar una búsqueda automática por nombre (`searchSteamGames`).
  2.  Si encuentra un nuevo ID con alta coincidencia de nombre, actualizarlo automáticamente o sugerirlo al Admin.

---

## 🌍 Internacionalización y Moneda

### 1. Soporte Multi-Divisa

- **Problema**: Actualmente asumimos USD (`cc=us`).
- **Solución**: Guardar precios en un mapa: `prices: { usd: 59.99, eur: 49.99 }`.
- **Implementación**: El Cron Job debería consultar Steam con `cc=us` y `cc=eu` secuencialmente.

---

## ⚡️ Optimización de Rendimiento

### 1. Colas de Trabajo (BullMQ / Redis)

- **Problema**: Si el catálogo crece a 10,000 juegos, el Cron Job actual podría tardar demasiado y bloquear recursos.
- **Solución**: Mover la actualización de precios a una cola de trabajos en segundo plano, procesando juegos en lotes pequeños (concurrency control).
