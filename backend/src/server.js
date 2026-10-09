import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Route Imports
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Load environment variables (.env)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Enterprise Healthcheck Endpoint
 * @route   GET /api/v1/health
 * @desc    Returns server uptime, timestamp, and live database connection state
 */
app.get('/api/v1/health', (req, res) => {
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbState = dbStates[mongoose.connection.readyState] || 'unknown';
  const isHealthy = mongoose.connection.readyState === 1;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'SPORT X WEAR Backend API',
    uptime: `${process.uptime().toFixed(2)}s`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbState,
      readyState: mongoose.connection.readyState,
    },
  });
});

// Root welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to SPORT X WEAR API v1. Ready for high-performance requests.',
  });
});

// API Routes Mounting (v1 primary + legacy/shorthand aliases)
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/auth', authRoutes);

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// Centralized 404 Catch-All Handler
app.use(notFoundHandler);

// Centralized Enterprise Error Handler
app.use(errorHandler);

// Start Server and Establish Singleton Database Connection
const startServer = async () => {
  try {
    // Attempt database connection
    await connectDB().catch((err) => {
      console.warn(`[Warning] Database initial connection failed: ${err.message}. Server starting in offline mode.`);
    });

    const server = app.listen(PORT, () => {
      console.log(`[SPORT X WEAR] Enterprise API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    });

    return server;
  } catch (error) {
    console.error(`[Fatal Server Error] Failed to start application: ${error.message}`);
    process.exit(1);
  }
};

startServer();

export default app;
