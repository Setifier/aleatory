import { useState } from "react";

export interface MfaVerificationState {
  code: string;
  isLoading: boolean;
  error: string;
}

export interface MfaVerificationActions {
  setCode: (code: string) => void;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  clearError: () => void;
  reset: () => void;
  handleCodeChange: (value: string) => void;
}

export const useMfaVerification = () => {
  const [code, setCode] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clearError = () => setError("");
  
  const reset = () => {
    setCode("");
    setError("");
    setLoading(false);
  };

  const handleCodeChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, "").slice(0, 6);
    setCode(cleanValue);
    if (error) clearError();
  };

  const validateCode = () => {
    if (!code.trim()) {
      setError("Code requis");
      return false;
    }
    if (code.length !== 6) {
      setError("Le code doit contenir 6 chiffres");
      return false;
    }
    return true;
  };

  return {
    code,
    isLoading,
    error,
    setCode,
    setError,
    setLoading,
    clearError,
    reset,
    handleCodeChange,
    validateCode,
    isCodeValid: code.length === 6,
  };
};