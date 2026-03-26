import { getRedis, key, cors } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { name, description, link1, price, cat, store, priority } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Nombre requerido' });

    const redis = getRedis();
    const data = await redis.get(key('gifts'));
    const gifts = data ? JSON.parse(data) : [];

    const maxId = gifts.length > 0 ? Math.max(...gifts.map(g => g.id)) : 0;
    const newGift = {
      id: maxId + 1,
      cat: cat || 'otros',
      name: name.trim(),
      store: store?.trim() || '',
      description: description?.trim() || '',
      price: price ? parseInt(price) : null,
      link1: link1?.trim() || '',
      priority: priority || null,
      status: 'Disponible',
      claimedBy: null,
      images: []
    };

    gifts.push(newGift);
    await redis.set(key('gifts'), JSON.stringify(gifts));

    return res.status(200).json({ success: true, gift: newGift });
  } catch (error) {
    console.error('Error agregando regalo:', error);
    return res.status(500).json({ error: 'Error al agregar' });
  }
}
