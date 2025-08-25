import type { Currency } from "./analytics";
import { GAEventWithParams } from "./core";

/* -------------------------------------------------
 * Ecommerce Tracking Options
 * ------------------------------------------------- */
export interface EcommerceTrackingOptions {
  readonly transactionId?: string;
  readonly affiliation?: string;
  readonly coupon?: string;
  readonly shipping?: number;
  readonly currency?: Currency;
  readonly tax?: number;
  readonly customParams?: Record<string, unknown>;
}

/* -------------------------------------------------
 * Ecommerce Item
 * ------------------------------------------------- */
export interface EcommerceItem {
  readonly item_id: string;
  readonly item_name: string;
  readonly affiliation?: string;
  readonly coupon?: string;
  readonly currency?: Currency;
  readonly discount?: number;
  readonly index?: number;
  readonly item_brand?: string;
  readonly item_category?: string;
  readonly item_category2?: string;
  readonly item_category3?: string;
  readonly item_category4?: string;
  readonly item_category5?: string;
  readonly item_list_id?: string;
  readonly item_list_name?: string;
  readonly item_variant?: string;
  readonly location_id?: string;
  readonly price: number;
  readonly promotion_id?: string;
  readonly promotion_name?: string;
  readonly quantity?: number;
  readonly [key: string]: string | number | boolean | undefined;
}

/* -------------------------------------------------
 * Cart
 * ------------------------------------------------- */
export enum CartType {
  ADD_TO_CART = "add_to_cart",
  REMOVE_FROM_CART = "remove_from_cart",
  VIEW_CART = "view_cart",
  UPDATE_CART = "update_cart",
}

export type CartItem = Pick<
  EcommerceItem,
  | "item_id"
  | "item_name"
  | "item_brand"
  | "item_variant"
  | "item_category"
  | "item_category2"
  | "item_category3"
  | "item_category4"
  | "item_category5"
  | "coupon"
  | "discount"
  | "price"
  | "quantity"
  | "currency"
  | "affiliation"
  | "index"
  | "item_list_id"
  | "item_list_name"
  | "location_id"
>;

/* -------------------------------------------------
 * Ecommerce Event Parameters
 * ------------------------------------------------- */
export interface EcommerceEventParameters {
  readonly currency?: Currency;
  readonly value?: number;
  readonly transaction_id?: string;
  readonly coupon?: string;
  readonly payment_type?: string;
  readonly shipping?: number;
  readonly tax?: number;
  readonly items?: readonly EcommerceItem[];
  readonly item_list_id?: string;
  readonly item_list_name?: string;
  readonly affiliation?: string;
}

/* -------------------------------------------------
 * Purchase / Cart Events
 * ------------------------------------------------- */
export type PurchaseEvent = GAEventWithParams<
  "purchase",
  EcommerceEventParameters & {
    readonly transaction_id: string;
    readonly value: number;
  }
>;

export type AddToCartEvent = GAEventWithParams<
  "add_to_cart",
  EcommerceEventParameters & { readonly items: readonly EcommerceItem[] }
>;

export type RemoveFromCartEvent = GAEventWithParams<
  "remove_from_cart",
  EcommerceEventParameters & { readonly items: readonly EcommerceItem[] }
>;

export type ViewCartEvent = GAEventWithParams<
  "view_cart",
  EcommerceEventParameters & { readonly items: readonly EcommerceItem[] }
>;

/* -------------------------------------------------
 * Checkout Events
 * ------------------------------------------------- */
export type BeginCheckoutEvent = GAEventWithParams<
  "begin_checkout",
  EcommerceEventParameters & {
    readonly value: number;
    readonly items: readonly EcommerceItem[];
  }
>;

export type AddPaymentInfoEvent = GAEventWithParams<
  "add_payment_info",
  EcommerceEventParameters & {
    readonly payment_type: string;
    readonly items: readonly EcommerceItem[];
  }
>;

export type AddShippingInfoEvent = GAEventWithParams<
  "add_shipping_info",
  EcommerceEventParameters & {
    readonly shipping: number;
    readonly items: readonly EcommerceItem[];
  }
>;

/* -------------------------------------------------
 * Item Interaction Events
 * ------------------------------------------------- */
export type ViewItemEvent = GAEventWithParams<
  "view_item",
  EcommerceEventParameters & { readonly items: readonly [EcommerceItem] }
>;

export type ViewItemListEvent = GAEventWithParams<
  "view_item_list",
  EcommerceEventParameters & { readonly items: readonly EcommerceItem[] }
>;

export type SelectItemEvent = GAEventWithParams<
  "select_item",
  EcommerceEventParameters & {
    readonly items: readonly [EcommerceItem]; // GA requires at least one item
  }
>;

/* -------------------------------------------------
 * Promotion Events
 * ------------------------------------------------- */
export type ViewPromotionEvent = GAEventWithParams<
  "view_promotion",
  EcommerceEventParameters & { readonly items: readonly EcommerceItem[] }
>;

export type SelectPromotionEvent = GAEventWithParams<
  "select_promotion",
  EcommerceEventParameters & { readonly items: readonly EcommerceItem[] }
>;

/* -------------------------------------------------
 * Wishlist Events
 * ------------------------------------------------- */
export type AddToWishlistEvent = GAEventWithParams<
  "add_to_wishlist",
  EcommerceEventParameters & { readonly items: readonly [EcommerceItem] }
>;

/* -------------------------------------------------
 * Lead Event
 * ------------------------------------------------- */
export type GenerateLeadEvent = GAEventWithParams<
  "generate_lead",
  EcommerceEventParameters & { readonly value?: number }
>;

/* -------------------------------------------------
 * Promotion / Checkout Support Types
 * ------------------------------------------------- */
export interface PromotionDetails {
  readonly promotion_id: string;
  readonly promotion_name: string;
  readonly creative_name?: string;
  readonly creative_slot?: string;
  readonly location_id?: string;
  readonly items?: readonly EcommerceItem[];
}

export interface CheckoutStep {
  readonly checkout_step?: number;
  readonly checkout_option?: string;
  readonly currency: Currency;
  readonly value: number;
  readonly items: readonly EcommerceItem[];
  readonly coupon?: string;
}

/* -------------------------------------------------
 * Search / Wishlist / Item View
 * ------------------------------------------------- */
export interface SearchResult {
  readonly search_term: string;
  readonly number_of_results?: number;
  readonly items?: readonly EcommerceItem[];
}

export interface WishlistOperation {
  readonly currency?: Currency;
  readonly value?: number;
  readonly items: readonly EcommerceItem[];
}

export interface ItemView {
  readonly currency?: Currency;
  readonly value?: number;
  readonly items: readonly [EcommerceItem];
}

/* -------------------------------------------------
 * Ecommerce Event Type Enum
 * ------------------------------------------------- */
export const EcommerceEventType = {
  PURCHASE: "purchase",
  REFUND: "refund",

  ADD_TO_CART: "add_to_cart",
  REMOVE_FROM_CART: "remove_from_cart",
  VIEW_CART: "view_cart",

  BEGIN_CHECKOUT: "begin_checkout",
  ADD_PAYMENT_INFO: "add_payment_info",
  ADD_SHIPPING_INFO: "add_shipping_info",

  VIEW_ITEM: "view_item",
  VIEW_ITEM_LIST: "view_item_list",
  SELECT_ITEM: "select_item",

  VIEW_PROMOTION: "view_promotion",
  SELECT_PROMOTION: "select_promotion",

  ADD_TO_WISHLIST: "add_to_wishlist",

  GENERATE_LEAD: "generate_lead",
} as const;

export type EcommerceEventType =
  (typeof EcommerceEventType)[keyof typeof EcommerceEventType];

/* -------------------------------------------------
 * Shopping Stage Enum
 * ------------------------------------------------- */
export const ShoppingStage = {
  BROWSING: "browsing",
  PRODUCT_DETAIL: "product_detail",
  ADD_TO_CART: "add_to_cart",
  CHECKOUT_START: "checkout_start",
  CHECKOUT_PROGRESS: "checkout_progress",
  PURCHASE: "purchase",
  POST_PURCHASE: "post_purchase",
} as const;

export type ShoppingStage = (typeof ShoppingStage)[keyof typeof ShoppingStage];
