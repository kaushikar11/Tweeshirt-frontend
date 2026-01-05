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
  const { data: session } = useSession();

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

  return (
    <>
      <Head>
        <title>Tweeshirt - Turn Tweets into T-Shirts</title>
        <meta name="description" content="Transform your favorite tweets into custom t-shirts" />
      </Head>

      <div 
        className="min-h-screen relative"
        style={{
          background: 'transparent',
        }}
      >
        <HeaderElements />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {session ? (
            <div className="mx-auto max-w-2xl py-16 sm:py-24">
              <Card className="bg-glass-dark border-violet-500/30 text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-blue-500/50 shadow-lg">
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardTitle className="font-display text-2xl text-white">
                    Welcome back, {session.user.name}!
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Ready to turn your tweets into t-shirts?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    size="lg"
                    onClick={goToImagePage}
                    className="w-full"
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => signIn('twitter')}
                    className="w-full"
                  >
                    Switch Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl py-16 sm:py-24">
              <div className="text-center">
                <div className="mb-8 flex justify-center">
                  <div className="rounded-2xl bg-gradient-primary p-4 shadow-2xl shadow-blue-500/30">
                    <Sparkles className="h-12 w-12 text-white" />
                  </div>
                </div>
                
                <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
                  Turn Tweets into
                  <span className="block bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">T-Shirts</span>
                </h1>
                
                <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-slate-300">
                  Transform your favorite tweets into custom, wearable art. Simple, fast, and delightful.
                </p>

                {error && (
                  <div className="mx-auto mt-8 max-w-md">
                    <Alert variant="error" onDismiss={() => setError(null)}>
                      {error}
                    </Alert>
                  </div>
                )}

                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Button
                    size="lg"
                    onClick={() => {
                      setError(null);
                      signIn('twitter');
                    }}
                    className="group"
                  >
                    <Twitter className="mr-2 h-5 w-5" />
                    Sign in with Twitter
                  </Button>
                </div>

                <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary shadow-lg shadow-blue-500/25">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-white">AI-Powered</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      Advanced AI generates unique designs from your tweets
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary shadow-lg shadow-blue-500/25">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-white">Fast & Simple</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      From tweet to t-shirt in minutes, not days
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary shadow-lg shadow-blue-500/25">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-white">Premium Quality</h3>
                    <p className="mt-2 text-sm text-slate-400">
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
