import PublicHeader from '@/components/header';
import Link from 'next/link';

export default function Login() {
  return (
    <div className='flex flex-col flex-1 bg-background text-foreground font-sans'>
      <PublicHeader showBtn={false} />
      <main className='flex flex-col justify-center items-center flex-1 px-4 gap-2'>
        <h1 className='text-2xl'>Se lascou 💀</h1>
        <h2 className='text-xl'>Ainda não implemetamos essa feature, perae chefia</h2>
        <div className='flex gap-4 justify-center items-center'>
          <Link href={`/login`} className='text-outline hover:underline px-4 py-2 rounded-sm'>
            Login
          </Link>
          <Link href={`/register`} className='text-outline hover:underline px-4 py-2 rounded-sm'>
            Register
          </Link>
        </div>
      </main>
    </div>
  );
}
