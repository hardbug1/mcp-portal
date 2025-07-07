import { AxiosError } from 'axios';

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorDetails {
  endpoint?: string;
  method?: string;
  statusCode?: number;
  originalError?: any;
}

class ErrorHandler {
  private errorCallbacks: ((error: AppError) => void)[] = [];

  // 에러 콜백 등록
  onError(callback: (error: AppError) => void): void {
    this.errorCallbacks.push(callback);
  }

  // 에러 콜백 제거
  removeErrorCallback(callback: (error: AppError) => void): void {
    const index = this.errorCallbacks.indexOf(callback);
    if (index > -1) {
      this.errorCallbacks.splice(index, 1);
    }
  }

  // 에러 처리 및 알림
  handleError(error: any, context?: string): AppError {
    const appError = this.createAppError(error, context);
    
    // 에러 로깅
    this.logError(appError);
    
    // 콜백 실행
    this.errorCallbacks.forEach(callback => callback(appError));
    
    return appError;
  }

  // AppError 객체 생성
  private createAppError(error: any, context?: string): AppError {
    if (error instanceof AxiosError) {
      return this.handleAxiosError(error, context);
    }
    
    if (error instanceof Error) {
      return this.handleGenericError(error, context);
    }
    
    return this.handleUnknownError(error, context);
  }

  // Axios 에러 처리
  private handleAxiosError(error: AxiosError, context?: string): AppError {
    const statusCode = error.response?.status;
    const responseData = error.response?.data as any;
    
    let code: string;
    let message: string;
    let userMessage: string;
    let severity: AppError['severity'] = 'medium';

    switch (statusCode) {
      case 400:
        code = 'VALIDATION_ERROR';
        message = responseData?.message || 'Invalid request data';
        userMessage = '입력 데이터를 확인해주세요.';
        severity = 'low';
        break;
        
      case 401:
        code = 'AUTHENTICATION_ERROR';
        message = 'Authentication failed';
        userMessage = '로그인이 필요합니다.';
        severity = 'medium';
        break;
        
      case 403:
        code = 'AUTHORIZATION_ERROR';
        message = 'Access denied';
        userMessage = '접근 권한이 없습니다.';
        severity = 'medium';
        break;
        
      case 404:
        code = 'NOT_FOUND_ERROR';
        message = 'Resource not found';
        userMessage = '요청한 리소스를 찾을 수 없습니다.';
        severity = 'low';
        break;
        
      case 409:
        code = 'CONFLICT_ERROR';
        message = responseData?.message || 'Resource conflict';
        userMessage = '이미 존재하는 데이터입니다.';
        severity = 'low';
        break;
        
      case 422:
        code = 'UNPROCESSABLE_ERROR';
        message = responseData?.message || 'Unprocessable entity';
        userMessage = '처리할 수 없는 요청입니다.';
        severity = 'low';
        break;
        
      case 429:
        code = 'RATE_LIMIT_ERROR';
        message = 'Too many requests';
        userMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
        severity = 'medium';
        break;
        
      case 500:
        code = 'SERVER_ERROR';
        message = 'Internal server error';
        userMessage = '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
        severity = 'high';
        break;
        
      case 502:
      case 503:
      case 504:
        code = 'SERVICE_UNAVAILABLE';
        message = 'Service unavailable';
        userMessage = '서비스를 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
        severity = 'high';
        break;
        
      default:
        if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
          code = 'NETWORK_ERROR';
          message = 'Network connection failed';
          userMessage = '네트워크 연결을 확인해주세요.';
          severity = 'medium';
        } else {
          code = 'UNKNOWN_API_ERROR';
          message = error.message || 'Unknown API error';
          userMessage = '알 수 없는 오류가 발생했습니다.';
          severity = 'medium';
        }
    }

    return {
      code,
      message,
      userMessage,
      severity,
      timestamp: new Date(),
      details: {
        endpoint: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        statusCode,
        originalError: responseData,
      },
    };
  }

  // 일반 Error 처리
  private handleGenericError(error: Error, context?: string): AppError {
    let code: string;
    let userMessage: string;
    let severity: AppError['severity'] = 'medium';

    // 특정 에러 타입 확인
    if (error.name === 'ValidationError') {
      code = 'VALIDATION_ERROR';
      userMessage = '입력 데이터를 확인해주세요.';
      severity = 'low';
    } else if (error.name === 'TypeError') {
      code = 'TYPE_ERROR';
      userMessage = '데이터 형식에 문제가 있습니다.';
      severity = 'low';
    } else if (error.name === 'ReferenceError') {
      code = 'REFERENCE_ERROR';
      userMessage = '시스템 오류가 발생했습니다.';
      severity = 'high';
    } else {
      code = 'GENERIC_ERROR';
      userMessage = '오류가 발생했습니다. 다시 시도해주세요.';
    }

    return {
      code,
      message: error.message,
      userMessage,
      severity,
      timestamp: new Date(),
      details: {
        originalError: error,
        context,
      },
    };
  }

  // 알 수 없는 에러 처리
  private handleUnknownError(error: any, context?: string): AppError {
    return {
      code: 'UNKNOWN_ERROR',
      message: String(error),
      userMessage: '알 수 없는 오류가 발생했습니다.',
      severity: 'medium',
      timestamp: new Date(),
      details: {
        originalError: error,
        context,
      },
    };
  }

  // 에러 로깅
  private logError(error: AppError): void {
    const logLevel = this.getLogLevel(error.severity);
    const logMessage = `[${error.code}] ${error.message}`;
    
    if (logLevel === 'error') {
      console.error(logMessage, error.details);
    } else if (logLevel === 'warn') {
      console.warn(logMessage, error.details);
    } else {
      console.log(logMessage, error.details);
    }

    // 프로덕션에서는 외부 로깅 서비스로 전송
    if (import.meta.env.PROD && error.severity === 'critical') {
      this.sendToLoggingService(error);
    }
  }

  private getLogLevel(severity: AppError['severity']): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      default:
        return 'log';
    }
  }

  // 외부 로깅 서비스 전송 (예: Sentry, LogRocket 등)
  private sendToLoggingService(error: AppError): void {
    // TODO: 실제 로깅 서비스 구현
    console.error('Critical error reported:', error);
  }

  // 사용자 친화적 에러 메시지 생성
  getUserFriendlyMessage(error: any): string {
    const appError = this.createAppError(error);
    return appError.userMessage;
  }

  // 재시도 가능한 에러인지 확인
  isRetryableError(error: any): boolean {
    const appError = this.createAppError(error);
    const retryableCodes = [
      'NETWORK_ERROR',
      'SERVICE_UNAVAILABLE',
      'SERVER_ERROR',
      'RATE_LIMIT_ERROR',
    ];
    return retryableCodes.includes(appError.code);
  }
}

export const errorHandler = new ErrorHandler();
export default errorHandler; 