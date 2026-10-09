'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Heart, CheckCircle2 } from 'lucide-react';
import { Product, AthleticSize } from '../../types';
import { formatPrice, getDiscountPercentage } from '../../lib/utils';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const productUrl = `/products/${product.slug || product._id}`;
  const defaultSize: AthleticSize = product.sizes[0] || 'M';

  const discountPercent = getDiscountPercentage(
    product.price,
    product.discountPrice
  );
  const activePrice = product.discountPrice || product.price;
  const categoryName =
    typeof product.category === 'object'
      ? product.category.name
      : product.category;

  const rating = product.rating || 4.5;
  const reviewsCount =
    product.reviewsCount || Math.floor((product.price * 7) % 350) + 42;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, defaultSize, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div className="group flex flex-col bg-white border border-neutral-200 transition-all duration-300 hover:shadow-lg relative justify-between">
      {/* Product Image Section */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        <Link href={productUrl} className="block w-full h-full">
          <Image
            src={
              product.images[0] ||
              'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
            }
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Badges Container */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10 pointer-events-none">
          {product.badge ? (
            <span className="bg-red-600 text-white font-headline text-[10px] sm:text-xs font-extrabold tracking-wider uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-xs">
              {product.badge}
            </span>
          ) : discountPercent > 0 ? (
            <span className="bg-red-600 text-white font-headline text-[10px] sm:text-xs font-extrabold tracking-wider uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-xs">
              SAVE {discountPercent}%
            </span>
          ) : null}

          {product.tech && (
            <span className="bg-neutral-950/80 backdrop-blur-xs text-white font-headline text-[9px] sm:text-[10px] font-bold tracking-widest uppercase px-1.5 py-0.5">
              {product.tech}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 bg-white/90 backdrop-blur-xs hover:bg-white text-neutral-800 hover:text-red-600 transition-colors z-10 cursor-pointer"
          aria-label="Add to wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
              isWishlisted ? 'text-red-600 fill-red-600' : ''
            }`}
          />
        </button>
      </div>

      {/* Card Body & Details (Original Black Athletic Theme) */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Category Tag */}
          <p className="font-headline text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5 sm:mb-1">
            {categoryName}
          </p>

          {/* Product Title */}
          <Link href={productUrl}>
            <h3 className="font-headline text-sm sm:text-base font-extrabold uppercase tracking-wide text-neutral-950 group-hover:text-red-600 transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>

          {/* Price Row */}
          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
            <span className="font-headline text-base sm:text-xl font-black text-neutral-950">
              {formatPrice(activePrice)}
            </span>
            {product.discountPrice && product.discountPrice < product.price && (
              <span className="font-headline text-xs sm:text-sm font-semibold text-neutral-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Original Black Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 font-headline text-xs sm:text-sm font-extrabold tracking-wider uppercase flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
            addedAnimation
              ? 'bg-neutral-900 text-white'
              : 'bg-neutral-950 hover:bg-red-600 text-white active:scale-[0.99]'
          }`}
        >
          {addedAnimation ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
              <span className="truncate">ADDED TO BAG</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="truncate">ADD TO CART</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
