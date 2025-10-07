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
    const { name, description, link1, link2 } = req.body;

    // Validar datos
    if (!name) {
      return res.status(400).json({ 
        error: 'El nombre del regalo es requerido' 
      });
    }

    // Obtener todos los regalos
    const giftsStr = await redis.get('gifts');
    let gifts = giftsStr ? JSON.parse(giftsStr) : [];

    // Encontrar el ID más alto
    const maxId = gifts.length > 0 ? Math.max(...gifts.map(g => g.id)) : -1;
    const newId = maxId + 1;

    // Crear nuevo regalo
    const newGift = {
      id: newId,
      name: name.trim(),
      description: description ? description.trim() : '',
      link1: link1 ? link1.trim() : null,
      link2: link2 ? link2.trim() : null,
      status: 'Disponible',
      claimedBy: null
    };

    // Agregar el nuevo regalo
    gifts.push(newGift);

    // Guardar en Redis
    await redis.set('gifts', JSON.stringify(gifts));

    return res.status(200).json({ 
      success: true, 
      message: 'Regalo agregado exitosamente',
      gift: newGift
    });

  } catch (error) {
    console.error('Error al agregar regalo:', error);
    return res.status(500).json({ 
      error: 'Error al agregar el regalo. Por favor intenta nuevamente.' 
    });
  }
}

