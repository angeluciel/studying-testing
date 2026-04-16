import type { FormData } from '@/types/auth';

export async function registerUser(formData: FormData) {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  if (!response.ok) throw new Error('Regitration failed.');

  return response.json();
}
