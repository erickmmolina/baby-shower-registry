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
    // Obtener el ID desde la URL
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID de regalo requerido' });
    }

    // Obtener todos los regalos
    const giftsStr = await redis.get('gifts');
    let gifts = giftsStr ? JSON.parse(giftsStr) : null;
    
    if (!gifts || !Array.isArray(gifts)) {
      return res.status(500).json({ error: 'Error al obtener los regalos' });
    }

    // Buscar el regalo
    const giftIndex = gifts.findIndex(g => g.id === parseInt(id));
    
    if (giftIndex === -1) {
      return res.status(404).json({ error: 'Regalo no encontrado' });
    }

    // Restaurar el regalo
    gifts[giftIndex] = {
      ...gifts[giftIndex],
      status: 'Disponible',
      claimedBy: null
    };

    // Guardar en Redis
    await redis.set('gifts', JSON.stringify(gifts));

    return res.status(200).json({ 
      success: true, 
      message: 'Regalo liberado exitosamente',
      gift: gifts[giftIndex]
    });

  } catch (error) {
    console.error('Error al liberar regalo:', error);
    return res.status(500).json({ 
      error: 'Error al liberar el regalo' 
    });
  }
}
