import Redis from 'ioredis';

// Crear cliente Redis usando REDIS_URL de Vercel
const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true
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
    const { giftId, name, description, link1, price1, link2, price2 } = req.body;

    // Validar datos
    if (giftId === undefined || giftId === null) {
      return res.status(400).json({ error: 'ID de regalo requerido.' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre del regalo es obligatorio.' });
    }

    // Obtener todos los regalos de Redis
    const giftsStr = await redis.get('gifts');
    const gifts = giftsStr ? JSON.parse(giftsStr) : [];

    // Buscar el regalo
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

    // Guardar en Redis
    await redis.set('gifts', JSON.stringify(gifts));

    return res.status(200).json({
      success: true,
      message: 'Regalo actualizado exitosamente.',
      gift: gifts[giftIndex]
    });
  } catch (error) {
    console.error('Error actualizando regalo:', error);
    return res.status(500).json({ error: 'Error al actualizar el regalo.' });
  }
}
