# Baby Shower Registry - Monorepo

Monorepo con listas de regalos y RSVP para baby showers. Cada proyecto es una carpeta independiente que se despliega como un proyecto separado en Vercel.

## Proyectos

| Carpeta | Baby | Estado |
|---------|------|--------|
| `nain/` | Baby Shower de Nain | Desplegado |
| `olivo-ferrer/` | Baby Shower Olivo Ferrer | Nuevo |

## Arquitectura

Cada proyecto es **auto-contenido** con:

```
proyecto/
├── api/              ← Serverless functions (Vercel)
│   ├── _helpers.js   ← Redis connection + helpers
│   ├── gifts.js      ← GET /api/gifts
│   ├── claim.js      ← POST /api/claim
│   ├── release.js    ← POST /api/release
│   ├── rsvps.js      ← GET/POST /api/rsvps
│   ├── event.js      ← GET/POST /api/event
│   ├── add-gift.js   ← POST /api/add-gift
│   ├── delete-gift.js
│   └── update-gift.js
├── public/           ← Frontend (static files)
│   ├── index.html    ← Página principal
│   ├── admin.html    ← Panel de administración
│   ├── styles.css
│   └── app.js
├── gifts.json        ← Data de regalos (default)
├── rsvps.json        ← RSVPs (local dev)
├── server.js         ← Servidor Express (dev local)
├── package.json
└── vercel.json
```

## Deploy en Vercel

Cada proyecto se despliega como un **proyecto separado** en Vercel, todos desde el mismo repo:

1. En Vercel, crear un nuevo proyecto
2. Conectar al repo `baby-shower-registry`
3. Configurar **Root Directory** → `nombre-carpeta/` (ej: `olivo-ferrer/`)
4. Agregar variable de entorno `REDIS_URL` (Vercel KV)
5. Deploy

## Agregar un nuevo baby shower

1. Copiar una carpeta existente (ej: `cp -r olivo-ferrer/ nuevo-proyecto/`)
2. Editar `gifts.json` con los regalos del nuevo baby shower
3. Editar `api/event.js` con los datos del evento
4. Editar `api/_helpers.js` → cambiar el `PREFIX` para las keys de Redis
5. Personalizar `public/` (HTML, CSS, textos, colores)
6. Actualizar `package.json` con el nombre del proyecto
7. Desplegar en Vercel con Root Directory apuntando a la nueva carpeta

## Desarrollo local

```bash
cd nombre-proyecto/
npm install
node server.js
# Abrir http://localhost:3000
# Admin: http://localhost:3000/admin
```

## API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/gifts` | Listar regalos |
| POST | `/api/claim` | Reservar regalo |
| POST | `/api/release` | Liberar regalo |
| POST | `/api/add-gift` | Agregar regalo |
| POST | `/api/delete-gift` | Eliminar regalo |
| POST | `/api/update-gift` | Actualizar regalo |
| GET/POST | `/api/rsvps` | Confirmaciones |
| GET/POST | `/api/event` | Info del evento |
