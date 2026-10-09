'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product, AthleticSize } from '../../types';
import { ProductCard } from './ProductCard';
import { Modal } from '../common/Modal';
import { SizeSelector } from './SizeSelector';
import { formatPrice, getDiscountPercentage } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { Star, ShieldCheck, Zap, ShoppingBag } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const { addToCart } = useCart();
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [modalSize, setModalSize] = useState<AthleticSize>('L');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleOpenQuickView = (product: Product) => {
    setActiveModalProduct(product);
    setModalSize(product.sizes[0] || 'L');
    setSelectedImageIndex(0);
  };

  const handleCloseQuickView = () => {
    setActiveModalProduct(null);
  };

  const handleModalAddToCart = () => {
    if (activeModalProduct) {
      addToCart(activeModalProduct, modalSize, 1);
      handleCloseQuickView();
    }
  };

  if (products.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-neutral-300 bg-neutral-50/50">
        <h3 className="font-headline text-2xl font-bold uppercase text-neutral-800">
          NO ATHLETIC GEAR FOUND
        </h3>
        <p className="text-sm text-neutral-500 mt-2">
          Try adjusting your filter selection or view all products.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Responsive Grid: 2 col on mobile, 4 col on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onQuickView={handleOpenQuickView}
          />
        ))}
      </div>

      {/* Interactive PDP Quick-View Modal */}
      {activeModalProduct && (
        <Modal
          isOpen={!!activeModalProduct}
          onClose={handleCloseQuickView}
          title="ATHLETIC SPECIFICATION PREVIEW"
          maxWidth="4xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left: Gallery & Main Image */}
            <div className="space-y-4">
              <div className="relative aspect-[3/4] w-full bg-neutral-100 overflow-hidden border border-neutral-200">
                <Image
                  src={
                    activeModalProduct.images[selectedImageIndex] ||
                    activeModalProduct.images[0]
                  }
                  alt={activeModalProduct.title}
                  fill
                  className="object-cover object-center"
                />
                {activeModalProduct.badge && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white font-headline text-xs font-black uppercase px-2.5 py-1">
                    {activeModalProduct.badge}
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {activeModalProduct.images.length > 1 && (
                <div className="flex gap-2">
                  {activeModalProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-20 border-2 overflow-hidden cursor-pointer ${
                        selectedImageIndex === idx
                          ? 'border-red-600'
                          : 'border-neutral-200 hover:border-neutral-400'
                      }`}
                    >
                      <Image
                        src={img}
                        alt="Thumbnail"
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Specifications & Add to Cart */}
            <div className="space-y-6">
              <div>
                <span className="font-headline text-xs font-bold uppercase tracking-widest text-neutral-400">
                  {typeof activeModalProduct.category === 'object'
                    ? activeModalProduct.category.name
                    : activeModalProduct.category}
                </span>
                <h2 className="font-headline text-3xl font-extrabold uppercase tracking-tight text-neutral-950 mt-1">
                  {activeModalProduct.title}
                </h2>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-neutral-700">
                    4.9★ (248 Verified Reviews)
                  </span>
                </div>

                {/* Pricing */}
                <div className="flex items-baseline gap-3 mt-4">
                  <span className="font-headline text-3xl font-black text-neutral-950">
                    {formatPrice(
                      activeModalProduct.discountPrice || activeModalProduct.price
                    )}
                  </span>
                  {activeModalProduct.discountPrice && (
                    <span className="font-headline text-lg font-bold text-neutral-400 line-through">
                      {formatPrice(activeModalProduct.price)}
                    </span>
                  )}
                  {getDiscountPercentage(
                    activeModalProduct.price,
                    activeModalProduct.discountPrice
                  ) > 0 && (
                    <span className="bg-red-600 text-white font-headline text-xs font-black uppercase px-2 py-0.5">
                      20% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Urgency */}
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-red-600 bg-red-50 border border-red-200 p-2.5">
                <Zap className="w-4 h-4 shrink-0 fill-red-600" />
                <span>
                  🔥 ONLY {activeModalProduct.stock || 5} LEFT IN STOCK - READY FOR IMMEDIATE DISPATCH
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-neutral-600 leading-relaxed">
                {activeModalProduct.description}
              </p>

              {/* Size Selector */}
              <SizeSelector
                availableSizes={activeModalProduct.sizes}
                selectedSize={modalSize}
                onSelectSize={setModalSize}
              />

              {/* Add to Bag CTA */}
              <button
                onClick={handleModalAddToCart}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-headline text-base font-extrabold tracking-wider uppercase py-4 flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" /> ADD TO BAG —{' '}
                {formatPrice(
                  activeModalProduct.discountPrice || activeModalProduct.price
                )}
              </button>

              {/* Fabric Details Accordion / Specs */}
              <div className="border-t border-neutral-200 pt-4 space-y-2 text-xs text-neutral-600">
                <div className="flex items-center gap-2 font-bold text-neutral-900 uppercase">
                  <ShieldCheck className="w-4 h-4 text-neutral-900" />
                  <span>AeroVent™ 4-way micro-cooling mesh</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-neutral-900 uppercase">
                  <ShieldCheck className="w-4 h-4 text-neutral-900" />
                  <span>Anti-odor ionic silver fiber treatment</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-neutral-900 uppercase">
                  <ShieldCheck className="w-4 h-4 text-neutral-900" />
                  <span>Zero-friction athletic flatlock seams</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ProductGrid;
