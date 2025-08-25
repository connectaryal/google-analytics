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
} from "../types/ecommerce";

export class GATracker extends GoogleAnalytics {
  constructor(config: Readonly<GA4Config>) {
    super(config);
  }

  private buildEvent(
    name: string,
    params: TEventParams = {},
    category: EventCategory = EventCategory.CUSTOM
  ): GAEvent {
    return Object.freeze({
      event_name: name,
      event_parameters: params,
      timestamp: Date.now(),
      event_category: category,
    });
  }

  public trackPageView = async (
    options: PageViewOptions = {}
  ): Promise<void> => {
    const { path, title, referrer } = options;
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

    const event: GAEvent = this.buildEvent(
      GA_EVENTS.PAGE_VIEW,
      {
        page_title: pageTitle,
        page_location: pageUrl,
        page_referrer: pageReferrer,
        ...options.customParams,
      },
      EventCategory.ENGAGEMENT
    );

    // The base class now handles queuing events until ready
    await this.trackEvent(event);
  };

  public async trackCustomEvent(
    eventName: string,
    parameters: TEventParams = {},
    category = EventCategory.CUSTOM
  ): Promise<void> {
    const event = this.buildEvent(eventName, parameters, category);
    return this.trackEvent(event);
  }

  public trackCart = async (
    action: CartType,
    items: CartItem[] = [],
    value?: number,
    customParams: TEventParams = {}
  ): Promise<void> => {
    if (!items.length) {
      throw new Error(`GA4: Cannot track ${action} with empty items`);
    }

    const eventName = (() => {
      switch (action) {
        case CartType.ADD_TO_CART:
          return GA_EVENTS.ADD_TO_CART;
        case CartType.REMOVE_FROM_CART:
          return GA_EVENTS.REMOVE_FROM_CART;
        case CartType.VIEW_CART:
          return GA_EVENTS.VIEW_CART;
        default:
          throw new Error(`GA4: Unsupported cart action ${action}`);
      }
    })();

    const eventParams: TEventParams = {
      currency: this.config.currency,
      items: items.map((item) => ({
        quantity: 1,
        ...item,
        price: +item.price.toFixed(2),
      })),
      ...customParams,
    };

    if (value !== undefined) {
      eventParams.value = +value.toFixed(2);
    }

    return this.trackEvent(
      this.buildEvent(eventName, eventParams, EventCategory.ECOMMERCE)
    );
  };

  public async trackBeginCheckout(
    value: number,
    items: unknown[] = [],
    customParams: TEventParams = {}
  ): Promise<void> {
    return this.trackEvent(
      this.buildEvent(
        GA_EVENTS.BEGIN_CHECKOUT,
        {
          currency: this.config.currency,
          value: +value.toFixed(2),
          items,
          ...customParams,
        },
        EventCategory.ECOMMERCE
      )
    );
  }

  public async trackPurchase(
    transactionId: string,
    value: number,
    items: EcommerceItem[] = [],
    options: EcommerceTrackingOptions = {}
  ): Promise<void> {
    if (!transactionId || value <= 0)
      throw new Error("GA4: Invalid purchase parameters");

    return this.trackEvent(
      this.buildEvent(
        GA_EVENTS.PURCHASE,
        {
          transaction_id: transactionId,
          value: +value.toFixed(2),
          currency: this.config.currency,
          ...(items.length && { items }),
          ...options,
        },
        EventCategory.ECOMMERCE
      )
    );
  }

  public async trackSearch(
    searchTerm: string,
    options: TEventParams = {}
  ): Promise<void> {
    if (!searchTerm?.trim()) {
      if (this.config.debug) console.warn("GA4: Search term is required");
      return;
    }
    return this.trackEvent(
      this.buildEvent(
        GA_EVENTS.SEARCH,
        { search_term: searchTerm.trim(), ...options },
        EventCategory.ENGAGEMENT
      )
    );
  }

  public async trackEngagement(
    type: string,
    options: TEventParams = {}
  ): Promise<void> {
    return this.trackEvent(
      this.buildEvent(
        GA_EVENTS.USER_ENGAGEMENT,
        { engagement_type: type, ...options },
        EventCategory.ENGAGEMENT
      )
    );
  }

  public async trackLogin(
    method: string,
    customParams: TEventParams = {}
  ): Promise<void> {
    return this.trackEvent(
      this.buildEvent(
        GA_EVENTS.LOGIN,
        { method, ...customParams },
        EventCategory.CONVERSION
      )
    );
  }

  public async trackSignUp(
    method: string,
    customParams: TEventParams = {}
  ): Promise<void> {
    return this.trackEvent(
      this.buildEvent(
        GA_EVENTS.SIGN_UP,
        { method, ...customParams },
        EventCategory.CONVERSION
      )
    );
  }

  public async trackShare(
    contentType: string,
    contentId: string,
    method: string,
    customParams: TEventParams = {}
  ): Promise<void> {
    return this.trackEvent(
      this.buildEvent(
        GA_EVENTS.SHARE,
        {
          content_type: contentType,
          content_id: contentId,
          method,
          ...customParams,
        },
        EventCategory.ENGAGEMENT
      )
    );
  }

  public async trackVideoPlay(
    title: string,
    url: string,
    duration?: number,
    customParams: TEventParams = {}
  ): Promise<void> {
    return this.trackEvent(
      this.buildEvent(
        GA_EVENTS.VIDEO_START,
        {
          video_title: title,
          video_url: url,
          ...(duration && { video_duration: duration }),
          ...customParams,
        },
        EventCategory.ENGAGEMENT
      )
    );
  }

  public async trackException(
    description: string,
    fatal = false,
    customParams: TEventParams = {}
  ): Promise<void> {
    return this.trackEvent(
      this.buildEvent(
        "exception",
        { description, fatal, ...customParams },
        EventCategory.ERROR
      )
    );
  }

  public async trackTiming(
    category: string,
    variable: string,
    value: number,
    label?: string
  ): Promise<void> {
    return this.trackEvent(
      this.buildEvent(
        "timing_complete",
        {
          name: variable,
          value: Math.round(value),
          event_category: category,
          ...(label && { event_label: label }),
        },
        EventCategory.PERFORMANCE
      )
    );
  }
}

export default GATracker;
