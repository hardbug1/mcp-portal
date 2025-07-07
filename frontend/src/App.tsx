import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './hooks/redux';
import { loadUserProfile } from './store/slices/authSlice';

// Components
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import WorkflowsPage from './pages/WorkflowsPage';
import WorkflowBuilderPage from './pages/WorkflowBuilderPage';
import ProfilePage from './pages/ProfilePage';
import ErrorBoundary from './components/ErrorBoundary';
import GlobalLoadingSpinner from './components/GlobalLoadingSpinner';
import { GlobalLoadingProvider } from './hooks/useLoading';
import { errorHandler } from './utils/errorHandler';
import { useToast } from './hooks/useToast';

// Auth wrapper component
const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !isAuthenticated) {
      dispatch(loadUserProfile());
    }
  }, [dispatch, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public route component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { showToast } = useToast();

  useEffect(() => {
    // 전역 에러 핸들러 콜백 등록
    const handleGlobalError = (error: any) => {
      showToast(error.userMessage, 'error');
    };

    errorHandler.onError(handleGlobalError);

    return () => {
      errorHandler.removeErrorCallback(handleGlobalError);
    };
  }, [showToast]);

  return (
    <ErrorBoundary>
      <GlobalLoadingProvider>
        <Router>
          <AuthWrapper>
            <Routes>
              {/* Public routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/auth/callback"
                element={<OAuthCallbackPage />}
              />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="workflows" element={<WorkflowsPage />} />
                <Route path="workflows/:id" element={<WorkflowBuilderPage />} />
                <Route path="workflows/new" element={<WorkflowBuilderPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <GlobalLoadingSpinner />
          </AuthWrapper>
        </Router>
      </GlobalLoadingProvider>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;
