import express from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { errorHandler } from './middlewares/error.middleware';
import authRouter from './modules/auth/auth.router';
import usersRouter from './modules/users/users.router';
import recordsRouter from './modules/records/records.router';
import dashboardRouter from './modules/dashboard/dashboard.router';

const app = express();

// --- Global Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// --- Swagger ---
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Dashboard API',
      version: '1.0.0',
      description: 'RESTful API for a finance dashboard with role-based access control, financial records management, and analytics.',
    },
    servers: [
      { url: `http://localhost:${env.PORT}`, description: 'Development server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/modules/**/*.router.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Base Routes ---
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Finance Dashboard API',
    docs: `http://localhost:${env.PORT}/api-docs`,
    health: `http://localhost:${env.PORT}/health`
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- API Routes ---
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/records', recordsRouter);
app.use('/api/dashboard', dashboardRouter);

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found` 
  });
});

// --- Global Error Handler ---
app.use(errorHandler);

export default app;
