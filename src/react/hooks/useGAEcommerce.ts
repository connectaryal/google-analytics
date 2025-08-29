"use client";

import { useAnalytics } from "../context/GAProvider";

export function useGAEcommerce() {
  const {
    trackCart,
    trackBeginCheckout,
    trackPurchase,
    trackItem,
    trackWishlist,
    trackShippingInfo,
    trackPaymentInfo,
    trackRefund,
    trackPromotion,
    trackLogin,
    trackSignUp,
  } = useAnalytics();

  return {
    trackCart,
    trackBeginCheckout,
    trackPurchase,
    trackItem,
    trackWishlist,
    trackShippingInfo,
    trackPaymentInfo,
    trackRefund,
    trackPromotion,
    trackLogin,
    trackSignUp,
  };
}
