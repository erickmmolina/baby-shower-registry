import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const GIFTS_FILE = path.join(__dirname, 'gifts.json');

// Función para leer los regalos
function readGifts() {
    try {
        const data = fs.readFileSync(GIFTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error leyendo gifts.json:', error);
        return [];
    }
}

// Función para guardar los regalos
function saveGifts(gifts) {
    try {
        fs.writeFileSync(GIFTS_FILE, JSON.stringify(gifts, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error('Error guardando gifts.json:', error);
        return false;
    }
}

// Endpoints API

// GET - Obtener todos los regalos
app.get('/api/gifts', (req, res) => {
    const gifts = readGifts();
    res.json(gifts);
});

// GET - Obtener un regalo específico
app.get('/api/gifts/:id', (req, res) => {
    const gifts = readGifts();
    const gift = gifts.find(g => g.id === parseInt(req.params.id));

    if (!gift) {
        return res.status(404).json({ error: 'Regalo no encontrado' });
    }

    res.json(gift);
});

// POST - Reclamar un regalo
app.post('/api/gifts/:id/claim', (req, res) => {
    const { nombre, apellido, email, telefono } = req.body;

    // Validar datos
    if (!nombre || !apellido || !email) {
        return res.status(400).json({
            error: 'Por favor completa todos los campos requeridos (nombre, apellido, email)'
        });
    }

    const gifts = readGifts();
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
    if (saveGifts(gifts)) {
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
app.post('/api/gifts/:id/release', (req, res) => {
    const gifts = readGifts();
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

    if (saveGifts(gifts)) {
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
app.post('/api/update-images', (req, res) => {
    const { giftId, images } = req.body;

    if (giftId === undefined || giftId === null) {
        return res.status(400).json({ error: 'ID de regalo requerido.' });
    }

    if (!Array.isArray(images)) {
        return res.status(400).json({ error: 'Las imágenes deben ser un array.' });
    }

    const gifts = readGifts();
    const giftIndex = gifts.findIndex(g => g.id === giftId);

    if (giftIndex === -1) {
        return res.status(404).json({ error: 'Regalo no encontrado.' });
    }

    // Actualizar las imágenes del regalo
    gifts[giftIndex].images = images;

    if (saveGifts(gifts)) {
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

