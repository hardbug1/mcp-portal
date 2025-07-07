import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/redux';
import { handleOAuthCallback } from '../store/slices/authSlice';

const OAuthCallbackPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      try {
        await dispatch(handleOAuthCallback()).unwrap();
        navigate('/dashboard');
      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login?error=oauth_failed');
      }
    };

    processCallback();
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            로그인 처리 중...
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            잠시만 기다려주세요.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallbackPage; 