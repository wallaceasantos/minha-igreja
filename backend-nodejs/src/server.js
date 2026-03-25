/**
 * API Igreja Connect - Node.js + Express
 * Backend moderno e gratuito para Render/Railway
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import churchRoutes from './routes/church.js';
import contactRoutes from './contact.js';
import authRoutes from './auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Igreja Connect API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// Rotas
app.use('/api/church', churchRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});

export default app;
