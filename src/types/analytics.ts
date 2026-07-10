import { EventCategory } from "../utils/constants";
import { TEventParams } from "./core";
import { CartItem, ItemType } from "./ecommerce";

/**
 * Initialization state using const assertions for better performance
 */
export const InitializationState = {
  NOT_INITIALIZED: "NOT_INITIALIZED",
  INITIALIZING: "INITIALIZING",
  INITIALIZED: "INITIALIZED",
  FAILED: "FAILED",
} as const;

export type InitializationState =
  (typeof InitializationState)[keyof typeof InitializationState];

/**
 * GA4 Configuration with performance-optimized defaults
 */
export interface GA4Config {
  readonly measurementId: string;
  readonly debug?: boolean;
  readonly customConfig?: Readonly<Record<string, unknown>>;
  readonly currency?: Currency;
  readonly disableGA?: boolean;
}

/**
 * Currency type with common currencies for better IntelliSense
 */
export type Currency =
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "CAD"
  | "AUD"
  | "CHF"
  | "CNY"
  | "INR"
  | "NPR";

/**
 * Page view tracking options.
 *
 * @remarks
 * During SSR, pass explicit `path`, `title`, and `referrer` values from request
 * metadata. Browser defaults are only resolved on the client.
 */
export interface PageViewOptions {
  readonly path?: string;
  readonly title?: string;
  readonly referrer?: string;
  readonly customParams?: Record<string, string | number | boolean>;
}

/**
 * Common Event Payload
 */
export interface EventPayload {
  readonly event_name: string;
  readonly event_category: EventCategory;
  readonly event_time: number;
  readonly [key: string]: unknown; // flexible extension
}

/**
 * Shipping Info
 *
 */
export interface TShippingInfo {
  readonly value: number;
  readonly coupon?: string;
  readonly shipping_tier: string;
  readonly items: CartItem[];
}

/**
 * Item tracking options.
 *
 * @remarks
 * During SSR, pass explicit `item_list_id` and `item_list_name` values from request
 * metadata. Browser defaults are only resolved on the client.
 */
export interface ItemTrackingOptions {
  readonly action: ItemType;
  readonly items: CartItem[];
  readonly item_list_id?: string;
  readonly item_list_name?: string;
  readonly value?: number;
  readonly customParams?: TEventParams;
}
