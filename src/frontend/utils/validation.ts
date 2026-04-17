import { FormData, ValidationResult } from '@/types/auth';

export function validateEmailStep(formData: FormData): ValidationResult {
  const { email, password, confirmPassword } = formData;

  if (!email || !password || !confirmPassword)
    return { ok: false, message: 'All fields must be filled.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: 'Email is invalid.' };
  if (password.length < 8) return { ok: false, message: 'Password must be at least 8 characters.' };
  if (password !== confirmPassword) return { ok: false, message: 'Passwords do not match.' };

  return { ok: true, message: null };
}
