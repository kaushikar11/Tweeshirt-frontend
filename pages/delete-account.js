import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
// Sidebar is provided globally in _app.js
import { Alert } from '../components/Alert';

export default function DeleteAccount() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleDeleteAccount = async () => {
    if (!confirmDelete || confirmEmail !== session?.user?.email) {
      setError('Please confirm your email to proceed');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/user/deleteAccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session?.user?.email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Sign out and redirect
      await signOut({ redirect: false });
      router.push('/');
    } catch (err) {
      setError(err.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Delete Account - Tweeshirt</title>
      </Head>

      <div className="flex h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
        <div className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto p-6 md:p-8">
            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft size={20} />
              Back
            </button>

            <div className="bg-red-950/50 rounded-lg p-8 border-2 border-red-500/50">
              <div className="flex items-start gap-4 mb-6">
                <AlertTriangle className="text-red-500 flex-shrink-0 mt-1" size={32} />
                <div>
                  <h1 className="text-3xl font-bold text-red-400 mb-2">Delete Your Account</h1>
                  <p className="text-gray-300">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>
              </div>

              {error && <Alert type="error" message={error} onClose={() => setError('')} />}

              {/* Warning List */}
              <div className="bg-red-950/30 rounded-lg p-4 mb-6 border border-red-500/30">
                <h3 className="font-semibold text-red-300 mb-3">What will be deleted:</h3>
                <ul className="space-y-2 text-sm text-red-200">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    All your generated images
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Your profile and account information
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Your order history
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    All associated data from our system
                  </li>
                </ul>
              </div>

              {/* Confirmation */}
              <div className="space-y-4 mb-6">
                <p className="text-gray-300 font-medium">
                  To confirm, please type your email address:
                </p>

                <input
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder={session?.user?.email}
                  className="w-full px-4 py-2 bg-slate-800 border border-red-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors"
                />

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmDelete}
                    onChange={(e) => setConfirmDelete(e.target.checked)}
                    className="w-4 h-4 accent-red-500"
                  />
                  <span className="text-sm text-gray-300">
                    I understand that this action is irreversible and all my data will be deleted
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={
                    loading ||
                    !confirmDelete ||
                    confirmEmail !== session?.user?.email
                  }
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg transition-colors font-medium"
                >
                  {loading ? 'Deleting Account...' : 'Delete My Account'}
                </button>

                <button
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
