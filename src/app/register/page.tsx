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
  username: z.string().min(3, 'Min 3 characters').max(30, 'Max 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const res = await authApi.register({ username: data.username, email: data.email, password: data.password });
      setAuth(res.data.user, res.data.token);
      router.push('/');
    } catch (err: unknown) {
      setServerError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Create account</h1>
          <p className="text-gray-400 mt-2">Join AnimeAClaude</p>
        </div>

        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
                {serverError}
              </div>
            )}

            {([
              { field: 'username', label: 'Username', type: 'text', placeholder: 'cool_username' },
              { field: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { field: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
              { field: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
            ] as const).map(({ field, label, type, placeholder }) => (
              <div key={field}>
                <label className="text-sm text-gray-300 mb-1.5 block">{label}</label>
                <input
                  {...register(field)}
                  type={type}
                  className="w-full bg-dark-700 border border-dark-500 text-white placeholder-gray-500 px-4 py-3 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder={placeholder}
                />
                {errors[field] && <p className="text-red-400 text-xs mt-1">{errors[field]?.message}</p>}
              </div>
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-500 hover:text-primary-400 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
