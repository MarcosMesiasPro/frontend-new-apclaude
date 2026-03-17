'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { User } from '@/types';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: me, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => usersApi.getProfile(username).then((r) => r.data.user),
  });

  const followMut = useMutation({
    mutationFn: (id: string) => usersApi.follow(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile', username] }),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex gap-6 items-center">
          <div className="w-24 h-24 rounded-full skeleton" />
          <div className="space-y-3 flex-1">
            <div className="h-5 w-40 skeleton rounded" />
            <div className="h-3 w-64 skeleton rounded" />
          </div>
        </div>
      </div>
    );
  }

  const profile: User = data;
  if (!profile) return <div className="text-center py-20 text-gray-400">User not found</div>;

  const isMe = me?._id === profile._id;
  const isFollowing = me ? profile.followers.some((f: User | string) => (typeof f === 'string' ? f : f._id) === me._id) : false;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-3xl font-bold text-white overflow-hidden flex-shrink-0">
          {profile.avatar
            ? <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
            : profile.username[0].toUpperCase()
          }
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{profile.username}</h1>
            {profile.role === 'admin' && (
              <span className="text-xs bg-accent/10 border border-accent/30 text-accent px-2 py-0.5 rounded-full">Admin</span>
            )}
            {profile.isBlocked && (
              <span className="text-xs bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-0.5 rounded-full">Blocked</span>
            )}
          </div>

          {profile.bio && <p className="text-gray-400 text-sm mt-1">{profile.bio}</p>}

          <div className="flex gap-6 mt-3">
            <div className="text-center">
              <p className="text-white font-bold">{profile.followers.length}</p>
              <p className="text-gray-500 text-xs">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-white font-bold">{profile.following.length}</p>
              <p className="text-gray-500 text-xs">Following</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isMe ? (
            <Link
              href="/profile/edit"
              className="px-4 py-2 bg-dark-600 border border-dark-500 text-white text-sm rounded-lg hover:bg-dark-500 transition-colors"
            >
              Edit Profile
            </Link>
          ) : isAuthenticated && (
            <button
              onClick={() => followMut.mutate(profile._id)}
              disabled={followMut.isPending}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                isFollowing
                  ? 'bg-dark-600 border border-dark-500 text-white hover:bg-dark-500'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }`}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Followers list */}
      {profile.followers.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-white mb-4">Followers</h2>
          <div className="flex flex-wrap gap-3">
            {profile.followers.map((follower: User) => (
              <Link key={follower._id} href={`/profile/${follower.username}`} className="flex items-center gap-2 bg-dark-700 px-3 py-2 rounded-lg hover:bg-dark-600 transition-colors">
                <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                  {follower.avatar
                    ? <img src={follower.avatar} alt="" className="w-full h-full object-cover" />
                    : follower.username[0].toUpperCase()
                  }
                </div>
                <span className="text-sm text-gray-300">{follower.username}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
