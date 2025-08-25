import { EventCategory } from '../utils/constants';
import { TEventParams } from './core';
import { CartItem, ItemType } from './ecommerce';

/**
 * Initialization state using const assertions for better performance
 */
export const InitializationState = {
  NOT_INITIALIZED: 'NOT_INITIALIZED',
  INITIALIZING: 'INITIALIZING',
  INITIALIZED: 'INITIALIZED',
  FAILED: 'FAILED',
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
}

/**
 * Currency type with common currencies for better IntelliSense
 */
export type Currency =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'JPY'
  | 'CAD'
  | 'AUD'
  | 'CHF'
  | 'CNY'
  | 'INR'
  | 'NPR';

/**
 * PageView Options
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
  value: number;
  coupon?: string;
  shipping_tier: string;
  items: CartItem[];
}

export interface TItem {
  action: ItemType;
  items: CartItem[];
  item_list_id: string;
  item_list_name: string;
  value?: number;
  customParams: TEventParams;
}
