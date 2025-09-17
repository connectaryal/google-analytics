import { GoogleAnalytics } from "./GoogleAnalytics";
import type { GAEvent, TEventParams } from "../types/core";
import { EventCategory, GA_EVENTS } from "../utils/constants";
import { isBrowser } from "../utils/validation";
import { GA4Config, PageViewOptions } from "../types/analytics";
import {
  CartType,
  CartItem,
  EcommerceTrackingOptions,
  EcommerceItem,
  WishlistType,
  PromotionType,
  ItemType,
} from "../types/ecommerce";

export class GATracker extends GoogleAnalytics {
  constructor(config: Readonly<GA4Config>) {
    super(config);
  }

  /**
   * Builds a Google Analytics event object with the specified parameters.
   *
   * @param name - The name of the event.
   * @param params - Optional parameters associated with the event.
   * @param category - The category of the event. Defaults to `EventCategory.CUSTOM`.
   * @returns A frozen `GAEvent` object containing the event name, parameters, timestamp, and category.
   */
  private readonly buildEvent = ({
    name,
    params = {},
    category = EventCategory.CUSTOM,
  }: {
    name: string;
    params?: TEventParams;
    category?: EventCategory;
  }): GAEvent => {
    return Object.freeze({
      event_name: name,
      event_parameters: params,
      event_category: category,
    });
  };

  /**
   * Tracks a page view event using Google Analytics 4 (GA4).
   *
   * This method constructs and sends a page view event with relevant metadata such as
   * page title, location (URL), referrer, and any additional parameters provided.
   * If the `path` is not specified, it attempts to use the current browser location.
   * If no valid path is available, the event will not be tracked and a warning is logged in debug mode.
   *
   * @param {PageViewOptions} options - The options for tracking the page view.
   * @param {string} [options.path] - The URL path of the page. Defaults to the current browser location if not provided.
   * @param {string} [options.title] - The title of the page. Defaults to the current document title if not provided.
   * @param {string} [options.referrer] - The referrer URL. Defaults to the current document referrer if not provided.
   * @param {...Record<string, any>} [options.params] - Additional custom parameters to include in the event.
   * @returns {Promise<void>} Resolves when the event has been queued or sent.
   */
  public trackPage = async ({
    path,
    title,
    referrer,
    ...params
  }: PageViewOptions): Promise<void> => {
    const pageUrl = path ?? (isBrowser() ? window.location.href : null);

    // Check if path is available
    if (!pageUrl) {
      if (this.config.debug) {
        console.warn("GA4: Cannot track page view without path");
      }
      return;
    }

    const pageTitle = title ?? (isBrowser() ? document.title : "");
    const pageReferrer = referrer ?? (isBrowser() ? document.referrer : "");

    const event: GAEvent = this.buildEvent({
      name: GA_EVENTS.PAGE_VIEW,
      params: {
        page_title: pageTitle,
        page_location: pageUrl,
        page_referrer: pageReferrer,
        ...params,
      },
      category: EventCategory.ENGAGEMENT,
    });

    // The base class now handles queuing events until ready
    await this.trackEvent(event);
  };

  /**
   * Tracks a custom event with the specified name, parameters, and category.
   *
   * @param name - The name of the custom event to track.
   * @param params - Optional parameters associated with the event.
   * @param category - The category of the event. Defaults to `EventCategory.CUSTOM`.
   * @returns A promise that resolves when the event has been tracked.
   */
  public trackCustomEvent = async ({
    name,
    params = {},
    category = EventCategory.CUSTOM,
  }: {
    name: string;
    params?: TEventParams;
    category?: EventCategory;
  }): Promise<void> => {
    const event = this.buildEvent({
      name,
      params,
      category,
    });
    return this.trackEvent(event);
  };

  /**
   * Tracks an item-related event in Google Analytics 4 (GA4).
   *
   * Depending on the provided `action`, this method sends a corresponding GA4 event
   * (e.g., select item, view item, view item list) with the specified items and parameters.
   * Throws an error if the items array is empty or if the action is unsupported.
   *
   * @param params - The parameters for tracking the item event.
   * @param params.action - The type of item event to track (e.g., select, view).
   * @param params.items - The list of cart items involved in the event.
   * @param params.item_list_id - (Optional) The ID of the item list.
   * @param params.item_list_name - (Optional) The name of the item list.
   * @param params.value - (Optional) The monetary value associated with the event.
   * @param params.customParams - Additional custom event parameters.
   * @throws Will throw an error if `items` is empty or if the `action` is unsupported.
   * @returns A promise that resolves when the event has been tracked.
   */
  public trackItem = async ({
    action,
    items,
    item_list_id,
    item_list_name,
    value,
    customParams,
  }: {
    action: ItemType;
    items: CartItem[];
    item_list_id?: string;
    item_list_name?: string;
    value?: number;
    customParams: TEventParams;
  }): Promise<void> => {
    if (!items.length) {
      throw new Error(`GA4: Cannot track ${action} with empty items`);
    }

    const eventName = (() => {
      switch (action) {
        case ItemType.SELECT_ITEM:
          return GA_EVENTS.SELECT_ITEM;
        case ItemType.VIEW_ITEM:
          return GA_EVENTS.VIEW_ITEM;
        case ItemType.VIEW_ITEM_LIST:
          return GA_EVENTS.VIEW_ITEM_LIST;
        default:
          throw new Error(`GA4: Unsupported cart action ${action}`);
      }
    })();

    const eventParams: TEventParams = {
      items: items.map((item) => ({
        quantity: item.quantity || 1,
        ...item,
        price: +item.price.toFixed(2),
      })),
      ...customParams,
    };

    if (action === ItemType.VIEW_ITEM) {
      eventParams.currency = this.config.currency;
      eventParams.value = value;
    } else {
      eventParams.item_list_id = item_list_id;
      eventParams.item_list_name = item_list_name;
    }

    return this.trackEvent(
      this.buildEvent({
        name: eventName,
        params: eventParams,
        category: EventCategory.ECOMMERCE,
      })
    );
  };

  /**
   * Tracks cart-related events in Google Analytics 4 (GA4).
   *
   * Supported actions include adding, removing, viewing, and updating cart items.
   * Throws an error if the items array is empty or if the value is not provided.
   *
   * @param {Object} params - The parameters for tracking the cart event.
   * @param {CartType} params.action - The cart action to track (add, remove, view, update).
   * @param {CartItem[]} params.items - The list of cart items involved in the event.
   * @param {number} params.value - The total value associated with the cart event.
   * @param {TEventParams} [params.customParams={}] - Additional custom event parameters.
   * @returns {Promise<void>} Resolves when the event has been successfully tracked.
   * @throws {Error} If items array is empty or value is not provided.
   */
  public trackCart = async ({
    action,
    items,
    value,
    customParams = {},
  }: {
    action: CartType;
    items: CartItem[];
    value: number;
    customParams?: TEventParams;
  }): Promise<void> => {
    if (!items.length) {
      throw new Error(`GA4: Cannot track ${action} with empty items`);
    }

    if (!value) {
      throw new Error(`GA4: Cannot track ${action} without value`);
    }

    const eventName = (() => {
      switch (action) {
        case CartType.ADD_TO_CART:
          return GA_EVENTS.ADD_TO_CART;
        case CartType.REMOVE_FROM_CART:
          return GA_EVENTS.REMOVE_FROM_CART;
        case CartType.VIEW_CART:
          return GA_EVENTS.VIEW_CART;
        case CartType.UPDATE_CART:
          return GA_EVENTS.UPDATE_CART;
        default:
          throw new Error(`GA4: Unsupported cart action ${action}`);
      }
    })();

    const eventParams: TEventParams = {
      currency: this.config.currency,
      value: +value.toFixed(2),
      items: items.map((item) => ({
        quantity: item.quantity || 1,
        ...item,
        price: +item.price.toFixed(2),
      })),
      ...customParams,
    };

    return this.trackEvent(
      this.buildEvent({
        name: eventName,
        params: eventParams,
        category: EventCategory.ECOMMERCE,
      })
    );
  };

  /**
   * Tracks wishlist-related events in Google Analytics 4 (GA4).
   *
   * @param params - The parameters for tracking the wishlist event.
   * @param params.action - The type of wishlist action (add, remove, view, update).
   * @param params.items - The list of items involved in the wishlist event.
   * @param params.value - The total value associated with the wishlist event.
   * @param params.customParams - Optional custom event parameters to include.
   * @throws Will throw an error if `items` is empty or `value` is null/undefined.
   * @throws Will throw an error if the `action` is not supported.
   * @returns A promise that resolves when the event has been tracked.
   */
  public trackWishlist = async ({
    action,
    items,
    value,
    customParams = {},
  }: {
    action: WishlistType;
    items: CartItem[];
    value: number;
    customParams?: TEventParams;
  }): Promise<void> => {
    if (!items.length) {
      throw new Error(`GA4: Cannot track ${action} with empty items`);
    }

    if (value == null) {
      throw new Error(`GA4: Cannot track ${action} without value`);
    }

    const eventName = (() => {
      switch (action) {
        case WishlistType.ADD_TO_WISHLIST:
          return GA_EVENTS.ADD_TO_WISHLIST;
        case WishlistType.REMOVE_FROM_WISHLIST:
          return GA_EVENTS.REMOVE_FROM_WISHLIST;
        case WishlistType.VIEW_WISHLIST:
          return GA_EVENTS.VIEW_WISHLIST;
        case WishlistType.UPDATE_WISHLIST:
          return GA_EVENTS.UPDATE_WISHLIST;
        default:
          throw new Error(`GA4: Unsupported wishlist action ${action}`);
      }
    })();

    const eventParams: TEventParams = {
      currency: this.config.currency,
      value: +value.toFixed(2),
      items: items.map((item) => ({
        quantity: item.quantity || 1,
        ...item,
        price: +item.price.toFixed(2),
      })),
      ...customParams,
    };

    return this.trackEvent(
      this.buildEvent({
        name: eventName,
        params: eventParams,
        category: EventCategory.ECOMMERCE,
      })
    );
  };

  /**
   * Tracks the shipping information event for Google Analytics 4 (GA4).
   *
   * This method records details about the shipping tier and cart items when a user provides shipping information.
   * Throws an error if the items array is empty or if the value is not provided.
   *
   * @param items - Array of cart items to be tracked. Each item should include quantity and price.
   * @param value - Total value of the items being shipped.
   * @param shipping_tier - The selected shipping tier (e.g., "standard", "express").
   * @param customParams - Optional additional event parameters to include.
   * @throws {Error} If the items array is empty or value is not provided.
   * @returns A promise that resolves when the event has been tracked.
   */
  public trackShippingInfo = async ({
    items,
    value,
    shipping_tier,
    customParams = {},
  }: {
    items: CartItem[];
    value: number;
    shipping_tier: string;
    customParams?: TEventParams;
  }): Promise<void> => {
    if (!items.length) {
      throw new Error(`GA4: Cannot track shipping info with empty items`);
    }

    if (!value) {
      throw new Error(`GA4: Cannot track shipping info without value`);
    }

    const eventParams: TEventParams = {
      currency: this.config.currency,
      value: +value.toFixed(2),
      items: items.map((item) => ({
        quantity: item.quantity || 1,
        ...item,
        price: +item.price.toFixed(2),
      })),
      shipping_tier,
      ...customParams,
    };

    return this.trackEvent(
      this.buildEvent({
        name: GA_EVENTS.ADD_SHIPPING_INFO,
        params: eventParams,
        category: EventCategory.ECOMMERCE,
      })
    );
  };

  /**
   * Tracks the payment information event in Google Analytics 4 (GA4).
   *
   * This method sends an event with payment details, including cart items, total value,
   * payment type, and any custom parameters. Throws an error if the items array is empty
   * or the value is not provided.
   *
   * @param items - Array of cart items to be tracked. Each item should include quantity and price.
   * @param value - The total value of the payment transaction.
   * @param payment_type - The type of payment used (e.g., 'credit_card', 'paypal').
   * @param customParams - Optional custom event parameters to include in the tracking event.
   * @throws {Error} If the items array is empty or the value is not provided.
   * @returns A promise that resolves when the event has been tracked.
   */
  public trackPaymentInfo = async (
    items: CartItem[],
    value: number,
    payment_type: string,
    customParams?: TEventParams
  ): Promise<void> => {
    if (!items.length) {
      throw new Error(`GA4: Cannot track payment info with empty items`);
    }

    if (!value) {
      throw new Error(`GA4: Cannot track payment info without value`);
    }

    const eventParams: TEventParams = {
      currency: this.config.currency,
      value: +value.toFixed(2),
      items: items.map((item) => ({
        quantity: item.quantity || 1,
        ...item,
        price: +item.price.toFixed(2),
      })),
      payment_type,
      ...customParams,
    };

    return this.trackEvent(
      this.buildEvent({
        name: GA_EVENTS.ADD_PAYMENT_INFO,
        params: eventParams,
        category: EventCategory.ECOMMERCE,
      })
    );
  };

  /**
   * Tracks the "begin_checkout" event in Google Analytics 4 (GA4).
   *
   * This method should be called when a user initiates the checkout process.
   * It sends an event with details about the cart items, total value, and any custom parameters.
   *
   * @param value - The total value of the cart at the beginning of checkout.
   * @param items - An array of cart items being checked out.
   * @param customParams - Additional custom parameters to include in the event.
   * @returns A promise that resolves when the event has been tracked.
   *
   * @remarks
   * If tracking fails and debug mode is enabled, an error will be logged to the console.
   */
  public trackBeginCheckout = async ({
    value,
    items = [],
    customParams = {},
  }: {
    value: number;
    items: CartItem[];
    customParams?: TEventParams;
  }): Promise<void> => {
    try {
      return this.trackEvent(
        this.buildEvent({
          name: GA_EVENTS.BEGIN_CHECKOUT,
          params: {
            currency: this.config.currency,
            value: +value.toFixed(2),
            items: items.map((item) => ({
              quantity: item.quantity || 1,
              ...item,
              price: +item.price.toFixed(2),
            })),
            ...customParams,
          },
          category: EventCategory.ECOMMERCE,
        })
      );
    } catch (error) {
      if (this.config.debug)
        console.error("GA4: Error tracking begin_checkout", error);
    }
  };

  /**
   * Tracks a purchase event in Google Analytics 4 (GA4).
   *
   * @param params - The purchase event parameters.
   * @param params.transactionId - The unique identifier for the transaction.
   * @param params.value - The total value of the purchase (must be greater than 0).
   * @param params.items - An array of purchased items, each containing details such as quantity and price.
   * @param params.customParams - Optional custom parameters to include with the event.
   * @throws {Error} Throws if the transactionId is missing or the value is not greater than 0.
   * @returns A promise that resolves when the event has been tracked.
   */
  public trackPurchase = async ({
    transactionId,
    value,
    items = [],
    customParams = {},
  }: {
    transactionId: string;
    value: number;
    items: EcommerceItem[];
    customParams?: EcommerceTrackingOptions;
  }): Promise<void> => {
    if (!transactionId || value <= 0) {
      throw new Error("GA4: Invalid purchase parameters");
    }

    const eventParams: TEventParams = {
      transaction_id: transactionId,
      currency: this.config.currency,
      value: +value.toFixed(2), // Sum of (price * quantity) for all items.
      items: items.map((item) => ({
        quantity: item.quantity || 1,
        ...item,
        price: +item.price.toFixed(2),
      })),
      ...customParams,
    };

    return this.trackEvent(
      this.buildEvent({
        name: GA_EVENTS.PURCHASE,
        params: eventParams,
        category: EventCategory.ECOMMERCE,
      })
    );
  };

  /**
   * Tracks a refund event in Google Analytics 4 (GA4).
   *
   * @param params - The refund event parameters.
   * @param params.transactionId - The unique identifier for the transaction being refunded.
   * @param params.value - The total refund value. Must be greater than 0.
   * @param params.items - An array of refunded items, each containing quantity and price details.
   * @param params.customParams - Additional custom parameters for the refund event.
   * @throws {Error} If the transactionId is missing or the value is not greater than 0.
   * @returns A promise that resolves when the refund event has been tracked.
   */
  public trackRefund = async ({
    transactionId,
    value,
    items = [],
    customParams = {},
  }: {
    transactionId: string;
    value: number;
    items: EcommerceItem[];
    customParams?: TEventParams;
  }): Promise<void> => {
    if (!transactionId || value <= 0)
      throw new Error("GA4: Invalid refund parameters");

    const eventParams: TEventParams = {
      transaction_id: transactionId,
      currency: this.config.currency,
      value: +value.toFixed(2), // Sum of (price * quantity) for all items.
      items: items.map((item) => ({
        quantity: item.quantity || 1,
        ...item,
        price: +item.price.toFixed(2),
      })),
      ...customParams,
    };

    return this.trackEvent(
      this.buildEvent({
        name: GA_EVENTS.REFUND,
        params: eventParams,
        category: EventCategory.ECOMMERCE,
      })
    );
  };

  /**
   * Tracks a search event in Google Analytics 4 (GA4).
   *
   * @param {Object} params - The parameters for the search event.
   * @param {string} params.searchTerm - The search term entered by the user. Must be a non-empty string.
   * @param {TEventParams} [params.options={}] - Additional event parameters to include.
   * @returns {Promise<void>} A promise that resolves when the event has been tracked.
   *
   * @remarks
   * If the search term is empty or only whitespace, the event will not be tracked and a warning will be logged in debug mode.
   */
  public trackSearch = async ({
    searchTerm,
    options = {},
  }: {
    searchTerm: string;
    options?: TEventParams;
  }): Promise<void> => {
    if (!searchTerm?.trim()) {
      if (this.config.debug) console.warn("GA4: Search term is required");
      return;
    }
    return this.trackEvent(
      this.buildEvent({
        name: GA_EVENTS.SEARCH,
        params: { search_term: searchTerm.trim(), ...options },
        category: EventCategory.ENGAGEMENT,
      })
    );
  };

  /**
   * Tracks a promotion event in Google Analytics 4 (GA4).
   *
   * This method records either a promotion view or selection event, including details about the promotion and associated items.
   * Throws an error if required parameters are missing or invalid.
   *
   * @param params - The parameters for tracking the promotion event.
   * @param params.action - The type of promotion event (view or select).
   * @param params.items - The list of cart items involved in the promotion.
   * @param params.creative_name - The name of the creative associated with the promotion.
   * @param params.creative_slot - The slot of the creative.
   * @param params.promotion_id - The unique identifier for the promotion.
   * @param params.promotion_name - The name of the promotion.
   * @param params.customParams - Optional custom event parameters to include.
   * @throws {Error} If `items` is empty, `creative_name` is missing, or the action is unsupported.
   * @returns A promise that resolves when the event has been tracked.
   */
  public trackPromotion = async ({
    action,
    items,
    creative_name,
    creative_slot,
    promotion_id,
    promotion_name,
    customParams = {},
  }: {
    action: PromotionType;
    items: CartItem[];
    creative_name: string;
    creative_slot: string;
    promotion_id: string;
    promotion_name: string;
    customParams?: TEventParams;
  }): Promise<void> => {
    if (!items.length) {
      throw new Error(`GA4: Cannot track ${action} with empty items`);
    }

    if (!creative_name) {
      throw new Error(`GA4: Cannot track ${action} without creative_name`);
    }

    const eventName = (() => {
      switch (action) {
        case PromotionType.VIEW_PROMOTION:
          return GA_EVENTS.VIEW_PROMOTION;
        case PromotionType.SELECT_PROMOTION:
          return GA_EVENTS.SELECT_PROMOTION;
        default:
          throw new Error(`GA4: Unsupported promotion action ${action}`);
      }
    })();

    const eventParams: TEventParams = {
      creative_name,
      creative_slot,
      promotion_id,
      promotion_name,
      items: items.map((item) => ({
        quantity: item.quantity || 1,
        ...item,
        price: +item.price.toFixed(2),
      })),
      ...customParams,
    };

    return this.trackEvent(
      this.buildEvent({
        name: eventName,
        params: eventParams,
        category: EventCategory.ECOMMERCE,
      })
    );
  };

  /**
   * Tracks a user engagement event with Google Analytics.
   *
   * @param params - An object containing the engagement type and additional event parameters.
   * @param params.type - The type of engagement to track (e.g., 'click', 'scroll').
   * @param params.options - Additional parameters for the event.
   * @returns A promise that resolves when the event has been tracked.
   */
  public trackEngagement = async ({
    type,
    options = {},
  }: {
    type: string;
    options?: TEventParams;
  }): Promise<void> => {
    return this.trackEvent(
      this.buildEvent({
        name: GA_EVENTS.USER_ENGAGEMENT,
        params: { engagement_type: type, ...options },
        category: EventCategory.ENGAGEMENT,
      })
    );
  };

  /**
   * Tracks a user login event using Google Analytics.
   *
   * @param {Object} options - The options for tracking the login event.
   * @param {string} options.method - The login method used (e.g., 'Google', 'Email').
   * @param {TEventParams} [options.customParams={}] - Additional custom parameters to include with the event.
   * @returns {Promise<void>} A promise that resolves when the event has been tracked.
   */
  public trackLogin = async ({
    method,
    customParams = {},
  }: {
    method: string;
    customParams?: TEventParams;
  }): Promise<void> => {
    return this.trackEvent(
      this.buildEvent({
        name: GA_EVENTS.LOGIN,
        params: { method, ...customParams },
        category: EventCategory.CONVERSION,
      })
    );
  };

  /**
   * Tracks a user sign-up event using Google Analytics.
   *
   * @param options - An object containing the sign-up method and any custom event parameters.
   * @param options.method - The method used for sign-up (e.g., 'email', 'google', etc.).
   * @param options.customParams - Additional custom parameters to include with the event.
   * @returns A promise that resolves when the event has been tracked.
   */
  public trackSignUp = async ({
    method,
    customParams = {},
  }: {
    method: string;
    customParams?: TEventParams;
  }): Promise<void> => {
    return this.trackEvent(
      this.buildEvent({
        name: GA_EVENTS.SIGN_UP,
        params: { method, ...customParams },
        category: EventCategory.CONVERSION,
      })
    );
  };

  /**
   * Tracks a share event in Google Analytics.
   *
   * @param params - An object containing the share event details.
   * @param params.contentType - The type of content being shared (e.g., "article", "image").
   * @param params.contentId - The unique identifier of the content being shared.
   * @param params.method - The method used to share the content (e.g., "email", "social").
   * @param params.customParams - Additional custom event parameters to include.
   * @returns A promise that resolves when the event has been tracked.
   */
  public trackShare = async ({
    contentType,
    contentId,
    method,
    customParams = {},
  }: {
    contentType: string;
    contentId: string;
    method: string;
    customParams?: TEventParams;
  }): Promise<void> => {
    return this.trackEvent(
      this.buildEvent({
        name: GA_EVENTS.SHARE,
        params: {
          content_type: contentType,
          content_id: contentId,
          method,
          ...customParams,
        },
        category: EventCategory.ENGAGEMENT,
      })
    );
  };

  /**
   * Tracks the start of a video play event in Google Analytics.
   *
   * @param {Object} params - The parameters for the video play event.
   * @param {string} params.title - The title of the video.
   * @param {string} params.url - The URL of the video.
   * @param {number} [params.duration] - The duration of the video in seconds (optional).
   * @param {TEventParams} params.customParams - Additional custom event parameters.
   * @returns {Promise<void>} A promise that resolves when the event has been tracked.
   */
  public trackVideoPlay = async ({
    title,
    url,
    duration,
    customParams = {},
  }: {
    title: string;
    url: string;
    duration?: number;
    customParams?: TEventParams;
  }): Promise<void> => {
    return this.trackEvent(
      this.buildEvent({
        name: GA_EVENTS.VIDEO_START,
        params: {
          video_title: title,
          video_url: url,
          ...(duration && { video_duration: duration }),
          ...customParams,
        },
        category: EventCategory.ENGAGEMENT,
      })
    );
  };

  /**
   * Tracks an exception event in Google Analytics.
   *
   * @param params - An object containing details about the exception.
   * @param params.description - A description of the exception.
   * @param params.fatal - Indicates if the exception was fatal. Defaults to `false`.
   * @param params.customParams - Additional custom parameters to include with the event.
   * @returns A promise that resolves when the event has been tracked.
   */
  public trackException = async ({
    description,
    fatal = false,
    customParams = {},
  }: {
    description: string;
    fatal?: boolean;
    customParams?: TEventParams;
  }): Promise<void> => {
    return this.trackEvent(
      this.buildEvent({
        name: GA_EVENTS.EXCEPTION,
        params: { description, fatal, ...customParams },
        category: EventCategory.ERROR,
      })
    );
  };

  /**
   * Tracks a form submission event with Google Analytics.
   *
   * This method captures form submission data and sends it to GA as a conversion event.
   * The form data is automatically serialized and included in the event parameters.
   *
   * @param options - The form submission tracking options
   * @param options.formId - Unique identifier for the form being submitted
   * @param options.formData - Key-value pairs representing the form field data
   * @param options.customParams - Optional additional parameters to include with the event
   * @returns A promise that resolves when the form submission event has been tracked
   */
  public trackFormSubmission = async ({
    formId,
    formData,
    customParams = {},
  }: {
    formId: string;
    formData: Record<string, any>;
    customParams?: TEventParams;
  }): Promise<void> => {
    return this.trackEvent(
      this.buildEvent({
        name: GA_EVENTS.FORM_SUBMIT,
        params: {
          form_id: formId,
          form_data: formData,
          ...customParams,
        },
        category: EventCategory.CONVERSION,
      })
    );
  };

  /**
   * Tracks a timing event in Google Analytics.
   *
   * @param category - The category of the timing event (e.g., 'Load', 'Render').
   * @param variable - The variable name for the timing event (e.g., 'JS Load').
   * @param value - The timing value in milliseconds.
   * @param label - An optional label to further describe the timing event.
   * @returns A promise that resolves when the timing event has been tracked.
   */
  public trackTiming = async (
    category: string,
    variable: string,
    value: number,
    label?: string
  ): Promise<void> => {
    return this.trackEvent(
      this.buildEvent({
        name: "timing_complete",
        params: {
          name: variable,
          value: Math.round(value),
          timing_category: category,
          ...(label && { event_label: label }),
        },
        category: EventCategory.PERFORMANCE,
      })
    );
  };
}

export default GATracker;
