import { getRedis, key, cors } from './_helpers.js';

const defaultEvent = {
  date: 'Sábado 25 de Abril, 2025',
  time: '14:30 - 18:00 hrs',
  location: 'Quincho Edificio Quillay',
  address: 'Av. Club del Campo 172, Vitacura',
  mapLink: 'https://maps.google.com/?q=Av+Club+del+Campo+172+Vitacura+Santiago',
  dressCode: 'Abrigado (es en terraza)'
};

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const redis = getRedis();

  if (req.method === 'GET') {
    try {
      const data = await redis.get(key('event'));
      return res.status(200).json(data ? JSON.parse(data) : defaultEvent);
    } catch (error) {
      return res.status(500).json({ error: 'Error al obtener evento' });
    }
  }

  if (req.method === 'POST') {
    try {
      await redis.set(key('event'), JSON.stringify(req.body));
      return res.status(200).json({ success: true, event: req.body });
    } catch (error) {
      return res.status(500).json({ error: 'Error al actualizar evento' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
