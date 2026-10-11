'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  Trash2,
  ShoppingBag,
  CheckCircle2,
  Clock,
  ExternalLink,
  Volume2,
  Sparkles,
  Wifi,
  WifiOff,
  Filter,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';

export default function AdminNotificationsPage() {
  const { user } = useAuth();
  const {
    connected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    requestNotificationPermission,
  } = useSocket();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'new_order' | 'order_status'>('all');

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.read;
    if (activeFilter === 'new_order') return item.type === 'new_order';
    if (activeFilter === 'order_status') return item.type === 'order_status';
    return true;
  });

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl sm:text-3xl font-black font-headline tracking-wide text-white uppercase">
              Live Alert Center
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                connected
                  ? 'bg-emerald-950/70 border-emerald-800 text-emerald-400'
                  : 'bg-amber-950/70 border-amber-800 text-amber-400'
              }`}
            >
              {connected ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <Wifi className="w-3 h-3" />
                  Socket.io Live
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  Connecting...
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Real-time WebSocket alerts triggered when customers place orders or status transitions occur.
          </p>
        </div>

        {/* Global Notification Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => requestNotificationPermission()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold hover:border-neutral-700 transition"
          >
            <Bell className="w-3.5 h-3.5 text-red-500" />
            <span>Enable Push</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-950/40"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={() => clearAll()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-red-400 text-xs font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Unread Alerts
          </span>
          <div className="text-2xl font-black font-headline text-red-500 flex items-center gap-2">
            <span>{unreadCount}</span>
            {unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            Total Broadcasts
          </span>
          <div className="text-2xl font-black font-headline text-white">
            {notifications.length}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
            WebSocket Channel
          </span>
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>admin-room: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'All Alerts', count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          {
            key: 'new_order',
            label: 'New Orders',
            count: notifications.filter((n) => n.type === 'new_order').length,
          },
          {
            key: 'order_status',
            label: 'Status Updates',
            count: notifications.filter((n) => n.type === 'order_status').length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeFilter === tab.key
                ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeFilter === tab.key ? 'bg-black/30 text-white' : 'bg-neutral-800 text-neutral-300'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notification Stream */}
      {filteredNotifications.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
          <Bell className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">All caught up!</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            No alerts matching your current filter. When a customer places a new order, you'll receive an instant chime and notification card here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const isNewOrder = notif.type === 'new_order';

            return (
              <div
                key={notif._id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all backdrop-blur-md relative overflow-hidden group ${
                  !notif.read
                    ? 'bg-neutral-900/90 border-red-500/40 shadow-lg shadow-red-950/10'
                    : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700'
                }`}
              >
                {!notif.read && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600" />
                )}

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Icon */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isNewOrder
                          ? 'bg-red-600/10 border-red-500/30 text-red-500'
                          : 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400'
                      }`}
                    >
                      {isNewOrder ? (
                        <ShoppingBag className="w-5 h-5" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-white font-headline tracking-wide">
                          {notif.title}
                        </h4>
                        {!notif.read && (
                          <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-800 text-red-400 text-[9px] font-bold uppercase tracking-wider">
                            New
                          </span>
                        )}
                        <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-300 mt-1 font-medium leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Meta badge tags */}
                      {notif.meta && (
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap text-[11px]">
                          {notif.meta.customerName && (
                            <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300">
                              Athlete: <strong className="text-white">{notif.meta.customerName}</strong>
                            </span>
                          )}
                          {notif.meta.totalAmount !== undefined && notif.meta.totalAmount > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-emerald-400 font-bold">
                              ₹{notif.meta.totalAmount.toLocaleString('en-IN')}
                            </span>
                          )}
                          {notif.meta.orderStatus && (
                            <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-400 uppercase font-mono text-[10px]">
                              Status: {notif.meta.orderStatus}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href="/admin/orders"
                      className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-semibold text-neutral-300 hover:text-white transition flex items-center gap-1.5"
                    >
                      <span>Orders</span>
                      <ArrowRight className="w-3 h-3 text-red-500" />
                    </Link>

                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif._id)}
                        title="Mark as read"
                        className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
