import React from 'react';
import { useState } from 'react';
import { Bell, User, CheckCircle, Clock, XCircle, Menu, LogOut, AlertTriangle, Settings, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const getStatusBadge = () => {
    if (!user) return null;
    
    const statusConfig = {
      Verified: { icon: CheckCircle, color: 'bg-green-100 text-green-800', text: 'Verified' },
      Pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      Rejected: { icon: XCircle, color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };

    const config = statusConfig[user.aadharStatus];
    const Icon = config.icon;

    return (
      <div className={`flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${config.color}`}>
        <Icon size={12} className="sm:w-4 sm:h-4 mr-1" />
        <span className="hidden sm:inline">KYC </span>{config.text}
      </div>
    );
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setShowProfileDropdown(false);
  };

  const handleProfileClick = () => {
    navigate('/settings');
    setShowProfileDropdown(false);
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
      <div className="bg-cream-50 shadow-sm border-b border-cream-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-cream-100 transition-colors mr-2 sm:mr-4 focus:outline-none focus:ring-2 focus:ring-cream-500"
              aria-label="Toggle menu"
            >
              <Menu size={24} className="text-cream-600" />
            </button>
            
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-cream-700">Dashboard</h1>
              <p className="text-xs sm:text-sm text-cream-600 hidden sm:block">Welcome back, {user?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {getStatusBadge()}
            
            <button className="relative p-2 text-cream-600 hover:text-cream-700 transition-colors hidden sm:block">
              <Bell size={18} className="sm:w-5 sm:h-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-2 sm:space-x-3 relative">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-cream-700 hidden sm:block">{user?.name}</p>
                <p className="text-xs text-cream-600 hidden sm:block">{user?.email}</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-cream-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-cream-300 transition-colors focus:outline-none focus:ring-2 focus:ring-cream-500"
                >
                  {user?.photo ? (
                    <img 
                      src={user.photo} 
                      alt="Profile" 
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User size={16} className="sm:w-5 sm:h-5 text-cream-700" />
                  )}
                </button>
                
                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-cream-50 rounded-lg shadow-lg border border-cream-200 z-10">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-cream-200">
                        <p className="text-sm font-medium text-cream-800">{user?.name}</p>
                        <p className="text-xs text-cream-600">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleProfileClick}
                        className="w-full flex items-center px-4 py-2 text-sm text-cream-700 hover:bg-cream-100 transition-colors"
                      >
                        <UserCircle size={16} className="mr-3" />
                        Profile & Settings
                      </button>
                      <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} className="mr-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showProfileDropdown && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowProfileDropdown(false)}
        />
      )}

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
    </>
  );
};

export default Navbar;