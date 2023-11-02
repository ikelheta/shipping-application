import { createClient } from 'redis';

const redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 10569,
  },
});
redisClient.connect();

redisClient.on('error', (err) => {
  console.log('Redis error:', err);
});

redisClient.on('connect', (err) => {
  console.log('Redis connected successfully:');
});

export default redisClient;
