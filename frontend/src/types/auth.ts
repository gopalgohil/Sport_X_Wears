export interface Address {
  _id?: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
  addressType?: 'home' | 'work' | string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  addresses?: Address[];
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface OrderItem {
  _id?: string;
  product: {
    _id: string;
    title: string;
    slug?: string;
    images?: string[];
  } | string;
  title: string;
  size: string;
  quantity: number;
  priceAtPurchase: number;
  image?: string;
}

export interface Order {
  _id: string;
  user?: string | null;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country?: string;
  };
  paymentDetails: {
    method: 'cod' | 'upi' | 'card' | 'stripe' | 'paypal';
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    transactionId?: string | null;
  };
  totalAmount: number;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

