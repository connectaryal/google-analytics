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
  readonly customParameters?: Record<string, unknown>;
  readonly debug?: boolean;
  readonly callback?: () => void;
  readonly onError?: (error: Error) => void;
  readonly forceTrack?: boolean;
  readonly transport?: "beacon" | "xhr" | "image";
}
