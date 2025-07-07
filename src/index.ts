/**
 * MCP Portal - MCP 서버 생성 플랫폼
 * 진입점 파일
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import session from 'express-session';
import { config } from './config/env';
import './config/passport'; // Passport 설정 로드

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import workflowRoutes from './routes/workflow.routes';
import nodeRoutes from './routes/node.routes';
import connectionRoutes from './routes/connection.routes';
import credentialRoutes from './routes/credential.routes';
import mcpRoutes from './routes/mcp.routes';
import deploymentRoutes from './routes/deployment.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Session configuration for OAuth
app.use(session({
  secret: config.jwtSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.nodeEnv === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes - connection과 node 제외하고 테스트
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/workflows', connectionRoutes); // connection은 workflow의 하위 리소스
app.use('/api/nodes', nodeRoutes); // 노드 템플릿 관련
app.use('/api/credentials', credentialRoutes);
app.use('/api/mcp', mcpRoutes);
app.use('/api/deployment', deploymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation failed',
      details: err.message,
    });
    return;
  }
  
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
    });
    return;
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`🩺 Health check: http://localhost:${PORT}/health`);
});

export default app; 