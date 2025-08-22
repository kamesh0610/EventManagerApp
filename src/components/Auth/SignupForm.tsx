import React, { useState } from 'react';
import { Mail, Phone, ArrowRight, User, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from './PasswordInput';
import { validatePassword } from '../../utils/validation';

const SignupForm: React.FC = () => {
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: ''
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signup, signupWithPhone } = useAuth();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.address) {
      setError('Please fill in all required fields');
      return;
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError('Password does not meet security requirements');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signup(formData.name, formData.email, formData.phone, formData.password, formData.address);
    } catch (error) {
      console.error('Signup failed:', error);
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    // Simulate OTP sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    setOtpSent(true);
    setLoading(false);
  };

  const handlePhoneSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signupWithPhone(formData.name, formData.phone, otp, formData.address);
    } catch (error) {
      console.error('Phone signup failed:', error);
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">EventPro</h1>
          <p className="text-sm sm:text-base text-gray-600">Create your manager account</p>
        </div>

        <div className="flex mb-6">
          <button
            type="button"
            onClick={() => setSignupMethod('email')}
            className={`flex-1 py-2 px-4 rounded-l-lg border-2 transition-colors ${
              signupMethod === 'email'
                ? 'bg-blue-50 border-blue-500 text-blue-600'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Mail size={20} className="mx-auto" />
            <span className="text-sm block mt-1">Email</span>
          </button>
          <button
            type="button"
            onClick={() => setSignupMethod('phone')}
            className={`flex-1 py-2 px-4 rounded-r-lg border-2 border-l-0 transition-colors ${
              signupMethod === 'phone'
                ? 'bg-blue-50 border-blue-500 text-blue-600'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Phone size={20} className="mx-auto" />
            <span className="text-sm block mt-1">Phone</span>
          </button>
        </div>

        {signupMethod === 'email' ? (
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Rajesh Kumar"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="manager@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 9876543210"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Business Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="New Delhi, India"
                  rows={2}
                  required
                />
              </div>
            </div>

            <PasswordInput
              value={formData.password}
              onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
              label="Password"
            />

            <PasswordInput
              value={formData.confirmPassword}
              onChange={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
              label="Confirm Password"
              showValidation={false}
            />

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Create Account <ArrowRight size={20} className="ml-2" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePhoneSignup} className="space-y-4">
            <div>
              <label htmlFor="name-phone" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  id="name-phone"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Rajesh Kumar"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone-signup" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  id="phone-signup"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 9876543210"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="address-phone" className="block text-sm font-medium text-gray-700 mb-1">
                Business Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                <textarea
                  id="address-phone"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="New Delhi, India"
                  rows={2}
                  required
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || !formData.name || !formData.phone || !formData.address}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            ) : (
              <>
                <div>
                  <label htmlFor="otp-signup" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP *
                  </label>
                  <input
                    type="text"
                    id="otp-signup"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123456"
                    maxLength={6}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      Create Account <ArrowRight size={20} className="ml-2" />
                    </>
                  )}
                </button>
              </>
            )}
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </a>
          </p>
        </div>

        <div className="mt-4 text-center">
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="font-medium text-green-800 mb-2 text-sm">Demo Info:</p>
            <div className="text-xs space-y-1 text-green-700">
              <p><strong>Password Requirements:</strong></p>
              <p>• Minimum 6 characters</p>
              <p>• One uppercase letter (A-Z)</p>
              <p>• One lowercase letter (a-z)</p>
              <p>• One symbol (!@#$%^&*)</p>
              <p><strong>Example:</strong> Demo123!</p>
              <p>OTP for phone signup: 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;