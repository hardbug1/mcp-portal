import React, { useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircleIcon,
          bgColor: 'bg-gradient-to-r from-emerald-50 to-green-50',
          borderColor: 'border-emerald-200',
          iconColor: 'text-emerald-600',
          textColor: 'text-emerald-800',
          progressColor: 'bg-emerald-500',
        };
      case 'error':
        return {
          icon: XCircleIcon,
          bgColor: 'bg-gradient-to-r from-red-50 to-pink-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          textColor: 'text-red-800',
          progressColor: 'bg-red-500',
        };
      case 'warning':
        return {
          icon: ExclamationTriangleIcon,
          bgColor: 'bg-gradient-to-r from-amber-50 to-yellow-50',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-600',
          textColor: 'text-amber-800',
          progressColor: 'bg-amber-500',
        };
      case 'info':
        return {
          icon: InformationCircleIcon,
          bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-800',
          progressColor: 'bg-blue-500',
        };
      default:
        return {
          icon: InformationCircleIcon,
          bgColor: 'bg-gradient-to-r from-slate-50 to-gray-50',
          borderColor: 'border-slate-200',
          iconColor: 'text-slate-600',
          textColor: 'text-slate-800',
          progressColor: 'bg-slate-500',
        };
    }
  };

  const config = getToastConfig();
  const Icon = config.icon;

  return (
    <div className={`
      relative overflow-hidden rounded-xl border ${config.borderColor} ${config.bgColor} 
      backdrop-blur-sm shadow-lg shadow-slate-200/50 p-4 slide-up
      hover:shadow-xl hover:scale-105 transition-all duration-300
    `}>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-slate-200 w-full">
        <div 
          className={`h-full ${config.progressColor} animate-pulse`}
          style={{
            animation: `shrink ${duration}ms linear`,
          }}
        />
      </div>

      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-white/50 flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${config.textColor} leading-relaxed`}>
            {message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={() => onClose(id)}
          className={`
            flex-shrink-0 p-1.5 rounded-lg hover:bg-white/50 transition-colors duration-200
            ${config.iconColor} hover:scale-110 transform
          `}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast; 