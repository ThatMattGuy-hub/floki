import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import logger from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import subtaskRoutes from './routes/subtask.routes';
import fileRoutes from './routes/file.routes';
import productRoutes from './routes/product.routes';
import projectRoutes from './routes/project.routes';
import userRoutes from './routes/user.routes';
import statusRoutes from './routes/status.routes';
import labelRoutes from './routes/label.routes';
import adminRoutes from './routes/admin.routes';
import agencyRoutes from './routes/agency.routes';
import teamRoutes from './routes/team.routes';
import reportRoutes from './routes/report.routes';
import report2Routes from './routes/report2.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/tasks`, taskRoutes);
app.use(`${API_PREFIX}/tasks`, subtaskRoutes);
app.use(`${API_PREFIX}/tasks`, fileRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/projects`, projectRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/statuses`, statusRoutes);
app.use(`${API_PREFIX}/labels`, labelRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/agencies`, agencyRoutes);
app.use(`${API_PREFIX}/teams`, teamRoutes);
app.use(`${API_PREFIX}/reports`, reportRoutes);
app.use(`${API_PREFIX}/reports2`, report2Routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`API base path: ${API_PREFIX}`);
});

export default app;

