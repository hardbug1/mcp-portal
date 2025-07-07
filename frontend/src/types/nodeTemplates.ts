import type { NodeTemplate, NodeCategory } from './workflow';

export const NODE_TEMPLATES: NodeTemplate[] = [
  // Triggers
  {
    type: 'trigger.manual',
    name: '수동 트리거',
    description: '수동으로 워크플로우를 시작합니다',
    category: 'triggers',
    icon: '▶️',
    color: '#10B981',
    inputs: [],
    outputs: [
      {
        name: 'output',
        type: 'any',
        description: '트리거 출력',
      },
    ],
    configSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          title: '트리거 이름',
          default: '수동 트리거',
        },
      },
    },
  },
  {
    type: 'trigger.webhook',
    name: '웹훅 트리거',
    description: 'HTTP 요청을 받아 워크플로우를 시작합니다',
    category: 'triggers',
    icon: '🌐',
    color: '#3B82F6',
    inputs: [],
    outputs: [
      {
        name: 'body',
        type: 'object',
        description: '요청 본문',
      },
      {
        name: 'headers',
        type: 'object',
        description: '요청 헤더',
      },
    ],
    configSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          title: '웹훅 경로',
          default: '/webhook',
        },
        method: {
          type: 'string',
          title: 'HTTP 메서드',
          enum: ['GET', 'POST', 'PUT', 'DELETE'],
          default: 'POST',
        },
      },
    },
  },
  // Actions
  {
    type: 'action.http',
    name: 'HTTP 요청',
    description: 'HTTP API를 호출합니다',
    category: 'actions',
    icon: '🌍',
    color: '#8B5CF6',
    inputs: [
      {
        name: 'url',
        type: 'string',
        required: true,
        description: '요청 URL',
      },
      {
        name: 'method',
        type: 'string',
        description: 'HTTP 메서드',
      },
      {
        name: 'headers',
        type: 'object',
        description: '요청 헤더',
      },
      {
        name: 'body',
        type: 'object',
        description: '요청 본문',
      },
    ],
    outputs: [
      {
        name: 'response',
        type: 'object',
        description: '응답 데이터',
      },
      {
        name: 'status',
        type: 'number',
        description: '응답 상태 코드',
      },
    ],
    configSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          title: 'URL',
          placeholder: 'https://api.example.com/data',
        },
        method: {
          type: 'string',
          title: 'HTTP 메서드',
          enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
          default: 'GET',
        },
        timeout: {
          type: 'number',
          title: '타임아웃 (초)',
          default: 30,
        },
      },
    },
  },
  {
    type: 'action.email',
    name: '이메일 발송',
    description: '이메일을 발송합니다',
    category: 'actions',
    icon: '📧',
    color: '#EF4444',
    inputs: [
      {
        name: 'to',
        type: 'string',
        required: true,
        description: '수신자 이메일',
      },
      {
        name: 'subject',
        type: 'string',
        required: true,
        description: '제목',
      },
      {
        name: 'body',
        type: 'string',
        required: true,
        description: '내용',
      },
    ],
    outputs: [
      {
        name: 'messageId',
        type: 'string',
        description: '메시지 ID',
      },
      {
        name: 'success',
        type: 'boolean',
        description: '발송 성공 여부',
      },
    ],
    configSchema: {
      type: 'object',
      properties: {
        from: {
          type: 'string',
          title: '발신자 이메일',
          placeholder: 'sender@example.com',
        },
        provider: {
          type: 'string',
          title: '이메일 제공자',
          enum: ['smtp', 'sendgrid', 'mailgun'],
          default: 'smtp',
        },
      },
    },
  },
  // Logic
  {
    type: 'logic.condition',
    name: '조건 분기',
    description: '조건에 따라 흐름을 분기합니다',
    category: 'logic',
    icon: '🔀',
    color: '#F59E0B',
    inputs: [
      {
        name: 'input',
        type: 'any',
        required: true,
        description: '입력 데이터',
      },
    ],
    outputs: [
      {
        name: 'true',
        type: 'any',
        description: '조건이 참일 때',
      },
      {
        name: 'false',
        type: 'any',
        description: '조건이 거짓일 때',
      },
    ],
    configSchema: {
      type: 'object',
      properties: {
        condition: {
          type: 'string',
          title: '조건식',
          placeholder: 'input.value > 100',
        },
        operator: {
          type: 'string',
          title: '연산자',
          enum: ['>', '<', '>=', '<=', '==', '!=', 'contains'],
          default: '==',
        },
      },
    },
  },
  // Transform
  {
    type: 'transform.data',
    name: '데이터 변환',
    description: '데이터를 변환합니다',
    category: 'transform',
    icon: '🔄',
    color: '#06B6D4',
    inputs: [
      {
        name: 'input',
        type: 'any',
        required: true,
        description: '입력 데이터',
      },
    ],
    outputs: [
      {
        name: 'output',
        type: 'any',
        description: '변환된 데이터',
      },
    ],
    configSchema: {
      type: 'object',
      properties: {
        mapping: {
          type: 'object',
          title: '데이터 매핑',
          description: '입력 데이터를 출력 형태로 매핑',
        },
        format: {
          type: 'string',
          title: '출력 형식',
          enum: ['json', 'xml', 'csv', 'text'],
          default: 'json',
        },
      },
    },
  },
];

export const getNodeTemplatesByCategory = (category: NodeCategory): NodeTemplate[] => {
  return NODE_TEMPLATES.filter(template => template.category === category);
};

export const getAllNodeTemplates = (): NodeTemplate[] => {
  return NODE_TEMPLATES;
};

export const getNodeTemplateByType = (type: string): NodeTemplate | undefined => {
  return NODE_TEMPLATES.find(template => template.type === type);
}; 