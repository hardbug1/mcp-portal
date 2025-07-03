import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 시드 데이터 생성 시작...');

  // 기본 사용자 생성
  const user = await prisma.user.upsert({
    where: { email: 'admin@mcpportal.com' },
    update: {},
    create: {
      email: 'admin@mcpportal.com',
      name: 'MCP Portal Admin',
      emailVerified: true,
      timezone: 'Asia/Seoul',
      locale: 'ko',
    },
  });

  console.log('✅ 사용자 생성:', user.email);

  // 기본 워크스페이스 생성
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Workspace',
      description: 'MCP Portal 기본 워크스페이스',
      slug: 'default',
      ownerId: user.id,
      planType: 'pro',
      planLimits: {
        maxWorkflows: 100,
        maxExecutions: 10000,
        maxIntegrations: 50,
      },
      settings: {
        theme: 'light',
        notifications: true,
      },
    },
  });

  console.log('✅ 워크스페이스 생성:', workspace.name);

  // 워크스페이스 사용자 관계 생성
  await prisma.workspaceUser.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: user.id,
      role: 'owner',
      permissions: {
        canManageWorkspace: true,
        canManageUsers: true,
        canManageIntegrations: true,
        canCreateWorkflows: true,
        canDeployWorkflows: true,
      },
      joinedAt: new Date(),
    },
  });

  // 샘플 워크플로우 생성
  const workflow = await prisma.workflow.create({
    data: {
      name: '샘플 이메일 알림 워크플로우',
      description: 'Gmail을 통해 이메일 알림을 보내는 샘플 워크플로우',
      tags: ['email', 'notification', 'sample'],
      workspaceId: workspace.id,
      createdBy: user.id,
      status: 'published',
      definition: {
        nodes: [
          {
            id: 'trigger-1',
            type: 'webhook',
            position: { x: 100, y: 100 },
            data: {
              name: 'Webhook Trigger',
              method: 'POST',
              path: '/webhook',
            },
          },
          {
            id: 'action-1',
            type: 'gmail-send',
            position: { x: 300, y: 100 },
            data: {
              name: 'Send Email',
              to: '{{trigger.data.email}}',
              subject: '알림: {{trigger.data.subject}}',
              body: '{{trigger.data.message}}',
            },
          },
        ],
        connections: [
          {
            source: 'trigger-1',
            target: 'action-1',
            sourceHandle: 'output',
            targetHandle: 'input',
          },
        ],
      },
    },
  });

  console.log('✅ 샘플 워크플로우 생성:', workflow.name);

  // 샘플 통합 생성
  const integration = await prisma.integration.create({
    data: {
      workspaceId: workspace.id,
      createdBy: user.id,
      serviceName: 'Gmail',
      serviceType: 'email',
      credentials: {
        // 실제로는 암호화되어 저장됨
        type: 'oauth2',
        encrypted: true,
      },
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
      status: 'active',
    },
  });

  console.log('✅ 샘플 통합 생성:', integration.serviceName);

  console.log('🎉 시드 데이터 생성 완료!');
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 실패:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 