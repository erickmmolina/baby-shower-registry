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

  const adminPassword = process.env.ADMIN_PASSWORD;

  // Si no hay contraseña configurada, permitir acceso (dev local)
  if (!adminPassword) {
    return res.status(200).json({ success: true });
  }

  const { password } = req.body || {};

  if (password === adminPassword) {
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
}
