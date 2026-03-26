# Configuración de Redis (Vercel KV)

## 🔴 Sincronización Local con Producción

Tu entorno local ahora está **conectado directamente a Redis de Vercel**, lo que significa que:

✅ **Todos los cambios que hagas localmente se reflejan automáticamente en producción**  
✅ **Las imágenes que agregues desde el admin local se guardan en Redis**  
✅ **No necesitas hacer deploy para que los cambios aparezcan**

---

## 🔧 Configuración Actual

El archivo `.env` contiene la URL de conexión a Redis:

```
REDIS_URL="redis://default:....."
```

**IMPORTANTE:** Este archivo está protegido por `.gitignore` y **NO se sube a GitHub** por seguridad.

---

## 📊 Diferencias entre Entornos

### Producción (Vercel)
- **Backend:** Funciones serverless en `/api/*`
- **Almacenamiento:** Redis (Vercel KV)
- **URL:** https://nain-bravo.vercel.app

### Local (Development)
- **Backend:** `server.js` (Express)
- **Almacenamiento:** Redis (mismo que producción) ✨
- **URL:** http://localhost:3000

---

## 🚀 Cómo Usar

### Iniciar servidor local:
```bash
node server.js
```

### El servidor automáticamente:
- Detecta la variable `REDIS_URL` en `.env`
- Se conecta a Redis de Vercel
- Lee y escribe datos directamente en producción

### Si no existe `.env`:
- El servidor usará el archivo local `gifts.json`
- Los cambios NO se sincronizarán con producción

---

## ⚠️ Precauciones

1. **Todos los cambios locales afectan producción inmediatamente**
2. **Si modificas un regalo localmente, se actualiza en producción**
3. **Si alguien selecciona un regalo en producción, se verá en local inmediatamente**

---

## 🔄 Sincronización Manual (si pierdes el .env)

Si necesitas descargar los datos de producción nuevamente:

```bash
curl https://nain-bravo.vercel.app/api/gifts | python3 -m json.tool > gifts.json
```

---

## 📝 Logs

El servidor muestra qué tipo de almacenamiento está usando al iniciar:

- `🔴 Usando Redis (Vercel KV) para almacenamiento` → Conectado a producción
- `📁 Usando archivo local (gifts.json) para almacenamiento` → Solo local
