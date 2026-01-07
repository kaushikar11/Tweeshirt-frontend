import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Twitter, Sparkles } from 'lucide-react';
import { HeaderElements } from '../components/HeaderElements';
import { Button } from '../components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { Alert } from '../components/Alert';

export default function Home() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const { error: urlError } = router.query;
    
    if (urlError) {
      let errorMessage = 'Failed to sign in with Twitter.';
      
      switch(urlError) {
        case 'OAuthSignin':
          errorMessage = 'Error in OAuth sign in process. Please verify your Twitter app credentials.';
          break;
        case 'OAuthCallback':
          errorMessage = 'Error in OAuth callback. Please check your callback URL configuration.';
          break;
        case 'OAuthCreateAccount':
          errorMessage = 'Could not create OAuth account.';
          break;
        case 'OAuthAccountNotLinked':
          errorMessage = 'OAuth account is not linked.';
          break;
        case 'Configuration':
          errorMessage = 'There is a problem with the server configuration.';
          break;
        default:
          errorMessage = 'An error occurred during authentication.';
      }
      
      setError(errorMessage);
      
      const newQuery = { ...router.query };
      delete newQuery.error;
      delete newQuery.callbackUrl;
      router.replace({ pathname: router.pathname, query: newQuery }, undefined, { shallow: true });
    }
  }, [router.query, router]);

  // Show welcome message only immediately after login
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const justLoggedIn = sessionStorage.getItem('justLoggedIn');
      if (justLoggedIn === 'true') {
        setShowWelcome(true);
        sessionStorage.removeItem('justLoggedIn');
        // Auto-redirect to image page after 2 seconds
        setTimeout(() => {
          router.push({
            pathname: '/image',
            query: {
              userName: session.user.name,
              userImage: session.user.image,
              email: session.user.email,
            },
          });
        }, 2000);
      } else {
        // Redirect to image page if already logged in
        router.push({
          pathname: '/image',
          query: {
            userName: session.user.name,
            userImage: session.user.image,
            email: session.user.email,
          },
        });
      }
    }
  }, [status, session, router]);

  const goToImagePage = () => {
    router.push({
      pathname: '/image',
      query: {
        userName: session.user.name,
        userImage: session.user.image,
        email: session.user.email,
      },
    });
  };

  // If logged in and not showing welcome, show loading (will redirect)
  if (status === 'authenticated' && session && !showWelcome) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Tweeshirt - Turn Tweets into T-Shirts</title>
        <meta name="description" content="Transform your favorite tweets into custom t-shirts" />
      </Head>

      <div className="min-h-screen relative">
        <HeaderElements />
        <main className="w-full flex items-center justify-center min-h-[calc(100vh-5rem)]">
          {session && showWelcome ? (
            <div className="w-full max-w-2xl px-6">
              <Card className="bg-black/40 backdrop-blur-2xl border border-white/10 text-center">
                <CardHeader>
                  <div className="mx-auto mb-6 h-24 w-24 overflow-hidden rounded-full border-2 border-white/20 shadow-2xl">
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardTitle className="font-display text-3xl text-white mb-2">
                    Welcome back, {session.user.name}!
                  </CardTitle>
                  <CardDescription className="text-slate-300 text-lg">
                    Ready to turn your tweets into t-shirts?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <Button
                    size="lg"
                    onClick={goToImagePage}
                    className="w-full bg-white text-black hover:bg-white/90"
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => signIn('twitter')}
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    Switch Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : !session && (
            <div className="w-full max-w-6xl px-6 py-20">
              <div className="text-center">
                <div className="mb-12 flex justify-center">
                  <div className="rounded-3xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 p-6 backdrop-blur-xl border border-white/10 shadow-2xl">
                    <img
                      src="/new logos/transparent-logo.png"
                      alt="Tweeshirt Logo"
                      className="h-16 w-auto mx-auto"
                    />
                  </div>
                </div>
                
                <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-bold tracking-tight text-white mb-6">
                  Turn Tweets into
                  <span className="block bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent mt-2">T-Shirts</span>
                </h1>
                
                <p className="mx-auto mt-8 max-w-2xl text-2xl leading-relaxed text-slate-300 font-light">
                  Powered by nextgen AI models. Transform your favorite tweets into custom t-shirts.
                </p>

                {error && (
                  <div className="mx-auto mt-8 max-w-md">
                    <Alert variant="error" onDismiss={() => setError(null)}>
                      {error}
                    </Alert>
                  </div>
                )}

                <div className="mt-12 flex items-center justify-center">
                  <Button
                    size="lg"
                    onClick={() => {
                      setError(null);
                      // Check if user is already authenticated
                      if (status === 'authenticated' && session) {
                        // Already logged in, redirect to image page
                        router.push({
                          pathname: '/image',
                          query: {
                            userName: session.user.name,
                            userImage: session.user.image,
                            email: session.user.email,
                          },
                        });
                      } else {
                        // Not logged in, proceed with Twitter sign in
                        sessionStorage.setItem('justLoggedIn', 'true');
                        signIn('twitter');
                      }
                    }}
                    className="group bg-white text-black hover:bg-white/90 px-8 py-4 text-lg"
                  >
                    <Twitter className="mr-2 h-5 w-5" />
                    {status === 'authenticated' && session ? 'Go to Dashboard' : 'Sign in with Twitter'}
                  </Button>
                </div>

                <div className="mt-24 grid grid-cols-1 gap-12 sm:grid-cols-3">
                  <div className="text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                      <img
                        src="/new logos/transparent-logo.png"
                        alt="Tweeshirt"
                        className="h-10 w-auto"
                      />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-white mb-3">AI-Powered</h3>
                    <p className="text-base text-slate-300 leading-relaxed">
                      Advanced AI generates unique designs from your tweets
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                      <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-white mb-3">Fast & Simple</h3>
                    <p className="text-base text-slate-300 leading-relaxed">
                      From tweet to t-shirt in minutes, not days
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                      <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-white mb-3">Premium Quality</h3>
                    <p className="text-base text-slate-300 leading-relaxed">
                      High-quality prints on comfortable, durable fabric
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
