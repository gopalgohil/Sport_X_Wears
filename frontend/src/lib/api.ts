import { Product, Category, User, AuthResponse, Order } from '../types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface GetProductsParams {
  category?: string;
  size?: string;
  sort?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: Product[];
}

export interface CategoriesResponse {
  success: boolean;
  count: number;
  data: Category[];
}

export interface SingleProductResponse {
  success: boolean;
  data: Product;
}

/**
 * Fetch dynamic products with server-side filtering, searching, and sorting
 */
export async function getProducts(
  params: GetProductsParams = {}
): Promise<ProductsResponse> {
  const query = new URLSearchParams();

  if (params.category && params.category !== 'ALL GEAR') {
    query.set('category', params.category);
  }
  if (params.size && params.size !== 'ALL') {
    query.set('size', params.size);
  }
  if (params.sort) {
    query.set('sort', params.sort);
  }
  if (params.search) {
    query.set('search', params.search);
  }
  if (params.minPrice !== undefined) {
    query.set('minPrice', params.minPrice.toString());
  }
  if (params.maxPrice !== undefined) {
    query.set('maxPrice', params.maxPrice.toString());
  }
  if (params.page) {
    query.set('page', params.page.toString());
  }
  if (params.limit) {
    query.set('limit', params.limit.toString());
  }

  const url = `${API_BASE_URL}/products?${query.toString()}`;

  try {
    const res = await fetch(url, {
      cache: 'no-store', // Always fetch fresh inventory & pricing
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('[API getProducts Error]:', error);
    return {
      success: false,
      count: 0,
      total: 0,
      page: 1,
      totalPages: 0,
      data: [],
    };
  }
}

/**
 * Fetch all active categories from backend
 */
export async function getCategories(): Promise<CategoriesResponse> {
  const url = `${API_BASE_URL}/categories`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch categories: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('[API getCategories Error]:', error);
    return {
      success: false,
      count: 0,
      data: [],
    };
  }
}

/**
 * Fetch a single product by ID or Slug
 */
export async function getProductById(idOrSlug: string): Promise<Product | null> {
  const url = `${API_BASE_URL}/products/${idOrSlug}`;

  try {
    const res = await fetch(url, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const data: SingleProductResponse = await res.json();
    return data.data;
  } catch (error) {
    console.error(`[API getProductById Error for ${idOrSlug}]:`, error);
    return null;
  }
}

export interface CreateOrderPayload {
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: {
    product: string;
    title: string;
    size: string;
    quantity: number;
    priceAtPurchase: number;
    image?: string;
  }[];
  shippingAddress: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country?: string;
  };
  paymentMethod: 'cod' | 'upi' | 'card';
  transactionId?: string;
}

/**
 * Submit dynamic order to backend MongoDB Atlas (attaches JWT token if available)
 */
export async function createOrder(payload: CreateOrderPayload, token?: string | null) {
  const url = `${API_BASE_URL}/orders`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to place order');
  }

  return data;
}

/**
 * Fetch placed order by ID
 */
export async function getOrderById(orderId: string) {
  const url = `${API_BASE_URL}/orders/${orderId}`;

  const res = await fetch(url, {
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch order');
  }

  return data.data;
}

/**
 * Login user
 */
export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const url = `${API_BASE_URL}/auth/login`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Login failed. Please check your credentials.');
  }

  return data;
}

/**
 * Register new user (dispatches 6-digit OTP via Brevo)
 */
export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{ success: boolean; requiresVerification?: boolean; message: string; email?: string }> {
  const url = `${API_BASE_URL}/auth/register`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Registration failed.');
  }

  return data;
}

/**
 * Verify 6-digit OTP code & activate account
 */
export async function verifyEmailOtp(payload: {
  email: string;
  otp: string;
}): Promise<AuthResponse> {
  const url = `${API_BASE_URL}/auth/verify-otp`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'OTP verification failed.');
  }

  return data;
}

/**
 * Resend 6-digit verification code via Brevo
 */
export async function resendVerificationOtp(payload: {
  email: string;
}): Promise<{ success: boolean; message: string }> {
  const url = `${API_BASE_URL}/auth/resend-otp`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to resend verification code.');
  }

  return data;
}


/**
 * Fetch currently logged in user profile using token
 */
export async function getAuthMe(token: string): Promise<{ success: boolean; user: User }> {
  const url = `${API_BASE_URL}/auth/me`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to authenticate user.');
  }

  return data;
}

/**
 * Update authenticated user profile (name, phone, addresses)
 */
export async function updateUserProfile(
  token: string,
  payload: { name?: string; phone?: string; addresses?: any[] }
): Promise<{ success: boolean; user: User; message: string }> {
  const url = `${API_BASE_URL}/auth/update-profile`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update profile.');
  }

  return data;
}

/**
 * Fetch authenticated athlete's real order history
 */
export async function getMyOrders(
  token: string
): Promise<{ success: boolean; count: number; data: Order[] }> {
  const url = `${API_BASE_URL}/orders/my-orders`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch your orders.');
  }

  return data;
}



