export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

export const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = [];
  
  // Minimum length check
  if (password.length < 6) {
    errors.push('At least 6 characters required');
  }
  
  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter required');
  }
  
  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    errors.push('At least one lowercase letter required');
  }
  
  // Symbol/Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('At least one symbol required (!@#$%^&*)');
  }
  
  // Number check (optional but recommended)
  const hasNumber = /[0-9]/.test(password);
  
  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (errors.length === 0) {
    if (password.length >= 8 && hasNumber) {
      strength = 'strong';
    } else {
      strength = 'medium';
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
};

export const getPasswordStrengthColor = (strength: 'weak' | 'medium' | 'strong'): string => {
  switch (strength) {
    case 'weak': return 'text-red-500';
    case 'medium': return 'text-yellow-500';
    case 'strong': return 'text-green-500';
    default: return 'text-gray-500';
  }
};

export const getPasswordStrengthBg = (strength: 'weak' | 'medium' | 'strong'): string => {
  switch (strength) {
    case 'weak': return 'bg-red-500';
    case 'medium': return 'bg-yellow-500';
    case 'strong': return 'bg-green-500';
    default: return 'bg-gray-300';
  }
};