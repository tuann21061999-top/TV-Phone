import React from 'react';

// === PRODUCT SKELETONS ===
export const ProductCardSkeleton = () => (
  <div className="bg-white border border-slate-100 rounded-xl md:rounded-2xl p-2.5 md:p-4 animate-pulse flex flex-col h-full shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
    <div className="bg-slate-200 rounded-lg md:rounded-xl h-[140px] sm:h-[160px] md:h-[220px] mb-3 md:mb-4 w-full"></div>
    <div className="bg-slate-200 h-3.5 md:h-4 rounded w-3/4 mb-2 md:mb-3"></div>
    <div className="flex flex-col gap-1.5 md:gap-2 mb-3">
        <div className="bg-slate-200 h-2.5 md:h-3 rounded w-1/2"></div>
        <div className="bg-slate-200 h-2.5 md:h-3 rounded w-1/3"></div>
    </div>
    <div className="flex justify-between items-end mt-auto pt-2">
      <div className="bg-slate-200 h-4 md:h-5 rounded w-1/2"></div>
      <div className="bg-slate-200 h-4 md:h-5 rounded w-8"></div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5 w-full">
    {Array.from({ length: count }).map((_, i) => <ProductCardSkeleton key={i} />)}
  </div>
);

// === PRODUCT DETAIL SKELETON ===
export const ProductDetailSkeleton = () => (
  <div className="w-full max-w-[1400px] mx-auto px-4 md:px-10 py-3 md:py-5 animate-pulse mt-4">
    <div className="h-4 bg-slate-200 rounded w-1/3 mb-6"></div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-6 lg:mb-12">
      <div className="w-full aspect-square max-h-[350px] md:max-h-[500px] bg-slate-200 rounded-xl md:rounded-2xl"></div>
      <div className="flex flex-col gap-4">
        <div className="h-8 md:h-10 bg-slate-200 rounded-lg w-3/4 mb-2"></div>
        <div className="h-8 md:h-10 bg-slate-200 rounded-lg w-1/3 mb-4"></div>
        <div className="space-y-3 mb-6">
          <div className="h-3 md:h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-3 md:h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-3 md:h-4 bg-slate-200 rounded w-4/6"></div>
        </div>
        <div className="h-20 bg-slate-200 rounded-xl w-full mb-6"></div>
        <div className="mt-auto flex gap-3 md:gap-4">
          <div className="h-12 md:h-[52px] w-12 md:w-[52px] bg-slate-200 rounded-xl shrink-0"></div>
          <div className="h-12 md:h-[52px] bg-slate-200 rounded-xl flex-1"></div>
        </div>
      </div>
    </div>
  </div>
);

// === CART SKELETON ===
export const CartSkeleton = () => (
  <div className="w-full max-w-[1200px] mx-auto px-4 py-8 animate-pulse">
    <div className="h-8 bg-slate-200 rounded w-40 mb-6"></div>
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-xl">
            <div className="w-20 h-20 bg-slate-200 rounded-lg shrink-0"></div>
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/4"></div>
              <div className="h-5 bg-slate-200 rounded w-1/3 mt-2"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-xl border border-slate-100 h-max">
        <div className="h-5 bg-slate-200 rounded w-1/2 mb-6"></div>
        <div className="space-y-4 mb-6">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
        </div>
        <div className="h-12 bg-slate-200 rounded-xl w-full"></div>
      </div>
    </div>
  </div>
);

// === CHECKOUT SKELETON ===
export const CheckoutSkeleton = () => (
  <div className="w-full max-w-[1400px] mx-auto mt-4 md:mt-8 px-3 md:px-10 pb-10 grid grid-cols-1 lg:grid-cols-[1.7fr_1.3fr] gap-4 md:gap-8 items-start animate-pulse">
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 border border-slate-100 h-32 md:h-40">
          <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
    <div className="bg-white rounded-xl p-6 border border-slate-100 min-h-[400px]">
      <div className="h-5 bg-slate-200 rounded w-1/2 mb-6"></div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-16 h-16 bg-slate-200 rounded-lg shrink-0"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-12 bg-slate-200 rounded-xl w-full mt-10"></div>
    </div>
  </div>
);

// === PROFILE SKELETON ===
export const ProfileSkeleton = () => (
  <div className="min-h-[60vh] bg-slate-50 py-8 font-sans animate-pulse">
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-6 md:gap-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 h-max flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-200 rounded-full mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3 mb-6"></div>
          <div className="w-full space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-200 rounded-xl w-full"></div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 min-h-[400px]">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 rounded-xl w-full"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// === NEWS SKELETON ===
export const NewsCardSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden border border-slate-100 flex flex-col h-full animate-pulse shadow-sm">
    <div className="h-40 md:h-48 bg-slate-200 w-full"></div>
    <div className="p-4 flex flex-col flex-1">
      <div className="h-3 bg-slate-200 rounded w-1/4 mb-3"></div>
      <div className="h-4 md:h-5 bg-slate-200 rounded w-full mb-2"></div>
      <div className="h-4 md:h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
      <div className="h-3 bg-slate-200 rounded w-1/2 mt-auto"></div>
    </div>
  </div>
);

export const NewsGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
    {Array.from({ length: count }).map((_, i) => <NewsCardSkeleton key={i} />)}
  </div>
);

// === LIST/TEXT SKELETON (Cho Spec, Review) ===
export const ListSkeleton = ({ rows = 5 }) => (
  <div className="w-full space-y-4 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4 border border-slate-100 rounded-xl bg-white">
        <div className="w-10 h-10 bg-slate-200 rounded-full shrink-0"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
          <div className="h-3 bg-slate-200 rounded w-full"></div>
          <div className="h-3 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>
    ))}
  </div>
);
