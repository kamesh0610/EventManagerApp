import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Camera, 
  Upload, 
  Save, 
  Lock, 
  Shield,
  LogOut,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/Auth/PasswordInput';
import { validatePassword } from '../utils/validation';

const Settings: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'kyc' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showKYCUpload, setShowKYCUpload] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.location.address || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');

  const [kycFiles, setKycFiles] = useState({
    front: null as File | null,
    back: null as File | null
  });

  const handleProfileSave = () => {
    updateUser({
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      location: {
        ...user!.location,
        address: profileForm.address
      }
    });
    setIsEditing(false);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    const passwordValidation = validatePassword(passwordForm.newPassword);
    if (!passwordValidation.isValid) {
      setPasswordError('New password does not meet security requirements');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    // Simulate password change
    alert('Password changed successfully');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
  };

  const handleKYCUpload = () => {
    if (!kycFiles.front || !kycFiles.back) {
      alert('Please upload both front and back images');
      return;
    }

    updateUser({
      aadharFront: URL.createObjectURL(kycFiles.front),
      aadharBack: URL.createObjectURL(kycFiles.back),
      aadharStatus: 'Pending'
    });

    setKycFiles({ front: null, back: null });
    setShowKYCUpload(false);
    alert('KYC documents uploaded successfully. Verification is pending.');
  };

  const getKYCStatusIcon = () => {
    switch (user?.aadharStatus) {
      case 'Verified':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'Pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'Rejected':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getKYCStatusColor = () => {
    switch (user?.aadharStatus) {
      case 'Verified':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'profile'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <User size={20} className="mr-3" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('kyc')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'kyc'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Shield size={20} className="mr-3" />
              KYC Verification
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'security'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Lock size={20} className="mr-3" />
              Security
            </button>
          </nav>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={logout}
              className="w-full flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              Logout
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {/* Profile Photo */}
              <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                    {user?.photo ? (
                      <img src={user.photo} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                    ) : (
                      <User size={32} className="text-blue-600" />
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                      <Camera size={16} />
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                  <p className="text-gray-500">{user?.email}</p>
                  <div className="flex items-center mt-2">
                    {getKYCStatusIcon()}
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getKYCStatusColor()}`}>
                      KYC {user?.aadharStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                      <textarea
                        value={profileForm.address}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProfileSave}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KYC Tab */}
          {activeTab === 'kyc' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">KYC Verification</h2>

              <div className="space-y-6">
                {/* Current Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getKYCStatusIcon()}
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900">Verification Status</h3>
                        <p className="text-sm text-gray-500">
                          Your KYC verification is currently {user?.aadharStatus?.toLowerCase()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getKYCStatusColor()}`}>
                      {user?.aadharStatus}
                    </span>
                  </div>
                </div>

                {/* Uploaded Documents */}
                {user?.aadharFront && user?.aadharBack && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Aadhar Front</h4>
                      <img 
                        src={user.aadharFront} 
                        alt="Aadhar Front" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Aadhar Back</h4>
                      <img 
                        src={user.aadharBack} 
                        alt="Aadhar Back" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>
                )}

                {/* Upload/Re-upload Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowKYCUpload(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Upload size={20} className="mr-2" />
                    {user?.aadharFront ? 'Re-upload Documents' : 'Upload KYC Documents'}
                  </button>
                </div>
              </div>

              {/* KYC Upload Modal */}
              {showKYCUpload && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl max-w-md w-full p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload KYC Documents</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Aadhar Front
                        </label>
                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                          <Upload className="text-gray-400 mx-auto mb-2" size={24} />
                          <p className="text-sm text-gray-600">Click to upload</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setKycFiles(prev => ({ ...prev, front: e.target.files?.[0] || null }))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          {kycFiles.front && (
                            <p className="text-xs text-green-600 mt-1">{kycFiles.front.name}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Aadhar Back
                        </label>
                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                          <Upload className="text-gray-400 mx-auto mb-2" size={24} />
                          <p className="text-sm text-gray-600">Click to upload</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setKycFiles(prev => ({ ...prev, back: e.target.files?.[0] || null }))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          {kycFiles.back && (
                            <p className="text-xs text-green-600 mt-1">{kycFiles.back.name}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4 mt-6">
                      <button
                        onClick={() => setShowKYCUpload(false)}
                        className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleKYCUpload}
                        disabled={!kycFiles.front || !kycFiles.back}
                        className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <PasswordInput
                  value={passwordForm.newPassword}
                  onChange={(value) => setPasswordForm(prev => ({ ...prev, newPassword: value }))}
                  label="New Password"
                />

                <PasswordInput
                  value={passwordForm.confirmPassword}
                  onChange={(value) => setPasswordForm(prev => ({ ...prev, confirmPassword: value }))}
                  label="Confirm New Password"
                  showValidation={false}
                />

                {passwordError && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{passwordError}</div>
                )}
                
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Lock size={16} className="mr-2" />
                  Change Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;