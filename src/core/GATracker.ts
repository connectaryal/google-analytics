import { GoogleAnalytics } from './GoogleAnalytics';
import type { GAEvent, TEventParams } from '../types/core';
import { EventCategory, GA_EVENTS } from '../utils/constants';
import { isBrowser } from '../utils/validation';
import { GA4Config, PageViewOptions } from '../types/analytics';
import {
  CartType,
  CartItem,
  EcommerceTrackingOptions,
  EcommerceItem,
  WishlistType,
  PromotionType,
  ItemType,
} from '../types/ecommerce';

export class GATracker extends GoogleAnalytics {
  constructor(config: Readonly<GA4Config>) {
    super(config);
  }

  private readonly buildEvent = (
    name: string,
    params: TEventParams = {},
    category: EventCategory = EventCategory.CUSTOM,
  ): GAEvent => {
    return Object.freeze({
      event_name: name,
      event_parameters: params,
      timestamp: Date.now(),
      event_category: category,
    });
  };

  public trackPage = async (options: PageViewOptions = {}): Promise<void> => {
    const { path, title, referrer } = options;
    const pageUrl = path ?? (isBrowser() ? window.location.href : null);

    // Check if path is available
    if (!pageUrl) {
      if (this.config.debug) {
        console.warn('GA4: Cannot track page view without path');
      }
      return;
    }

    const pageTitle = title ?? (isBrowser() ? document.title : '');
    const pageReferrer = referrer ?? (isBrowser() ? document.referrer : '');

    const event: GAEvent = this.buildEvent(
      GA_EVENTS.PAGE_VIEW,
      {
        page_title: pageTitle,
        page_location: pageUrl,
        page_referrer: pageReferrer,
        ...options.customParams,
      },
      EventCategory.ENGAGEMENT,
    );

    // The base class now handles queuing events until ready
    await this.trackEvent(event);
  };

  public trackCustomEvent = async (
    eventName: string,
    parameters: TEventParams = {},
    category = EventCategory.CUSTOM,
  ): Promise<void> => {
    const event = this.buildEvent(eventName, parameters, category);
    return this.trackEvent(event);
  };

  public trackItem = async (
    action: ItemType,
    items: CartItem[],
    item_list_id?: string,
    item_list_name?: string,
    value?: number,
    customParams: TEventParams = {},
  ): Promise<void> => {
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
      this.buildEvent(eventName, eventParams, EventCategory.ECOMMERCE),
    );
  };

  public trackCart = async (
    action: CartType,
    items: CartItem[],
    value: number,
    customParams: TEventParams = {},
  ): Promise<void> => {
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
      this.buildEvent(eventName, eventParams, EventCategory.ECOMMERCE),
    );
  };

  public trackWishlist = async (
    action: WishlistType,
    items: CartItem[],
    value: number,
    customParams: TEventParams = {},
  ): Promise<void> => {
    if (!items.length) {
      throw new Error(`GA4: Cannot track ${action} with empty items`);
    }

    if (!value) {
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
      this.buildEvent(eventName, eventParams, EventCategory.ECOMMERCE),
    );
  };

  public trackShippingInfo = async (
    items: CartItem[],
    value: number,
    shipping_tier: string,
    customParams: TEventParams = {},
  ): Promise<void> => {
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
      this.buildEvent(
        GA_EVENTS.ADD_SHIPPING_INFO,
        eventParams,
        EventCategory.ECOMMERCE,
      ),
    );
  };

  public trackPaymentInfo = async (
    items: CartItem[],
    value: number,
    payment_type: string,
    customParams: TEventParams = {},
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
      this.buildEvent(
        GA_EVENTS.ADD_PAYMENT_INFO,
        eventParams,
        EventCategory.ECOMMERCE,
      ),
    );
  };

  public trackBeginCheckout = async (
    value: number,
    items: CartItem[] = [],
    customParams: TEventParams = {},
  ): Promise<void> => {
    try {
      return this.trackEvent(
        this.buildEvent(
          GA_EVENTS.BEGIN_CHECKOUT,
          {
            currency: this.config.currency,
            value: +value.toFixed(2),
            items,
            ...customParams,
          },
          EventCategory.ECOMMERCE,
        ),
      );
    } catch (error) {
      if (this.config.debug)
        console.error('GA4: Error tracking begin_checkout', error);
    }
  };

  public trackPurchase = async (
    transactionId: string,
    value: number,
    items: EcommerceItem[] = [],
    customParams: EcommerceTrackingOptions = {},
  ): Promise<void> => {
    if (!transactionId || value <= 0)
      throw new Error('GA4: Invalid purchase parameters');

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
      this.buildEvent(GA_EVENTS.PURCHASE, eventParams, EventCategory.ECOMMERCE),
    );
  };

  public trackRefund = async (
    transactionId: string,
    value: number,
    items: EcommerceItem[] = [],
    customParams: EcommerceTrackingOptions = {},
  ): Promise<void> => {
    if (!transactionId || value <= 0)
      throw new Error('GA4: Invalid refund parameters');

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
      this.buildEvent(GA_EVENTS.REFUND, eventParams, EventCategory.ECOMMERCE),
    );
  };

  public trackSearch = async (
    searchTerm: string,
    options: TEventParams = {},
  ): Promise<void> => {
    if (!searchTerm?.trim()) {
      if (this.config.debug) console.warn('GA4: Search term is required');
      return;
    }
    return this.trackEvent(
      this.buildEvent(
        GA_EVENTS.SEARCH,
        { search_term: searchTerm.trim(), ...options },
        EventCategory.ENGAGEMENT,
      ),
    );
  };

  public trackPromotion = async (
    action: PromotionType,
    items: CartItem[],
    creative_name: string,
    creative_slot: string,
    promotion_id: string,
    promotion_name: string,
    customParams: TEventParams = {},
  ): Promise<void> => {
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
      this.buildEvent(eventName, eventParams, EventCategory.ECOMMERCE),
    );
  };

  public trackEngagement = async (
    type: string,
    options: TEventParams = {},
  ): Promise<void> => {
    return this.trackEvent(
      this.buildEvent(
        GA_EVENTS.USER_ENGAGEMENT,
        { engagement_type: type, ...options },
        EventCategory.ENGAGEMENT,
      ),
    );
  };

  public trackLogin = async (
    method: string,
    customParams: TEventParams = {},
  ): Promise<void> => {
    return this.trackEvent(
      this.buildEvent(
        GA_EVENTS.LOGIN,
        { method, ...customParams },
        EventCategory.CONVERSION,
      ),
    );
  };

  public trackSignUp = async (
    method: string,
    customParams: TEventParams = {},
  ): Promise<void> => {
    return this.trackEvent(
      this.buildEvent(
        GA_EVENTS.SIGN_UP,
        { method, ...customParams },
        EventCategory.CONVERSION,
      ),
    );
  };

  public trackShare = async (
    contentType: string,
    contentId: string,
    method: string,
    customParams: TEventParams = {},
  ): Promise<void> => {
    return this.trackEvent(
      this.buildEvent(
        GA_EVENTS.SHARE,
        {
          content_type: contentType,
          content_id: contentId,
          method,
          ...customParams,
        },
        EventCategory.ENGAGEMENT,
      ),
    );
  };

  public trackVideoPlay = async (
    title: string,
    url: string,
    duration?: number,
    customParams: TEventParams = {},
  ): Promise<void> => {
    return this.trackEvent(
      this.buildEvent(
        GA_EVENTS.VIDEO_START,
        {
          video_title: title,
          video_url: url,
          ...(duration && { video_duration: duration }),
          ...customParams,
        },
        EventCategory.ENGAGEMENT,
      ),
    );
  };

  public trackException = async (
    description: string,
    fatal = false,
    customParams: TEventParams = {},
  ): Promise<void> => {
    return this.trackEvent(
      this.buildEvent(
        'exception',
        { description, fatal, ...customParams },
        EventCategory.ERROR,
      ),
    );
  };

  public trackTiming = async (
    category: string,
    variable: string,
    value: number,
    label?: string,
  ): Promise<void> => {
    return this.trackEvent(
      this.buildEvent(
        'timing_complete',
        {
          name: variable,
          value: Math.round(value),
          event_category: category,
          ...(label && { event_label: label }),
        },
        EventCategory.PERFORMANCE,
      ),
    );
  };
}

export default GATracker;
