import { getRedis, key, cors } from './_helpers.js';
import defaultGifts from '../gifts.json' assert { type: 'json' };

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const redis = getRedis();
    const data = await redis.get(key('gifts'));
    let gifts = data ? JSON.parse(data) : null;

    if (!gifts) {
      await redis.set(key('gifts'), JSON.stringify(defaultGifts));
      gifts = defaultGifts;
    }

    return res.status(200).json(gifts);
  } catch (error) {
    console.error('Error obteniendo regalos:', error);
    return res.status(500).json({ error: 'Error al obtener los regalos' });
  }
}
