/**
 * MCP Portal - MCP 서버 생성 플랫폼
 * 진입점 파일
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { apiLimiter } from './middleware/rate-limit.middleware.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import workflowRoutes from './routes/workflow.routes.js';
import nodeRoutes from './routes/node.routes.js';
import connectionRoutes from './routes/connection.routes.js';
import credentialRoutes from './routes/credential.routes.js';
import mcpRoutes from './routes/mcp.routes.js';

const app = express();

// 보안 미들웨어
app.use(helmet());

// CORS 설정
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

// 기본 미들웨어
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API 라우트
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/nodes', nodeRoutes);
app.use('/api/workflows', connectionRoutes);
app.use('/api/mcp', mcpRoutes);

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({ error: '요청하신 리소스를 찾을 수 없습니다.' });
});

// 전역 에러 핸들러
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? '서버 오류가 발생했습니다.' 
      : err.message,
  });
});

// 테스트 환경이 아닐 때만 서버 시작
if (process.env.NODE_ENV !== 'test') {
  const PORT = config.port;
  
  app.listen(PORT, () => {
    console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔑 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`👤 User API: http://localhost:${PORT}/api/users`);
    console.log(`🔐 Credential API: http://localhost:${PORT}/api/credentials`);
    console.log(`📋 Workflow API: http://localhost:${PORT}/api/workflows`);
    console.log(`🔗 Node API: http://localhost:${PORT}/api/nodes`);
    console.log(`🔌 Connection API: http://localhost:${PORT}/api/workflows/:workflowId/connections`);
    console.log(`🤖 MCP API: http://localhost:${PORT}/api/mcp`);
  });
}

export default app; 