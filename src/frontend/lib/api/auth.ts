import type { FormData } from '@/types/auth';

export async function registerUser(formData: FormData) {
  const { email, password, name, surname } = formData;
  const response = await fetch('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name, surname }),
  });

  if (!response.ok) throw new Error('Regitration failed.');

  return response.json();
}
