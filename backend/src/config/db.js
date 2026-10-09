import mongoose from 'mongoose';
import dns from 'node:dns';

// Configure reliable DNS servers (Google & Cloudflare) to prevent querySrv ECONNREFUSED on local ISP/router setups
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (dnsErr) {
  console.warn(`[DNS Config] Unable to set custom DNS servers: ${dnsErr.message}`);
}

/**
 * Singleton Database Connection Handler for MongoDB Atlas
 * Features:
 * - Connection pooling (minPoolSize, maxPoolSize)
 * - Event-driven connection monitoring
 * - Graceful shutdown on termination signals (SIGINT, SIGTERM)
 */
class Database {
  constructor() {
    this.connection = null;
    this.isConnecting = false;
  }

  async connect() {
    // Return existing connection if already established or in progress
    if (this.connection && mongoose.connection.readyState === 1) {
      return this.connection;
    }

    if (this.isConnecting) {
      console.log('MongoDB connection already in progress...');
      return;
    }

    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/sportxwear';

    const options = {
      maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || '10', 10),
      minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || '2', 10),
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      autoIndex: process.env.NODE_ENV !== 'production', // Disable auto-indexing in production for performance
    };

    try {
      this.isConnecting = true;
      this.setupEventListeners();

      this.connection = await mongoose.connect(uri, options);
      console.log(`[Database] MongoDB Atlas Connected: ${this.connection.connection.host}/${this.connection.connection.name}`);
      this.setupGracefulShutdown();

      return this.connection;
    } catch (error) {
      console.error(`[Database Error] Connection failed: ${error.message}`);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  setupEventListeners() {
    // Avoid binding listeners multiple times
    if (mongoose.connection.listenerCount('error') > 0) return;

    mongoose.connection.on('connected', () => {
      console.log('[Database Event] Mongoose connected to database cluster.');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[Database Event] Mongoose connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database Event] Mongoose disconnected from database.');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[Database Event] Mongoose reconnected successfully.');
    });
  }

  setupGracefulShutdown() {
    const handleShutdown = async (signal) => {
      console.log(`\n[Database] Received ${signal}. Closing MongoDB connection gracefully...`);
      try {
        await mongoose.connection.close(false);
        console.log('[Database] MongoDB connection closed safely.');
        process.exit(0);
      } catch (err) {
        console.error(`[Database Error] Error during connection shutdown: ${err.message}`);
        process.exit(1);
      }
    };

    // Ensure listeners are registered only once
    if (process.listenerCount('SIGINT') === 0) {
      process.on('SIGINT', () => handleShutdown('SIGINT'));
    }
    if (process.listenerCount('SIGTERM') === 0) {
      process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    }
  }
}

// Export singleton instance
const databaseInstance = new Database();
export const connectDB = () => databaseInstance.connect();
export default databaseInstance;
