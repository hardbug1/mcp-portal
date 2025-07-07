import React, { useState, useCallback, useRef, createContext, useContext, ReactNode } from 'react';

export interface LoadingState {
  isLoading: boolean;
  loadingTasks: Set<string>;
  error: any | null;
}

export interface UseLoadingResult {
  isLoading: boolean;
  error: any | null;
  startLoading: (taskId?: string) => void;
  stopLoading: (taskId?: string) => void;
  setError: (error: any) => void;
  clearError: () => void;
  withLoading: <T>(
    asyncFn: () => Promise<T>,
    taskId?: string
  ) => Promise<T>;
}

export function useLoading(initialLoading = false): UseLoadingResult {
  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading,
    loadingTasks: new Set(),
    error: null,
  });
  
  const taskIdCounter = useRef(0);

  const startLoading = useCallback((taskId?: string) => {
    const id = taskId || `task_${++taskIdCounter.current}`;
    setState(prev => ({
      ...prev,
      loadingTasks: new Set([...prev.loadingTasks, id]),
      isLoading: true,
      error: null,
    }));
    return id;
  }, []);

  const stopLoading = useCallback((taskId?: string) => {
    setState(prev => {
      const newTasks = new Set(prev.loadingTasks);
      if (taskId) {
        newTasks.delete(taskId);
      } else {
        newTasks.clear();
      }
      
      return {
        ...prev,
        loadingTasks: newTasks,
        isLoading: newTasks.size > 0,
      };
    });
  }, []);

  const setError = useCallback((error: any) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
      loadingTasks: new Set(),
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const withLoading = useCallback(
    async function<T>(
      asyncFn: () => Promise<T>,
      taskId?: string
    ): Promise<T> {
      const id = startLoading(taskId);
      try {
        const result = await asyncFn();
        stopLoading(id);
        return result;
      } catch (error) {
        stopLoading(id);
        setError(error);
        throw error;
      }
    },
    [startLoading, stopLoading, setError]
  );

  return {
    isLoading: state.isLoading,
    error: state.error,
    startLoading,
    stopLoading,
    setError,
    clearError,
    withLoading,
  };
}

// 전역 로딩 상태 관리를 위한 컨텍스트

interface GlobalLoadingContextType {
  isLoading: boolean;
  loadingMessage?: string;
  startGlobalLoading: (message?: string) => void;
  stopGlobalLoading: () => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType | undefined>(undefined);

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const [globalState, setGlobalState] = useState({
    isLoading: false,
    loadingMessage: undefined as string | undefined,
  });

  const startGlobalLoading = useCallback((message?: string) => {
    setGlobalState({
      isLoading: true,
      loadingMessage: message,
    });
  }, []);

  const stopGlobalLoading = useCallback(() => {
    setGlobalState({
      isLoading: false,
      loadingMessage: undefined,
    });
  }, []);

  return (
    <GlobalLoadingContext.Provider value={{
      isLoading: globalState.isLoading,
      loadingMessage: globalState.loadingMessage,
      startGlobalLoading,
      stopGlobalLoading,
    }}>
      {children}
    </GlobalLoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  const context = useContext(GlobalLoadingContext);
  if (context === undefined) {
    throw new Error('useGlobalLoading must be used within a GlobalLoadingProvider');
  }
  return context;
} 