import React, { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthBg } from '../../utils/validation';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showValidation?: boolean;
  label?: string;
  required?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder = "••••••••",
  showValidation = true,
  label = "Password",
  required = true
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const validation = validatePassword(value);
  const showValidationUI = showValidation && (isFocused || value.length > 0);

  const requirements = [
    { text: 'At least 6 characters', test: (pwd: string) => pwd.length >= 6 },
    { text: 'One uppercase letter', test: (pwd: string) => /[A-Z]/.test(pwd) },
    { text: 'One lowercase letter', test: (pwd: string) => /[a-z]/.test(pwd) },
    { text: 'One symbol (!@#$%^&*)', test: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) }
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
            showValidationUI
              ? validation.isValid
                ? 'border-green-300 focus:ring-green-500'
                : 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          placeholder={placeholder}
          required={required}
        />
        
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {/* Password Strength Indicator */}
      {showValidationUI && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Password strength:</span>
            <span className={`text-xs font-medium capitalize ${getPasswordStrengthColor(validation.strength)}`}>
              {validation.strength}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthBg(validation.strength)}`}
              style={{ 
                width: validation.strength === 'weak' ? '33%' : 
                       validation.strength === 'medium' ? '66%' : '100%' 
              }}
            ></div>
          </div>

          {/* Requirements List */}
          <div className="space-y-1">
            {requirements.map((req, index) => {
              const isValid = req.test(value);
              return (
                <div key={index} className="flex items-center text-xs">
                  {isValid ? (
                    <Check size={12} className="text-green-500 mr-2" />
                  ) : (
                    <X size={12} className="text-red-500 mr-2" />
                  )}
                  <span className={isValid ? 'text-green-600' : 'text-red-600'}>
                    {req.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;