# MCP Portal - MCP 서버 생성 플랫폼

## 📋 개요

MCP Portal은 비개발자도 쉽게 MCP(Model Context Protocol) 서버를 생성할 수 있는 노코드 플랫폼입니다. 드래그 앤 드롭 인터페이스를 통해 워크플로우를 구성하고, 원클릭으로 MCP 서버를 배포할 수 있습니다.

## 🚀 주요 기능

- **시각적 워크플로우 빌더**: 드래그 앤 드롭으로 MCP 서버 생성
- **원클릭 서비스 통합**: 인기 있는 API 및 서비스 자동 연결
- **스마트 설정 마법사**: AI 기반 설정 추천 및 자동화
- **실시간 배포 및 관리**: 즉시 배포 및 모니터링 도구
- **협업 및 공유**: 팀 워크플로우 및 템플릿 공유

## 📚 문서

### 🔧 개발 문서
- [개발 체크리스트](docs/development-checklist.md) - 단계별 개발 진행 상황
- [개발 가이드](docs/development-guide.md) - 개발 환경 설정 및 가이드
- [시스템 설계](docs/system-design.md) - Clean Architecture 기반 설계
- [API 설계](docs/api-design.md) - REST API 명세
- [데이터베이스 설계](docs/database-design.md) - Prisma 스키마 설계

### 🎨 UI/UX 문서
- [UI 디자인 가이드](docs/ui-design.md) - 디자인 시스템 및 와이어프레임
- **[Tailwind CSS 가이드라인](docs/tailwind-guidelines.md)** - Context7 분석 기반 v4 설정 및 사용법

### 📋 기획 문서
- [요구사항](docs/requirements.md) - 프로젝트 기본 요구사항
- [요구사항 답변](docs/requirements-answers.md) - 상세 요구사항 분석
- [사용자 스토리](docs/user-stories.md) - 사용자 중심 기능 정의

## 🛠️ 기술 스택

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT + OAuth 2.0
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (최적화됨)
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library

### DevOps
- **Containerization**: Docker
- **Code Quality**: ESLint + Prettier
- **Git Hooks**: Husky
- **CI/CD**: GitHub Actions

## 🏃‍♂️ 빠른 시작

### 사전 요구사항
- Node.js 18 이상
- PostgreSQL 15 이상
- npm 또는 yarn

### 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/your-username/mcp-portal.git
cd mcp-portal
```

2. **의존성 설치**
```bash
# 백엔드 의존성
npm install

# 프론트엔드 의존성
cd frontend
npm install
cd ..
```

3. **환경 변수 설정**
```bash
cp .env.example .env
# .env 파일을 편집하여 데이터베이스 및 OAuth 설정
```

4. **데이터베이스 설정**
```bash
# PostgreSQL 데이터베이스 생성
createdb mcp_portal_dev

# 마이그레이션 실행
npx prisma migrate dev
```

5. **서버 실행**
```bash
# 백엔드 서버 (포트 3000)
npm run dev

# 새 터미널에서 프론트엔드 서버 (포트 5173)
cd frontend
npm run dev
```

6. **브라우저에서 접속**
- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:3000

## 📊 프로젝트 상태

### 완료된 기능 ✅
- **Phase 1**: 프로젝트 설정 및 초기 구성 (100%)
- **Phase 2.1**: 데이터베이스 설정 (100%)
- **Phase 2.2**: 인증 및 권한 시스템 (100%)
- **Phase 2.3**: 핵심 API 구현 (100%)
- **Phase 2.4**: MCP 프로토콜 구현 (100%)
- **Phase 3.1**: 기본 UI 구조 + Tailwind v4 최적화 (100%)
- **Phase 3.2**: 인증 관련 페이지 (95%)
- **Phase 3.3**: 대시보드 구현 (100%)
- **Phase 3.4**: 워크플로우 빌더 (100%)
- **Phase 3.5**: 자격증명 관리 UI (100%)

### 현재 작업 중 🔄
- **Phase 3.6**: MCP 서버 배포 UI
- **Phase 4**: 테스트 및 최적화

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원

문제가 있거나 질문이 있으시면 [Issues](https://github.com/your-username/mcp-portal/issues)를 통해 문의해주세요.

---

**MCP Portal** - AI 에이전트 도구 생성을 민주화하는 플랫폼 