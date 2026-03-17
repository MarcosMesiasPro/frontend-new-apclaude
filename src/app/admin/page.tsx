'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { User, Comment } from '@/types';
import { timeAgo } from '@/lib/utils';
import { CreateUserModal } from '@/components/admin/CreateUserModal';

type Tab = 'users' | 'comments';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('users');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') router.push('/');
  }, [isAuthenticated, user, router]);

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers().then((r) => r.data),
    enabled: tab === 'users',
  });

  const { data: commentsData, isLoading: loadingComments } = useQuery({
    queryKey: ['admin-comments'],
    queryFn: () => adminApi.getComments().then((r) => r.data),
    enabled: tab === 'comments',
  });

  const blockMut = useMutation({
    mutationFn: (id: string) => adminApi.toggleBlock(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const deleteUserMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const deleteCommentMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteComment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-comments'] }),
  });

  if (!isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        {tab === 'users' && (
          <button
            onClick={() => setShowCreate(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
          >
            + Create User
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-dark-600 pb-4">
        {(['users', 'comments'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white hover:bg-dark-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Users Table */}
      {tab === 'users' && (
        <div className="overflow-x-auto">
          {loadingUsers ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map((i) => <div key={i} className="h-14 skeleton rounded-lg" />)}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-dark-600">
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Joined</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-600">
                {usersData?.users?.map((u: User) => (
                  <tr key={u._id} className="text-sm">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                          {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : u.username[0].toUpperCase()}
                        </div>
                        <span className="text-white">{u.username}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-gray-400">{u.email}</td>
                    <td className="py-4 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-dark-600 text-gray-300'
                      }`}>{u.role}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        u.isBlocked ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                      }`}>{u.isBlocked ? 'Blocked' : 'Active'}</span>
                    </td>
                    <td className="py-4 pr-4 text-gray-500">{timeAgo(u.createdAt)}</td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => blockMut.mutate(u._id)}
                          disabled={blockMut.isPending}
                          className={`text-xs px-3 py-1 rounded transition-colors ${
                            u.isBlocked
                              ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                              : 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'
                          }`}
                        >
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete user ${u.username}?`)) deleteUserMut.mutate(u._id);
                            }}
                            className="text-xs px-3 py-1 rounded bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Comments Table */}
      {tab === 'comments' && (
        <div className="space-y-3">
          {loadingComments ? (
            [1,2,3].map((i) => <div key={i} className="h-20 skeleton rounded-lg" />)
          ) : (
            commentsData?.comments?.map((c: Comment) => (
              <div key={c._id} className="bg-dark-800 border border-dark-600 rounded-xl p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">{c.user.username}</span>
                    <span className="text-xs text-gray-500">on anime #{c.animeId}</span>
                    <span className="text-xs text-gray-500">&bull; {timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-300">{c.content}</p>
                  <span className="text-xs text-gray-500">{c.likes.length} likes</span>
                </div>
                <button
                  onClick={() => deleteCommentMut.mutate(c._id)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
