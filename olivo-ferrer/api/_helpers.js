import Redis from 'ioredis';

// Prefix para Redis keys - evita colisiones si se comparte instancia
const PREFIX = 'olivo_';

let redis = null;

export function getRedis() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      lazyConnect: true
    });
  }
  return redis;
}

export function key(name) {
  return `${PREFIX}${name}`;
}

export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
