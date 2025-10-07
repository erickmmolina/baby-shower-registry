# 🚀 Guía de Deployment en Vercel

Esta guía te ayudará a desplegar tu lista de regalos de baby shower en Vercel (GRATIS).

---

## 📋 Requisitos Previos

1. Cuenta en [GitHub](https://github.com) (gratis)
2. Cuenta en [Vercel](https://vercel.com) (gratis)

---

## 🔧 Paso 1: Instalar dependencias actualizadas

```bash
npm install
```

---

## 📦 Paso 2: Crear Repositorio en GitHub

### Opción A: Desde la terminal (recomendado)

1. **Inicializar Git:**
```bash
git init
git add .
git commit -m "Initial commit - Baby Shower Registry"
```

2. **Crear repositorio en GitHub:**
   - Ve a https://github.com/new
   - Nombre: `baby-shower-registry` (o el que prefieras)
   - Deja todo por defecto
   - Click en "Create repository"

3. **Subir tu código:**
```bash
git remote add origin https://github.com/TU_USUARIO/baby-shower-registry.git
git branch -M main
git push -u origin main
```

### Opción B: Usando GitHub Desktop

1. Descarga [GitHub Desktop](https://desktop.github.com/)
2. File → Add Local Repository
3. Selecciona la carpeta `ezeiza`
4. Publish repository

---

## ☁️ Paso 3: Desplegar en Vercel

### 3.1 Conectar con Vercel

1. **Ir a Vercel:**
   - Ve a https://vercel.com
   - Click en "Sign Up" (si no tienes cuenta)
   - Elige "Continue with GitHub"

2. **Importar tu proyecto:**
   - Click en "Add New..." → "Project"
   - Selecciona tu repositorio `baby-shower-registry`
   - Click en "Import"

### 3.2 Configurar el Proyecto

En la página de configuración:

- **Framework Preset:** Other
- **Root Directory:** ./
- **Build Command:** (dejar vacío o `npm run build`)
- **Output Directory:** public
- **Install Command:** npm install

Click en **"Deploy"**

### 3.3 Configurar Vercel KV (Base de Datos)

**IMPORTANTE:** Después del primer deploy, necesitas configurar la base de datos:

1. **Ir al Dashboard del proyecto en Vercel**

2. **Ir a la pestaña "Storage"**

3. **Crear Vercel KV:**
   - Click en "Create Database"
   - Selecciona "KV" (Redis)
   - Nombre: `baby-shower-db` (o el que prefieras)
   - Region: Selecciona la más cercana a Chile (ej: Washington D.C.)
   - Click en "Create"

4. **Conectar a tu proyecto:**
   - Vercel automáticamente detectará tu proyecto
   - Click en "Connect" junto al nombre de tu proyecto
   - Confirma la conexión

5. **Re-desplegar:**
   - Ve a la pestaña "Deployments"
   - Click en los tres puntos (...) del último deployment
   - Click en "Redeploy"
   - Marca "Use existing Build Cache"
   - Click en "Redeploy"

---

## ✅ Paso 4: ¡Listo!

Tu aplicación estará disponible en una URL como:

```
https://baby-shower-registry.vercel.app
```

O una URL personalizada si configuraste un dominio.

---

## 🔗 URLs Finales

Una vez desplegado, tendrás:

- **Para invitados:** `https://tu-proyecto.vercel.app`
- **Panel admin:** `https://tu-proyecto.vercel.app/admin.html`
- **API:** `https://tu-proyecto.vercel.app/api/gifts`

---

## 🎨 Actualizaciones Futuras

Cada vez que hagas cambios:

```bash
# 1. Hacer cambios en tu código
# 2. Guardar en Git
git add .
git commit -m "Descripción de los cambios"
git push

# 3. Vercel desplegará automáticamente los cambios
```

---

## 🆓 Plan Gratuito de Vercel

El plan gratuito incluye:

- ✅ Despliegues ilimitados
- ✅ 100 GB de ancho de banda
- ✅ Funciones Serverless
- ✅ Vercel KV (Redis) con 256MB
- ✅ SSL automático (HTTPS)
- ✅ Dominio .vercel.app gratis

**¡Más que suficiente para tu baby shower!**

---

## 🛠️ Solución de Problemas

### Error: "KV is not configured"

**Solución:** Asegúrate de haber creado y conectado Vercel KV (Paso 3.3)

### Error: "Module not found: @vercel/kv"

**Solución:** 
```bash
npm install @vercel/kv
git add .
git commit -m "Add Vercel KV dependency"
git push
```

### Los regalos no se guardan

**Solución:** Verifica que Vercel KV esté conectado correctamente:
1. Ve al Dashboard de Vercel
2. Tu Proyecto → Settings → Environment Variables
3. Deberías ver variables como `KV_URL`, `KV_REST_API_URL`, etc.

### Quiero resetear todos los regalos

**Opción 1 - Desde Vercel Dashboard:**
1. Storage → Tu base de datos KV
2. Data Browser
3. Busca la key "gifts"
4. Elimínala
5. La próxima vez que alguien acceda, se inicializará automáticamente

**Opción 2 - Crear endpoint de reset:**
Contacta al desarrollador para agregar esta funcionalidad.

---

## 🌐 Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio (ej: `regalos-baby.midominio.com`):

1. Ve a tu proyecto en Vercel
2. Settings → Domains
3. Agrega tu dominio
4. Sigue las instrucciones para configurar los DNS

---

## 📱 Compartir con Invitados

Una vez desplegado, simplemente comparte la URL:

**WhatsApp:**
```
🍼 ¡Hola! Te invito a ver nuestra lista de regalos de baby shower:
https://tu-proyecto.vercel.app

Por favor selecciona el regalo que te gustaría darnos 💝
```

**Email:**
```
Asunto: 🍼 Lista de Regalos - Baby Shower

Hola [Nombre],

Te invitamos a ver nuestra lista de regalos para el baby shower.
Puedes seleccionar el regalo que desees en el siguiente link:

https://tu-proyecto.vercel.app

¡Gracias!
```

---

## 📊 Monitoreo

Para ver quién ha elegido qué regalo:

1. Ve a: `https://tu-proyecto.vercel.app/admin.html`
2. Verás estadísticas y detalles de cada regalo

---

## 🔒 Seguridad

- **HTTPS automático:** Todos los datos se transmiten de forma segura
- **Sin autenticación:** Cualquiera con el link puede ver y seleccionar regalos
- **Para agregar contraseña al admin:** Contacta al desarrollador

---

## 💡 Tips

1. **Prueba antes de compartir:** Accede a la URL y prueba seleccionar un regalo
2. **Comparte el link corto:** Usa un acortador de URLs si la URL de Vercel es muy larga
3. **Monitorea regularmente:** Revisa el panel admin para ver qué se ha elegido
4. **Backup:** Los datos están seguros en Vercel KV, pero puedes exportarlos si lo necesitas

---

## 📞 Soporte

Si tienes problemas:

1. Revisa esta guía completa
2. Verifica los logs en Vercel (Dashboard → Deployments → Click en el deployment → View Function Logs)
3. Revisa la consola del navegador (F12)

---

¡Disfruta tu baby shower! 🎉👶✨

