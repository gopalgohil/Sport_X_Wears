export type AthleticSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  bannerImage?: string;
  description?: string;
  isActive: boolean;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  category: Category | string;
  description: string;
  price: number;
  discountPrice?: number;
  sizes: AthleticSize[];
  images: string[];
  stock: number;
  isActive: boolean;
  createdAt?: string;
  badge?: string;
  tech?: string;
  rating?: number;
  reviewsCount?: number;
}

export interface CartItem {
  id: string; // unique cart entry id (productId + size)
  product: Product;
  size: AthleticSize;
  quantity: number;
}
