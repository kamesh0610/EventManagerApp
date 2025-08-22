import React from 'react';
import { Bell, User, CheckCircle, Clock, XCircle, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

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

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2 sm:mr-4"
          >
            <Menu size={24} className="text-gray-600" />
          </button>
          
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Welcome back, {user?.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {getStatusBadge()}
          
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors hidden sm:block">
            <Bell size={18} className="sm:w-5 sm:h-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900 hidden sm:block">{user?.name}</p>
              <p className="text-xs text-gray-500 hidden sm:block">{user?.email}</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User size={16} className="sm:w-5 sm:h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;