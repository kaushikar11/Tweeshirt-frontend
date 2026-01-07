import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Check, Sparkles, Zap, Image as ImageIcon, Grid3x3, Trash2 } from 'lucide-react';
import { HeaderElements } from '../components/HeaderElements';
import { Button } from '../components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { PromptForm } from '../components/PromptForm';
import { Alert } from '../components/Alert';

export default function ImagePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { userName, userImage, email } = router.query;
  
  // All hooks must be called before any conditional returns
  const [image, setImage] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generationHistory, setGenerationHistory] = useState([]);
  const [userImages, setUserImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [deleting, setDeleting] = useState(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Fetch user images on mount
  useEffect(() => {
    const fetchUserImages = async () => {
      if (!session) return;
      
      const userIdentifier = 
        email || 
        session?.user?.email || 
        session?.user?.username || 
        session?.user?.id;
      
      if (!userIdentifier) return;

      setLoadingImages(true);
      try {
        const response = await fetch(`/api/getUserImages?email=${encodeURIComponent(userIdentifier)}`);
        const data = await response.json();
        if (data.success) {
          setUserImages(data.images || []);
        }
      } catch (error) {
        console.error('Error fetching user images:', error);
      } finally {
        setLoadingImages(false);
      }
    };

    if (status === 'authenticated' && session) {
      fetchUserImages();
    }
  }, [session, status, email]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (status === 'unauthenticated' || !session) {
    return null;
  }

  const generateImage = async ({ prompt, style, email: userEmail }) => {
    // Twitter doesn't provide email, so we use username or ID as identifier
    const userIdentifier = 
      userEmail || 
      email || 
      session?.user?.email || 
      session?.user?.username || 
      session?.user?.id || 
      `user_${Date.now()}`;
    
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    
    if (!session) {
      setError('Please ensure you are logged in.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generateImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, email: userIdentifier }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setImage(data.image_0);
        setTimestamp(data.timestamp);
        setPrompt(data.prompt || prompt);
        setGenerationHistory(prev => [{
          image: data.image_0,
          timestamp: data.timestamp,
          prompt: data.prompt,
          style: data.style,
          filename: data.filename,
        }, ...prev]);
        
        // Refresh user images after generation
        const userIdentifier = 
          userEmail || 
          email || 
          session?.user?.email || 
          session?.user?.username || 
          session?.user?.id;
        if (userIdentifier) {
          const refreshResponse = await fetch(`/api/getUserImages?email=${encodeURIComponent(userIdentifier)}`);
          const refreshData = await refreshResponse.json();
          if (refreshData.success) {
            setUserImages(refreshData.images || []);
          }
        }
      } else {
        setError(data.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred while generating the image');
    } finally {
      setLoading(false);
    }
  };

  const goToTshirtPage = (imageToUse = null) => {
    const imageToSend = imageToUse || selectedImage || image;
    if (!imageToSend) {
      alert('Please select an image before proceeding.');
      return;
    }
    router.push({
      pathname: '/App',
      query: {
        userName,
        userImage,
        email,
        selectedImage: imageToSend,
        prompt: prompt || 'Custom Design',
        timestamp: timestamp || new Date().toISOString(),
        selectedImageIndex: 1,
        image_0: imageToSend,
      },
    });
  };

  const handleDelete = async (imageId, filename) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      setDeleting(imageId);
      const userIdentifier = 
        email || 
        session?.user?.email || 
        session?.user?.username || 
        session?.user?.id;
      
      const response = await fetch('/api/deleteImage', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userIdentifier,
          imageId: imageId,
          filename: filename,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      // Remove from local state
      setUserImages((prev) => prev.filter((img) => img.id !== imageId));
      
      // If deleted image was selected, clear selection
      if (selectedImage && (userImages.find(img => img.id === imageId)?.url === selectedImage || userImages.find(img => img.id === imageId)?.image === selectedImage)) {
        setSelectedImage('');
        setImage('');
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      alert(err.message || 'Failed to delete image');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <Head>
        <title>Generate Design - Tweeshirt</title>
      </Head>

      <div className="min-h-screen relative">
        <HeaderElements />
        <main className="w-full flex flex-col items-center min-h-[calc(100vh-5rem)] py-12">
          <div className="w-full max-w-6xl px-6">
            <div className="w-full">
            <div className="mb-12 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/25">
                <Zap className="h-4 w-4" />
                Powered by nextgen AI models
              </div>
              <h1 className="font-display text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                Create Your Design
              </h1>
              <p className="mt-4 text-xl text-slate-300">
                Transform your ideas into stunning t-shirt designs
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowGallery(!showGallery)}
                  className="text-slate-300 hover:text-white hover:bg-white/10"
                >
                  <Grid3x3 className="mr-2 h-4 w-4" />
                  {showGallery ? 'Hide' : 'Show'} My Past Designs ({userImages.length})
                </Button>
              </div>
            </div>

            {error && (
              <div className="mb-6">
                <Alert variant="error" onDismiss={() => setError(null)}>
                  {error}
                </Alert>
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <PromptForm
                  onSubmit={generateImage}
                  loading={loading}
                  userEmail={email || session?.user?.email || session?.user?.username || session?.user?.id || ''}
                />
              </div>

              <div>
                {image && (
                  <Card className="bg-glass-dark border-violet-500/30">
                    <CardHeader>
                      <CardTitle className="font-display text-xl text-white">Your Generated Design</CardTitle>
                      <CardDescription className="text-slate-400">
                        Click to select this design for your t-shirt
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center">
                        <div
                          onClick={() => setSelectedImage(selectedImage === image ? '' : image)}
                          className={`relative cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                            selectedImage === image
                              ? 'border-blue-500 ring-4 ring-blue-500/30 shadow-2xl shadow-blue-500/20'
                              : 'border-slate-700 hover:border-violet-500/50'
                          }`}
                        >
                          <img
                            src={image && (image.startsWith('http') ? image : `data:image/png;base64,${image}`)}
                            alt="Generated design"
                            className="h-auto w-full max-w-md"
                          />
                          {selectedImage === image && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-primary/80 backdrop-blur-sm">
                              <div className="rounded-full bg-white p-3 shadow-xl">
                                <Check className="h-6 w-6 text-blue-600" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {loading && (
                  <Card className="bg-glass-dark border-violet-500/30">
                    <CardContent className="py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                        <p className="text-slate-300">Generating your design...</p>
                        <p className="mt-2 text-sm text-slate-500">This may take a moment</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!image && !loading && (
                  <Card className="bg-glass-dark border-violet-500/30">
                    <CardContent className="py-12 text-center">
                      <Sparkles className="mx-auto h-12 w-12 text-slate-600" />
                      <p className="mt-4 text-slate-400">Your generated designs will appear here</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* User Gallery - All Generated Images */}
            {showGallery && (
              <div className="mt-12">
                <Card className="bg-glass-dark border-violet-500/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-display text-2xl text-white">My Generated Designs</CardTitle>
                        <CardDescription className="text-slate-400">
                          Select any design to print on your t-shirt
                        </CardDescription>
                      </div>
                      {loadingImages && (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {userImages.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {userImages.map((item, idx) => {
                          const src = item.url || item.image || '';
                          return (
                            <Card
                              key={idx}
                              className={`bg-slate-800/50 border-slate-700/50 cursor-pointer transition-all hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 ${
                                selectedImage === src ? 'border-blue-500 ring-2 ring-blue-500/30' : ''
                              }`}
                              onClick={() => {
                                setImage(src);
                                setSelectedImage(src);
                                setTimestamp(item.timestamp);
                                setPrompt(item.prompt);
                              }}
                            >
                              <CardContent className="p-0">
                                <div className="relative">
                                  <img
                                    src={src}
                                    alt={item.prompt}
                                    className="h-48 w-full object-cover rounded-t-lg"
                                  />
                                  {selectedImage === src && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-primary/80 backdrop-blur-sm rounded-t-lg">
                                      <div className="rounded-full bg-white p-2 shadow-xl">
                                        <Check className="h-5 w-5 text-blue-600" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="p-4">
                                  <p className="text-sm text-slate-300 line-clamp-2 font-medium">{item.prompt}</p>
                                  <div className="mt-2 flex items-center justify-between gap-2">
                                    <span className="text-xs text-slate-500">{new Date(item.created).toLocaleDateString()}</span>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          goToTshirtPage(src);
                                        }}
                                        className="text-xs"
                                      >
                                        Order
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(item.id, item.filename || item.id);
                                        }}
                                        disabled={deleting === item.id}
                                        className="text-xs text-red-400 hover:text-red-300 hover:border-red-400"
                                      >
                                        {deleting === item.id ? (
                                          <div className="w-3 h-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent"></div>
                                        ) : (
                                          <Trash2 className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <ImageIcon className="mx-auto h-12 w-12 text-slate-600" />
                        <p className="mt-4 text-slate-400">No designs generated yet</p>
                        <p className="mt-2 text-sm text-slate-500">Create your first design above!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Generations (Session History) */}
            {generationHistory.length > 0 && !showGallery && (
              <div className="mt-12">
                <h2 className="mb-6 font-display text-2xl font-semibold text-white">Recent Generations</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {generationHistory.slice(0, 6).map((item, idx) => (
                    <Card
                      key={idx}
                      className="bg-glass-dark border-slate-700/50 cursor-pointer transition-all hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10"
                      onClick={() => {
                        setImage(item.image);
                        setSelectedImage(item.image);
                        setTimestamp(item.timestamp);
                      }}
                    >
                      <CardContent className="p-0">
                        <img
                          src={`data:image/png;base64,${item.image}`}
                          alt={item.prompt}
                          className="h-48 w-full object-cover rounded-t-lg"
                        />
                        <div className="p-4">
                          <p className="text-sm text-slate-400 line-clamp-2">{item.prompt}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-slate-500">{item.style}</span>
                            <span className="text-xs text-slate-600">•</span>
                            <span className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
