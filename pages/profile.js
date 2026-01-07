import { useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Upload, Save, X, AlertCircle } from 'lucide-react';
import { HeaderElements } from '../components/HeaderElements';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';

export default function Profile() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
  });
  const [profileImage, setProfileImage] = useState(session?.user?.image || '');
  const [imagePreview, setImagePreview] = useState(session?.user?.image || '');

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setProfileImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        name: formData.name,
        email: session?.user?.email,
      };

      // If image was changed, include it
      if (typeof profileImage !== 'string') {
        updateData.image = imagePreview; // base64 encoded
      }

      const response = await fetch('/api/user/updateProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess('Profile updated successfully!');
      // Refresh session data
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Profile - Tweeshirt</title>
      </Head>

      <div className="min-h-screen relative">
        <HeaderElements />
        <div className="w-full flex flex-col items-center min-h-[calc(100vh-5rem)] py-12">
          <div className="w-full max-w-2xl px-6">
            <h1 className="text-4xl font-bold text-white mb-8">Profile Settings</h1>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Picture Section */}
              <div className="bg-slate-900/50 rounded-lg p-6 border border-violet-500/20">
                <h2 className="text-xl font-semibold text-white mb-4">Profile Picture</h2>

                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Image Preview */}
                  <div className="flex-shrink-0">
                    <div className="relative w-32 h-32 rounded-full border-4 border-violet-500 overflow-hidden bg-slate-800">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="flex flex-col justify-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                    >
                      <Upload size={18} />
                      Change Picture
                    </button>
                    {imagePreview && typeof profileImage !== 'string' && (
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(session?.user?.image || '');
                          setProfileImage(session?.user?.image || '');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                      >
                        <X size={18} />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name Section */}
              <div className="bg-slate-900/50 rounded-lg p-6 border border-violet-500/20">
                <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className="w-full px-4 py-2 bg-slate-800 border border-violet-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email (Cannot be changed)
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={session?.user?.email || ''}
                      disabled
                      className="w-full px-4 py-2 bg-slate-800/50 border border-violet-500/20 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white rounded-lg transition-colors font-medium"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
