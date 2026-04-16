import React, { useState } from 'react';
import { FormData } from '@/types/auth';
import { validateEmailStep } from '@/utils/validation';
import { registerUser } from '@/lib/api/auth';

export function useRegisterForm() {
  const [step, setStep] = useState<'email' | 'name'>('email');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    surname: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleNextStep() {
    const { ok, message } = validateEmailStep(formData);
    setError(message);
    if (ok) setStep('name');
  }

  async function handleSubmit() {
    try {
      await registerUser(formData);
    } catch (err) {
      console.log(err);
    }
  }

  return {
    step,
    setStep,
    error,
    formData,
    handleChange,
    handleNextStep,
    handleSubmit,
  };
}
