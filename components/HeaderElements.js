import { useSession, signOut, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export function HeaderElements() {
  const { data: session } = useSession();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/40 backdrop-blur-2xl border-b border-white/5' 
          : 'bg-transparent'
      }`}
      style={{
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
      }}
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <img
              src="/new logos/transparent-logo.png"
              alt="Tweeshirt Logo"
              className="h-8 w-auto"
            />
            <span className="font-display text-xl font-semibold tracking-tight text-white/95">
              Tweeshirt
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-8">
            {session ? (
              <>
                <button
                  onClick={() => router.push('/image')}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => router.push('/gallery')}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  Gallery
                </button>
                <button
                  onClick={() => router.push('/orders')}
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  Orders
                </button>
                <div className="h-6 w-px bg-white/20" />
                <div className="flex items-center space-x-3">
                  {session.user?.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="h-8 w-8 rounded-full border border-white/20 object-cover"
                    />
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center space-x-1.5"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => {
                  sessionStorage.setItem('justLoggedIn', 'true');
                  signIn('twitter');
                }}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
