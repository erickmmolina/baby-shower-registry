import { getRedis, key, cors } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { giftId } = req.body;
    const redis = getRedis();
    const data = await redis.get(key('gifts'));
    const gifts = data ? JSON.parse(data) : [];

    const idx = gifts.findIndex(g => g.id === parseInt(giftId));
    if (idx === -1) return res.status(404).json({ error: 'Regalo no encontrado' });

    gifts.splice(idx, 1);
    await redis.set(key('gifts'), JSON.stringify(gifts));

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error eliminando regalo:', error);
    return res.status(500).json({ error: 'Error al eliminar' });
  }
}
