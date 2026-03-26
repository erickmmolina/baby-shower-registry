import { getRedis, key, cors } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { giftId, nombre, apellido, email, telefono } = req.body;

    if (giftId === undefined && giftId !== 0) {
      return res.status(400).json({ error: 'ID de regalo requerido' });
    }
    if (!nombre || !apellido || !email) {
      return res.status(400).json({ error: 'Completa nombre, apellido y email' });
    }

    const redis = getRedis();
    const data = await redis.get(key('gifts'));
    const gifts = data ? JSON.parse(data) : [];

    const idx = gifts.findIndex(g => g.id === parseInt(giftId));
    if (idx === -1) return res.status(404).json({ error: 'Regalo no encontrado' });
    if (gifts[idx].status === 'Ya elegido') {
      return res.status(409).json({ error: 'Este regalo ya fue seleccionado' });
    }

    gifts[idx] = {
      ...gifts[idx],
      status: 'Ya elegido',
      claimedBy: { nombre, apellido, email, telefono: telefono || '', fecha: new Date().toISOString() }
    };

    await redis.set(key('gifts'), JSON.stringify(gifts));
    return res.status(200).json({ success: true, message: 'Regalo reservado', gift: gifts[idx] });
  } catch (error) {
    console.error('Error al reclamar:', error);
    return res.status(500).json({ error: 'Error al guardar la selección' });
  }
}
