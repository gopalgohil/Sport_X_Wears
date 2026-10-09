'use client';

import React from 'react';
import { AthleticSize } from '../../types';
import { cn } from '../../lib/utils';

interface SizeSelectorProps {
  availableSizes?: AthleticSize[];
  selectedSize: AthleticSize;
  onSelectSize: (size: AthleticSize) => void;
  showLabel?: boolean;
}

const ALL_SIZES: AthleticSize[] = ['S', 'M', 'L', 'XL', 'XXL'];

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  availableSizes = ALL_SIZES,
  selectedSize,
  onSelectSize,
  showLabel = true,
}) => {
  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-600">
          <span>SIZE: <span className="text-neutral-950 font-black">{selectedSize}</span></span>
          <span className="text-neutral-400 text-[10px] underline cursor-pointer hover:text-neutral-900">
            SIZE GUIDE
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-1 sm:gap-1.5">
        {ALL_SIZES.map((size) => {
          const isAvailable = availableSizes.includes(size);
          const isSelected = selectedSize === size;

          return (
            <button
              key={size}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelectSize(size)}
              className={cn(
                'min-w-7 h-7 sm:min-w-8 sm:h-8 px-1 sm:px-2 flex items-center justify-center font-headline text-xs font-bold uppercase transition-all duration-150 border cursor-pointer select-none',
                isSelected
                  ? 'bg-neutral-950 text-white border-neutral-950 shadow-xs'
                  : 'bg-white text-neutral-800 border-neutral-300 hover:border-neutral-950 hover:bg-neutral-50',
                !isAvailable &&
                  'opacity-30 cursor-not-allowed line-through bg-neutral-100 border-neutral-200 text-neutral-400'
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SizeSelector;
