import React, { useState } from 'react';
import { Upload, X, AlertTriangle, CheckCircle, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KYCModal: React.FC<KYCModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [aadharNumber, setAadharNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'input' | 'verifying' | 'success'>('input');

  if (!isOpen) return null;

  const validateAadharNumber = (number: string) => {
    // Remove spaces and check if it's exactly 12 digits
    const cleanNumber = number.replace(/\s/g, '');
    return /^\d{12}$/.test(cleanNumber);
  };

  const formatAadharNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 12 digits
    const limitedDigits = digits.slice(0, 12);
    
    // Add spaces every 4 digits
    return limitedDigits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAadharNumber(e.target.value);
    setAadharNumber(formatted);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateAadharNumber(aadharNumber)) {
      setError('Please enter a valid 12-digit Aadhar number');
      return;
    }

    setVerifying(true);
    setStep('verifying');

    try {
      const result = await authAPI.verifyAadhar(aadharNumber.replace(/\s/g, ''));
      
      if (result.success && result.verificationData) {
        // Update user with verified status
        updateUser({
          aadharStatus: 'Verified',
          aadharNumber: aadharNumber.replace(/\s/g, ''),
          verifiedName: result.verificationData.name
        });
        
        setStep('success');
        
        // Auto close after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError(result.message || 'Verification failed. Please try again.');
        setStep('input');
      }
    } catch (error) {
      console.error('Aadhar verification error:', error);
      setError('Verification failed. Please check your connection and try again.');
      setStep('input');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Aadhar Verification</h2>
          {step !== 'verifying' && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {step === 'input' && (
          <>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <CreditCard className="text-blue-500 mr-3 mt-0.5" size={20} />
                <div className="text-sm">
                  <p className="font-medium text-blue-800">UIDAI Verification</p>
                  <p className="text-blue-700 mt-1">
                    Enter your 12-digit Aadhar number for instant verification through UIDAI API.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhar Number *
                </label>
                <input
                  type="text"
                  value={aadharNumber}
                  onChange={handleAadharChange}
                  placeholder="1234 5678 9012"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono tracking-wider"
                  maxLength={14} // 12 digits + 2 spaces
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Enter your 12-digit Aadhar number
                </p>
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-center">
                  <AlertTriangle size={16} className="mr-2" />
                  {error}
                </div>
              )}

              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800 font-medium mb-1">Demo Aadhar Numbers:</p>
                <p className="text-xs text-green-700">• 1234 5678 9012 (Test Number)</p>
                <p className="text-xs text-green-700">• Any 12-digit number works for demo</p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!validateAadharNumber(aadharNumber)}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Verify with UIDAI
                </button>
              </div>
            </form>
          </>
        )}

        {step === 'verifying' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Verifying with UIDAI</h3>
            <p className="text-gray-600">Please wait while we verify your Aadhar number...</p>
            <div className="mt-4 bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">🔒 Secure verification in progress</p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Verification Successful!</h3>
            <p className="text-gray-600 mb-4">Your Aadhar has been verified successfully.</p>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800 font-medium">✅ UIDAI Verified</p>
              <p className="text-xs text-green-700 mt-1">You now have full access to all features</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCModal;