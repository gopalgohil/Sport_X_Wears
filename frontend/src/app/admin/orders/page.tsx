'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  AlertCircle,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  X,
} from 'lucide-react';
import { Order } from '@/types';
import { getAllOrdersAdmin, updateOrderStatusAdmin } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const STATUS_OPTIONS = ['all', 'processing', 'shipped', 'delivered', 'cancelled'] as const;

export default function AdminOrdersPage() {
  const { token } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getAllOrdersAdmin(
        {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery.trim() || undefined,
        },
        token
      );
      if (res?.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, token]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  // Status update handler
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatusAdmin(orderId, { orderStatus: newStatus }, token);
      setActionSuccess(`Order #${orderId.slice(-4).toUpperCase()} status updated to "${newStatus}"`);
      await fetchOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus as any } : null));
      }
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-headline text-white tracking-wide">
            CUSTOMER ORDERS
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Track, fulfill, and update athlete order statuses in real-time.
          </p>
        </div>

        <button
          onClick={() => fetchOrders()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl border border-neutral-800 text-sm font-semibold transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm font-medium flex items-center justify-between">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                statusFilter === status
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/50'
                  : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-red-500 text-sm"
          />
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-950 border-b border-neutral-800 text-[11px] uppercase tracking-wider font-bold text-neutral-400">
              <tr>
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-4">Customer</th>
                <th className="py-4 px-4">Items</th>
                <th className="py-4 px-4">Total</th>
                <th className="py-4 px-4">Payment</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-2" />
                    <p>Loading orders...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="font-semibold text-neutral-300">No orders found</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      No incoming customer orders matching this criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-neutral-800/40 transition-colors"
                  >
                    {/* Order ID & Date */}
                    <td className="py-4 px-6">
                      <p className="font-mono font-bold text-white">
                        #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-white leading-tight">
                        {order.customer?.name}
                      </p>
                      <p className="text-xs text-neutral-400 truncate max-w-[160px]">
                        {order.customer?.email}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {order.customer?.phone}
                      </p>
                    </td>

                    {/* Items */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-neutral-200">
                          {order.items?.length || 0}
                        </span>
                        <span className="text-xs text-neutral-500">item(s)</span>
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate max-w-[150px]">
                        {order.items?.[0]?.title}
                        {order.items?.length > 1 ? ` +${order.items.length - 1} more` : ''}
                      </p>
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-4 font-headline font-bold text-base text-emerald-400">
                      ₹{order.totalAmount}
                    </td>

                    {/* Payment Mode */}
                    <td className="py-4 px-4">
                      <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                        {order.paymentDetails?.method || 'COD'}
                      </span>
                      <p className="text-[11px] text-neutral-500 capitalize mt-0.5">
                        {order.paymentDetails?.status || 'pending'}
                      </p>
                    </td>

                    {/* Status Select Dropdown */}
                    <td className="py-4 px-4">
                      <select
                        disabled={updatingId === order._id}
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`text-xs font-bold uppercase rounded-lg px-2.5 py-1.5 border transition-all cursor-pointer ${
                          order.orderStatus === 'delivered'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            : order.orderStatus === 'shipped'
                            ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                            : order.orderStatus === 'cancelled'
                            ? 'bg-red-950/80 text-red-300 border-red-800'
                            : 'bg-amber-950/80 text-amber-300 border-amber-800'
                        }`}
                      >
                        <option value="processing" className="bg-neutral-900 text-white">
                          Processing
                        </option>
                        <option value="shipped" className="bg-neutral-900 text-white">
                          Shipped
                        </option>
                        <option value="delivered" className="bg-neutral-900 text-white">
                          Delivered
                        </option>
                        <option value="cancelled" className="bg-neutral-900 text-white">
                          Cancelled
                        </option>
                      </select>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-neutral-950 border border-neutral-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-xs uppercase font-bold text-red-500 tracking-wider">
                  Order Details
                </span>
                <h3 className="text-xl font-bold font-headline text-white">
                  #{selectedOrder._id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-neutral-400 hover:text-white rounded-xl bg-neutral-900 border border-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Info */}
              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Athlete Info
                </p>
                <p className="text-sm font-bold text-white">{selectedOrder.customer?.name}</p>
                <p className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-500" />
                  {selectedOrder.customer?.email}
                </p>
                <p className="text-xs text-neutral-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-500" />
                  {selectedOrder.customer?.phone}
                </p>
              </div>

              {/* Shipping Address */}
              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Shipping Address
                </p>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {selectedOrder.shippingAddress?.street},<br />
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state || ''} -{' '}
                  {selectedOrder.shippingAddress?.postalCode}<br />
                  {selectedOrder.shippingAddress?.country || 'India'}
                </p>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Purchased Gear ({selectedOrder.items?.length})
              </p>
              <div className="divide-y divide-neutral-800/60 rounded-2xl bg-neutral-900/90 border border-neutral-800 overflow-hidden">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-800"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-neutral-950 flex items-center justify-center text-xs font-bold text-neutral-500">
                          SX
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-white">{item.title}</p>
                        <p className="text-xs text-neutral-400">
                          Size: <span className="text-white font-bold">{item.size}</span> • Qty:{' '}
                          <span className="text-white font-bold">{item.quantity}</span>
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-white">
                      ₹{item.priceAtPurchase * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary & Status Row */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-400">Total Charged</p>
                <p className="text-2xl font-black font-headline text-emerald-400">
                  ₹{selectedOrder.totalAmount}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-neutral-400 mb-1">Status</p>
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-950 text-white border border-neutral-700 text-xs font-bold uppercase cursor-pointer"
                >
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
