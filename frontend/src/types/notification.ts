export interface NotificationItem {
  _id: string;
  recipient?: string | null;
  recipientRole: 'admin' | 'customer' | 'all';
  title: string;
  message: string;
  type: 'new_order' | 'order_status' | 'customer_registered' | 'system';
  order?: string | null;
  read: boolean;
  meta?: {
    customerName?: string;
    customerEmail?: string;
    totalAmount?: number;
    orderStatus?: string;
    itemsCount?: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationsResponse {
  success: boolean;
  unreadCount: number;
  count: number;
  data: NotificationItem[];
}
