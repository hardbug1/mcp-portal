import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  nodeId?: string;
  nodeName?: string;
  executionId: string;
  metadata?: Record<string, any>;
}

export interface WorkflowExecutionLogsProps {
  workflowId: string;
  executionId?: string;
  isVisible: boolean;
  onClose: () => void;
}

const WorkflowExecutionLogs: React.FC<WorkflowExecutionLogsProps> = ({
  workflowId,
  executionId,
  isVisible,
  onClose,
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // WebSocket 연결 설정
  useEffect(() => {
    if (!isVisible || !workflowId) return;

    const wsUrl = `ws://localhost:3001/ws/workflows/${workflowId}/logs${executionId ? `?executionId=${executionId}` : ''}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log('로그 WebSocket 연결됨');
    };

    ws.onmessage = (event) => {
      try {
        const logEntry: LogEntry = JSON.parse(event.data);
        logEntry.timestamp = new Date(logEntry.timestamp);
        
        setLogs(prev => [...prev, logEntry]);
      } catch (error) {
        console.error('로그 파싱 오류:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('로그 WebSocket 연결 종료됨');
    };

    ws.onerror = (error) => {
      console.error('로그 WebSocket 오류:', error);
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [workflowId, executionId, isVisible]);

  // 로그 필터링
  useEffect(() => {
    let filtered = logs;

    // 레벨 필터
    if (filterLevel !== 'all') {
      filtered = filtered.filter(log => log.level === filterLevel);
    }

    // 검색 필터
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(term) ||
        log.nodeName?.toLowerCase().includes(term) ||
        log.nodeId?.toLowerCase().includes(term)
      );
    }

    setFilteredLogs(filtered);
  }, [logs, filterLevel, searchTerm]);

  // 자동 스크롤
  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  const clearLogs = () => {
    setLogs([]);
  };

  const downloadLogs = () => {
    const logText = filteredLogs
      .map(log => `[${format(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}] ${log.level.toUpperCase()}: ${log.message}`)
      .join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${workflowId}-logs-${format(new Date(), 'yyyyMMdd-HHmmss')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'warn':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      case 'debug':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'debug':
        return '🐛';
      default:
        return '📝';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900">
                워크플로우 실행 로그
              </h2>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-500">
                  {isConnected ? '연결됨' : '연결 끊김'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 필터 및 컨트롤 */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                {/* 레벨 필터 */}
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">모든 레벨</option>
                  <option value="error">오류</option>
                  <option value="warn">경고</option>
                  <option value="info">정보</option>
                  <option value="debug">디버그</option>
                </select>

                {/* 검색 */}
                <input
                  type="text"
                  placeholder="로그 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />

                {/* 자동 스크롤 토글 */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="text-sm text-gray-700">자동 스크롤</span>
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={clearLogs}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  로그 지우기
                </button>
                <button
                  onClick={downloadLogs}
                  className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  다운로드
                </button>
              </div>
            </div>
          </div>

          {/* 로그 목록 */}
          <div
            ref={logsContainerRef}
            className="flex-1 overflow-y-auto p-4 font-mono text-sm"
          >
            {filteredLogs.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>표시할 로그가 없습니다.</p>
                {searchTerm && (
                  <p className="mt-2">검색어: "{searchTerm}"</p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-md border-l-4 ${getLevelColor(log.level)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{getLevelIcon(log.level)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                          <span>{format(log.timestamp, 'HH:mm:ss.SSS')}</span>
                          {log.nodeName && (
                            <>
                              <span>•</span>
                              <span className="font-medium">{log.nodeName}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="uppercase font-medium">{log.level}</span>
                        </div>
                        <div className="text-gray-900 whitespace-pre-wrap break-words">
                          {log.message}
                        </div>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                              메타데이터 보기
                            </summary>
                            <pre className="mt-1 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 상태 바 */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                총 {logs.length}개 로그 (필터링: {filteredLogs.length}개)
              </span>
              <span>
                마지막 업데이트: {logs.length > 0 ? format(logs[logs.length - 1].timestamp, 'HH:mm:ss') : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowExecutionLogs; 