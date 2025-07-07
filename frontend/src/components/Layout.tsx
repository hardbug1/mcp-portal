import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logoutUser } from '../store/slices/authSlice';
import {
  HomeIcon,
  CogIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  KeyIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const Layout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const navigation = [
    { name: '대시보드', href: '/dashboard', icon: HomeIcon },
    { name: '워크플로우', href: '/workflows', icon: CogIcon },
    { name: '자격증명', href: '/credentials', icon: KeyIcon },
    { name: '분석', href: '/analytics', icon: ChartBarIcon },
  ];

  const isCurrentPath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Mobile sidebar backdrop */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity ease-linear duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        
        {/* Mobile sidebar */}
        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full glass-card transform transition ease-in-out duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors duration-200"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-6 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <h1 className="text-xl font-bold gradient-text">MCP Portal</h1>
              </div>
            </div>
            
            <nav className="px-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={
                    isCurrentPath(item.href) ? 'nav-link-active' : 'nav-link-inactive'
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Mobile user section */}
          <div className="flex-shrink-0 border-t border-white/10 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex-shrink-0 p-2 text-slate-400 hover:text-red-500 transition-colors duration-200 rounded-lg hover:bg-red-50"
                title="로그아웃"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-72">
          <div className="flex flex-col h-0 flex-1 glass-card m-4 rounded-2xl">
            <div className="flex-1 flex flex-col pt-8 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-6 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold gradient-text">MCP Portal</h1>
                    <p className="text-xs text-slate-500">AI 워크플로우 플랫폼</p>
                  </div>
                </div>
              </div>
              
              <nav className="flex-1 px-4 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={
                      isCurrentPath(item.href) ? 'nav-link-active' : 'nav-link-inactive'
                    }
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            {/* Desktop user section */}
            <div className="flex-shrink-0 border-t border-white/20 p-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <div className="flex space-x-1">
                  <Link
                    to="/profile"
                    className="p-2 text-slate-400 hover:text-blue-500 transition-colors duration-200 rounded-lg hover:bg-blue-50"
                    title="프로필"
                  >
                    <UserIcon className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors duration-200 rounded-lg hover:bg-red-50"
                    title="로그아웃"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden">
          <div className="glass-card m-4 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-white/50 transition-all duration-200"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">M</span>
                </div>
                <span className="font-bold gradient-text">MCP Portal</span>
              </div>
              
              <div className="w-10"></div> {/* Spacer for balance */}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout; 