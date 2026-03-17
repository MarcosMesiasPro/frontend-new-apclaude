'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { commentsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { Comment } from '@/types';
import { timeAgo } from '@/lib/utils';
import Link from 'next/link';

export function CommentsSection({ animeId }: { animeId: number }) {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['comments', animeId],
    queryFn: () => commentsApi.getByAnime(animeId).then((r) => r.data),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['comments', animeId] });

  const createMut = useMutation({
    mutationFn: (content: string) => commentsApi.create(animeId, content),
    onSuccess: () => { setNewComment(''); invalidate(); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => commentsApi.delete(id),
    onSuccess: invalidate,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) => commentsApi.update(id, content),
    onSuccess: () => { setEditingId(null); invalidate(); },
  });

  const likeMut = useMutation({
    mutationFn: (id: string) => commentsApi.toggleLike(id),
    onSuccess: invalidate,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createMut.mutate(newComment.trim());
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-6">Comments {data?.total ? `(${data.total})` : ''}</h2>

      {/* New comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-600 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
              {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                maxLength={500}
                className="w-full bg-dark-700 border border-dark-500 text-white placeholder-gray-500 px-4 py-3 rounded-xl focus:outline-none focus:border-primary-500 transition-colors resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">{newComment.length}/500</span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || createMut.isPending}
                  className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  {createMut.isPending ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <p className="text-gray-400 text-sm mb-6">
          <Link href="/login" className="text-primary-400 hover:underline">Sign in</Link> to leave a comment.
        </p>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-9 h-9 rounded-full skeleton flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 skeleton rounded" />
                <div className="h-3 skeleton rounded" />
                <div className="h-3 w-3/4 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {data?.comments?.map((comment: Comment) => (
            <div key={comment._id} className="flex gap-3">
              <Link href={`/profile/${comment.user.username}`} className="flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                  {comment.user.avatar
                    ? <img src={comment.user.avatar} alt="" className="w-full h-full object-cover" />
                    : comment.user.username[0].toUpperCase()
                  }
                </div>
              </Link>

              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <Link href={`/profile/${comment.user.username}`} className="text-sm font-semibold text-white hover:text-primary-400">
                    {comment.user.username}
                  </Link>
                  <span className="text-xs text-gray-500">{timeAgo(comment.createdAt)}</span>
                </div>

                {editingId === comment._id ? (
                  <div className="mt-1">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={2}
                      maxLength={500}
                      className="w-full bg-dark-700 border border-primary-500 text-white text-sm px-3 py-2 rounded-lg focus:outline-none resize-none"
                    />
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => updateMut.mutate({ id: comment._id, content: editContent })}
                        disabled={updateMut.isPending}
                        className="text-xs bg-primary-600 text-white px-3 py-1 rounded transition-colors hover:bg-primary-700"
                      >
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:text-white">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-300 mt-1 leading-relaxed">{comment.content}</p>
                )}

                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() => isAuthenticated && likeMut.mutate(comment._id)}
                    className={`flex items-center gap-1 text-xs transition-colors ${
                      user && comment.likes.includes(user._id)
                        ? 'text-pink-400'
                        : 'text-gray-500 hover:text-pink-400'
                    }`}
                  >
                    {user && comment.likes.includes(user._id) ? '♥' : '♡'}
                    <span>{comment.likes.length}</span>
                  </button>

                  {user && user._id === comment.user._id && editingId !== comment._id && (
                    <>
                      <button
                        onClick={() => { setEditingId(comment._id); setEditContent(comment.content); }}
                        className="text-xs text-gray-500 hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMut.mutate(comment._id)}
                        className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}

                  {user?.role === 'admin' && user._id !== comment.user._id && (
                    <button
                      onClick={() => deleteMut.mutate(comment._id)}
                      className="text-xs text-red-500 hover:text-red-400 transition-colors"
                    >
                      Admin Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {data?.comments?.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">No comments yet. Be the first!</p>
          )}
        </div>
      )}
    </div>
  );
}
