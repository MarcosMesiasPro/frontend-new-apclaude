'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminApi } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const schema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['user', 'admin']),
});
type FormData = z.infer<typeof schema>;

export function CreateUserModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'user' },
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      await adminApi.createUser(data);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      onClose();
    } catch (err: unknown) {
      setServerError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Create User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
              {serverError}
            </div>
          )}

          {(['username', 'email', 'password'] as const).map((field) => (
            <div key={field}>
              <label className="text-sm text-gray-300 mb-1 block capitalize">{field}</label>
              <input
                {...register(field)}
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                className="w-full bg-dark-700 border border-dark-500 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-primary-500"
              />
              {errors[field] && <p className="text-red-400 text-xs mt-0.5">{errors[field]?.message}</p>}
            </div>
          ))}

          <div>
            <label className="text-sm text-gray-300 mb-1 block">Role</label>
            <select
              {...register('role')}
              className="w-full bg-dark-700 border border-dark-500 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-primary-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-dark-600 border border-dark-500 text-white py-2.5 rounded-lg text-sm hover:bg-dark-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
