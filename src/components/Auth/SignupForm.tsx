import React, { useState } from 'react';
import { Mail, Phone, ArrowRight, User, MapPin, Sparkles, Shield, Users, Star } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-cream-200 to-cream-300 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-10 w-32 h-32 bg-cream-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-20 w-48 h-48 bg-cream-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/3 w-40 h-40 bg-cream-300 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-cream-500 rounded-2xl mb-6 shadow-lg">
            <Star className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-cream-800 mb-2">Join EventPro</h1>
          <p className="text-cream-600 text-lg">Start managing events professionally</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-cream-200">
          {/* Signup Method Toggle */}
          <div className="flex mb-8 bg-cream-100 rounded-2xl p-1">
            <button
              type="button"
              onClick={() => setSignupMethod('email')}
              className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 ${
                signupMethod === 'email'
                  ? 'bg-cream-500 text-white shadow-lg transform scale-105'
                  : 'text-cream-600 hover:text-cream-700'
              }`}
            >
              <Mail size={20} className="mx-auto mb-1" />
              <span className="text-sm font-medium">Email</span>
            </button>
            <button
              type="button"
              onClick={() => setSignupMethod('phone')}
              className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 ${
                signupMethod === 'phone'
                  ? 'bg-cream-500 text-white shadow-lg transform scale-105'
                  : 'text-cream-600 hover:text-cream-700'
              }`}
            >
              <Phone size={20} className="mx-auto mb-1" />
              <span className="text-sm font-medium">Phone</span>
            </button>
          </div>

          {signupMethod === 'email' ? (
            <form onSubmit={handleEmailSignup} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-cream-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cream-400" size={18} />
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-500 focus:border-transparent transition-all duration-300"
                      placeholder="Rajesh Kumar"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-cream-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cream-400" size={18} />
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-500 focus:border-transparent transition-all duration-300"
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-cream-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cream-400" size={18} />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-500 focus:border-transparent transition-all duration-300"
                    placeholder="manager@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-cream-700 mb-2">
                  Business Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-cream-400" size={18} />
                  <textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="New Delhi, India"
                    rows={2}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-cream-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cream-400" size={18} />
                    <input
                      type="password"
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-500 focus:border-transparent transition-all duration-300"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-cream-700 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cream-400" size={18} />
                    <input
                      type="password"
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-500 focus:border-transparent transition-all duration-300"
                      placeholder="••••••••"
                      required
                    />
                  </div>
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
                    Create Account <ArrowRight size={20} className="ml-2" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePhoneSignup} className="space-y-6">
              <div>
                <label htmlFor="name-phone" className="block text-sm font-semibold text-cream-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cream-400" size={18} />
                  <input
                    type="text"
                    id="name-phone"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-500 focus:border-transparent transition-all duration-300"
                    placeholder="Rajesh Kumar"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone-signup" className="block text-sm font-semibold text-cream-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cream-400" size={18} />
                  <input
                    type="tel"
                    id="phone-signup"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-500 focus:border-transparent transition-all duration-300"
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address-phone" className="block text-sm font-semibold text-cream-700 mb-2">
                  Business Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-cream-400" size={18} />
                  <textarea
                    id="address-phone"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cream-500 focus:border-transparent transition-all duration-300 resize-none"
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
                  className="w-full bg-gradient-to-r from-cream-500 to-cream-600 text-white py-4 px-6 rounded-xl hover:from-cream-600 hover:to-cream-700 focus:outline-none focus:ring-2 focus:ring-cream-500 transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg transform hover:scale-105"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              ) : (
                <>
                  <div>
                    <label htmlFor="otp-signup" className="block text-sm font-semibold text-cream-700 mb-2">
                      Enter OTP *
                    </label>
                    <input
                      type="text"
                      id="otp-signup"
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
                        Create Account <ArrowRight size={20} className="ml-2" />
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-cream-600 mb-6">
              Already have an account?{' '}
              <a href="/login" className="text-cream-700 hover:text-cream-800 font-semibold underline decoration-cream-400 hover:decoration-cream-600 transition-all duration-300">
                Sign in
              </a>
            </p>
            
            {/* Password Requirements */}
            <div className="bg-gradient-to-r from-cream-100 to-cream-200 p-4 rounded-xl border border-cream-300">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-4 h-4 text-cream-600 mr-2" />
                <p className="font-semibold text-cream-700 text-sm">Password Requirements</p>
              </div>
              <div className="text-xs space-y-1 text-cream-600">
                <p>• Minimum 6 characters</p>
                <p>• One uppercase letter (A-Z)</p>
                <p>• One lowercase letter (a-z)</p>
                <p>• One symbol (!@#$%^&*)</p>
                <p className="font-medium text-cream-700 mt-2">Example: Demo123!</p>
                <p className="text-cream-500">OTP for phone signup: 123456</p>
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

export default SignupForm;