import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Download, Trash2, ExternalLink, Loader, ShoppingBag } from 'lucide-react';
import { HeaderElements } from '../components/HeaderElements';
import { Alert } from '../components/Alert';

export default function Gallery() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Fetch user images
  useEffect(() => {
    const fetchImages = async () => {
      if (!session?.user?.email) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/getUserImages?email=${encodeURIComponent(session.user.email)}`);

        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }

        const data = await response.json();
        setImages(data.images || []);
      } catch (err) {
        setError(err.message || 'Failed to load images');
        console.error('Error fetching images:', err);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated' && session) {
      fetchImages();
    }
  }, [session?.user?.email, status, session]);

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  const handleDownload = async (imageUrl, filename) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'image.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download image');
    }
  };

  const handleDelete = async (imageId, filename) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      setDeleting(imageId);
      const response = await fetch('/api/deleteImage', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session?.user?.email,
          filename,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      setImages((prev) => prev.filter((img) => img.id !== imageId));
      setSelectedImage(null);
    } catch (err) {
      setError(err.message || 'Failed to delete image');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <Head>
        <title>My Work - Tweeshirt</title>
      </Head>

      <div className="min-h-screen relative">
        <HeaderElements />
        <div className="w-full flex flex-col items-center min-h-[calc(100vh-5rem)] py-12">
          <div className="w-full max-w-7xl px-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">My Work</h1>
              <p className="text-gray-400">
                {images.length} {images.length === 1 ? 'image' : 'images'} created
              </p>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Loader className="w-12 h-12 animate-spin text-violet-500 mx-auto mb-4" />
                  <p className="text-gray-400">Loading your images...</p>
                </div>
              </div>
            ) : images.length === 0 ? (
              <div className="flex items-center justify-center h-96 bg-slate-900/50 rounded-lg border border-violet-500/20">
                <div className="text-center">
                  <p className="text-gray-400 mb-4">No images created yet</p>
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                  >
                    Create Your First Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Images Grid */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        onClick={() => setSelectedImage(image)}
                        className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage?.id === image.id
                            ? 'border-violet-500 ring-2 ring-violet-500/50'
                            : 'border-violet-500/20 hover:border-violet-500/50'
                        }`}
                      >
                        <div className="aspect-square bg-slate-800 relative group">
                          {image.url ? (
                            <img
                              src={image.url}
                              alt={image.prompt}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No image
                            </div>
                          )}

                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push({
                                  pathname: '/App',
                                  query: {
                                    userName: session?.user?.name,
                                    userImage: session?.user?.image,
                                    email: session?.user?.email,
                                    selectedImage: image.image || image.url,
                                    prompt: image.prompt || 'Custom Design',
                                    timestamp: image.timestamp || new Date().toISOString(),
                                    selectedImageIndex: 1,
                                    image_0: image.image || image.url,
                                  },
                                });
                              }}
                              className="p-2.5 bg-white text-black hover:bg-white/90 rounded-lg transition-colors shadow-lg"
                              title="Order this design"
                            >
                              <ShoppingBag size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(image.url, image.filename);
                              }}
                              className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                              title="Download image"
                            >
                              <Download size={18} />
                            </button>
                            <a
                              href={image.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                              title="View full size"
                            >
                              <ExternalLink size={18} />
                            </a>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-3 bg-slate-800/50 border-t border-violet-500/20">
                          <p className="text-sm text-gray-300 line-clamp-2">{image.prompt}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(image.created).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details Panel */}
                <div className="lg:col-span-1">
                  {selectedImage ? (
                    <div className="bg-slate-900/50 rounded-lg border border-violet-500/20 p-6 sticky top-6">
                      <h2 className="text-lg font-semibold text-white mb-4">Image Details</h2>

                      <div className="space-y-4 mb-6">
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase mb-1">Original Prompt</p>
                          <p className="text-sm text-gray-200 break-words">{selectedImage.prompt}</p>
                        </div>

                        {selectedImage.enhancedPrompt && (
                          <div>
                            <p className="text-xs font-medium text-gray-400 uppercase mb-1">Enhanced Prompt</p>
                            <p className="text-sm text-gray-300 break-words">{selectedImage.enhancedPrompt}</p>
                          </div>
                        )}

                        {selectedImage.style && (
                          <div>
                            <p className="text-xs font-medium text-gray-400 uppercase mb-1">Style</p>
                            <span className="inline-block px-3 py-1 bg-violet-500/20 border border-violet-500/50 text-violet-200 text-xs rounded-full">
                              {selectedImage.style}
                            </span>
                          </div>
                        )}

                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase mb-1">Created</p>
                          <p className="text-sm text-gray-300">
                            {new Date(selectedImage.created).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            router.push({
                              pathname: '/App',
                              query: {
                                userName: session?.user?.name,
                                userImage: session?.user?.image,
                                email: session?.user?.email,
                                selectedImage: selectedImage.image || selectedImage.url,
                                prompt: selectedImage.prompt || 'Custom Design',
                                timestamp: selectedImage.timestamp || new Date().toISOString(),
                                selectedImageIndex: 1,
                                image_0: selectedImage.image || selectedImage.url,
                              },
                            });
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black hover:bg-white/90 rounded-lg transition-colors font-medium"
                        >
                          <ShoppingBag size={16} />
                          Order This Design
                        </button>

                        <a
                          href={selectedImage.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                          <ExternalLink size={16} />
                          View Full Size
                        </a>

                        <button
                          onClick={() => handleDownload(selectedImage.url, selectedImage.filename)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                        >
                          <Download size={16} />
                          Download
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(selectedImage.id, selectedImage.filename)
                          }
                          disabled={deleting === selectedImage.id}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg transition-colors"
                        >
                          {deleting === selectedImage.id ? (
                            <>
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 size={16} />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900/50 rounded-lg border border-violet-500/20 p-6 h-full flex items-center justify-center">
                      <p className="text-gray-400 text-center">Select an image to view details</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
