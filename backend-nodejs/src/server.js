/**
 * API MinhaIgreja - Node.js + Express
 * Backend moderno e gratuito para Render/Railway
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { accessLogger } from './middleware/accessLogger.js';
import { fileURLToPath } from 'url';
import path from 'path';

// Configurar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
import adminReviewsRoutes from './routes/admin-reviews.js';
import churchRoutes from './routes/church.js';
import memberLiveRoutes from './routes/member-live.js';
import contactRoutes from './routes/contact.js';
import authRoutes from './routes/auth.js';
import testDbRoutes from './routes/test-db.js';
import configRoutes from './routes/config.js';
import statsRoutes from './routes/stats.js';
import adminRoutes from './routes/admin.js';
import delinquencyRoutes from './routes/delinquency.js';
import adminChurchesRoutes from './routes/admin-churches.js';
import adminUsersRoutes from './routes/admin-users.js';
import adminBillingRoutes from './routes/admin-billing.js';
import adminAuditRoutes from './routes/admin-audit.js';
import adminPlanSettingsRoutes from './routes/admin-plan-settings.js';
import adminSettingsRoutes from './routes/admin-settings.js';
import adminTicketsRoutes from './routes/admin-tickets.js';
import adminAnnouncementsRoutes from './routes/admin-announcements.js';
import adminTemplatesRoutes from './routes/admin-templates.js';
import adminReportsRoutes from './routes/admin-reports.js';
import adminSecurityRoutes from './routes/admin-security.js';
import membersRoutes from './routes/members.js';
import eventsRoutes from './routes/events.js';
import pedidosRoutes from './routes/pedidos.js';
import servicesRoutes from './routes/services.js';
import ministriesRoutes from './routes/ministries.js';
import ticketsRoutes from './routes/tickets.js';
import uploadRoutes from './routes/upload.js';
import churchGalleryRoutes from './routes/church-gallery.js';
import liveStreamsRoutes from './routes/live-streams.js';
import liveNotificationsRoutes from './routes/live-notifications.js';
import churchVersesRoutes from './routes/church-verses.js';
import { startScheduler } from './schedulers/announcement-scheduler.js';
import { startScheduler as startPrayerReminderScheduler } from './schedulers/prayer-reminder-scheduler.js';
import { startBillingScheduler } from './schedulers/billing-scheduler.js';
import { startTrialScheduler } from './schedulers/trial-scheduler.js';
import startDomainScheduler from './schedulers/domain-scheduler.js';
import adminUpgradeRoutes from './routes/admin-upgrade.js';
import adminDomainRoutes from './routes/admin-domain.js';
import superAdminDomainsRoutes from './routes/super-admin-domains.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger de acessos (antes das rotas)
app.use(accessLogger);

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MinhaIgreja API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// Rotas
app.use('/api/test-db', testDbRoutes);
app.use('/api/church', churchRoutes);
app.use('/api/member/live', memberLiveRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/church', configRoutes);
app.use('/api/church', statsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', delinquencyRoutes);
app.use('/api/admin', adminChurchesRoutes);
app.use('/api/admin', adminUsersRoutes);
app.use('/api/admin/billing', adminBillingRoutes); // Billing routes
app.use('/api/admin', adminAuditRoutes); // Audit logs routes
app.use('/api/admin', adminPlanSettingsRoutes); // Plan settings routes
app.use('/api/admin', adminSettingsRoutes); // System settings routes
app.use('/api/admin', adminTicketsRoutes); // Support tickets routes
app.use('/api/admin', adminAnnouncementsRoutes); // Announcements routes
app.use('/api/admin', adminTemplatesRoutes); // Templates routes
app.use('/api/admin', adminReportsRoutes); // Reports routes
app.use('/api/admin', adminSecurityRoutes); // Security routes
app.use('/api/admin/upgrade', adminUpgradeRoutes); // Upgrade routes
app.use('/api/admin/domain', adminDomainRoutes); // Domain routes
app.use('/api/super-admin', superAdminDomainsRoutes); // Super Admin Domain routes
app.use('/api/members', membersRoutes); // Members routes
app.use('/api/events', eventsRoutes); // Events routes
app.use('/api/pedidos', pedidosRoutes); // Pedidos de Oração routes
app.use('/api/services', servicesRoutes); // Cultos Fixos routes
app.use('/api/ministries', ministriesRoutes); // Ministérios routes
app.use('/api/tickets', ticketsRoutes); // Tickets de Suporte routes
app.use('/api/gallery', churchGalleryRoutes); // Church Gallery routes
app.use('/api/church', liveStreamsRoutes);
app.use('/api/live', liveNotificationsRoutes); // Live Streams routes
app.use('/api/church', churchVersesRoutes); // Church Verses routes
app.use('/api/admin', adminReviewsRoutes); // Rotas de avaliações (Admin)
app.use('/api', adminReviewsRoutes);       // Rotas públicas de avaliações

// Servir arquivos estáticos (uploads) - DEVE VIR ANTES das rotas
app.use('/api/uploads/membros', express.static(path.join(rootDir, 'uploads/membros')));
app.use('/api/uploads/logos', express.static(path.join(rootDir, 'uploads/logos')));
app.use('/api/uploads/gallery', express.static(path.join(rootDir, 'uploads/gallery')));

app.use('/api/uploads', uploadRoutes); // Upload de fotos

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
import './schedulers/live-status-scheduler.js';
import { setupWebSocket } from './websocket/live-chat.js';

import http from 'http';
const httpServer = http.createServer(app);

// Configurar WebSocket
setupWebSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🔌 WebSocket ready for live chat`);

  // Iniciar schedulers
  startScheduler(); // Comunicados
  startPrayerReminderScheduler(); // Lembretes de Pedidos de Oração
  startBillingScheduler(); // Cobrança e Inadimplência
  startTrialScheduler(); // Trial de 30 Dias
  startDomainScheduler(); // Verificação de DNS de Domínios
});

export default app;
