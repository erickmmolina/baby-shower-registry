import { getRedis, key, cors } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { giftId, name, description, link1, price, cat, store, priority, image } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Nombre requerido' });

    const redis = getRedis();
    const data = await redis.get(key('gifts'));
    const gifts = data ? JSON.parse(data) : [];

    const idx = gifts.findIndex(g => g.id === parseInt(giftId));
    if (idx === -1) return res.status(404).json({ error: 'Regalo no encontrado' });

    const updates = {
      name: name.trim(),
      description: description !== undefined ? (description?.trim() || '') : gifts[idx].description,
      link1: link1 !== undefined ? (link1?.trim() || '') : gifts[idx].link1,
      price: price !== undefined ? (price ? parseInt(price) : null) : gifts[idx].price,
      cat: cat || gifts[idx].cat,
      store: store !== undefined ? (store?.trim() || gifts[idx].store) : gifts[idx].store,
      priority: priority !== undefined ? (priority || null) : gifts[idx].priority
    };

    if (image !== undefined) {
      updates.image = image || null;
    }

    gifts[idx] = { ...gifts[idx], ...updates };

    await redis.set(key('gifts'), JSON.stringify(gifts));
    return res.status(200).json({ success: true, gift: gifts[idx] });
  } catch (error) {
    console.error('Error actualizando:', error);
    return res.status(500).json({ error: 'Error al actualizar' });
  }
}
