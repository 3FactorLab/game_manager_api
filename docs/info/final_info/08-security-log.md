# 🛡️ Security Implementation Log

## 1. Filosofía: Defense in Depth

La seguridad no es una sola barrera, sino múltiples capas de defensa. Si una falla, la siguiente debe proteger el sistema.

## 2. Capas de Seguridad Implementadas

### A. Capa de Red y Transporte

- **HTTPS (Simulado en Dev)**: El sistema está diseñado para correr detrás de un proxy inverso (Nginx) que maneje SSL en producción.
- **CORS**: Configurado restrictivamente para permitir solo orígenes confiables (Frontend).

### B. Capa de Aplicación (Express)

- **Helmet**: Middleware que configura headers HTTP seguros para proteger contra ataques comunes (XSS, Clickjacking, Sniffing).
- **Rate Limiting**: `express-rate-limit` protege contra ataques de fuerza bruta y DoS, limitando el número de peticiones por IP en una ventana de tiempo.

### C. Capa de Autenticación (Dual Token)

- **Access Token (Corto plazo)**: JWT con vida útil de 15 minutos. Si es robado, el daño es limitado.
- **Refresh Token (Largo plazo)**: JWT de 7 días, almacenado en BD. Permite revocar el acceso de un usuario forzando el logout desde el servidor (Stateful Auth).
- **Rotation**: Cada vez que se usa un Refresh Token, se emite uno nuevo, invalidando el anterior. Esto detecta robos de tokens (Reuse Detection).

### D. Capa de Datos (Validación)

- **Zod ("Fail-Fast")**: Ningún dato entra al controlador sin pasar por un esquema estricto. Esto previene Inyección NoSQL y polución de datos.
- **Sanitización**: Los inputs se limpian de caracteres peligrosos.

### E. Integridad Estructural

- **Cascade Delete**: Para evitar datos huérfanos que puedan causar errores lógicos (o de seguridad), borrar un usuario desencadena una limpieza en cadena garantizada por Mongoose Middleware y testada unitariamente (`user.delete.test.ts`).

## 3. Checklist de Seguridad para Producción

- [ ] Cambiar `JWT_SECRET` por una cadena larga y aleatoria.
- [ ] Configurar `NODE_ENV=production` para activar optimizaciones de seguridad de Express.
- [ ] Habilitar SSL/TLS en el balanceador de carga.
- [ ] Revisar la política de CORS para incluir solo el dominio real del frontend.
