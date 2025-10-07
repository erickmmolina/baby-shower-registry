import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Redis from 'ioredis';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const GIFTS_FILE = path.join(__dirname, 'gifts.json');

// Configurar Redis si está disponible
let redis = null;
const USE_REDIS = !!process.env.REDIS_URL;

if (USE_REDIS) {
    redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
        lazyConnect: true
    });
    console.log('🔴 Usando Redis (Vercel KV) para almacenamiento');
} else {
    console.log('📁 Usando archivo local (gifts.json) para almacenamiento');
}

// Función para leer los regalos
async function readGifts() {
    try {
        if (USE_REDIS && redis) {
            const giftsStr = await redis.get('gifts');
            return giftsStr ? JSON.parse(giftsStr) : [];
        } else {
            const data = fs.readFileSync(GIFTS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error leyendo regalos:', error);
        return [];
    }
}

// Función para guardar los regalos
async function saveGifts(gifts) {
    try {
        if (USE_REDIS && redis) {
            await redis.set('gifts', JSON.stringify(gifts));
            return true;
        } else {
            fs.writeFileSync(GIFTS_FILE, JSON.stringify(gifts, null, 2), 'utf8');
            return true;
        }
    } catch (error) {
        console.error('Error guardando regalos:', error);
        return false;
    }
}

// Endpoints API

// GET - Obtener todos los regalos
app.get('/api/gifts', async (req, res) => {
    const gifts = await readGifts();
    res.json(gifts);
});

// GET - Obtener un regalo específico
app.get('/api/gifts/:id', async (req, res) => {
    const gifts = await readGifts();
    const gift = gifts.find(g => g.id === parseInt(req.params.id));

    if (!gift) {
        return res.status(404).json({ error: 'Regalo no encontrado' });
    }

    res.json(gift);
});

// POST - Reclamar un regalo
app.post('/api/gifts/:id/claim', async (req, res) => {
    const { nombre, apellido, email, telefono } = req.body;

    // Validar datos
    if (!nombre || !apellido || !email) {
        return res.status(400).json({
            error: 'Por favor completa todos los campos requeridos (nombre, apellido, email)'
        });
    }

    const gifts = await readGifts();
    const giftIndex = gifts.findIndex(g => g.id === parseInt(req.params.id));

    if (giftIndex === -1) {
        return res.status(404).json({ error: 'Regalo no encontrado' });
    }

    const gift = gifts[giftIndex];

    // Verificar si ya está reclamado
    if (gift.status === 'Ya elegido') {
        return res.status(409).json({
            error: 'Este regalo ya ha sido seleccionado por otro invitado'
        });
    }

    // Actualizar el regalo
    gifts[giftIndex] = {
        ...gift,
        status: 'Ya elegido',
        claimedBy: {
            nombre,
            apellido,
            email,
            telefono: telefono || '',
            fecha: new Date().toISOString()
        }
    };

    // Guardar cambios
    if (await saveGifts(gifts)) {
        res.json({
            success: true,
            message: '¡Gracias! El regalo ha sido reservado exitosamente',
            gift: gifts[giftIndex]
        });
    } else {
        res.status(500).json({
            error: 'Error al guardar la selección. Por favor intenta nuevamente.'
        });
    }
});

// POST - Liberar un regalo (para administración)
app.post('/api/gifts/:id/release', async (req, res) => {
    const gifts = await readGifts();
    const giftIndex = gifts.findIndex(g => g.id === parseInt(req.params.id));

    if (giftIndex === -1) {
        return res.status(404).json({ error: 'Regalo no encontrado' });
    }

    // Restaurar el regalo
    gifts[giftIndex] = {
        ...gifts[giftIndex],
        status: 'Disponible',
        claimedBy: null
    };

    if (await saveGifts(gifts)) {
        res.json({
            success: true,
            message: 'Regalo liberado exitosamente',
            gift: gifts[giftIndex]
        });
    } else {
        res.status(500).json({
            error: 'Error al liberar el regalo'
        });
    }
});

// POST - Actualizar imágenes de un regalo
app.post('/api/update-images', async (req, res) => {
    const { giftId, images } = req.body;

    if (giftId === undefined || giftId === null) {
        return res.status(400).json({ error: 'ID de regalo requerido.' });
    }

    if (!Array.isArray(images)) {
        return res.status(400).json({ error: 'Las imágenes deben ser un array.' });
    }

    const gifts = await readGifts();
    const giftIndex = gifts.findIndex(g => g.id === giftId);

    if (giftIndex === -1) {
        return res.status(404).json({ error: 'Regalo no encontrado.' });
    }

    // Actualizar las imágenes del regalo
    gifts[giftIndex].images = images;

    if (await saveGifts(gifts)) {
        res.json({
            success: true,
            message: 'Imágenes actualizadas exitosamente.',
            gift: gifts[giftIndex]
        });
    } else {
        res.status(500).json({
            error: 'Error al actualizar las imágenes.'
        });
    }
});

// POST - Actualizar datos de un regalo
app.post('/api/update-gift', async (req, res) => {
    const { giftId, name, description, link1, price1, link2, price2 } = req.body;

    if (giftId === undefined || giftId === null) {
        return res.status(400).json({ error: 'ID de regalo requerido.' });
    }

    if (!name || !name.trim()) {
        return res.status(400).json({ error: 'El nombre del regalo es obligatorio.' });
    }

    const gifts = await readGifts();
    const giftIndex = gifts.findIndex(g => g.id === giftId);

    if (giftIndex === -1) {
        return res.status(404).json({ error: 'Regalo no encontrado.' });
    }

    // Actualizar los datos del regalo
    gifts[giftIndex] = {
        ...gifts[giftIndex],
        name: name.trim(),
        description: description ? description.trim() : '',
        link1: link1 ? link1.trim() : '',
        price1: price1 ? parseInt(price1) : null,
        link2: link2 ? link2.trim() : '',
        price2: price2 ? parseInt(price2) : null
    };

    if (await saveGifts(gifts)) {
        res.json({
            success: true,
            message: 'Regalo actualizado exitosamente.',
            gift: gifts[giftIndex]
        });
    } else {
        res.status(500).json({
            error: 'Error al actualizar el regalo.'
        });
    }
});

// Ruta principal - servir el HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para el admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🎁 Servidor de Baby Shower Registry corriendo en http://localhost:${PORT}`);
    console.log(`📋 API disponible en http://localhost:${PORT}/api/gifts`);
});

