import { createClient } from '@vercel/kv';

// Crear cliente KV con las variables de entorno
const kv = createClient({
  url: process.env.KV_REST_API_URL || process.env.STORAGE_URL || process.env.REDIS_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.STORAGE_REST_API_TOKEN || process.env.REDIS_REST_API_TOKEN
});

export default async function handler(req, res) {
  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { giftId, nombre, apellido, email, telefono } = req.body;

    // Validar datos
    if (!giftId && giftId !== 0) {
      return res.status(400).json({ error: 'ID de regalo requerido' });
    }

    if (!nombre || !apellido || !email) {
      return res.status(400).json({ 
        error: 'Por favor completa todos los campos requeridos (nombre, apellido, email)' 
      });
    }

    // Obtener todos los regalos
    let gifts = await kv.get('gifts');
    
    if (!gifts || !Array.isArray(gifts)) {
      return res.status(500).json({ error: 'Error al obtener los regalos' });
    }

    // Buscar el regalo
    const giftIndex = gifts.findIndex(g => g.id === parseInt(giftId));
    
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

    // Guardar en Vercel KV
    await kv.set('gifts', gifts);

    return res.status(200).json({ 
      success: true, 
      message: '¡Gracias! El regalo ha sido reservado exitosamente',
      gift: gifts[giftIndex]
    });

  } catch (error) {
    console.error('Error al reclamar regalo:', error);
    return res.status(500).json({ 
      error: 'Error al guardar la selección. Por favor intenta nuevamente.' 
    });
  }
}

