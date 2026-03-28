export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send('Missing url param');

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BabyShowerBot/1.0)',
        'Accept': 'image/*,*/*',
        'Referer': new URL(url).origin
      }
    });

    if (!response.ok) return res.status(response.status).send('Image fetch failed');

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    res.send(buffer);
  } catch (e) {
    res.status(500).send('Proxy error');
  }
}
