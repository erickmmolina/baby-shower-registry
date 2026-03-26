import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const GIFTS_FILE = path.join(__dirname, 'gifts.json');
const RSVP_FILE = path.join(__dirname, 'rsvps.json');

// Redis
let redis = null;
const USE_REDIS = !!process.env.REDIS_URL;

if (USE_REDIS) {
    redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
        lazyConnect: true
    });
    console.log('Redis conectado');
} else {
    console.log('Usando archivos locales');
}

// --- Helpers ---
async function readGifts() {
    try {
        if (USE_REDIS && redis) {
            const data = await redis.get('olivo_gifts');
            return data ? JSON.parse(data) : [];
        }
        return JSON.parse(fs.readFileSync(GIFTS_FILE, 'utf8'));
    } catch (e) {
        console.error('Error leyendo gifts:', e);
        return [];
    }
}

async function saveGifts(gifts) {
    try {
        if (USE_REDIS && redis) {
            await redis.set('olivo_gifts', JSON.stringify(gifts));
        } else {
            fs.writeFileSync(GIFTS_FILE, JSON.stringify(gifts, null, 2), 'utf8');
        }
        return true;
    } catch (e) {
        console.error('Error guardando gifts:', e);
        return false;
    }
}

async function readRsvps() {
    try {
        if (USE_REDIS && redis) {
            const data = await redis.get('olivo_rsvps');
            return data ? JSON.parse(data) : [];
        }
        if (fs.existsSync(RSVP_FILE)) {
            return JSON.parse(fs.readFileSync(RSVP_FILE, 'utf8'));
        }
        return [];
    } catch (e) {
        console.error('Error leyendo rsvps:', e);
        return [];
    }
}

async function saveRsvps(rsvps) {
    try {
        if (USE_REDIS && redis) {
            await redis.set('olivo_rsvps', JSON.stringify(rsvps));
        } else {
            fs.writeFileSync(RSVP_FILE, JSON.stringify(rsvps, null, 2), 'utf8');
        }
        return true;
    } catch (e) {
        console.error('Error guardando rsvps:', e);
        return false;
    }
}

// --- API Gifts ---
app.get('/api/gifts', async (req, res) => {
    res.json(await readGifts());
});

app.get('/api/gifts/:id', async (req, res) => {
    const gifts = await readGifts();
    const gift = gifts.find(g => g.id === parseInt(req.params.id));
    if (!gift) return res.status(404).json({ error: 'Regalo no encontrado' });
    res.json(gift);
});

// POST /api/claim - Reservar un regalo (giftId en body)
app.post('/api/claim', async (req, res) => {
    const { giftId, nombre, apellido, email, telefono } = req.body;
    if (!nombre || !apellido || !email) {
        return res.status(400).json({ error: 'Completa nombre, apellido y email' });
    }

    const gifts = await readGifts();
    const idx = gifts.findIndex(g => g.id === parseInt(giftId));
    if (idx === -1) return res.status(404).json({ error: 'Regalo no encontrado' });
    if (gifts[idx].status === 'Ya elegido') {
        return res.status(409).json({ error: 'Este regalo ya fue seleccionado' });
    }

    gifts[idx] = {
        ...gifts[idx],
        status: 'Ya elegido',
        claimedBy: { nombre, apellido, email, telefono: telefono || '', fecha: new Date().toISOString() }
    };

    if (await saveGifts(gifts)) {
        res.json({ success: true, message: 'Regalo reservado', gift: gifts[idx] });
    } else {
        res.status(500).json({ error: 'Error al guardar' });
    }
});

// POST /api/release - Liberar un regalo (giftId en body)
app.post('/api/release', async (req, res) => {
    const { giftId } = req.body;
    const gifts = await readGifts();
    const idx = gifts.findIndex(g => g.id === parseInt(giftId));
    if (idx === -1) return res.status(404).json({ error: 'Regalo no encontrado' });

    gifts[idx] = { ...gifts[idx], status: 'Disponible', claimedBy: null };

    if (await saveGifts(gifts)) {
        res.json({ success: true, gift: gifts[idx] });
    } else {
        res.status(500).json({ error: 'Error al liberar' });
    }
});

// POST /api/update-gift
app.post('/api/update-gift', async (req, res) => {
    const { giftId, name, description, link1, price, cat, store, priority, image } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Nombre requerido' });

    const gifts = await readGifts();
    const idx = gifts.findIndex(g => g.id === parseInt(giftId));
    if (idx === -1) return res.status(404).json({ error: 'Regalo no encontrado' });

    const updates = {
        name: name.trim(),
        description: description !== undefined ? (description?.trim() || '') : gifts[idx].description,
        link1: link1 !== undefined ? (link1?.trim() || '') : gifts[idx].link1,
        price: price !== undefined ? (price ? parseInt(price) : null) : gifts[idx].price,
        cat: cat || gifts[idx].cat,
        store: store !== undefined ? (store?.trim() || gifts[idx].store) : gifts[idx].store,
        priority: priority !== undefined ? (priority || null) : gifts[idx].priority
    };
    if (image !== undefined) updates.image = image || null;

    gifts[idx] = { ...gifts[idx], ...updates };

    if (await saveGifts(gifts)) {
        res.json({ success: true, gift: gifts[idx] });
    } else {
        res.status(500).json({ error: 'Error al actualizar' });
    }
});

// POST /api/add-gift
app.post('/api/add-gift', async (req, res) => {
    const { name, description, link1, price, cat, store, priority } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Nombre requerido' });

    const gifts = await readGifts();
    const maxId = gifts.length > 0 ? Math.max(...gifts.map(g => g.id)) : 0;

    const newGift = {
        id: maxId + 1,
        cat: cat || 'otros',
        name: name.trim(),
        store: store?.trim() || '',
        description: description?.trim() || '',
        price: price ? parseInt(price) : null,
        link1: link1?.trim() || '',
        priority: priority || null,
        status: 'Disponible',
        claimedBy: null,
        images: []
    };

    gifts.push(newGift);

    if (await saveGifts(gifts)) {
        res.json({ success: true, gift: newGift });
    } else {
        res.status(500).json({ error: 'Error al agregar' });
    }
});

// POST /api/delete-gift
app.post('/api/delete-gift', async (req, res) => {
    const { giftId } = req.body;
    const gifts = await readGifts();
    const idx = gifts.findIndex(g => g.id === parseInt(giftId));
    if (idx === -1) return res.status(404).json({ error: 'Regalo no encontrado' });

    gifts.splice(idx, 1);

    if (await saveGifts(gifts)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Error al eliminar' });
    }
});

// --- API RSVP ---
app.get('/api/rsvps', async (req, res) => {
    res.json(await readRsvps());
});

app.post('/api/rsvps', async (req, res) => {
    const { nombre, apellido, email, asiste, acompanantes, mensaje } = req.body;
    if (!nombre || !email) {
        return res.status(400).json({ error: 'Nombre y email requeridos' });
    }

    const rsvps = await readRsvps();

    // Verificar si ya confirmó con ese email
    const existing = rsvps.findIndex(r => r.email === email);
    const rsvp = {
        nombre, apellido: apellido || '', email, asiste: !!asiste,
        acompanantes: parseInt(acompanantes) || 0,
        mensaje: mensaje || '',
        fecha: new Date().toISOString()
    };

    if (existing >= 0) {
        rsvps[existing] = rsvp;
    } else {
        rsvps.push(rsvp);
    }

    if (await saveRsvps(rsvps)) {
        res.json({ success: true, rsvp });
    } else {
        res.status(500).json({ error: 'Error al guardar RSVP' });
    }
});

// --- Admin auth ---
app.post('/api/admin-auth', (req, res) => {
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (!ADMIN_PASSWORD) {
        return res.json({ success: true });
    }
    const { password } = req.body || {};
    if (password === ADMIN_PASSWORD) {
        return res.json({ success: true });
    }
    return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
});

// --- Event info ---
app.get('/api/event', async (req, res) => {
    try {
        if (USE_REDIS && redis) {
            const data = await redis.get('olivo_event');
            if (data) return res.json(JSON.parse(data));
        }
        res.json({
            date: 'Sábado 25 de Abril, 2025',
            time: '14:30 - 18:00 hrs',
            location: 'Quincho Edificio Quillay',
            address: 'Av. Club del Campo 172, Vitacura',
            mapLink: 'https://maps.google.com/?q=Av+Club+del+Campo+172+Vitacura+Santiago',
            dressCode: 'Abrigado (es en terraza)'
        });
    } catch (e) {
        res.status(500).json({ error: 'Error obteniendo evento' });
    }
});

app.post('/api/event', async (req, res) => {
    try {
        const eventData = req.body;
        if (USE_REDIS && redis) {
            await redis.set('olivo_event', JSON.stringify(eventData));
        } else {
            fs.writeFileSync(path.join(__dirname, 'event.json'), JSON.stringify(eventData, null, 2), 'utf8');
        }
        res.json({ success: true, event: eventData });
    } catch (e) {
        res.status(500).json({ error: 'Error actualizando evento' });
    }
});

// --- Image proxy ---
app.get('/api/img', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('Missing url');
    try {
        const r = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'image/*,*/*', 'Referer': new URL(url).origin }
        });
        if (!r.ok) return res.status(r.status).send('Failed');
        const ct = r.headers.get('content-type') || 'image/jpeg';
        const buf = Buffer.from(await r.arrayBuffer());
        res.setHeader('Content-Type', ct);
        res.setHeader('Cache-Control', 'public, max-age=604800');
        res.send(buf);
    } catch (e) { res.status(500).send('Proxy error'); }
});

// --- Routes ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.listen(PORT, () => {
    console.log(`Baby Shower Olivo Ferrer en http://localhost:${PORT}`);
});
