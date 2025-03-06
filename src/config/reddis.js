// reddis.js

import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config({path:'../.env'});

const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    },
    password: process.env.REDIS_PASSWORD,
});

redisClient.on('error', (err) => console.error('Redis Error:', err));

const connectRedis = async () => {
    await redisClient.connect();
    console.log('Redis Connected');
};

connectRedis();

export {redisClient};