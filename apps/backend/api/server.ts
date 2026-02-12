import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';
import stablecoinRoutes from './routes/stablecoin';
import alertRoutes from './routes/alert';
import healthRoutes from './routes/health';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/stablecoins', stablecoinRoutes);
app.use('/api/alerts', alertRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Stablecoin Monitoring API',
    version: '1.0.0',
    status: 'running',
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('subscribe', (data) => {
    console.log('Client subscribed to:', data);
    socket.join(data.channel);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

export { app, httpServer, io };

// Start server
const PORT = process.env.API_PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
});
