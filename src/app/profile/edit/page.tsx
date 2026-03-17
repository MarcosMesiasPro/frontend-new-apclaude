'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const schema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional().or(z.literal('')),
  bio: z.string().max(200).optional().or(z.literal('')),
  avatar: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

export default function EditProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuthStore();
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: user?.username || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    setSuccess(false);
    try {
      const res = await usersApi.updateProfile({
        username: data.username || undefined,
        bio: data.bio || undefined,
        avatar: data.avatar || undefined,
      });
      updateUser(res.data.user);
      setSuccess(true);
      setTimeout(() => router.push(`/profile/${res.data.user.username}`), 1000);
    } catch (err: unknown) {
      setServerError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Update failed');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-white mb-8">Edit Profile</h1>

      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
              {serverError}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-3 rounded-lg">
              Profile updated!
            </div>
          )}

          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">Username</label>
            <input
              {...register('username')}
              className="w-full bg-dark-700 border border-dark-500 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-primary-500"
            />
            {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">Bio</label>
            <textarea
              {...register('bio')}
              rows={3}
              maxLength={200}
              className="w-full bg-dark-700 border border-dark-500 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-primary-500 resize-none"
            />
            {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-1.5 block">Avatar URL</label>
            <input
              {...register('avatar')}
              placeholder="https://example.com/avatar.jpg"
              className="w-full bg-dark-700 border border-dark-500 text-white placeholder-gray-500 px-4 py-3 rounded-lg focus:outline-none focus:border-primary-500"
            />
            {errors.avatar && <p className="text-red-400 text-xs mt-1">{errors.avatar.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
