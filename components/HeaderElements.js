import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './Button';

export function HeaderElements() {
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
    <div className="fixed top-4 right-4 z-50 flex items-center space-x-4">
      <button
        onClick={toggleTheme}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </button>

      {session && (
        <div className="flex items-center space-x-3 bg-slate-900/50 backdrop-blur-sm rounded-lg px-3 py-2">
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
      )}
    </div>
  );
}

