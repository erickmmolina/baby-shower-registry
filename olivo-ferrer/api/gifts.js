import { getRedis, key, cors } from './_helpers.js';
import fs from 'fs';
import path from 'path';

function loadDefaultGifts() {
  try {
    const filePath = path.join(process.cwd(), 'gifts.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error('Error loading default gifts:', e);
    return [];
  }
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const redis = getRedis();
    const data = await redis.get(key('gifts'));
    let gifts = data ? JSON.parse(data) : null;

    if (!gifts) {
      gifts = loadDefaultGifts();
      if (gifts.length > 0) {
        await redis.set(key('gifts'), JSON.stringify(gifts));
      }
    }

    return res.status(200).json(gifts);
  } catch (error) {
    console.error('Error obteniendo regalos:', error);
    return res.status(500).json({ error: 'Error al obtener los regalos' });
  }
}
