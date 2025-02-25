import Fastify from 'fastify';
import listRoutes from './routes/list';
import salesRoutes from './routes/sales';
import inventoryRoutes from './routes/inventory';
import env from './env'

const fastify = Fastify({ logger: true });

// Register routes with optional prefixes
fastify.register(listRoutes, { prefix: '/api/v1/list' });
fastify.register(salesRoutes, { prefix: '/api/v1/sales' });
fastify.register(inventoryRoutes, { prefix: '/api/v1/inventory' });

// Start the server
const start = async () => {
  try {
    await fastify.listen({ 
      port: parseInt(env().PORT!! || '3001', 10),
      host: '0.0.0.0'  // This ensures the server listens on all network interfaces
    });
    console.log(`Server running on http://0.0.0.0:${env().PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();