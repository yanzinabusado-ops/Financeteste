import { useState, useCallback } from 'react';

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export function useInputValidation() {
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const validate = useCallback((
    _name: string,
    value: string | number,
    rules: ValidationRules
  ): ValidationResult => {
    const stringValue = String(value);

    // Required
    if (rules.required && !stringValue.trim()) {
      return { isValid: false, error: 'Este campo é obrigatório' };
    }

    // Min length
    if (rules.minLength && stringValue.length < rules.minLength) {
      return { 
        isValid: false, 
        error: `Mínimo de ${rules.minLength} caracteres` 
      };
    }

    // Max length
    if (rules.maxLength && stringValue.length > rules.maxLength) {
      return { 
        isValid: false, 
        error: `Máximo de ${rules.maxLength} caracteres` 
      };
    }

    // Min value (for numbers)
    if (rules.min !== undefined && Number(value) < rules.min) {
      return { 
        isValid: false, 
        error: `Valor mínimo: ${rules.min}` 
      };
    }

    // Max value (for numbers)
    if (rules.max !== undefined && Number(value) > rules.max) {
      return { 
        isValid: false, 
        error: `Valor máximo: ${rules.max}` 
      };
    }

    // Pattern
    if (rules.pattern && !rules.pattern.test(stringValue)) {
      return { 
        isValid: false, 
        error: 'Formato inválido' 
      };
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(stringValue);
      if (customError) {
        return { isValid: false, error: customError };
      }
    }

    return { isValid: true, error: null };
  }, []);

  const validateField = useCallback((
    name: string,
    value: string | number,
    rules: ValidationRules
  ) => {
    const result = validate(name, value, rules);
    setErrors(prev => ({ ...prev, [name]: result.error }));
    return result.isValid;
  }, [validate]);

  const clearError = useCallback((name: string) => {
    setErrors(prev => ({ ...prev, [name]: null }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Sanitize input to prevent XSS
  const sanitizeInput = useCallback((input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .trim();
  }, []);

  return {
    errors,
    validate,
    validateField,
    clearError,
    clearAllErrors,
    sanitizeInput,
  };
}
