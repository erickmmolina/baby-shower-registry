import { getRedis, key, cors } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const redis = getRedis();

  if (req.method === 'GET') {
    try {
      const data = await redis.get(key('rsvps'));
      return res.status(200).json(data ? JSON.parse(data) : []);
    } catch (error) {
      console.error('Error obteniendo RSVPs:', error);
      return res.status(500).json({ error: 'Error al obtener confirmaciones' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { nombre, apellido, email, asiste, acompanantes, mensaje } = req.body;
      if (!nombre || !email) {
        return res.status(400).json({ error: 'Nombre y email requeridos' });
      }

      const data = await redis.get(key('rsvps'));
      const rsvps = data ? JSON.parse(data) : [];

      const rsvp = {
        nombre, apellido: apellido || '', email, asiste: !!asiste,
        acompanantes: parseInt(acompanantes) || 0,
        mensaje: mensaje || '',
        fecha: new Date().toISOString()
      };

      const existing = rsvps.findIndex(r => r.email === email);
      if (existing >= 0) {
        rsvps[existing] = rsvp;
      } else {
        rsvps.push(rsvp);
      }

      await redis.set(key('rsvps'), JSON.stringify(rsvps));
      return res.status(200).json({ success: true, rsvp });
    } catch (error) {
      console.error('Error guardando RSVP:', error);
      return res.status(500).json({ error: 'Error al guardar confirmación' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
