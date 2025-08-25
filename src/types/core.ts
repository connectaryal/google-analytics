import { EventCategory } from "../utils/constants";
import {
  AddToCartEvent,
  BeginCheckoutEvent,
  PurchaseEvent,
  RemoveFromCartEvent,
  ViewCartEvent,
} from "./ecommerce";

/**
 * Global type augmentation
 */
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag: (...args: unknown[]) => void;
  }
}

/* -------------------------------------------------
 * Utility Types
 * ------------------------------------------------- */
export type Nullable<T> = T | null;
export type ConsentState = "granted" | "denied";

export type GAEventName =
  | "page_view"
  | "purchase"
  | "add_to_cart"
  | "remove_from_cart"
  | "view_cart"
  | "begin_checkout"
  | "search"
  | "user_engagement"
  | "login"
  | "sign_up"
  | "share"
  | "video_start"
  | "video_progress"
  | "video_complete"
  | "exception"
  | "timing_complete"
  | (string & {}); // allows custom names

/**
 * Base event interface - all GA4 events extend this
 */
export type TEventParams = Record<string, unknown>;
export interface BaseGAEvent<TParams = TEventParams> {
  readonly event_name: GAEventName;
  readonly event_parameters?: TParams;
  readonly custom_parameters?: Record<string, unknown>;
  readonly timestamp?: number;
  readonly event_category?: EventCategory;
}

/** Factory helper for strongly typed GA events */
export type GAEventWithParams<
  Name extends GAEventName,
  Params
> = BaseGAEvent<Params> & {
  readonly event_name: Name;
  readonly event_parameters: Params;
};

/* -------------------------------------------------
 * Page View
 * ------------------------------------------------- */
export interface PageViewEventParameters {
  readonly page_title?: string;
  readonly page_location?: string;
  readonly page_referrer?: string;
  readonly page_encoding?: string;
  readonly client_id?: string;
  readonly language?: string;
  readonly screen_resolution?: string;
  readonly view_count?: number;
}
export type PageViewEvent = GAEventWithParams<
  "page_view",
  PageViewEventParameters
>;

/* -------------------------------------------------
 * Search
 * ------------------------------------------------- */
export interface SearchEventParameters {
  readonly search_term: string;
  readonly number_of_results?: number;
  readonly search_category?: string;
}
export type SearchEvent = GAEventWithParams<"search", SearchEventParameters>;

/* -------------------------------------------------
 * Engagement
 * ------------------------------------------------- */
export interface EngagementEventParameters {
  readonly engagement_type?: string;
  readonly engagement_time_msec?: number;
  readonly method?: string;
  readonly value?: number;
}
export type EngagementEvent = GAEventWithParams<
  "user_engagement",
  EngagementEventParameters
>;

/* -------------------------------------------------
 * Auth (Login / Signup)
 * ------------------------------------------------- */
export interface AuthEventParameters {
  readonly method: string;
}
export type LoginEvent = GAEventWithParams<"login", AuthEventParameters>;
export type SignUpEvent = GAEventWithParams<"sign_up", AuthEventParameters>;

/* -------------------------------------------------
 * Share
 * ------------------------------------------------- */
export interface ShareEventParameters {
  readonly content_type: string;
  readonly content_id: string;
  readonly method: string;
}
export type ShareEvent = GAEventWithParams<"share", ShareEventParameters>;

/* -------------------------------------------------
 * Video
 * ------------------------------------------------- */
export interface VideoEventParameters {
  readonly video_title: string;
  readonly video_url: string;
  readonly video_duration?: number;
  readonly video_current_time?: number;
  readonly video_percent?: number;
  readonly video_provider?: string;
  readonly visible?: boolean;
}
export type VideoStartEvent = GAEventWithParams<
  "video_start",
  VideoEventParameters
>;
export type VideoProgressEvent = GAEventWithParams<
  "video_progress",
  VideoEventParameters & {
    readonly video_current_time: number;
    readonly video_percent: number;
  }
>;
export type VideoCompleteEvent = GAEventWithParams<
  "video_complete",
  VideoEventParameters
>;

/* -------------------------------------------------
 * Exception
 * ------------------------------------------------- */
export interface ExceptionEventParameters {
  readonly description: string;
  readonly fatal?: boolean;
}
export type ExceptionEvent = GAEventWithParams<
  "exception",
  ExceptionEventParameters
>;

/* -------------------------------------------------
 * Timing
 * ------------------------------------------------- */
export interface TimingEventParameters {
  readonly name: string;
  readonly value: number;
  readonly event_category: string;
  readonly event_label?: string;
}
export type TimingEvent = GAEventWithParams<
  "timing_complete",
  TimingEventParameters
>;

/* -------------------------------------------------
 * GAEvent Union
 * ------------------------------------------------- */
export type GAEvent =
  | PageViewEvent
  | PurchaseEvent
  | AddToCartEvent
  | RemoveFromCartEvent
  | ViewCartEvent
  | BeginCheckoutEvent
  | SearchEvent
  | EngagementEvent
  | LoginEvent
  | SignUpEvent
  | ShareEvent
  | VideoStartEvent
  | VideoProgressEvent
  | VideoCompleteEvent
  | ExceptionEvent
  | TimingEvent
  | BaseGAEvent;

/* -------------------------------------------------
 * Tracking Options
 * ------------------------------------------------- */
export interface TrackingOptions {
  readonly immediate?: boolean;
  readonly timestamp?: number;
  readonly customParameters?: Record<string, unknown>;
  readonly debug?: boolean;
  readonly callback?: () => void;
  readonly onError?: (error: Error) => void;
  readonly forceTrack?: boolean;
  readonly transport?: "beacon" | "xhr" | "image";
}

/* -------------------------------------------------
 * Consent Config
 * ------------------------------------------------- */
export interface ConsentConfig {
  readonly analytics_storage?: ConsentState;
  readonly ad_storage?: ConsentState;
  readonly ad_user_data?: ConsentState;
  readonly ad_personalization?: ConsentState;
  readonly functionality_storage?: ConsentState;
  readonly personalization_storage?: ConsentState;
  readonly security_storage?: ConsentState;
  readonly wait_for_update?: number;
}

/* -------------------------------------------------
 * User Properties
 * ------------------------------------------------- */
export interface UserProperties {
  readonly user_id?: string;
  readonly customer_id?: string;
  readonly customer_type?: "new" | "returning" | "vip";
  readonly user_category?: string;
  readonly subscription_status?: "free" | "premium" | "enterprise";
  readonly language?: string;
  readonly country?: string;
  readonly region?: string;
  readonly city?: string;
  readonly age_group?: string;
  readonly gender?: "male" | "female" | "other" | "prefer_not_to_say";
  readonly interests?: readonly string[];
  readonly device_category?: "mobile" | "tablet" | "desktop";
  readonly browser?: string;
  readonly os?: string;
  readonly campaign_source?: string;
  readonly campaign_medium?: string;
  readonly campaign_name?: string;
  readonly campaign_term?: string;
  readonly campaign_content?: string;
}

/* -------------------------------------------------
 * Event Queue Item
 * ------------------------------------------------- */
type RetryCount = number & { __brand: "RetryCount" };

export interface QueuedEvent {
  readonly event: GAEvent;
  readonly options: TrackingOptions;
  readonly timestamp: number;
  readonly retryCount: RetryCount;
}

/* -------------------------------------------------
 * Tracker Config
 * ------------------------------------------------- */
export interface TrackerConfig {
  readonly batchSize?: number; // default: 20
  readonly batchTimeout?: number; // default: 5000ms
  readonly maxRetries?: number; // default: 3
  readonly retryDelay?: number; // default: 2000ms
  readonly enableBatching?: boolean; // default: true
  readonly enableAutoRetry?: boolean; // default: true
  readonly enableOfflineQueue?: boolean; // default: true
  readonly maxQueueSize?: number; // default: 100
}
