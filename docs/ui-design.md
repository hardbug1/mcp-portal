# MCP 서버 생성 플랫폼 - UI 디자인 가이드

## 📋 개요

본 문서는 MCP 서버 생성 플랫폼의 UI/UX 디자인 가이드와 와이어프레임을 정의합니다. 사용자 친화적이고 직관적인 인터페이스를 통해 비개발자도 쉽게 MCP 서버를 생성할 수 있도록 설계되었습니다.

## 🎨 디자인 시스템

### 컬러 팔레트

```css
:root {
  /* Primary Colors - Blue */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-900: #1e3a8a;

  /* Secondary Colors - Gray */
  --color-secondary-50: #f8fafc;
  --color-secondary-100: #f1f5f9;
  --color-secondary-500: #64748b;
  --color-secondary-600: #475569;
  --color-secondary-900: #0f172a;

  /* Semantic Colors */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #06b6d4;

  /* Neutral Colors */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
}
```

### 타이포그래피

```css
/* Headings */
.text-h1 { font-size: 2.25rem; font-weight: 700; line-height: 1.2; }
.text-h2 { font-size: 1.875rem; font-weight: 600; line-height: 1.3; }
.text-h3 { font-size: 1.5rem; font-weight: 600; line-height: 1.4; }
.text-h4 { font-size: 1.25rem; font-weight: 500; line-height: 1.4; }

/* Body Text */
.text-body-lg { font-size: 1.125rem; line-height: 1.6; }
.text-body { font-size: 1rem; line-height: 1.6; }
.text-body-sm { font-size: 0.875rem; line-height: 1.5; }
.text-caption { font-size: 0.75rem; line-height: 1.4; }
```

### 간격 시스템

```css
/* Spacing Scale (4px base) */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
```

## 🖼️ 와이어프레임

### 1. 대시보드 페이지

<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1200" height="800" fill="#f8fafc"/>
  
  <!-- Header -->
  <rect x="0" y="0" width="1200" height="64" fill="#ffffff" stroke="#e5e7eb"/>
  <text x="24" y="40" font-family="Arial" font-size="18" font-weight="bold" fill="#1f2937">MCP Portal</text>
  <rect x="1000" y="16" width="32" height="32" rx="16" fill="#e5e7eb"/>
  <text x="1050" y="36" font-family="Arial" font-size="14" fill="#374151">John Doe</text>
  
  <!-- Sidebar -->
  <rect x="0" y="64" width="240" height="736" fill="#ffffff" stroke="#e5e7eb"/>
  <text x="24" y="100" font-family="Arial" font-size="14" font-weight="600" fill="#6b7280">NAVIGATION</text>
  
  <!-- Sidebar Menu Items -->
  <rect x="16" y="120" width="208" height="40" rx="8" fill="#3b82f6"/>
  <text x="32" y="144" font-family="Arial" font-size="14" fill="#ffffff">📊 Dashboard</text>
  
  <rect x="16" y="168" width="208" height="40" rx="8" fill="transparent"/>
  <text x="32" y="192" font-family="Arial" font-size="14" fill="#374151">🔄 Workflows</text>
  
  <rect x="16" y="216" width="208" height="40" rx="8" fill="transparent"/>
  <text x="32" y="240" font-family="Arial" font-size="14" fill="#374151">🚀 Deployments</text>
  
  <rect x="16" y="264" width="208" height="40" rx="8" fill="transparent"/>
  <text x="32" y="288" font-family="Arial" font-size="14" fill="#374151">🔌 Integrations</text>
  
  <rect x="16" y="312" width="208" height="40" rx="8" fill="transparent"/>
  <text x="32" y="336" font-family="Arial" font-size="14" fill="#374151">📈 Analytics</text>
  
  <!-- Main Content Area -->
  <rect x="240" y="64" width="960" height="736" fill="#f8fafc"/>
  
  <!-- Page Header -->
  <text x="264" y="104" font-family="Arial" font-size="24" font-weight="bold" fill="#1f2937">Dashboard</text>
  <text x="264" y="128" font-family="Arial" font-size="14" fill="#6b7280">Welcome back! Here's what's happening with your workflows.</text>
  
  <!-- Stats Cards -->
  <rect x="264" y="152" width="220" height="120" rx="8" fill="#ffffff" stroke="#e5e7eb"/>
  <text x="280" y="180" font-family="Arial" font-size="14" font-weight="600" fill="#6b7280">Total Workflows</text>
  <text x="280" y="220" font-family="Arial" font-size="32" font-weight="bold" fill="#1f2937">24</text>
  <text x="280" y="248" font-family="Arial" font-size="12" fill="#10b981">+12% from last month</text>
  
  <rect x="504" y="152" width="220" height="120" rx="8" fill="#ffffff" stroke="#e5e7eb"/>
  <text x="520" y="180" font-family="Arial" font-size="14" font-weight="600" fill="#6b7280">Active Deployments</text>
  <text x="520" y="220" font-family="Arial" font-size="32" font-weight="bold" fill="#1f2937">18</text>
  <text x="520" y="248" font-family="Arial" font-size="12" fill="#10b981">+8% from last month</text>
  
  <rect x="744" y="152" width="220" height="120" rx="8" fill="#ffffff" stroke="#e5e7eb"/>
  <text x="760" y="180" font-family="Arial" font-size="14" font-weight="600" fill="#6b7280">Success Rate</text>
  <text x="760" y="220" font-family="Arial" font-size="32" font-weight="bold" fill="#1f2937">98.5%</text>
  <text x="760" y="248" font-family="Arial" font-size="12" fill="#10b981">+0.3% from last month</text>
  
  <rect x="984" y="152" width="200" height="120" rx="8" fill="#ffffff" stroke="#e5e7eb"/>
  <text x="1000" y="180" font-family="Arial" font-size="14" font-weight="600" fill="#6b7280">Executions Today</text>
  <text x="1000" y="220" font-family="Arial" font-size="32" font-weight="bold" fill="#1f2937">1,247</text>
  <text x="1000" y="248" font-family="Arial" font-size="12" fill="#10b981">+15% from yesterday</text>
  
  <!-- Recent Workflows Section -->
  <rect x="264" y="296" width="920" height="480" rx="8" fill="#ffffff" stroke="#e5e7eb"/>
  <text x="280" y="324" font-family="Arial" font-size="18" font-weight="600" fill="#1f2937">Recent Workflows</text>
  <rect x="1080" y="304" width="88" height="32" rx="6" fill="#3b82f6"/>
  <text x="1100" y="324" font-family="Arial" font-size="12" fill="#ffffff">New Workflow</text>
  
  <!-- Table Header -->
  <rect x="280" y="352" width="888" height="40" fill="#f8fafc" stroke="#e5e7eb"/>
  <text x="296" y="376" font-family="Arial" font-size="12" font-weight="600" fill="#6b7280">NAME</text>
  <text x="496" y="376" font-family="Arial" font-size="12" font-weight="600" fill="#6b7280">STATUS</text>
  <text x="596" y="376" font-family="Arial" font-size="12" font-weight="600" fill="#6b7280">LAST RUN</text>
  <text x="796" y="376" font-family="Arial" font-size="12" font-weight="600" fill="#6b7280">SUCCESS RATE</text>
  <text x="1096" y="376" font-family="Arial" font-size="12" font-weight="600" fill="#6b7280">ACTIONS</text>
  
  <!-- Table Rows -->
  <rect x="280" y="392" width="888" height="48" fill="#ffffff" stroke="#e5e7eb"/>
  <text x="296" y="420" font-family="Arial" font-size="14" fill="#1f2937">Gmail to Slack Notification</text>
  <rect x="496" y="404" width="60" height="20" rx="10" fill="#dcfce7"/>
  <text x="516" y="416" font-family="Arial" font-size="10" fill="#166534">Active</text>
  <text x="596" y="420" font-family="Arial" font-size="14" fill="#6b7280">2 hours ago</text>
  <text x="796" y="420" font-family="Arial" font-size="14" fill="#6b7280">98.2%</text>
  <text x="1096" y="420" font-family="Arial" font-size="12" fill="#3b82f6">Edit</text>
  
  <rect x="280" y="440" width="888" height="48" fill="#ffffff" stroke="#e5e7eb"/>
  <text x="296" y="468" font-family="Arial" font-size="14" fill="#1f2937">GitHub Issues to Notion</text>
  <rect x="496" y="452" width="60" height="20" rx="10" fill="#dcfce7"/>
  <text x="516" y="464" font-family="Arial" font-size="10" fill="#166534">Active</text>
  <text x="596" y="468" font-family="Arial" font-size="14" fill="#6b7280">5 hours ago</text>
  <text x="796" y="468" font-family="Arial" font-size="14" fill="#6b7280">95.8%</text>
  <text x="1096" y="468" font-family="Arial" font-size="12" fill="#3b82f6">Edit</text>
  
  <rect x="280" y="488" width="888" height="48" fill="#ffffff" stroke="#e5e7eb"/>
  <text x="296" y="516" font-family="Arial" font-size="14" fill="#1f2937">Calendar Event Reminder</text>
  <rect x="496" y="500" width="60" height="20" rx="10" fill="#fef3c7"/>
  <text x="516" y="512" font-family="Arial" font-size="10" fill="#92400e">Draft</text>
  <text x="596" y="516" font-family="Arial" font-size="14" fill="#6b7280">Never</text>
  <text x="796" y="516" font-family="Arial" font-size="14" fill="#6b7280">-</text>
  <text x="1096" y="516" font-family="Arial" font-size="12" fill="#3b82f6">Edit</text>
</svg>

### 2. 워크플로우 빌더 페이지

<svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1200" height="800" fill="#f8fafc"/>
  
  <!-- Header -->
  <rect x="0" y="0" width="1200" height="64" fill="#ffffff" stroke="#e5e7eb"/>
  <text x="24" y="40" font-family="Arial" font-size="18" font-weight="bold" fill="#1f2937">MCP Portal</text>
  <text x="200" y="40" font-family="Arial" font-size="14" fill="#6b7280">/ Workflows / New Workflow</text>
  
  <!-- Toolbar -->
  <rect x="0" y="64" width="1200" height="56" fill="#ffffff" stroke="#e5e7eb"/>
  <rect x="24" y="76" width="80" height="32" rx="6" fill="#3b82f6"/>
  <text x="52" y="96" font-family="Arial" font-size="12" fill="#ffffff">Save</text>
  
  <rect x="120" y="76" width="80" height="32" rx="6" fill="transparent" stroke="#d1d5db"/>
  <text x="148" y="96" font-family="Arial" font-size="12" fill="#374151">Test</text>
  
  <rect x="216" y="76" width="80" height="32" rx="6" fill="transparent" stroke="#d1d5db"/>
  <text x="240" y="96" font-family="Arial" font-size="12" fill="#374151">Deploy</text>
  
  <text x="350" y="96" font-family="Arial" font-size="14" font-weight="600" fill="#1f2937">Untitled Workflow</text>
  
  <!-- Node Palette -->
  <rect x="0" y="120" width="280" height="680" fill="#ffffff" stroke="#e5e7eb"/>
  <text x="24" y="152" font-family="Arial" font-size="16" font-weight="600" fill="#1f2937">Nodes</text>
  
  <!-- Triggers Section -->
  <text x="24" y="184" font-family="Arial" font-size="12" font-weight="600" fill="#6b7280">TRIGGERS</text>
  
  <rect x="24" y="200" width="232" height="60" rx="8" fill="#f8fafc" stroke="#e5e7eb"/>
  <rect x="32" y="208" width="44" height="44" rx="8" fill="#3b82f6"/>
  <text x="48" y="236" font-family="Arial" font-size="16" fill="#ffffff">📧</text>
  <text x="88" y="224" font-family="Arial" font-size="14" font-weight="500" fill="#1f2937">Gmail Trigger</text>
  <text x="88" y="240" font-family="Arial" font-size="12" fill="#6b7280">New email received</text>
  
  <rect x="24" y="268" width="232" height="60" rx="8" fill="#f8fafc" stroke="#e5e7eb"/>
  <rect x="32" y="276" width="44" height="44" rx="8" fill="#10b981"/>
  <text x="48" y="304" font-family="Arial" font-size="16" fill="#ffffff">🕒</text>
  <text x="88" y="292" font-family="Arial" font-size="14" font-weight="500" fill="#1f2937">Schedule Trigger</text>
  <text x="88" y="308" font-family="Arial" font-size="12" fill="#6b7280">Run on schedule</text>
  
  <!-- Actions Section -->
  <text x="24" y="356" font-family="Arial" font-size="12" font-weight="600" fill="#6b7280">ACTIONS</text>
  
  <rect x="24" y="372" width="232" height="60" rx="8" fill="#f8fafc" stroke="#e5e7eb"/>
  <rect x="32" y="380" width="44" height="44" rx="8" fill="#f59e0b"/>
  <text x="48" y="408" font-family="Arial" font-size="16" fill="#ffffff">💬</text>
  <text x="88" y="396" font-family="Arial" font-size="14" font-weight="500" fill="#1f2937">Slack Message</text>
  <text x="88" y="412" font-family="Arial" font-size="12" fill="#6b7280">Send message to channel</text>
  
  <rect x="24" y="440" width="232" height="60" rx="8" fill="#f8fafc" stroke="#e5e7eb"/>
  <rect x="32" y="448" width="44" height="44" rx="8" fill="#8b5cf6"/>
  <text x="48" y="476" font-family="Arial" font-size="16" fill="#ffffff">📊</text>
  <text x="88" y="464" font-family="Arial" font-size="14" font-weight="500" fill="#1f2937">Google Sheets</text>
  <text x="88" y="480" font-family="Arial" font-size="12" fill="#6b7280">Add row to spreadsheet</text>
  
  <!-- Canvas Area -->
  <rect x="280" y="120" width="920" height="680" fill="#fafafa" stroke="#e5e7eb"/>
  
  <!-- Canvas Grid (subtle) -->
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" stroke-width="1"/>
    </pattern>
  </defs>
  <rect x="280" y="120" width="920" height="680" fill="url(#grid)"/>
  
  <!-- Sample Nodes on Canvas -->
  <!-- Gmail Trigger Node -->
  <rect x="400" y="200" width="160" height="80" rx="12" fill="#ffffff" stroke="#3b82f6" stroke-width="2"/>
  <rect x="408" y="208" width="32" height="32" rx="6" fill="#3b82f6"/>
  <text x="420" y="228" font-family="Arial" font-size="12" fill="#ffffff">📧</text>
  <text x="448" y="228" font-family="Arial" font-size="14" font-weight="500" fill="#1f2937">Gmail Trigger</text>
  <text x="448" y="244" font-family="Arial" font-size="12" fill="#6b7280">New email received</text>
  <circle cx="560" cy="240" r="6" fill="#3b82f6"/>
  
  <!-- Connection Line -->
  <path d="M 566 240 Q 620 240 620 300 Q 620 360 674 360" stroke="#3b82f6" stroke-width="2" fill="none"/>
  
  <!-- Slack Action Node -->
  <rect x="680" y="320" width="160" height="80" rx="12" fill="#ffffff" stroke="#f59e0b" stroke-width="2"/>
  <circle cx="680" cy="360" r="6" fill="#f59e0b"/>
  <rect x="688" y="328" width="32" height="32" rx="6" fill="#f59e0b"/>
  <text x="700" y="348" font-family="Arial" font-size="12" fill="#ffffff">💬</text>
  <text x="728" y="348" font-family="Arial" font-size="14" font-weight="500" fill="#1f2937">Slack Message</text>
  <text x="728" y="364" font-family="Arial" font-size="12" fill="#6b7280">Send to #general</text>
  
  <!-- Properties Panel -->
  <rect x="1000" y="120" width="200" height="680" fill="#ffffff" stroke="#e5e7eb"/>
  <text x="1016" y="152" font-family="Arial" font-size="16" font-weight="600" fill="#1f2937">Properties</text>
  
  <text x="1016" y="184" font-family="Arial" font-size="12" font-weight="600" fill="#6b7280">NODE SETTINGS</text>
  
  <text x="1016" y="208" font-family="Arial" font-size="12" fill="#374151">Node Name</text>
  <rect x="1016" y="216" width="168" height="32" rx="6" fill="#f9fafb" stroke="#d1d5db"/>
  <text x="1024" y="236" font-family="Arial" font-size="12" fill="#6b7280">Gmail Trigger</text>
  
  <text x="1016" y="268" font-family="Arial" font-size="12" fill="#374151">Search Query</text>
  <rect x="1016" y="276" width="168" height="32" rx="6" fill="#f9fafb" stroke="#d1d5db"/>
  <text x="1024" y="296" font-family="Arial" font-size="12" fill="#6b7280">is:unread important:true</text>
  
  <text x="1016" y="328" font-family="Arial" font-size="12" fill="#374151">Poll Interval</text>
  <rect x="1016" y="336" width="168" height="32" rx="6" fill="#f9fafb" stroke="#d1d5db"/>
  <text x="1024" y="356" font-family="Arial" font-size="12" fill="#6b7280">5 minutes</text>
</svg>

### 3. 모바일 반응형 디자인

<svg width="375" height="812" viewBox="0 0 375 812" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="375" height="812" fill="#f8fafc"/>
  
  <!-- Mobile Header -->
  <rect x="0" y="0" width="375" height="88" fill="#ffffff" stroke="#e5e7eb"/>
  <text x="24" y="60" font-family="Arial" font-size="18" font-weight="bold" fill="#1f2937">MCP Portal</text>
  <rect x="315" y="44" width="32" height="32" rx="16" fill="#e5e7eb"/>
  
  <!-- Navigation Tabs -->
  <rect x="0" y="88" width="375" height="56" fill="#ffffff" stroke="#e5e7eb"/>
  
  <rect x="24" y="104" width="80" height="24" rx="12" fill="#3b82f6"/>
  <text x="56" y="120" font-family="Arial" font-size="12" fill="#ffffff" text-anchor="middle">Dashboard</text>
  
  <rect x="120" y="104" width="80" height="24" rx="12" fill="transparent"/>
  <text x="160" y="120" font-family="Arial" font-size="12" fill="#6b7280" text-anchor="middle">Workflows</text>
  
  <rect x="216" y="104" width="80" height="24" rx="12" fill="transparent"/>
  <text x="256" y="120" font-family="Arial" font-size="12" fill="#6b7280" text-anchor="middle">Deploy</text>
  
  <!-- Stats Cards (Mobile) -->
  <rect x="24" y="168" width="327" height="80" rx="8" fill="#ffffff" stroke="#e5e7eb"/>
  <text x="40" y="192" font-family="Arial" font-size="12" font-weight="600" fill="#6b7280">Total Workflows</text>
  <text x="40" y="220" font-family="Arial" font-size="24" font-weight="bold" fill="#1f2937">24</text>
  <text x="40" y="236" font-family="Arial" font-size="10" fill="#10b981">+12% from last month</text>
  
  <rect x="24" y="264" width="327" height="80" rx="8" fill="#ffffff" stroke="#e5e7eb"/>
  <text x="40" y="288" font-family="Arial" font-size="12" font-weight="600" fill="#6b7280">Success Rate</text>
  <text x="40" y="316" font-family="Arial" font-size="24" font-weight="bold" fill="#1f2937">98.5%</text>
  <text x="40" y="332" font-family="Arial" font-size="10" fill="#10b981">+0.3% from last month</text>
  
  <!-- Recent Workflows (Mobile) -->
  <rect x="24" y="368" width="327" height="400" rx="8" fill="#ffffff" stroke="#e5e7eb"/>
  <text x="40" y="396" font-family="Arial" font-size="16" font-weight="600" fill="#1f2937">Recent Workflows</text>
  
  <!-- Workflow Item 1 -->
  <rect x="40" y="416" width="295" height="72" rx="6" fill="#f8fafc" stroke="#e5e7eb"/>
  <text x="56" y="436" font-family="Arial" font-size="14" font-weight="500" fill="#1f2937">Gmail to Slack</text>
  <text x="56" y="452" font-family="Arial" font-size="12" fill="#6b7280">2 hours ago</text>
  <rect x="250" y="432" width="60" height="20" rx="10" fill="#dcfce7"/>
  <text x="270" y="444" font-family="Arial" font-size="10" fill="#166534" text-anchor="middle">Active</text>
  <text x="56" y="468" font-family="Arial" font-size="12" fill="#6b7280">Success: 98.2%</text>
  
  <!-- Workflow Item 2 -->
  <rect x="40" y="496" width="295" height="72" rx="6" fill="#f8fafc" stroke="#e5e7eb"/>
  <text x="56" y="516" font-family="Arial" font-size="14" font-weight="500" fill="#1f2937">GitHub to Notion</text>
  <text x="56" y="532" font-family="Arial" font-size="12" fill="#6b7280">5 hours ago</text>
  <rect x="250" y="512" width="60" height="20" rx="10" fill="#dcfce7"/>
  <text x="270" y="524" font-family="Arial" font-size="10" fill="#166534" text-anchor="middle">Active</text>
  <text x="56" y="548" font-family="Arial" font-size="12" fill="#6b7280">Success: 95.8%</text>
  
  <!-- Bottom Navigation -->
  <rect x="0" y="756" width="375" height="56" fill="#ffffff" stroke="#e5e7eb"/>
  
  <rect x="30" y="768" width="60" height="32" rx="16" fill="#3b82f6"/>
  <text x="60" y="788" font-family="Arial" font-size="10" fill="#ffffff" text-anchor="middle">Dashboard</text>
  
  <text x="150" y="788" font-family="Arial" font-size="10" fill="#6b7280" text-anchor="middle">Workflows</text>
  <text x="225" y="788" font-family="Arial" font-size="10" fill="#6b7280" text-anchor="middle">Deploy</text>
  <text x="300" y="788" font-family="Arial" font-size="10" fill="#6b7280" text-anchor="middle">Settings</text>
</svg>

## 🎯 UI 컴포넌트 가이드

### 버튼 컴포넌트

```css
/* Primary Button */
.btn-primary {
  background: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}
```

### 카드 컴포넌트

```css
.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
```

### 폼 컴포넌트

```css
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}
```

## 📱 반응형 디자인 가이드

### 브레이크포인트

```css
/* Mobile First Approach */
.container {
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 1.5rem;
    max-width: 768px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 2rem;
    max-width: 1200px;
  }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}
```

### 모바일 최적화

```css
/* Touch-friendly targets */
.btn-mobile {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1rem;
}

/* Responsive typography */
.text-responsive {
  font-size: 1rem;
}

@media (min-width: 768px) {
  .text-responsive {
    font-size: 1.125rem;
  }
}

@media (min-width: 1024px) {
  .text-responsive {
    font-size: 1.25rem;
  }
}
```

## ♿ 접근성 가이드

### 색상 대비

- **텍스트 대비**: 최소 4.5:1 (WCAG AA 기준)
- **대형 텍스트**: 최소 3:1
- **UI 컴포넌트**: 최소 3:1

### 키보드 네비게이션

```css
/* Focus indicators */
.focusable:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Skip links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

### ARIA 레이블

```html
<!-- 버튼 -->
<button aria-label="워크플로우 저장">Save</button>

<!-- 폼 입력 -->
<input type="text" aria-describedby="email-help" />
<div id="email-help">유효한 이메일 주소를 입력하세요</div>

<!-- 상태 표시 -->
<div role="status" aria-live="polite">
  워크플로우가 성공적으로 저장되었습니다.
</div>
```

## 🎨 아이콘 시스템

### 아이콘 가이드라인

```css
.icon {
  width: 1rem;
  height: 1rem;
  display: inline-block;
  vertical-align: middle;
}

.icon-lg {
  width: 1.5rem;
  height: 1.5rem;
}

.icon-xl {
  width: 2rem;
  height: 2rem;
}
```

### 서비스별 아이콘 색상

- **Gmail**: #EA4335
- **Slack**: #4A154B  
- **GitHub**: #181717
- **Google Sheets**: #0F9D58
- **Microsoft**: #00BCF2
- **Notion**: #000000

## 🔄 상태 표시 시스템

### 상태 색상 코드

```css
.status-active {
  background: #dcfce7;
  color: #166534;
}

.status-inactive {
  background: #f3f4f6;
  color: #4b5563;
}

.status-error {
  background: #fecaca;
  color: #991b1b;
}

.status-warning {
  background: #fef3c7;
  color: #92400e;
}

.status-draft {
  background: #e0e7ff;
  color: #3730a3;
}
```

### 로딩 상태

```css
.loading-spinner {
  border: 2px solid #f3f4f6;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

이 UI 디자인 가이드는 사용자 친화적이고 접근성이 뛰어난 인터페이스를 구축하기 위한 종합적인 지침을 제공합니다. 모든 컴포넌트는 일관성 있는 디자인 시스템을 따르며, 다양한 디바이스와 사용자 요구사항을 고려하여 설계되었습니다. 