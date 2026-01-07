import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { ShoppingBag, Loader, Package, Calendar, DollarSign, Truck } from 'lucide-react';
import { HeaderElements } from '../components/HeaderElements';
import { Alert } from '../components/Alert';

export default function OrderHistory() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user?.email) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/getOrders?email=${encodeURIComponent(session.user.email)}`);

        if (!response.ok) {
          // 404 or other error - just show empty
          if (response.status === 404) {
            setOrders([]);
            return;
          }
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err) {
        setError(err.message || 'Failed to load orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session?.user?.email]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-200 border-blue-500/30';
      case 'shipped':
        return 'bg-purple-500/20 text-purple-200 border-purple-500/30';
      case 'delivered':
        return 'bg-green-500/20 text-green-200 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-200 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-200 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Package size={16} />;
      case 'processing':
        return <Loader size={16} className="animate-spin" />;
      case 'shipped':
        return <Truck size={16} />;
      case 'delivered':
        return <Package size={16} />;
      default:
        return <ShoppingBag size={16} />;
    }
  };

  return (
    <>
      <Head>
        <title>Order History - Tweeshirt</title>
      </Head>

      <div className="min-h-screen relative">
        <HeaderElements />
        <div className="w-full flex flex-col items-center min-h-[calc(100vh-5rem)] py-12">
          <div className="w-full max-w-7xl px-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Order History</h1>
              <p className="text-gray-400">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </p>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Loader className="w-12 h-12 animate-spin text-violet-500 mx-auto mb-4" />
                  <p className="text-gray-400">Loading your orders...</p>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex items-center justify-center h-96 bg-slate-900/50 rounded-lg border border-violet-500/20">
                <div className="text-center">
                  <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">No orders yet</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Orders List */}
                <div className="lg:col-span-2 space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`cursor-pointer rounded-lg p-4 border-2 transition-all ${
                        selectedOrder?.id === order.id
                          ? 'border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/50'
                          : 'border-violet-500/20 bg-slate-900/50 hover:border-violet-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-400">Order ID</p>
                          <p className="text-lg font-semibold text-white font-mono">{order.id}</p>
                        </div>
                        <span
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Date</p>
                          <p className="text-white">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Total</p>
                          <p className="text-white font-semibold">${order.total?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Details Panel */}
                <div className="lg:col-span-1">
                  {selectedOrder ? (
                    <div className="bg-slate-900/50 rounded-lg border border-violet-500/20 p-6 sticky top-6">
                      <h2 className="text-lg font-semibold text-white mb-4">Order Details</h2>

                      <div className="space-y-4 mb-6">
                        {/* Order ID */}
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase mb-1">Order Number</p>
                          <p className="text-sm text-white font-mono break-all">{selectedOrder.id}</p>
                        </div>

                        {/* Status */}
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase mb-1">Status</p>
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border ${getStatusColor(
                              selectedOrder.status
                            )}`}
                          >
                            {getStatusIcon(selectedOrder.status)}
                            {selectedOrder.status}
                          </span>
                        </div>

                        {/* Date */}
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase mb-1">Order Date</p>
                          <div className="flex items-center gap-2 text-white">
                            <Calendar size={14} />
                            {new Date(selectedOrder.createdAt).toLocaleString()}
                          </div>
                        </div>

                        {/* Items */}
                        <div>
                          <p className="text-xs font-medium text-gray-400 uppercase mb-2">Items</p>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {selectedOrder.items?.map((item, idx) => (
                              <div
                                key={idx}
                                className="p-2 bg-slate-800/50 rounded border border-violet-500/10"
                              >
                                <p className="text-sm text-gray-300">{item.name}</p>
                                <p className="text-xs text-gray-500">
                                  {item.quantity}x @ ${item.price?.toFixed(2) || '0.00'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Address */}
                        {selectedOrder.shippingAddress && (
                          <div>
                            <p className="text-xs font-medium text-gray-400 uppercase mb-1">
                              Shipping Address
                            </p>
                            <p className="text-sm text-gray-300 whitespace-pre-wrap">
                              {selectedOrder.shippingAddress}
                            </p>
                          </div>
                        )}

                        {/* Total */}
                        <div className="pt-4 border-t border-violet-500/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-400">
                              <DollarSign size={16} />
                              <span className="text-sm">Total</span>
                            </div>
                            <p className="text-2xl font-bold text-violet-400">
                              ${selectedOrder.total?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {selectedOrder.status.toLowerCase() === 'shipped' && (
                        <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                          Track Shipment
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-900/50 rounded-lg border border-violet-500/20 p-6 h-full flex items-center justify-center">
                      <p className="text-gray-400 text-center">Select an order to view details</p>
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
