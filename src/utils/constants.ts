/**
 * GA Constants and Enums
 * Following Google Analytics 4 official specifications and limits
 */

/**
 * GA Event Names - Official Google Analytics 4 events
 * https://developers.google.com/analytics/devguides/collection/ga4/reference/events
 */
export const GA_EVENTS = {
  // Automatically collected events
  FIRST_VISIT: "first_visit",
  SESSION_START: "session_start",
  USER_ENGAGEMENT: "user_engagement",

  // Enhanced measurement events
  PAGE_VIEW: "page_view",
  SCROLL: "scroll",
  OUTBOUND: "click",
  SITE_SEARCH: "search",
  VIDEO_START: "video_start",
  VIDEO_PROGRESS: "video_progress",
  VIDEO_COMPLETE: "video_complete",
  FILE_DOWNLOAD: "file_download",

  // Recommended events
  AD_IMPRESSION: "ad_impression",
  JOIN_GROUP: "join_group",
  LOGIN: "login",
  SEARCH: "search",
  SELECT_CONTENT: "select_content",
  SHARE: "share",
  SIGN_UP: "sign_up",
  SPEND_VIRTUAL_CURRENCY: "spend_virtual_currency",
  TUTORIAL_BEGIN: "tutorial_begin",
  TUTORIAL_COMPLETE: "tutorial_complete",

  // Ecommerce events
  PURCHASE: "purchase",
  REFUND: "refund",
  ADD_PAYMENT_INFO: "add_payment_info",
  ADD_SHIPPING_INFO: "add_shipping_info",
  ADD_TO_WISHLIST: "add_to_wishlist",
  REMOVE_FROM_WISHLIST: "remove_from_wishlist",
  VIEW_WISHLIST: "view_wishlist",
  DELETE_WISHLIST: "delete_wishlist",
  BEGIN_CHECKOUT: "begin_checkout",
  GENERATE_LEAD: "generate_lead",
  ADD_TO_CART: "add_to_cart",
  VIEW_CART: "view_cart",
  UPDATE_CART: "update_cart",
  REMOVE_FROM_CART: "remove_from_cart",
  VIEW_ITEM: "view_item",

  // Custom events (our additions)
  BUTTON_CLICK: "button_click",
  FORM_START: "form_start",
  FORM_SUBMIT: "form_submit",
  CONTACT: "contact",
  ERROR: "exception",
} as const;

/**
 * GA4 Parameter Names - Official parameter names
 * https://developers.google.com/analytics/devguides/collection/ga4/reference/events#shared_parameters
 */
export const GA_PARAMETERS = {
  // Shared parameters
  CURRENCY: "currency",
  VALUE: "value",
  TRANSACTION_ID: "transaction_id",
  COUPON: "coupon",
  PAYMENT_TYPE: "payment_type",
  SHIPPING: "shipping",
  TAX: "tax",
  ITEMS: "items",

  // Item parameters
  ITEM_ID: "item_id",
  ITEM_NAME: "item_name",
  ITEM_CATEGORY: "item_category",
  ITEM_CATEGORY2: "item_category2",
  ITEM_CATEGORY3: "item_category3",
  ITEM_CATEGORY4: "item_category4",
  ITEM_CATEGORY5: "item_category5",
  ITEM_LIST_ID: "item_list_id",
  ITEM_LIST_NAME: "item_list_name",
  ITEM_VARIANT: "item_variant",
  ITEM_BRAND: "item_brand",
  PRICE: "price",
  QUANTITY: "quantity",
  INDEX: "index",
  PROMOTION_ID: "promotion_id",
  PROMOTION_NAME: "promotion_name",
  CREATIVE_NAME: "creative_name",
  CREATIVE_SLOT: "creative_slot",
  LOCATION_ID: "location_id",
  AFFILIATION: "affiliation",
  DISCOUNT: "discount",

  // Page parameters
  PAGE_TITLE: "page_title",
  PAGE_LOCATION: "page_location",
  PAGE_REFERRER: "page_referrer",

  // Content parameters
  CONTENT_TYPE: "content_type",
  CONTENT_ID: "content_id",

  // Search parameters
  SEARCH_TERM: "search_term",

  // Video parameters
  VIDEO_TITLE: "video_title",
  VIDEO_PROVIDER: "video_provider",
  VIDEO_URL: "video_url",
  VIDEO_DURATION: "video_duration",
  VIDEO_CURRENT_TIME: "video_current_time",
  VIDEO_PERCENT: "video_percent",
  VISIBLE: "visible",

  // Engagement parameters
  ENGAGEMENT_TIME_MSEC: "engagement_time_msec",

  // Custom parameters
  METHOD: "method",
  DESCRIPTION: "description",
  FATAL: "fatal",

  // Link parameters
  LINK_TEXT: "link_text",
  LINK_URL: "link_url",
  LINK_DOMAIN: "link_domain",
  OUTBOUND: "outbound",
  FILE_EXTENSION: "file_extension",
  FILE_NAME: "file_name",
} as const;

/**
 * GA4 Limits and Constraints
 * https://developers.google.com/analytics/devguides/collection/ga4/limits-quotas
 */
export const GA_LIMITS = {
  // Event limits
  MAX_EVENT_NAME_LENGTH: 40,
  MAX_PARAMETER_NAME_LENGTH: 40,
  MAX_PARAMETER_VALUE_LENGTH: 100,
  MAX_CUSTOM_PARAMETERS: 25,
  MAX_EVENTS_PER_REQUEST: 25,
  MAX_ITEMS_PER_EVENT: 200,

  // String limits
  MAX_USER_ID_LENGTH: 256,
  MAX_ITEM_ID_LENGTH: 50,
  MAX_ITEM_NAME_LENGTH: 100,
  MAX_ITEM_CATEGORY_LENGTH: 100,
  MAX_CURRENCY_CODE_LENGTH: 3,

  // Numeric limits
  MAX_VALUE: 9007199254740991, // Number.MAX_SAFE_INTEGER
  MIN_VALUE: -9007199254740991, // Number.MIN_SAFE_INTEGER
  MAX_QUANTITY: 999999,
  MIN_QUANTITY: 1,

  // Rate limits
  MAX_EVENTS_PER_SECOND: 1000,
  MAX_CONVERSIONS_PER_EVENT: 1,
} as const;

/**
 * Default Configuration Values
 */
export const DEFAULT_CONFIG = {
  DATA_LAYER_NAME: "dataLayer",
  COOKIE_EXPIRES_DAYS: 365,
  SESSION_TIMEOUT_MINUTES: 30,
  DEBOUNCE_DELAY_MS: 250,
  BATCH_SIZE: 10,
  BATCH_TIMEOUT_MS: 5000,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
} as const;

/**
 * Event Categories for Organization
 */
export enum EventCategory {
  ENGAGEMENT = "engagement",
  ECOMMERCE = "ecommerce",
  NAVIGATION = "navigation",
  INTERACTION = "interaction",
  CONVERSION = "conversion",
  ERROR = "error",
  PERFORMANCE = "performance",
  CUSTOM = "custom",
}

/**
 * Priority Levels for Event Processing
 */
export enum EventPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4,
}

/**
 * Tracking Status
 */
export enum TrackingStatus {
  IDLE = "idle",
  TRACKING = "tracking",
  PAUSED = "paused",
  ERROR = "error",
}

/**
 * Common Currency Codes (ISO 4217)
 */
export const CURRENCY_CODES = {
  USD: "USD",
  EUR: "EUR",
  GBP: "GBP",
  JPY: "JPY",
  CAD: "CAD",
  AUD: "AUD",
  CHF: "CHF",
  CNY: "CNY",
  INR: "INR",
  BRL: "BRL",
} as const;

/**
 * Common File Extensions for Download Tracking
 */
export const TRACKABLE_FILE_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "zip",
  "rar",
  "7z",
  "tar",
  "gz",
  "mp4",
  "avi",
  "mov",
  "wmv",
  "flv",
  "webm",
  "mp3",
  "wav",
  "flac",
  "aac",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "svg",
  "webp",
  "txt",
  "csv",
  "json",
  "xml",
] as const;

/**
 * Social Media Platforms for Share Tracking
 */
export const SOCIAL_PLATFORMS = {
  FACEBOOK: "Facebook",
  TWITTER: "Twitter",
  LINKEDIN: "LinkedIn",
  INSTAGRAM: "Instagram",
  PINTEREST: "Pinterest",
  YOUTUBE: "YouTube",
  TIKTOK: "TikTok",
  WHATSAPP: "WhatsApp",
  TELEGRAM: "Telegram",
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  INVALID_MEASUREMENT_ID:
    "Invalid GA4 Measurement ID format. Expected format: G-XXXXXXXXXX",
  TRACKER_NOT_INITIALIZED:
    "GA Tracker has not been initialized. Call initialize() first.",
  INVALID_EVENT_NAME: "Event name is required and must be a non-empty string",
  INVALID_EVENT_PARAMETERS: "Event parameters must be an object",
  PARAMETER_NAME_TOO_LONG: `Parameter name exceeds maximum length of ${GA_LIMITS.MAX_PARAMETER_NAME_LENGTH} characters`,
  PARAMETER_VALUE_TOO_LONG: `Parameter value exceeds maximum length of ${GA_LIMITS.MAX_PARAMETER_VALUE_LENGTH} characters`,
  TOO_MANY_CUSTOM_PARAMETERS: `Too many custom parameters. Maximum allowed: ${GA_LIMITS.MAX_CUSTOM_PARAMETERS}`,
  INVALID_CURRENCY_CODE:
    "Invalid currency code. Must be a 3-letter ISO 4217 code",
  INVALID_VALUE: "Value must be a valid number",
  MISSING_REQUIRED_PARAMETER: "Required parameter is missing",
  NETWORK_ERROR: "Network error occurred while sending tracking data",
  GTAG_NOT_LOADED: "Google Analytics gtag library is not loaded",
} as const;

/**
 * Regular Expressions for Validation
 */
export const VALIDATION_PATTERNS = {
  MEASUREMENT_ID: /^G-[A-Z0-9]{10}$/,
  CURRENCY_CODE: /^[A-Z]{3}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  URL: /^https?:\/\/.+/,
  EVENT_NAME: /^[a-zA-Z][a-zA-Z0-9_]{0,39}$/,
  PARAMETER_NAME: /^[a-zA-Z][a-zA-Z0-9_]{0,39}$/,
} as const;
