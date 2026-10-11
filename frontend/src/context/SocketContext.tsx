'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { NotificationItem } from '@/types';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
} from '@/lib/api';
import { Bell, ShoppingBag, CheckCircle2, X } from 'lucide-react';
import Link from 'next/link';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  latestAlert: NotificationItem | null;
  dismissLatestAlert: () => void;
  fetchNotificationsList: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
  requestNotificationPermission: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Synthesize pleasant athletic notification chime via Web Audio API (Zero external assets needed)
const playChimeSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5 note
    osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.12); // A5 note

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(987.77, now + 0.14); // B5 note
    osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.28); // E6 note

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.2);
    osc2.start(now + 0.14);
    osc2.stop(now + 0.45);
  } catch (e) {
    // Audio autoplay might be blocked prior to user interaction
  }
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestAlert, setLatestAlert] = useState<NotificationItem | null>(null);
  const alertTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Derive Socket server URL from NEXT_PUBLIC_API_URL or environment
  const getSocketUrl = () => {
    if (process.env.NEXT_PUBLIC_SOCKET_URL) {
      return process.env.NEXT_PUBLIC_SOCKET_URL;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    return apiUrl.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
  };

  // Fetch persistent notifications from DB
  const fetchNotificationsList = useCallback(async () => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const res = await getNotifications(token);
      if (res?.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Could not fetch notifications:', err);
    }
  }, [token]);

  // Auto sync: ensures notifications update live on mobile without manual page refresh
  useEffect(() => {
    fetchNotificationsList();

    // 1. Silent sync interval (every 15 seconds)
    const interval = setInterval(() => {
      fetchNotificationsList();
    }, 15000);

    // 2. Immediate sync when user unlocks mobile or switches back to browser tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotificationsList();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchNotificationsList]);

  // Request browser desktop / mobile push notification permissions
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  // Dispatch browser / OS push notification
  const triggerBrowserPush = (title: string, body: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
          });
        } catch (e) {
          // Push notifications in mobile browser
        }
      }
    }
  };

  // Handle incoming notification
  const handleIncomingNotification = useCallback(
    (notif: NotificationItem) => {
      // 1. Play audio chime
      playChimeSound();

      // 2. Trigger native OS / Mobile push notification
      triggerBrowserPush(notif.title, notif.message);

      // 3. Update state
      setNotifications((prev) => [notif, ...prev.filter((n) => n._id !== notif._id)]);
      setUnreadCount((prev) => prev + 1);

      // 4. Show live floating alert banner
      setLatestAlert(notif);
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      alertTimerRef.current = setTimeout(() => {
        setLatestAlert(null);
      }, 7000);
    },
    []
  );

  // Initialize Socket.io connection
  useEffect(() => {
    const socketUrl = getSocketUrl();
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 20,
      reconnectionDelay: 1500,
    });

    newSocket.on('connect', () => {
      setConnected(true);

      // Join respective rooms based on authenticated role
      if (user?.role === 'admin') {
        newSocket.emit('join_admin_room');
      }
      if (user?._id) {
        newSocket.emit('join_user_room', user._id);
      }
      if (user?.email) {
        newSocket.emit('join_user_room', user.email.toLowerCase());
      }
    });

    newSocket.on('reconnect', () => {
      setConnected(true);
      if (user?.role === 'admin') newSocket.emit('join_admin_room');
      if (user?._id) newSocket.emit('join_user_room', user._id);
      if (user?.email) newSocket.emit('join_user_room', user.email.toLowerCase());
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    // Listen to admin new order events
    newSocket.on('new_order_notification', (data: NotificationItem) => {
      handleIncomingNotification(data);
    });

    // Listen to customer & admin order lifecycle updates
    newSocket.on('order_status_notification', (data: NotificationItem) => {
      handleIncomingNotification(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [handleIncomingNotification]);

  // Ensure rooms are joined whenever authenticated user details load or change
  useEffect(() => {
    if (!socket || !connected) return;

    if (user?.role === 'admin') {
      socket.emit('join_admin_room');
    }
    if (user?._id) {
      socket.emit('join_user_room', user._id);
    }
    if (user?.email) {
      socket.emit('join_user_room', user.email.toLowerCase());
    }
  }, [socket, connected, user?._id, user?.role, user?.email]);

  // Dismiss floating banner
  const dismissLatestAlert = () => {
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setLatestAlert(null);
  };

  // Mark single notification read
  const markAsRead = async (id: string) => {
    try {
      await markNotificationRead(id, token);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.error(e);
    }
  };

  // Mark all read
  const markAllAsRead = async () => {
    try {
      await markAllNotificationsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  // Clear all
  const clearAll = async () => {
    try {
      await clearAllNotifications(token);
      setNotifications([]);
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        notifications,
        unreadCount,
        latestAlert,
        dismissLatestAlert,
        fetchNotificationsList,
        markAsRead,
        markAllAsRead,
        clearAll,
        requestNotificationPermission,
      }}
    >
      {children}

      {/* Real-time Floating Notification Banner (Mobile & Desktop) */}
      {latestAlert && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="p-4 rounded-2xl bg-neutral-900/95 border-2 border-red-500/80 shadow-[0_10px_35px_rgba(239,68,68,0.25)] backdrop-blur-xl text-white relative">
            <button
              onClick={dismissLatestAlert}
              className="absolute top-3 right-3 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 pr-6">
              <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500 text-red-500 flex items-center justify-center shrink-0">
                {latestAlert.type === 'new_order' ? (
                  <ShoppingBag className="w-5 h-5 animate-bounce" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                  <h4 className="text-xs font-bold font-headline uppercase tracking-wider text-red-400">
                    {latestAlert.title}
                  </h4>
                </div>
                <p className="text-xs text-neutral-200 mt-1 font-medium leading-snug">
                  {latestAlert.message}
                </p>

                <div className="mt-3 flex items-center gap-3">
                  {user?.role === 'admin' ? (
                    <Link
                      href="/admin/orders"
                      onClick={dismissLatestAlert}
                      className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition shadow-sm"
                    >
                      View in Orders
                    </Link>
                  ) : (
                    <Link
                      href="/orders"
                      onClick={dismissLatestAlert}
                      className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition shadow-sm"
                    >
                      Track Order
                    </Link>
                  )}

                  <button
                    onClick={dismissLatestAlert}
                    className="text-[11px] text-neutral-400 hover:text-neutral-200 font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
