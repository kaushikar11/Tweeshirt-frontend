import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Shield, AlertTriangle } from 'lucide-react';
import { HeaderElements } from '../components/HeaderElements';
import { Alert } from '../components/Alert';

export default function Settings() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleChangePassword = () => {
    setError('Password change functionality coming soon');
  };

  const handleDeleteAccount = () => {
    router.push('/delete-account');
  };

  return (
    <>
      <Head>
        <title>Account Settings - Tweeshirt</title>
      </Head>

      <div className="min-h-screen relative">
        <HeaderElements />
        <div className="w-full flex flex-col items-center min-h-[calc(100vh-5rem)] py-12">
          <div className="w-full max-w-2xl px-6">
            <h1 className="text-4xl font-bold text-white mb-8">Account Settings</h1>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

            {/* Security Section removed (no password change UI) */}

            {/* Danger Zone */}
            <div className="bg-red-950/30 rounded-lg p-6 border border-red-500/30">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-500" size={24} />
                <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
              </div>

              <p className="text-gray-300 text-sm mb-4">
                These actions are irreversible. Please proceed with caution.
              </p>

              <button
                onClick={handleDeleteAccount}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
