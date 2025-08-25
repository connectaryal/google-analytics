import { VALIDATION_PATTERNS, GA_LIMITS } from "./constants";

/**
 * Browser environment detection
 */
export const isBrowser = (): boolean => {
  return typeof window !== "undefined" && typeof document !== "undefined";
};

/**
 * Check if gtag is available
 */
export const isGtagAvailable = (): boolean => {
  return isBrowser() && typeof window.gtag === "function";
};

/**
 * Validate GA4 measurement ID format
 */
export const validateMeasurementId = (measurementId: string): boolean => {
  return VALIDATION_PATTERNS.MEASUREMENT_ID.test(measurementId);
};

/**
 * Validate currency code format
 */
export const validateCurrency = (currency: string): boolean => {
  return VALIDATION_PATTERNS.CURRENCY_CODE.test(currency);
};

/**
 * Validate event name
 */
export const validateEventName = (
  eventName: string
): {
  isValid: boolean;
  error?: string;
} => {
  if (!eventName || typeof eventName !== "string") {
    return {
      isValid: false,
      error: "Event name is required and must be a string",
    };
  }

  if (eventName.length > GA_LIMITS.MAX_EVENT_NAME_LENGTH) {
    return {
      isValid: false,
      error: `Event name exceeds maximum length of ${GA_LIMITS.MAX_EVENT_NAME_LENGTH} characters`,
    };
  }

  if (!VALIDATION_PATTERNS.EVENT_NAME.test(eventName)) {
    return {
      isValid: false,
      error:
        "Event name must start with a letter and contain only letters, numbers, and underscores",
    };
  }

  return { isValid: true };
};

export const validateParameters = (
  parameters: Record<string, unknown> = {}
): {
  isValid: boolean;
  error?: string;
} => {
  const parameterCount = Object.keys(parameters).length;

  if (parameterCount > GA_LIMITS.MAX_ITEMS_PER_EVENT) {
    return {
      isValid: false,
      error: `Event parameters exceed maximum count of ${GA_LIMITS.MAX_ITEMS_PER_EVENT}`,
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Validate email address
 */
export const validateEmail = (email: string): boolean => {
  return VALIDATION_PATTERNS.EMAIL.test(email);
};

/**
 * Validate phone number
 */
export const validatePhone = (phone: string): boolean => {
  return VALIDATION_PATTERNS.PHONE.test(phone);
};

/**
 * Validate URL
 */
export const validateUrl = (url: string): boolean => {
  return VALIDATION_PATTERNS.URL.test(url);
};
