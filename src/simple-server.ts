import express from 'express';

const app = express();

app.use(express.json());

// 기본 라우트만 테스트
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// 간단한 라우트들만 추가
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test successful' });
});

// 매개변수가 있는 라우트 테스트
app.get('/api/workflows/:id', (req, res) => {
  res.json({ workflowId: req.params.id });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`🚀 Simple test server running on port ${PORT}`);
});

export default app;
