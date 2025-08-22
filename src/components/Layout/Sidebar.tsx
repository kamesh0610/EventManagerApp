import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Briefcase,
  Calendar,
  Users,
  Radio,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/services', label: 'My Services', icon: Briefcase },
    { to: '/bookings', label: 'Bookings', icon: Users },
    { to: '/broadcast', label: 'Broadcast Requests', icon: Radio },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        bg-white h-screen w-64 shadow-lg border-r border-gray-200 flex flex-col
        fixed lg:static top-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        max-w-[280px] sm:w-64
      `}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-bold text-gray-800">EventPro</h2>
            <p className="text-xs text-gray-500">Manager Dashboard</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        
        <div className="hidden lg:block p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">EventPro</h2>
          <p className="text-sm text-gray-500">Manager Dashboard</p>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => {
                      // Close sidebar on mobile when navigating
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <Icon size={20} className="mr-3" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;