import { Link, useLocation } from 'react-router-dom';
import { Heart, Users, User, BarChart } from 'lucide-react';

const AppLayout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/app/swipe', icon: Heart, label: 'Swipe' },
    { path: '/app/matches', icon: Users, label: 'Matches' },
    { path: '/app/profile', icon: User, label: 'Profile' },
    { path: '/app/analytics', icon: BarChart, label: 'Stats' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex flex-col">
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-pink-200 shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex justify-around items-center h-16">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                    isActive
                      ? 'text-pink-600'
                      : 'text-gray-500 hover:text-pink-500'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className={`w-6 h-6 mb-1 ${isActive ? 'animate-pulse' : ''}`} />
                  <span className="text-xs font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 w-12 h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
