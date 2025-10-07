# 🍼 Sistema de Lista de Regalos - Baby Shower

Sistema web completo para gestionar la lista de regalos de baby shower con selección y bloqueo automático de regalos.

## ✨ Características

- 🎁 **Interfaz moderna y responsiva** con diseño atractivo
- 🔒 **Bloqueo automático** de regalos seleccionados
- 📱 **Responsive** - funciona en móviles, tablets y desktop
- 🎨 **Diseño personalizado** con tema baby shower
- 🔄 **Actualización en tiempo real** del estado de los regalos
- 📋 **Filtros** para ver regalos disponibles, ya elegidos o todos
- 🔗 **Múltiples opciones de compra** para cada regalo
- ✅ **Validación de formularios** para evitar errores
- 💾 **Persistencia de datos** en archivo JSON

## 📋 Requisitos

- Node.js (versión 14 o superior)
- npm o yarn

## 🚀 Instalación

1. **Instalar dependencias:**

```bash
npm install
```

## ▶️ Ejecutar la aplicación

1. **Iniciar el servidor:**

```bash
npm start
```

2. **Abrir en el navegador:**

```
http://localhost:3000
```

¡Eso es todo! La aplicación estará corriendo y lista para usar.

## 📱 Cómo usar

### Para los invitados:

1. **Acceder** a la URL compartida (ej: `http://localhost:3000`)
2. **Explorar** la lista de regalos disponibles
3. **Filtrar** por estado (Todos, Disponibles, Ya elegidos)
4. **Hacer clic** en "Elegir este regalo" en el regalo deseado
5. **Completar el formulario** con tus datos:
   - Nombre (requerido)
   - Apellido (requerido)
   - Email (requerido)
   - Teléfono (opcional)
6. **Confirmar** la selección
7. El regalo quedará **automáticamente bloqueado** para otros invitados

### Para administración:

Los datos de los regalos y sus estados se guardan en el archivo `gifts.json`. Puedes:

- **Ver quién eligió cada regalo** abriendo el archivo `gifts.json`
- **Liberar un regalo** usando el endpoint: `POST /api/gifts/:id/release`
- **Agregar nuevos regalos** editando el archivo `gifts.json` (reiniciar servidor después)

## 🔧 Estructura del proyecto

```
ezeiza/
├── server.js                          # Servidor backend (API REST)
├── gifts.json                         # Base de datos de regalos
├── package.json                       # Dependencias del proyecto
├── public/                            # Frontend
│   ├── index.html                     # Página principal
│   ├── styles.css                     # Estilos CSS
│   └── app.js                         # Lógica JavaScript
├── Lista_estandarizada_para_Google_Sheets.csv  # Datos originales
└── README.md                          # Este archivo
```

## 🌐 API Endpoints

### GET /api/gifts
Obtiene todos los regalos con su estado actual.

**Respuesta:**
```json
[
  {
    "id": 0,
    "name": "BAÑERA CON ACCESORIOS",
    "link1": "https://...",
    "link2": "https://...",
    "status": "Disponible",
    "claimedBy": null
  }
]
```

### POST /api/gifts/:id/claim
Reclama un regalo (lo marca como "Ya elegido").

**Body:**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "telefono": "+56912345678"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "¡Gracias! El regalo ha sido reservado exitosamente",
  "gift": { ... }
}
```

### POST /api/gifts/:id/release
Libera un regalo marcado como "Ya elegido" (vuelve a "Disponible").

**Respuesta:**
```json
{
  "success": true,
  "message": "Regalo liberado exitosamente"
}
```

## 🎨 Personalización

### Cambiar colores:

Edita las variables CSS en `public/styles.css`:

```css
:root {
    --primary-color: #ff9ec8;      /* Color principal */
    --secondary-color: #a8d8ea;    /* Color secundario */
    --accent-color: #ffcb77;       /* Color de acento */
    /* ... más colores ... */
}
```

### Agregar o modificar regalos:

1. Edita el archivo `gifts.json`
2. Reinicia el servidor

Formato de cada regalo:
```json
{
  "id": 0,
  "name": "NOMBRE DEL REGALO",
  "description": "Descripción opcional",
  "link1": "https://link-compra-1.com",
  "link2": "https://link-compra-2.com",  // opcional
  "status": "Disponible",
  "claimedBy": null
}
```

## 📊 Ver quién eligió cada regalo

Abre el archivo `gifts.json` y busca el campo `claimedBy` en cada regalo:

```json
{
  "id": 0,
  "name": "BAÑERA CON ACCESORIOS",
  "status": "Ya elegido",
  "claimedBy": {
    "nombre": "María",
    "apellido": "González",
    "email": "maria@example.com",
    "telefono": "+56912345678",
    "fecha": "2025-10-07T15:30:00.000Z"
  }
}
```

## 🌍 Desplegar en producción

### Opción 1: Vercel, Netlify, Railway
Estas plataformas permiten desplegar aplicaciones Node.js fácilmente.

### Opción 2: VPS propio
```bash
# Instalar PM2 para mantener el servidor corriendo
npm install -g pm2

# Iniciar la aplicación
pm2 start server.js --name baby-shower

# Guardar configuración
pm2 save
pm2 startup
```

### Opción 3: Heroku
```bash
heroku create
git push heroku main
```

## 🔒 Seguridad

- Los datos se guardan localmente en `gifts.json`
- No hay autenticación implementada (todos pueden ver y seleccionar)
- Para producción, considera agregar:
  - Autenticación para administración
  - Base de datos real (MongoDB, PostgreSQL, etc.)
  - Rate limiting para evitar spam
  - HTTPS/SSL

## 🐛 Solución de problemas

### El servidor no inicia:
```bash
# Verificar que el puerto 3000 no esté en uso
lsof -i :3000

# Usar un puerto diferente
PORT=8080 npm start
```

### Los regalos no se actualizan:
- Refresca la página (F5)
- Verifica que el servidor esté corriendo
- Revisa la consola del navegador (F12) para errores

### Error al guardar selección:
- Verifica que el archivo `gifts.json` tenga permisos de escritura
- Revisa los logs del servidor en la terminal

## 📝 Licencia

Este proyecto es de código abierto y puede ser usado libremente.

## 🤝 Soporte

Si tienes problemas o preguntas, revisa:
1. Este README
2. Los logs del servidor en la terminal
3. La consola del navegador (F12 → Console)

---

¡Disfruta organizando tu baby shower! 🎉👶

