'use client';
import PublicHeader from '@/components/header';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  surname: string;
};

export default function Register() {
  const [step, setStep] = useState<'email' | 'name'>('email');
  const [role, setRole] = useState<'admin' | 'user' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    surname: '',
  });

  const validateEmail = (): { ok: boolean; message: string | null } => {
    const { email, password, confirmPassword } = formData;

    if (!email || !password || !confirmPassword)
      return { ok: false, message: 'All fields must be filled.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return { ok: false, message: 'Email is invalid.' };
    if (password.length < 8)
      return { ok: false, message: 'Password must be at least 8 characters.' };
    if (password !== confirmPassword) return { ok: false, message: 'Passwords do not match.' };

    return { ok: true, message: null };
  };

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit() {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
    } catch (err) {
      console.log(err);
    }
  }

  const ddSelected = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (role) {
      requestAnimationFrame(() => {
        ddSelected.current?.focus();
      });
    }
  });

  return (
    <div className='flex flex-col flex-1 bg-background text-foreground font-sans'>
      <PublicHeader redirect='/login' text='Sign in' />
      <main className='flex flex-col justify-center items-center flex-1 px-4'>
        <div className='w-full max-w-md flex flex-col gap-6 border border-border bg-surface rounded-xl px-12 py-10'>
          <AnimatePresence mode='wait' initial={false}>
            {step === 'email' ? (
              <motion.div
                className='flex flex-col gap-6'
                key='email'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className='flex flex-col gap-1'>
                  <h1 className='text-2xl font-semibold'>Let&apos;s create your account</h1>
                  <p className='text-lg text-muted'>Start with your email and password!</p>
                </div>
                <form className='flex flex-col gap-4'>
                  <label className='flex flex-col gap-1.5'>
                    <span className='font-medium'>Email</span>
                    <input
                      placeholder='you@example.com'
                      type='email'
                      name='email'
                      className='py-3 px-3 rounded-lg border border-border-input bg-background text-foreground placeholder:text-muted  transition-colors duration-150'
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </label>
                  <label className='flex flex-col gap-1.5'>
                    <span className=' font-medium'>Password</span>
                    <input
                      placeholder='Your Secret Password'
                      type='password'
                      name='password'
                      className='py-3 px-3 rounded-lg border border-border-input bg-background text-foreground placeholder:text-muted  transition-colors duration-150'
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </label>
                  <label className='flex flex-col gap-1.5'>
                    <span className=' font-medium'>Confirm Password</span>
                    <input
                      placeholder='Your Secret Password'
                      type='password'
                      name='confirmPassword'
                      className='py-3 px-3 rounded-lg border border-border-input bg-background text-foreground placeholder:text-muted  transition-colors duration-150'
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </label>
                  <button
                    type='button'
                    onClick={() => {
                      const { ok, message } = validateEmail();
                      setError(message);
                      if (ok) setStep('name');
                    }}
                    className='w-full h-10 rounded-lg bg-outline text-background font-medium  cursor-pointer hover:bg-outline/90 transition-colors duration-150 mt-2'
                  >
                    Next Step
                  </button>
                  <p className='w-full text-center text-red-500 text-sm min-h-5'>{error ?? ''}</p>
                </form>
                <p className='text-center  text-muted'>
                  Already have an account?{' '}
                  <Link
                    href='/login'
                    className='text-outline font-medium hover:text-outline/80 transition-colors duration-150'
                  >
                    Sign in
                  </Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                className='flex flex-col gap-6'
                key='name'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className='flex flex-col gap-1'>
                  <button
                    type='button'
                    onClick={() => setStep('email')}
                    className='p-2 rounded-lg hover:bg-background w-fit transition-all duration-150 -translate-x-2.5'
                  >
                    <ArrowLeft />
                  </button>
                  <h1 className='text-2xl font-semibold'>Please fill in your data</h1>
                  <p className='text-lg text-muted'>We&apos;re still missing some information</p>
                </div>
                <form className='flex flex-col gap-4'>
                  <label className='flex flex-col gap-1.5'>
                    <span className=' font-medium'>Name</span>
                    <input
                      placeholder='Your name'
                      type='text'
                      name='name'
                      className='py-3 px-3 rounded-lg border border-border-input bg-background text-foreground placeholder:text-muted  transition-colors duration-150'
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </label>
                  <label className='flex flex-col gap-1.5'>
                    <span className=' font-medium'>Surname</span>
                    <input
                      placeholder='Your Surname'
                      type='text'
                      name='surname'
                      className='py-3 px-3 rounded-lg border border-border-input bg-background text-foreground placeholder:text-muted  transition-colors duration-150'
                      value={formData.surname}
                      onChange={handleChange}
                    />
                  </label>
                  <button
                    type='button'
                    onClick={() => console.log('send data')}
                    className='w-full h-10 rounded-lg bg-outline text-background font-medium  cursor-pointer hover:bg-outline/90 transition-colors duration-150 mt-2'
                  >
                    Create Account
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
