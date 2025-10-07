import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { giftId, images } = req.body;

      if (giftId === undefined || giftId === null) {
        return res.status(400).json({ error: 'ID de regalo requerido.' });
      }

      if (!Array.isArray(images)) {
        return res.status(400).json({ error: 'Las imágenes deben ser un array.' });
      }

      const giftsStr = await redis.get('gifts');
      let gifts = giftsStr ? JSON.parse(giftsStr) : [];

      const giftIndex = gifts.findIndex(g => g.id === giftId);

      if (giftIndex === -1) {
        return res.status(404).json({ error: 'Regalo no encontrado.' });
      }

      // Actualizar las imágenes del regalo
      gifts[giftIndex].images = images;

      await redis.set('gifts', JSON.stringify(gifts));

      return res.status(200).json({ 
        success: true, 
        message: 'Imágenes actualizadas exitosamente.',
        gift: gifts[giftIndex]
      });
    } catch (error) {
      console.error('Error al actualizar imágenes:', error);
      return res.status(500).json({ error: error.message || 'Error al actualizar las imágenes.' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}