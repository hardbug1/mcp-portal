# MCP 서버 생성 플랫폼 - API 설계 문서

## 📋 개요

본 문서는 MCP 서버 생성 플랫폼의 RESTful API 설계를 정의합니다.

### API 설계 원칙
- **RESTful**: HTTP 메서드와 상태 코드 표준 준수
- **일관성**: 일관된 네이밍 컨벤션과 응답 형식
- **보안**: JWT 기반 인증과 RBAC 권한 관리
- **성능**: 페이지네이션, 필터링, 캐싱 지원
- **확장성**: 버전 관리와 하위 호환성 보장

## 🔗 Base URL 및 버전 관리

```
Production: https://api.mcpportal.com/v1
Staging: https://api-staging.mcpportal.com/v1
Development: http://localhost:3000/api/v1
```

## 🔐 인증 및 권한

### JWT Authentication
```http
Authorization: Bearer <jwt_token>
```

### API Key Authentication (서버 간 통신)
```http
X-API-Key: <api_key>
```

## 📊 공통 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

## 🔑 Authentication API

### POST /auth/register
사용자 회원가입

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "emailVerified": false,
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ...",
      "expiresIn": 3600
    }
  }
}
```

### POST /auth/login
사용자 로그인

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### POST /auth/oauth/google
Google OAuth 로그인

**Request Body:**
```json
{
  "code": "oauth_authorization_code",
  "redirectUri": "https://app.mcpportal.com/auth/callback"
}
```

### POST /auth/refresh
토큰 갱신

**Request Body:**
```json
{
  "refreshToken": "eyJ..."
}
```

### POST /auth/logout
로그아웃

**Headers:** `Authorization: Bearer <token>`

## 👤 Users API

### GET /users/me
현재 사용자 정보 조회

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://cdn.mcpportal.com/avatars/user_123.jpg",
    "plan": "pro",
    "emailVerified": true,
    "mfaEnabled": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "lastLoginAt": "2024-01-20T14:22:00Z"
  }
}
```

### PUT /users/me
사용자 정보 수정

**Request Body:**
```json
{
  "name": "John Smith",
  "avatar": "base64_image_data"
}
```

### DELETE /users/me
계정 삭제

## 🏢 Workspaces API

### GET /workspaces
워크스페이스 목록 조회

**Query Parameters:**
- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지 크기 (기본값: 20, 최대: 100)
- `search`: 검색어

**Response (200):**
```json
{
  "success": true,
  "data": {
    "workspaces": [
      {
        "id": "ws_123",
        "name": "My Workspace",
        "description": "Personal automation workspace",
        "plan": "pro",
        "role": "owner",
        "memberCount": 5,
        "workflowCount": 12,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### POST /workspaces
워크스페이스 생성

**Request Body:**
```json
{
  "name": "New Workspace",
  "description": "Team automation workspace",
  "plan": "team"
}
```

### GET /workspaces/{workspaceId}
워크스페이스 상세 조회

### PUT /workspaces/{workspaceId}
워크스페이스 수정

### DELETE /workspaces/{workspaceId}
워크스페이스 삭제

## 🔄 Workflows API

### GET /workspaces/{workspaceId}/workflows
워크플로우 목록 조회

**Query Parameters:**
- `page`, `limit`: 페이지네이션
- `search`: 이름/설명 검색
- `status`: 상태 필터 (`draft`, `active`, `inactive`)
- `tags`: 태그 필터
- `sortBy`: 정렬 기준 (`name`, `createdAt`, `updatedAt`)
- `sortOrder`: 정렬 순서 (`asc`, `desc`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "workflows": [
      {
        "id": "wf_123",
        "name": "Gmail to Slack Notification",
        "description": "Send Slack notifications for important emails",
        "status": "active",
        "tags": ["email", "notification"],
        "nodeCount": 5,
        "connectionCount": 4,
        "lastExecutedAt": "2024-01-20T14:22:00Z",
        "successRate": 98.5,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-18T16:45:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "pages": 1
    }
  }
}
```

### POST /workspaces/{workspaceId}/workflows
워크플로우 생성

**Request Body:**
```json
{
  "name": "New Workflow",
  "description": "Workflow description",
  "definition": {
    "nodes": [
      {
        "id": "node_1",
        "type": "trigger",
        "subtype": "gmail",
        "position": { "x": 100, "y": 100 },
        "config": {
          "query": "is:unread important:true"
        }
      },
      {
        "id": "node_2",
        "type": "action",
        "subtype": "slack",
        "position": { "x": 300, "y": 100 },
        "config": {
          "channel": "#general",
          "message": "New important email: {{email.subject}}"
        }
      }
    ],
    "connections": [
      {
        "source": "node_1",
        "target": "node_2",
        "sourceHandle": "output",
        "targetHandle": "input"
      }
    ]
  },
  "tags": ["email", "notification"]
}
```

### GET /workspaces/{workspaceId}/workflows/{workflowId}
워크플로우 상세 조회

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "wf_123",
    "name": "Gmail to Slack Notification",
    "description": "Send Slack notifications for important emails",
    "status": "active",
    "definition": {
      "nodes": [...],
      "connections": [...]
    },
    "tags": ["email", "notification"],
    "statistics": {
      "totalExecutions": 1250,
      "successfulExecutions": 1231,
      "failedExecutions": 19,
      "successRate": 98.5,
      "averageExecutionTime": 2.3,
      "lastExecutedAt": "2024-01-20T14:22:00Z"
    },
    "deployment": {
      "id": "dep_456",
      "status": "deployed",
      "mcpServerUrl": "https://mcp-wf-123.mcpportal.com",
      "deployedAt": "2024-01-18T16:45:00Z"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-18T16:45:00Z"
  }
}
```

### PUT /workspaces/{workspaceId}/workflows/{workflowId}
워크플로우 수정

### DELETE /workspaces/{workspaceId}/workflows/{workflowId}
워크플로우 삭제

### POST /workspaces/{workspaceId}/workflows/{workflowId}/test
워크플로우 테스트 실행

**Request Body:**
```json
{
  "testData": {
    "email": {
      "subject": "Test Email",
      "body": "This is a test email",
      "from": "test@example.com"
    }
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "executionId": "exec_789",
    "status": "running",
    "testMode": true,
    "startedAt": "2024-01-20T15:30:00Z"
  }
}
```

## 🚀 Deployments API

### POST /workspaces/{workspaceId}/workflows/{workflowId}/deploy
워크플로우 배포

**Request Body:**
```json
{
  "environment": "production",
  "config": {
    "timeout": 30000,
    "retryAttempts": 3,
    "enableLogging": true
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "dep_456",
    "workflowId": "wf_123",
    "status": "deploying",
    "environment": "production",
    "mcpServerUrl": "https://mcp-wf-123.mcpportal.com",
    "config": {
      "timeout": 30000,
      "retryAttempts": 3,
      "enableLogging": true
    },
    "createdAt": "2024-01-20T15:30:00Z"
  }
}
```

### GET /workspaces/{workspaceId}/workflows/{workflowId}/deployments
배포 목록 조회

### GET /workspaces/{workspaceId}/workflows/{workflowId}/deployments/{deploymentId}
배포 상세 조회

### DELETE /workspaces/{workspaceId}/workflows/{workflowId}/deployments/{deploymentId}
배포 중단

## 📊 Executions API

### GET /workspaces/{workspaceId}/workflows/{workflowId}/executions
실행 이력 조회

**Query Parameters:**
- `page`, `limit`: 페이지네이션
- `status`: 상태 필터 (`running`, `success`, `failed`)
- `dateFrom`, `dateTo`: 날짜 범위
- `sortBy`: 정렬 기준 (`startedAt`, `duration`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "executions": [
      {
        "id": "exec_789",
        "workflowId": "wf_123",
        "status": "success",
        "trigger": "webhook",
        "duration": 2340,
        "inputData": { ... },
        "outputData": { ... },
        "nodeExecutions": [
          {
            "nodeId": "node_1",
            "status": "success",
            "duration": 1200,
            "output": { ... }
          }
        ],
        "startedAt": "2024-01-20T14:22:00Z",
        "completedAt": "2024-01-20T14:22:02Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1250,
      "pages": 63
    }
  }
}
```

### GET /workspaces/{workspaceId}/workflows/{workflowId}/executions/{executionId}
실행 상세 조회

### POST /workspaces/{workspaceId}/workflows/{workflowId}/executions/{executionId}/cancel
실행 취소

## 🔌 Integrations API

### GET /integrations
사용 가능한 통합 서비스 목록

**Response (200):**
```json
{
  "success": true,
  "data": {
    "integrations": [
      {
        "id": "google",
        "name": "Google Workspace",
        "description": "Gmail, Sheets, Calendar, Drive integration",
        "icon": "https://cdn.mcpportal.com/icons/google.svg",
        "category": "productivity",
        "authType": "oauth2",
        "services": [
          {
            "id": "gmail",
            "name": "Gmail",
            "description": "Email automation",
            "triggers": ["new_email", "email_replied"],
            "actions": ["send_email", "mark_read"]
          }
        ],
        "isPopular": true,
        "isNew": false
      }
    ]
  }
}
```

### GET /workspaces/{workspaceId}/integrations
워크스페이스 연동 서비스 목록

### POST /workspaces/{workspaceId}/integrations/{integrationId}/connect
서비스 연동

**Request Body:**
```json
{
  "authCode": "oauth_authorization_code",
  "redirectUri": "https://app.mcpportal.com/integrations/callback",
  "scopes": ["gmail.readonly", "sheets.readwrite"]
}
```

### DELETE /workspaces/{workspaceId}/integrations/{integrationId}/disconnect
서비스 연동 해제

### GET /workspaces/{workspaceId}/integrations/{integrationId}/test
연동 상태 테스트

## 📈 Analytics API

### GET /workspaces/{workspaceId}/analytics/overview
워크스페이스 분석 개요

**Query Parameters:**
- `period`: 기간 (`7d`, `30d`, `90d`, `1y`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "metrics": {
      "totalExecutions": 15420,
      "successfulExecutions": 15187,
      "failedExecutions": 233,
      "successRate": 98.5,
      "averageExecutionTime": 2.8,
      "activeWorkflows": 12,
      "totalWorkflows": 15
    },
    "trends": {
      "executionsGrowth": 12.5,
      "successRateChange": 0.3,
      "performanceChange": -0.2
    },
    "topWorkflows": [
      {
        "id": "wf_123",
        "name": "Gmail to Slack",
        "executions": 5420,
        "successRate": 99.2
      }
    ]
  }
}
```

### GET /workspaces/{workspaceId}/analytics/executions
실행 통계

### GET /workspaces/{workspaceId}/analytics/performance
성능 통계

## 🛠️ Node Types API

### GET /node-types
사용 가능한 노드 타입 목록

**Response (200):**
```json
{
  "success": true,
  "data": {
    "nodeTypes": [
      {
        "id": "gmail_trigger",
        "category": "trigger",
        "integration": "google",
        "service": "gmail",
        "name": "Gmail Trigger",
        "description": "Triggered when new emails are received",
        "icon": "https://cdn.mcpportal.com/icons/gmail.svg",
        "configSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "title": "Search Query",
              "description": "Gmail search query"
            }
          },
          "required": ["query"]
        },
        "outputSchema": {
          "type": "object",
          "properties": {
            "email": {
              "type": "object",
              "properties": {
                "subject": { "type": "string" },
                "body": { "type": "string" },
                "from": { "type": "string" }
              }
            }
          }
        }
      }
    ]
  }
}
```

## ⚠️ 에러 코드

### 인증 관련 (401, 403)
- `AUTH_TOKEN_MISSING`: 인증 토큰 누락
- `AUTH_TOKEN_INVALID`: 유효하지 않은 토큰
- `AUTH_TOKEN_EXPIRED`: 만료된 토큰
- `AUTH_INSUFFICIENT_PERMISSIONS`: 권한 부족

### 요청 관련 (400)
- `VALIDATION_ERROR`: 입력 데이터 검증 실패
- `INVALID_REQUEST_FORMAT`: 잘못된 요청 형식
- `MISSING_REQUIRED_FIELD`: 필수 필드 누락

### 리소스 관련 (404, 409)
- `RESOURCE_NOT_FOUND`: 리소스를 찾을 수 없음
- `RESOURCE_ALREADY_EXISTS`: 리소스가 이미 존재
- `RESOURCE_CONFLICT`: 리소스 충돌

### 서버 관련 (500, 503)
- `INTERNAL_SERVER_ERROR`: 내부 서버 오류
- `SERVICE_UNAVAILABLE`: 서비스 일시 중단
- `DATABASE_ERROR`: 데이터베이스 오류

## 📊 Rate Limiting

### 제한 정책
```
Free Plan:
- 60 requests/minute per user
- 1,000 requests/hour per user

Pro Plan:
- 600 requests/minute per user
- 10,000 requests/hour per user

Enterprise Plan:
- Custom limits based on agreement
```

### Rate Limit Headers
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642680000
X-RateLimit-Retry-After: 60
```

## 🔍 API 문서화

### OpenAPI Specification
API 문서는 OpenAPI 3.0 형식으로 제공되며, Swagger UI를 통해 인터랙티브하게 탐색할 수 있습니다.

**문서 URL:**
- Production: `https://api.mcpportal.com/docs`
- Staging: `https://api-staging.mcpportal.com/docs`

### SDK 지원
다음 언어로 공식 SDK를 제공합니다:
- JavaScript/TypeScript
- Python
- Go
- Java

이 API 설계는 RESTful 원칙을 준수하며, 확장성과 사용성을 고려하여 설계되었습니다. 