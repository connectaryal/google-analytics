"use client";

import { CartType, CartItem, EcommerceItem } from "../../types/ecommerce";
import { useAnalytics } from "../context/GAProvider";

export function useGAEcommerce() {
  const ga = useAnalytics();

  return {
    // Cart: ADD, REMOVE, VIEW, UPDATE
    trackCart: (
      action: CartType,
      items: CartItem[],
      value: number,
      options?: Record<string, unknown>
    ) => {
      ga.trackCart(action, items, value, options);
    },

    // begin checkout
    trackBeginCheckout: (
      value: number,
      items: Array<{
        item_id: string;
        item_name: string;
        price: number;
        quantity: number;
      }>
    ) => {
      ga.trackBeginCheckout(value, items);
    },

    // Purchase order
    trackPurchase: (
      transactionId: string,
      value: number,
      items: EcommerceItem[]
    ) => {
      ga.trackPurchase(transactionId, value, items);
    },
  };
}
