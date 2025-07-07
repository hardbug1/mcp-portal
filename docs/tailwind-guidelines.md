# Tailwind CSS 설정 및 사용 가이드라인

## 📋 개요

본 문서는 MCP 서버 생성 플랫폼에서 Tailwind CSS v4를 올바르게 설정하고 사용하기 위한 가이드라인을 제공합니다. Context7 분석을 통해 최신 모범 사례를 반영했습니다.

## 🔧 Tailwind CSS v4 설정

### 필수 의존성

```json
{
  "devDependencies": {
    "tailwindcss": "^4.1.11",
    "@tailwindcss/vite": "^4.1.11",
    "@tailwindcss/forms": "^0.5.9",
    "@tailwindcss/typography": "^0.5.15",
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^0.6.8"
  }
}
```

### Vite 설정 (권장)

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // Tailwind v4 전용 Vite 플러그인
  ],
  server: {
    port: 5173,
    host: true,
  },
})
```

### Tailwind 설정 파일

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#64748b',
          600: '#475569',
          900: '#0f172a',
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### CSS 파일 설정 (v4 형식)

```css
/* src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@import "tailwindcss";

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
    scroll-behavior: smooth;
  }
  
  body {
    background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%);
    background-attachment: fixed;
    color: #0f172a;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* 커스텀 스크롤바 */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 9999px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
}

@layer components {
  /* 글래스모피즘 효과 */
  .glass {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }

  /* 카드 컴포넌트 */
  .card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    border: 1px solid #e5e7eb;
  }

  .card-hover {
    transition: all 0.2s ease-in-out;
  }

  .card-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  /* 버튼 스타일 */
  .btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s ease-in-out;
    border: none;
    cursor: pointer;
  }

  .btn-primary:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  .btn-secondary {
    background: white;
    color: #374151;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s ease-in-out;
    border: 1px solid #d1d5db;
    cursor: pointer;
  }

  .btn-secondary:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  /* 입력 필드 */
  .input-field {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: white;
    transition: all 0.2s ease-in-out;
    font-size: 0.875rem;
  }

  .input-field:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .input-field:invalid {
    border-color: #ef4444;
  }

  /* 네비게이션 */
  .nav-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    color: #374151;
    text-decoration: none;
    transition: all 0.2s ease-in-out;
    font-weight: 500;
  }

  .nav-item:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  .nav-item.active {
    background: #3b82f6;
    color: white;
  }

  /* 로딩 스피너 */
  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #e5e7eb;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* 토스트 알림 */
  .toast {
    background: white;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border-left: 4px solid #3b82f6;
    max-width: 400px;
    animation: slideUp 0.3s ease-out;
  }

  .toast.success {
    border-left-color: #10b981;
  }

  .toast.error {
    border-left-color: #ef4444;
  }

  .toast.warning {
    border-left-color: #f59e0b;
  }
}

@layer utilities {
  /* 텍스트 그라디언트 */
  .text-gradient {
    background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* 숨김 스크롤바 */
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  /* 반응형 텍스트 크기 */
  .text-responsive {
    font-size: clamp(1rem, 2.5vw, 1.5rem);
  }

  /* 안전 영역 */
  .safe-area-inset-top {
    padding-top: env(safe-area-inset-top);
  }

  .safe-area-inset-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

### Prettier 설정

```json
// .prettierrc
{
  "plugins": ["prettier-plugin-tailwindcss"],
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

## 🎨 디자인 토큰

### 색상 시스템

```typescript
// src/types/theme.ts
export const colorTokens = {
  // Primary Colors (Blue)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6', // 기본
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary Colors (Gray)
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b', // 기본
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Semantic Colors
  success: {
    50: '#ecfdf5',
    500: '#10b981',
    700: '#047857',
  },
  
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    700: '#b45309',
  },
  
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    700: '#c53030',
  },
  
  info: {
    50: '#f0f9ff',
    500: '#06b6d4',
    700: '#0891b2',
  }
} as const;
```

### 타이포그래피 스케일

```typescript
// src/types/typography.ts
export const typographyTokens = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  },
  
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  }
} as const;
```

### 간격 시스템

```typescript
// src/types/spacing.ts
export const spacingTokens = {
  // 4px 기반 스케일
  0: '0px',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  96: '24rem',     // 384px
} as const;
```

## 🧩 컴포넌트 패턴

### 버튼 컴포넌트

```tsx
// src/components/ui/Button.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const buttonVariants = cva(
  // 기본 스타일
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500',
        secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus-visible:ring-secondary-500',
        outline: 'border border-secondary-300 bg-white text-secondary-900 hover:bg-secondary-50 focus-visible:ring-secondary-500',
        ghost: 'text-secondary-900 hover:bg-secondary-100 focus-visible:ring-secondary-500',
        destructive: 'bg-error-500 text-white hover:bg-error-600 focus-visible:ring-error-500',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 입력 필드 컴포넌트

```tsx
// src/components/ui/Input.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const inputVariants = cva(
  'flex w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-secondary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-secondary-300 focus-visible:ring-primary-500',
        error: 'border-error-500 focus-visible:ring-error-500',
        success: 'border-success-500 focus-visible:ring-success-500',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, label, error, helper, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-secondary-900">
            {label}
          </label>
        )}
        <input
          className={cn(inputVariants({ variant: error ? 'error' : variant, size, className }))}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-error-500">{error}</p>
        )}
        {helper && !error && (
          <p className="text-sm text-secondary-500">{helper}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

### 카드 컴포넌트

```tsx
// src/components/ui/Card.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const cardVariants = cva(
  'rounded-lg border bg-white text-secondary-950 shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-secondary-200',
        outline: 'border-secondary-300',
        ghost: 'border-transparent shadow-none',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  )
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-secondary-500', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));

CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';
```

## 🎯 사용 가이드라인

### DO (권장사항)

1. **Tailwind v4 Vite 플러그인 사용**
   ```typescript
   // ✅ 권장
   import tailwindcss from '@tailwindcss/vite'
   
   export default defineConfig({
     plugins: [react(), tailwindcss()]
   })
   ```

2. **CSS 파일에서 @import "tailwindcss" 사용**
   ```css
   /* ✅ v4 형식 */
   @import "tailwindcss";
   ```

3. **Prettier 플러그인으로 클래스 자동 정렬**
   ```json
   {
     "plugins": ["prettier-plugin-tailwindcss"]
   }
   ```

4. **컴포넌트 기반 스타일링**
   ```tsx
   // ✅ 권장 - 재사용 가능한 컴포넌트
   <Button variant="primary" size="lg">
     저장
   </Button>
   ```

5. **시맨틱 색상 사용**
   ```tsx
   // ✅ 권장
   <div className="bg-primary-500 text-white">
   <div className="text-error-500">
   ```

### DON'T (비권장사항)

1. **PostCSS 방식 사용 금지**
   ```javascript
   // ❌ 비권장 - v4에서는 Vite 플러그인 사용
   module.exports = {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     },
   }
   ```

2. **@apply 지시문 남용 금지**
   ```css
   /* ❌ 비권장 - v4에서는 순수 CSS 사용 */
   .custom-button {
     @apply bg-blue-500 text-white px-4 py-2;
   }
   ```

3. **인라인 스타일과 혼용 금지**
   ```tsx
   // ❌ 비권장
   <div className="bg-blue-500" style={{backgroundColor: 'red'}}>
   ```

4. **불필요한 플러그인 설치 금지**
   ```json
   // ❌ 비권장 - v3.3+에서 코어에 통합됨
   "@tailwindcss/line-clamp": "^0.4.4"
   ```

## 📱 반응형 디자인

### 브레이크포인트

```css
/* 기본 브레이크포인트 */
sm: 640px   /* 태블릿 */
md: 768px   /* 작은 데스크톱 */
lg: 1024px  /* 데스크톱 */
xl: 1280px  /* 큰 데스크톱 */
2xl: 1536px /* 매우 큰 화면 */
```

### 모바일 우선 설계

```tsx
// ✅ 모바일 우선 반응형 설계
<div className="
  grid grid-cols-1 gap-4
  sm:grid-cols-2 sm:gap-6
  lg:grid-cols-3 lg:gap-8
  xl:grid-cols-4
">
  {/* 카드들 */}
</div>

// ✅ 반응형 텍스트
<h1 className="
  text-2xl font-bold
  sm:text-3xl
  lg:text-4xl
  xl:text-5xl
">
  제목
</h1>

// ✅ 반응형 패딩
<div className="
  p-4
  sm:p-6
  lg:p-8
  xl:p-12
">
  내용
</div>
```

## 🔧 개발 도구

### VS Code 확장

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### VS Code 설정

```json
// .vscode/settings.json
{
  "css.validate": false,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "editor.quickSuggestions": {
    "strings": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## 🧪 테스트

### 스타일 테스트

```tsx
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../ui/Button';

describe('Button', () => {
  it('should apply correct variant classes', () => {
    render(<Button variant="primary">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary-500');
  });

  it('should apply correct size classes', () => {
    render(<Button size="lg">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-12');
  });
});
```

## 📊 성능 최적화

### 번들 크기 최적화

```javascript
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // 사용하지 않는 스타일 제거
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
  }
}
```

### 빌드 분석

```bash
# 번들 크기 분석
npm run build -- --analyze

# CSS 크기 확인
npx tailwindcss -i ./src/index.css -o ./dist/output.css --minify
```

## 🔍 디버깅

### 개발 도구

```css
/* 개발 시 레이아웃 디버깅 */
.debug-screens::before {
  content: 'xs';
  @media (min-width: 640px) { content: 'sm'; }
  @media (min-width: 768px) { content: 'md'; }
  @media (min-width: 1024px) { content: 'lg'; }
  @media (min-width: 1280px) { content: 'xl'; }
  @media (min-width: 1536px) { content: '2xl'; }
  position: fixed;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem;
  font-size: 0.75rem;
  z-index: 9999;
}
```

### 일반적인 문제 해결

1. **스타일이 적용되지 않는 경우**
   - Content 경로 확인
   - 빌드 캐시 클리어
   - 브라우저 캐시 클리어

2. **성능 이슈**
   - 불필요한 클래스 제거
   - PurgeCSS 설정 확인
   - 번들 분석 실행

3. **반응형 이슈**
   - 브레이크포인트 순서 확인
   - 모바일 우선 설계 적용
   - 뷰포트 메타 태그 확인

## 📚 추가 리소스

- [Tailwind CSS v4 공식 문서](https://tailwindcss.com/docs)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Headless UI](https://headlessui.com/) - 접근성 좋은 컴포넌트
- [Radix UI](https://radix-ui.com/) - 고급 컴포넌트 라이브러리
- [Class Variance Authority](https://cva.style/) - 컴포넌트 변형 관리

---

이 가이드라인을 따라 일관되고 유지보수 가능한 Tailwind CSS 코드를 작성하세요. 