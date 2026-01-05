import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Moon, Sun, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './Button';
import { cn } from '../lib/utils';

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme') || 'light';
    setTheme(stored);
    document.documentElement.classList.toggle('dark', stored === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!mounted) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push('/')}
              className="font-display text-xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent transition-all hover:scale-105"
            >
              Tweeshirt
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {session ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {session.user?.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="h-8 w-8 rounded-full border border-blue-500/50"
                    />
                  )}
                  <span className="hidden text-sm font-medium text-slate-300 sm:block">
                    {session.user?.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="text-slate-400 hover:text-slate-200 hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}
