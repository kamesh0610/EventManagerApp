import React, { useState } from 'react';
import { Mail, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from './PasswordInput';
import { validatePassword } from '../../utils/validation';

const LoginForm: React.FC = () => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, loginWithPhone } = useAuth();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError('Please enter a valid password meeting all requirements');
      return;
    }
    
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    // Simulate OTP sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    setOtpSent(true);
    setLoading(false);
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithPhone(phone, otp);
    } catch (error) {
      console.error('Phone login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">EventPro</h1>
          <p className="text-sm sm:text-base text-gray-600">Sign in to your manager account</p>
        </div>

        <div className="flex mb-6">
          <button
            type="button"
            onClick={() => setLoginMethod('email')}
            className={`flex-1 py-2 px-4 rounded-l-lg border-2 transition-colors ${
              loginMethod === 'email'
                ? 'bg-blue-50 border-blue-500 text-blue-600'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Mail size={20} className="mx-auto" />
            <span className="text-sm block mt-1">Email</span>
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('phone')}
            className={`flex-1 py-2 px-4 rounded-r-lg border-2 border-l-0 transition-colors ${
              loginMethod === 'phone'
                ? 'bg-blue-50 border-blue-500 text-blue-600'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Phone size={20} className="mx-auto" />
            <span className="text-sm block mt-1">Phone</span>
          </button>
        </div>

        {loginMethod === 'email' ? (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="manager@example.com"
                required
              />
            </div>
            
            <PasswordInput
              value={password}
              onChange={setPassword}
              showValidation={false}
              label="Password"
            />

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
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
                  Sign In <ArrowRight size={20} className="ml-2" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePhoneLogin} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+91 9876543210"
                required
              />
            </div>
            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || !phone}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            ) : (
              <>
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
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
                      Verify & Sign In <ArrowRight size={20} className="ml-2" />
                    </>
                  )}
                </button>
              </>
            )}
          </form>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          <p className="mb-2">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </a>
          </p>
          <div className="bg-blue-50 p-3 rounded-lg mt-3">
            <p className="font-medium text-blue-800 mb-2">Demo Credentials:</p>
            <div className="text-xs space-y-1">
              <p><strong>Email:</strong> demo@eventpro.com</p>
              <p><strong>Password:</strong> Demo123!</p>
              <p><strong>Phone:</strong> +91 9876543210</p>
              <p><strong>OTP:</strong> 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;