'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { getProductById } from '@/lib/api';
import { Product } from '@/types';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getProductById(id);
        if (data) {
          setProduct(data);
        } else {
          setError('Product not found or has been removed.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-neutral-400">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-3" />
        <p className="text-sm font-medium">Fetching product specifications...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-red-950 border border-red-800 text-red-400 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <p className="text-sm text-neutral-400">{error || 'Unable to retrieve product.'}</p>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 border border-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Products</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black font-headline text-white tracking-wide">
          EDIT PRODUCT SPECIFICATIONS
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Modifying live catalog entry for <strong className="text-white">"{product.title}"</strong>
        </p>
      </div>

      <ProductForm initialData={product} isEdit={true} />
    </div>
  );
}
