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
 * How tracked events are delivered.
 *
 * - `"gtag"` — `window.gtag("event", name, params)` (GA4 via gtag.js)
 * - `"dataLayer"` — `window[dataLayerName].push({ event: name, ...params })` (GTM)
 * - `"both"` — both of the above. If the GTM container also fires a GA4 tag for
 *   the same property, every event is counted twice.
 */
export type EventTransport = "gtag" | "dataLayer" | "both";

/**
 * Configuration for GA4 (gtag.js) and/or a Google Tag Manager container (gtm.js).
 *
 * At least one of `measurementId` or `gtmId` is required unless `disableGA` is set.
 */
export interface GAConfig {
  /** GA4 measurement ID (`G-XXXXXXXXXX`), loaded via gtag.js. */
  readonly measurementId?: string;
  /** GTM container ID (`GTM-XXXXXXX`), loaded via gtm.js. */
  readonly gtmId?: string;
  /** Name of the global dataLayer array. Defaults to `"dataLayer"`. */
  readonly dataLayerName?: string;
  /** GTM environment `gtm_auth` parameter. */
  readonly gtmAuth?: string;
  /** GTM environment `gtm_preview` parameter (e.g. `"env-3"`). */
  readonly gtmPreview?: string;
  /** CSP nonce applied to injected `<script>` tags. */
  readonly nonce?: string;
  /**
   * Event delivery. Defaults to `"dataLayer"` when `gtmId` is set, otherwise `"gtag"`.
   */
  readonly eventTransport?: EventTransport;
  readonly debug?: boolean;
  /** Consent Mode defaults, pushed as `gtag("consent", "default", customConfig)`. */
  readonly customConfig?: Readonly<Record<string, unknown>>;
  readonly currency?: Currency;
  readonly disableGA?: boolean;
}

/**
 * @deprecated Use {@link GAConfig}. Kept as an alias for backward compatibility.
 */
export type GA4Config = GAConfig;

/**
 * GA4 user properties. `null` clears a property.
 */
export type UserProperties = Readonly<
  Record<string, string | number | boolean | null>
>;

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
