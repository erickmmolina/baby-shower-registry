# 🍼 Sistema de Lista de Regalos - Baby Shower

Sistema web completo para gestionar la lista de regalos de baby shower con selección y bloqueo automático de regalos.

## ✨ Características

- 🎁 **Interfaz moderna y responsiva** con diseño atractivo
- 🔒 **Bloqueo automático** de regalos seleccionados
- 📱 **Responsive** - funciona en móviles, tablets y desktop
- 🎨 **Diseño personalizado** con tema baby shower (colores azules)
- 🔄 **Actualización en tiempo real** del estado de los regalos
- 📋 **Filtros** para ver regalos disponibles, ya elegidos o todos
- 🔗 **Múltiples opciones de compra** para cada regalo
- ✅ **Validación de formularios** para evitar errores
- 💾 **Persistencia de datos** con Redis Cloud

## 🌐 URLs de la Aplicación

- **Para invitados:** https://nain-bravo.vercel.app
- **Panel admin:** https://nain-bravo.vercel.app/admin
- **Repositorio GitHub:** https://github.com/erickmmolina/baby-shower-registry

## 🚀 Deployment

Esta aplicación está desplegada en Vercel con Redis Cloud para el almacenamiento de datos.

Ver documentación completa en `DEPLOY_VERCEL.md`

## 🛠️ Tecnologías

- Frontend: HTML5, CSS3, JavaScript (Vanilla)
- Backend: Vercel Serverless Functions (Node.js)
- Base de datos: Redis Cloud
- Deployment: Vercel con auto-deployment desde GitHub

## 📱 Uso

### Para los invitados:
1. Acceder a https://nain-bravo.vercel.app
2. Ver todos los regalos disponibles
3. Click en "Elegir este regalo"
4. Completar datos personales
5. Confirmar selección

### Para administración:
1. Acceder a https://nain-bravo.vercel.app/admin
2. Ver estadísticas y regalos
3. Liberar regalos si es necesario

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar servidor local
npm start

# La app estará en http://localhost:3000
```

## 🎨 Personalización

### Cambiar colores:
Edita `public/styles.css` y modifica las variables CSS:

```css
:root {
    --primary-color: #6FB1E8;
    --primary-dark: #5A9FD4;
    --secondary-color: #a8d8ea;
    --accent-color: #89CFF0;
}
```

### Agregar/modificar regalos:
Los regalos se inicializan automáticamente la primera vez en Redis Cloud desde `api/gifts.js`

## 📦 Estructura del Proyecto

```
baby-shower-registry/
├── api/                    # Serverless Functions
│   ├── gifts.js           # GET regalos
│   ├── claim.js           # POST reclamar regalo
│   └── release.js         # POST liberar regalo
├── public/                # Frontend
│   ├── index.html         # Página principal
│   ├── admin.html         # Panel de administración
│   ├── styles.css         # Estilos
│   └── app.js            # Lógica JavaScript
├── vercel.json           # Configuración de Vercel
├── package.json          # Dependencias
└── README.md            # Este archivo
```

## 🔄 Actualizaciones

Para actualizar la aplicación:

```bash
# Hacer cambios en el código
git add .
git commit -m "Descripción de cambios"
git push

# Vercel despliega automáticamente en ~30 segundos
```

## 🆓 Costos

- Vercel: **GRATIS** (Plan Hobby)
- GitHub: **GRATIS**
- Redis Cloud: **GRATIS** (30 MB)

**Total: $0 USD/mes** 🎉

## 📝 Licencia

Este proyecto es de código abierto y puede ser usado libremente.

---

¡Disfruta tu baby shower! 🍼👶✨
# Deploy trigger Thu Mar 26 13:22:21 -03 2026
