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
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { giftId } = req.body;

    if (!giftId && giftId !== 0) {
      return res.status(400).json({ error: 'ID de regalo requerido' });
    }

    // Obtener todos los regalos
    const giftsStr = await redis.get('gifts');
    let gifts = giftsStr ? JSON.parse(giftsStr) : [];

    // Buscar el regalo
    const giftIndex = gifts.findIndex(g => g.id === parseInt(giftId));
    
    if (giftIndex === -1) {
      return res.status(404).json({ error: 'Regalo no encontrado' });
    }

    // Eliminar el regalo
    const deletedGift = gifts[giftIndex];
    gifts.splice(giftIndex, 1);

    // Guardar en Redis
    await redis.set('gifts', JSON.stringify(gifts));

    return res.status(200).json({ 
      success: true, 
      message: 'Regalo eliminado exitosamente',
      gift: deletedGift
    });

  } catch (error) {
    console.error('Error al eliminar regalo:', error);
    return res.status(500).json({ 
      error: 'Error al eliminar el regalo' 
    });
  }
}

