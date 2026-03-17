'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const res = await authApi.login(data);
      setAuth(res.data.user, res.data.token);
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setServerError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 mt-2">Sign in to AnimeAClaude</p>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
                {serverError}
              </div>
            )}

            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full bg-dark-700 border border-dark-500 text-white placeholder-gray-500 px-4 py-3 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Password</label>
              <input
                {...register('password')}
                type="password"
                className="w-full bg-dark-700 border border-dark-500 text-white placeholder-gray-500 px-4 py-3 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary-500 hover:text-primary-400 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
