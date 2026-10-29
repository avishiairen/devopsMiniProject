require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const releaseRoutes = require('./routes/releases');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ShipShape API is running',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    dbHost: mongoose.connection.host || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/releases', releaseRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// ── Database + server startup ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shipshape';

async function startServer() {
  // If an explicit Docker or remote URI is provided (e.g., mongodb://mongo:27017/shipshape),
  // connect directly and do not use the in-memory fallback.
  const isDockerOrRemote = process.env.MONGODB_URI &&
    !process.env.MONGODB_URI.includes('localhost') &&
    !process.env.MONGODB_URI.includes('127.0.0.1');

  if (isDockerOrRemote) {
    console.log(`⏳ Connecting to Docker/remote MongoDB at: ${MONGODB_URI}`);
    let attempts = 10;
    while (attempts > 0) {
      try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB:', MONGODB_URI);
        break;
      } catch (err) {
        attempts--;
        if (attempts === 0) {
          console.error('❌ Failed to connect to MongoDB container after multiple attempts:', err.message);
          process.exit(1);
        }
        console.log(`⏳ Waiting for MongoDB to become ready... (${attempts} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  } else {
    // Local development mode: try local MongoDB, fallback to embedded memory server
    let connected = false;
    try {
      console.log(`⏳ Attempting connection to local MongoDB at: ${MONGODB_URI}`);
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 2500 });
      console.log('✅ Connected to local MongoDB:', MONGODB_URI);
      connected = true;
    } catch (err) {
      console.log('ℹ️ Local MongoDB not detected. Falling back to embedded database...');
    }

    if (!connected) {
      try {
        console.log('🚀 Starting embedded local MongoDB for demonstration...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create({
          instance: { dbName: 'shipshape' }
        });
        const uri = mongod.getUri();
        await mongoose.connect(uri);
        console.log('✅ Connected to embedded MongoDB at:', uri);
      } catch (err) {
        console.error('❌ Could not start embedded MongoDB:', err.message);
        process.exit(1);
      }
    }
  }

  // Auto-seed demo data on first run
  const { seedIfEmpty } = require('./seed');
  await seedIfEmpty();

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚢 ShipShape API running at: http://localhost:${PORT}`);
    console.log(`   Health check:             http://localhost:${PORT}/api/health`);
    console.log(`   Dashboard API:            http://localhost:${PORT}/api/dashboard`);
    console.log(`======================================================\n`);
  });
}

startServer();
