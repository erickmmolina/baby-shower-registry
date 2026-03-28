import { cors } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  // Si no hay password configurado, permitir acceso (dev local)
  if (!ADMIN_PASSWORD) {
    return res.status(200).json({ success: true });
  }

  const { password } = req.body || {};

  if (password === ADMIN_PASSWORD) {
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
}
