'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/favorites', label: 'Favorites' },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-dark-800/90 backdrop-blur-md border-b border-dark-600">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-accent">Anime</span>AClaude
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-white',
                pathname === link.href ? 'text-white' : 'text-gray-400'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              {user.role === 'admin' && (
                <Link href="/admin" className="text-xs text-accent font-medium px-3 py-1 rounded-full border border-accent/30">
                  Admin
                </Link>
              )}
              <Link
                href={`/profile/${user.username}`}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    user.username[0].toUpperCase()
                  )}
                </div>
                <span className="hidden sm:block text-sm text-gray-300">{user.username}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
                Login
              </Link>
              <Link
                href="/register"
                className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
