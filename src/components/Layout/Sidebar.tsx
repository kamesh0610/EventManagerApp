import React from 'react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Briefcase,
  Calendar,
  Users,
  Radio,
  Settings,
  LogOut, 
  AlertTriangle,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/services', label: 'My Services', icon: Briefcase },
    { to: '/bookings', label: 'Bookings', icon: Users },
    { to: '/broadcast', label: 'Broadcast Requests', icon: Radio },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

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
        bg-cream-50 h-screen w-64 shadow-lg border-r border-cream-200 flex flex-col
        fixed lg:static top-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        max-w-[280px] sm:w-64
      `}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-between items-center p-4 border-b border-cream-200">
          <div>
            <h2 className="text-lg font-bold text-cream-700">EventPro</h2>
            <p className="text-xs text-cream-600">Manager Dashboard</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-cream-100 transition-colors"
          >
            <X size={24} className="text-cream-600" />
          </button>
        </div>
        
        <div className="hidden lg:block p-6 border-b border-cream-200">
          <h2 className="text-xl font-bold text-cream-700">EventPro</h2>
          <p className="text-sm text-cream-600">Manager Dashboard</p>
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
                          ? 'bg-cream-300 text-cream-800 border-r-2 border-cream-500'
                          : 'text-cream-700 hover:bg-cream-200 hover:text-cream-800'
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
        
        <div className="p-4 border-t border-cream-200">
          <button
            onClick={handleLogoutClick}
            className="flex items-center w-full px-4 py-3 text-cream-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-cream-50 rounded-xl max-w-sm w-full p-6 border border-cream-200">
              <div className="flex items-center mb-4">
                <AlertTriangle className="text-amber-500 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-cream-800">Confirm Logout</h3>
              </div>
              
              <p className="text-cream-700 mb-6">
                Are you sure you want to logout? You'll need to sign in again to access your dashboard.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 py-2 px-4 border border-cream-300 text-cream-700 rounded-lg hover:bg-cream-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;