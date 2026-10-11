'use client';

import React from 'react';
import ProductForm from '@/components/admin/ProductForm';

export default function AddProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black font-headline text-white tracking-wide">
          CREATE ATHLETIC PRODUCT
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Add high-performance apparel with custom sizes, pricing, and high-res imagery.
        </p>
      </div>

      <ProductForm isEdit={false} />
    </div>
  );
}
