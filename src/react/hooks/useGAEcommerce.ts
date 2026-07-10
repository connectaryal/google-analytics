"use client";

import { useMemo } from "react";
import { useAnalytics } from "../context/GAProvider";

export function useGAEcommerce() {
  const analytics = useAnalytics();

  return useMemo(
    () => ({
      trackCart: analytics.trackCart,
      trackBeginCheckout: analytics.trackBeginCheckout,
      trackPurchase: analytics.trackPurchase,
      trackItem: analytics.trackItem,
      trackWishlist: analytics.trackWishlist,
      trackShippingInfo: analytics.trackShippingInfo,
      trackPaymentInfo: analytics.trackPaymentInfo,
      trackRefund: analytics.trackRefund,
      trackPromotion: analytics.trackPromotion,
      trackLogin: analytics.trackLogin,
      trackSignUp: analytics.trackSignUp,
    }),
    [analytics]
  );
}
