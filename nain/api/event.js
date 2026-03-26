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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // Obtener información del evento de Redis
      const eventStr = await redis.get('event');
      
      if (eventStr) {
        return res.status(200).json(JSON.parse(eventStr));
      }
      
      // Valores por defecto
      return res.status(200).json({
        date: 'Sábado 26 de Octubre, 2025',
        time: '17:00 hrs',
        location: 'Casa de los Abuelos',
        mapLink: 'https://maps.google.com/?q=-33.4489,-70.6693',
        dressCode: 'Casual y cómodo',
        theme: 'Tonos pastel 💙'
      });
    } catch (error) {
      console.error('Error obteniendo evento:', error);
      return res.status(500).json({ error: 'Error al obtener información del evento' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { date, time, location, mapLink, dressCode, theme } = req.body;
      
      const eventData = { date, time, location, mapLink, dressCode, theme };
      
      // Guardar en Redis
      await redis.set('event', JSON.stringify(eventData));

      return res.status(200).json({
        success: true,
        message: 'Información del evento actualizada',
        event: eventData
      });
    } catch (error) {
      console.error('Error actualizando evento:', error);
      return res.status(500).json({ error: 'Error al actualizar el evento' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
