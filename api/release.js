import { kv } from '@vercel/kv';

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
    const { giftId } = req.body;

    if (!giftId && giftId !== 0) {
      return res.status(400).json({ error: 'ID de regalo requerido' });
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

    // Restaurar el regalo
    gifts[giftIndex] = {
      ...gifts[giftIndex],
      status: 'Disponible',
      claimedBy: null
    };

    // Guardar en Vercel KV
    await kv.set('gifts', gifts);

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

