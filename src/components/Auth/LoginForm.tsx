import React, { useState } from 'react';
import { Mail, Phone, ArrowRight, Eye, EyeOff, Sparkles, Shield, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-cream-200 to-cream-300 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-cream-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-20 w-48 h-48 bg-cream-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-cream-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-cream-500 rounded-2xl mb-6 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-cream-800 mb-2">EventPro</h1>
          <p className="text-cream-600 text-lg">Welcome back to your dashboard</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-cream-200">
          {/* Login Method Toggle */}
          <div className="flex mb-8 bg-cream-100 rounded-2xl p-1">
            <button
              type="button"
              onClick={() => setLoginMethod('email')}
              className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 ${
                loginMethod === 'email'
                  ? 'bg-cream-500 text-white shadow-lg transform scale-105'
                  : 'text-cream-600 hover:text-cream-700'
              }`}
            >
              <Mail size={20} className="mx-auto mb-1" />
              <span className="text-sm font-medium">Email</span>
            </button>
            <button
              type="button"
              onClick={() => setLoginMethod('phone')}
              className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 ${
                loginMethod === 'phone'
                  ? 'bg-cream-500 text-white shadow-lg transform scale-105'
                  : 'text-cream-600 hover:text-cream-700'
              }`}
            >
              <Phone size={20} className="mx-auto mb-1" />
              <span className="text-sm font-medium">Phone</span>
            </button>
          </div>

          {loginMethod === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-cream-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cream-400" size={20} />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-500 focus:border-transparent transition-all duration-300"
                    placeholder="manager@example.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-cream-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cream-400" size={20} />
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-500 focus:border-transparent transition-all duration-300"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cream-500 to-cream-600 text-white py-4 px-6 rounded-xl hover:from-cream-600 hover:to-cream-700 focus:outline-none focus:ring-2 focus:ring-cream-500 transition-all duration-300 disabled:opacity-50 flex items-center justify-center font-semibold shadow-lg transform hover:scale-105"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <>
                    Sign In <ArrowRight size={20} className="ml-2" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePhoneLogin} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-cream-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cream-400" size={20} />
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-500 focus:border-transparent transition-all duration-300"
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
              </div>
              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || !phone}
                  className="w-full bg-gradient-to-r from-cream-500 to-cream-600 text-white py-4 px-6 rounded-xl hover:from-cream-600 hover:to-cream-700 focus:outline-none focus:ring-2 focus:ring-cream-500 transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg transform hover:scale-105"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              ) : (
                <>
                  <div>
                    <label htmlFor="otp" className="block text-sm font-semibold text-cream-700 mb-2">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-4 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-500 focus:border-transparent transition-all duration-300 text-center text-2xl font-mono tracking-widest"
                      placeholder="123456"
                      maxLength={6}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cream-500 to-cream-600 text-white py-4 px-6 rounded-xl hover:from-cream-600 hover:to-cream-700 focus:outline-none focus:ring-2 focus:ring-cream-500 transition-all duration-300 disabled:opacity-50 flex items-center justify-center font-semibold shadow-lg transform hover:scale-105"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
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

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-cream-600 mb-4">
              Don't have an account?{' '}
              <a href="/signup" className="text-cream-700 hover:text-cream-800 font-semibold underline decoration-cream-400 hover:decoration-cream-600 transition-all duration-300">
                Sign up
              </a>
            </p>
            
            {/* Demo Credentials */}
            <div className="bg-gradient-to-r from-cream-100 to-cream-200 p-4 rounded-xl border border-cream-300">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-4 h-4 text-cream-600 mr-2" />
                <p className="font-semibold text-cream-700 text-sm">Demo Credentials</p>
              </div>
              <div className="text-xs space-y-1 text-cream-600">
                <p><strong>Email:</strong> demo@eventpro.com</p>
                <p><strong>Password:</strong> Demo123!</p>
                <p><strong>Phone:</strong> +91 9876543210</p>
                <p><strong>OTP:</strong> 123456</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-cream-200">
            <Shield className="w-8 h-8 text-cream-600 mx-auto mb-2" />
            <p className="text-xs text-cream-700 font-medium">Secure</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-cream-200">
            <Sparkles className="w-8 h-8 text-cream-600 mx-auto mb-2" />
            <p className="text-xs text-cream-700 font-medium">Modern</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-cream-200">
            <Users className="w-8 h-8 text-cream-600 mx-auto mb-2" />
            <p className="text-xs text-cream-700 font-medium">Trusted</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;