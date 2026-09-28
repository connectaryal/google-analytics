# @connectaryal/google-analytics

> **Modern Google Analytics 4 & Google Tag Manager** - Type-safe, performance-optimized, production-ready React library.

[![npm version](https://badge.fury.io/js/@connectaryal%2Fgoogle-analytics.svg)](https://badge.fury.io/js/@connectaryal%2Fgoogle-analytics)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-16.8%2B-61dafb.svg)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-Compatible-black.svg)](https://nextjs.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## Why Choose This Library?

Unlike other GA4 libraries, this one is **built for modern React applications** with enterprise-grade features:

- **Zero Configuration** - Works out of the box with sensible defaults
- **100% Type Safe** - Full TypeScript support with intelligent autocomplete
- **Performance Optimized** - Event batching, memory leak prevention, and automatic initialization
- **Complete Ecommerce** - Enhanced ecommerce tracking with all GA4 events
- **Google Tag Manager** - Load a GTM container (`gtmId`) and push every event to the dataLayer in GA4's GTM format
- **React Hooks** - Modern React patterns with custom hooks
- **No Script Conflicts** - Prevents duplicate GA script loading
- **Debug Mode** - Development-friendly error reporting and validation
- **Event Validation** - Automatic parameter validation and sanitization

---

## Quick Start

### Installation

```bash
npm install @connectaryal/google-analytics
# or
yarn add @connectaryal/google-analytics
# or
pnpm add @connectaryal/google-analytics
```

### Basic Setup

```tsx
// 1. Wrap your app with GAProvider
import { GAProvider } from "@connectaryal/google-analytics";

function App() {
  const gaConfig = {
    measurementId: "G-XXXXXXXXXX",
    debug: process.env.NODE_ENV === "development",
  };

  return (
    <GAProvider config={gaConfig}>
      <YourApp />
    </GAProvider>
  );
}
```

> Using Google Tag Manager instead? Pass `gtmId: "GTM-XXXXXXX"`. See [Google Tag Manager](#google-tag-manager).

### Using Analytics Hooks

```tsx
import {
  useGoogleAnalytics,
  useGAEcommerce,
} from "@connectaryal/google-analytics";

function HomePage() {
  const { trackPage, trackCustomEvent } = useGoogleAnalytics();
  const { trackCart } = useGAEcommerce();

  // Track page views automatically
  useEffect(() => {
    trackPage({ title: "Home Page" });
  }, [trackPage]);

  // Track custom events
  const handleHeroCTA = () => {
    trackCustomEvent({
      name: "hero_cta_click",
      params: {
        button_text: "Get Started",
        section: "hero",
      },
    });
  };

  // Track ecommerce events
  const handleAddToCart = (product) => {
    trackCart({
      action: "add_to_cart",
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: product.price,
          quantity: 1,
        },
      ],
      value: product.price,
    });
  };

  return (
    <div>
      <button onClick={handleHeroCTA}>Get Started</button>
      <button onClick={() => handleAddToCart(product)}>Add to Cart</button>
    </div>
  );
}
```

---

## Core Features

### Page Tracking

```tsx
const { trackPage } = useGoogleAnalytics();

// Basic page tracking
trackPage();

// Custom page tracking with parameters
trackPage({
  path: "/products/wireless-headphones",
  title: "Wireless Headphones - Best Audio Experience",
  referrer: "https://google.com",
});

// Track single-page application navigation
const router = useRouter();
useEffect(() => {
  const handleRouteChange = (url) => {
    trackPage({ path: url });
  };

  router.events.on("routeChangeComplete", handleRouteChange);
  return () => router.events.off("routeChangeComplete", handleRouteChange);
}, [router, trackPage]);
```

### Custom Event Tracking

```tsx
const {
  trackCustomEvent,
  trackEngagement,
  trackSearch,
  trackFormSubmission,
  trackVideoPlay,
  trackException,
} = useGoogleAnalytics();

// Simple custom event
trackCustomEvent({
  name: "newsletter_signup",
  params: {
    method: "popup",
    location: "homepage",
  },
});

// User engagement tracking
trackEngagement({
  type: "scroll",
  options: {
    scroll_depth: 75,
    page_title: "Product Details",
  },
});

// Search tracking
trackSearch({
  searchTerm: "wireless headphones",
  options: {
    search_results: 24,
    search_category: "electronics",
  },
});

// Form submission tracking
trackFormSubmission({
  formId: "contact_form",
  formData: {
    form_type: "contact",
    user_type: "new_visitor",
  },
});

// Video interaction tracking
trackVideoPlay({
  title: "Product Demo Video",
  url: "https://example.com/video.mp4",
  duration: 120,
  customParams: {
    video_category: "product_demo",
  },
});

// Exception tracking
trackException({
  description: "Payment processing failed",
  fatal: false,
  customParams: {
    error_code: "PAYMENT_001",
    user_id: "user123",
  },
});
```

### Authentication Events

```tsx
// User login tracking
const { trackLogin, trackSignUp } = useGAAuth();

trackLogin({
  method: "google",
  customParams: {
    user_type: "returning",
  },
});

// User signup tracking
trackSignUp({
  method: "email",
  customParams: {
    campaign: "summer_sale",
  },
});

// Attach a user ID (your own non-PII identifier) and user properties
const { setUserId, setUserProperties } = useGAAuth();

setUserId("user_123"); // gtag("set", { user_id }) or dataLayer.push({ user_id })
setUserProperties({ plan: "pro" }); // gtag("set", "user_properties", …) or dataLayer.push({ user_properties })
setUserId(null); // on logout
```

### Social Sharing

```tsx
// Track social shares
const { trackShare } = useGoogleAnalytics();

trackShare({
  contentType: "article",
  contentId: "how-to-setup-analytics",
  method: "twitter",
  customParams: {
    share_location: "article_bottom",
  },
});
```

---

## Complete Ecommerce Tracking

### Product Interactions

```tsx
const { trackItem } = useGAEcommerce();

// View item
trackItem({
  action: "view_item",
  items: [
    {
      item_id: "SKU123",
      item_name: "Wireless Headphones",
      item_category: "Electronics",
      item_brand: "AudioTech",
      price: 99.99,
      quantity: 1,
    },
  ],
  value: 99.99,
  customParams: {
    source: "product_list",
  },
});

// View item list
trackItem({
  action: "view_item_list",
  items: products,
  item_list_id: "electronics_featured",
  item_list_name: "Featured Electronics",
});

// Select item
trackItem({
  action: "select_item",
  items: [selectedProduct],
  item_list_id: "search_results",
  item_list_name: "Search Results",
});
```

### Shopping Cart

```tsx
const { trackCart } = useGAEcommerce();

// Add to cart
trackCart({
  action: "add_to_cart",
  items: [
    {
      item_id: "SKU123",
      item_name: "Wireless Headphones",
      price: 99.99,
      quantity: 2,
    },
  ],
  value: 199.98,
  customParams: {
    add_source: "product_page",
  },
});

// Remove from cart
trackCart({
  action: "remove_from_cart",
  items: [removedItem],
  value: removedItem.price * removedItem.quantity,
});

// View cart
trackCart({
  action: "view_cart",
  items: cartItems,
  value: cartTotal,
});
```

### Checkout Process

```tsx
const { trackBeginCheckout, trackShippingInfo, trackPaymentInfo } =
  useGAEcommerce();

// Begin checkout
trackBeginCheckout({
  value: 199.98,
  items: cartItems,
  customParams: {
    checkout_step: 1,
    checkout_option: "guest",
  },
});

// Add shipping info
trackShippingInfo({
  items: cartItems,
  value: 199.98,
  shipping_tier: "standard",
  customParams: {
    shipping_cost: 9.99,
  },
});

// Add payment info
trackPaymentInfo(
  cartItems,
  209.97, // total with shipping
  "credit_card",
  {
    payment_provider: "stripe",
  }
);
```

### Purchase & Refunds

```tsx
// Track purchase
const { trackPurchase, trackRefund } = useGAEcommerce();

// Track purchase
trackPurchase({
  transactionId: "ORDER_12345",
  value: 209.97,
  items: purchasedItems,
  customParams: {
    affiliation: "Online Store",
    coupon: "SAVE10",
    shipping: 9.99,
    tax: 16.8,
  },
});

// Track refund
trackRefund({
  transactionId: "ORDER_12345",
  value: 99.99,
  items: [refundedItem],
  customParams: {
    refund_reason: "defective_product",
  },
});
```

### Wishlist Tracking

```tsx
const { trackWishlist } = useGAEcommerce();

// Add to wishlist
trackWishlist({
  action: "add_to_wishlist",
  items: [product],
  value: product.price,
  customParams: {
    wishlist_name: "favorites",
  },
});

// View wishlist
trackWishlist({
  action: "view_wishlist",
  items: wishlistItems,
  value: wishlistTotal,
});
```

### Promotion Tracking

```tsx
const { trackPromotion } = useGAEcommerce();

// View promotion
trackPromotion({
  action: "view_promotion",
  items: promotionalItems,
  creative_name: "Summer Sale Banner",
  creative_slot: "hero_banner",
  promotion_id: "SUMMER2024",
  promotion_name: "Summer Sale 50% Off",
});

// Select promotion
trackPromotion({
  action: "select_promotion",
  items: promotionalItems,
  creative_name: "Summer Sale Banner",
  creative_slot: "hero_banner",
  promotion_id: "SUMMER2024",
  promotion_name: "Summer Sale 50% Off",
});
```

---

## Framework Integration

### Next.js App Router

```tsx
// app/layout.tsx
import { GAProvider } from "@connectaryal/google-analytics";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaConfig = {
    measurementId: "G-XXXXXXXXXX",
    debug: process.env.NODE_ENV === "development",
    currency: "USD",
  };

  return (
    <html lang="en">
      <body>
        <GAProvider config={gaConfig}>{children}</GAProvider>
      </body>
    </html>
  );
}
```

**Suggestion: Wrap by a custom provider**

```tsx
// app/components/AnalyticsTracker.tsx
"use client";

import { usePathname } from "next/navigation";
import { useGoogleAnalytics } from "@connectaryal/google-analytics";
import { useEffect } from "react";

export function AnalyticsLayout() {
  const pathname = usePathname();
  const { trackPage } = useGoogleAnalytics();

  useEffect(() => {
    trackPage({ path: pathname });
  }, [pathname, trackPage]);

  return null;
}
```

### Next.js Pages Router

```tsx
// pages/_app.tsx
import type { AppProps } from "next/app";
import { GAProvider } from "@connectaryal/google-analytics";
import { useRouter } from "next/router";
import { useGoogleAnalytics } from "@connectaryal/google-analytics";
import { useEffect } from "react";

function AnalyticsTracker() {
  const router = useRouter();
  const { trackPage } = useGoogleAnalytics();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      trackPage({ path: url });
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events, trackPage]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  const gaConfig = {
    measurementId: "G-XXXXXXXXXX",
    debug: process.env.NODE_ENV === "development",
    currency: "USD",
  };

  return (
    <GAProvider config={gaConfig}>
      <AnalyticsTracker />
      <Component {...pageProps} />
    </GAProvider>
  );
}
```

### React Router

```tsx
import { BrowserRouter, useLocation } from "react-router-dom";
import { GAProvider, useGoogleAnalytics } from "@connectaryal/google-analytics";

function AnalyticsTracker() {
  const location = useLocation();
  const { trackPage } = useGoogleAnalytics();

  useEffect(() => {
    trackPage({ path: location.pathname });
  }, [location, trackPage]);

  return null;
}

function App() {
  return (
    <GAProvider config={{ measurementId: "G-XXXXXXXXXX" }}>
      <BrowserRouter>
        <AnalyticsTracker />
        <Routes>{/* Your routes */}</Routes>
      </BrowserRouter>
    </GAProvider>
  );
}
```

---

## Google Tag Manager

Pass a GTM container ID as `gtmId` to load the container with `gtm.js`. This is Google's official GTM snippet, not the GA4 `gtag.js` tag. Every hook then pushes its events to `window.dataLayer`, and your container decides which tags fire.

> **Migrating?** If you were passing `GTM-…` as `measurementId`, switch to `gtmId`. That setup loaded the Google tag instead of your container, never fired `gtm.js`, and sent a meaningless `gtag('config', 'GTM-…')`. In v2.0.0, passing a GTM ID as `measurementId` throws an error.

### GTM only: React / Vite

```tsx
// main.tsx
import { GAProvider } from "@connectaryal/google-analytics";

createRoot(document.getElementById("root")!).render(
  <GAProvider config={{ gtmId: "GTM-XXXXXXX" }}>
    <App />
  </GAProvider>
);
```

In a client-only SPA, `GTMNoScript` can't help, because the page never renders without JavaScript. To support no-JS visitors, paste Google's `<noscript>` iframe into `index.html` right after `<body>`.

### GTM only: Next.js App Router

```tsx
// app/layout.tsx
import { GAProvider, GTMNoScript } from "@connectaryal/google-analytics";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID!; // "GTM-XXXXXXX"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Must come right after the opening <body> tag */}
        <GTMNoScript gtmId={GTM_ID} />
        <GAProvider config={{ gtmId: GTM_ID }}>{children}</GAProvider>
      </body>
    </html>
  );
}
```

`GAProvider` is a client component. Nothing touches `window` or `document` during server rendering, and `gtm.js` is injected after hydration. `GTMNoScript` renders:

```html
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
```

It accepts `gtmAuth` and `gtmPreview` for GTM environments, and renders nothing if `gtmId` isn't a valid `GTM-XXXXXXX` ID.

### GTM options

```tsx
<GAProvider
  config={{
    gtmId: "GTM-XXXXXXX",
    dataLayerName: "dataLayer", // custom name adds &l=<name> to gtm.js
    gtmAuth: "aBcD123", // GTM environment: set both gtmAuth and gtmPreview
    gtmPreview: "env-3",
    nonce: cspNonce, // added to injected <script> tags
    customConfig: {
      // Consent Mode v2 defaults, pushed before gtm.js loads
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    },
  }}
>
```

What happens on `init()`:

1. `window[dataLayerName]` is created if missing.
2. If `customConfig` is set, `gtag("consent", "default", customConfig)` is pushed as an `arguments` object, which is the form GTM's Consent Mode expects.
3. `{ "gtm.start": Date.now(), event: "gtm.js" }` is pushed.
4. `https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXXX` is inserted as an async script.

If a `gtm.js` script for the same container is already on the page, for example from a snippet in `index.html`, it isn't injected again and `gtm.js` isn't re-fired. In that case, put your consent defaults in the page before that snippet.

### What gets pushed to the dataLayer

| Call                              | dataLayer push                                                                          |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| `trackCustomEvent({ name, params })` | `{ event: name, ...params }`                                                         |
| `trackPage()`                     | `{ event: "page_view", page_path, page_title, page_location, page_referrer }`           |
| Every `useGAEcommerce` event      | `{ ecommerce: null }`, then `{ event: name, ecommerce: { currency, value, items, … } }` |
| `trackLogin` / `trackSignUp`      | `{ event: "login", method }` / `{ event: "sign_up", method }`                           |
| `setUserId(id)`                   | `{ user_id: id }`                                                                       |
| `setUserProperties(props)`        | `{ user_properties: props }`                                                            |

Ecommerce events follow [Google's GA4 GTM ecommerce format](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce?client_type=gtm). The `{ ecommerce: null }` push stops the previous event's items from leaking into the next one.

> GTM's data model keeps values from earlier pushes. A Data Layer Variable such as `value` still holds the last value that was pushed, even on a later event that didn't set it. Read event-specific values only in tags triggered by that event.

### Setting up tags in the GTM UI

**1. Google tag (GA4 base).** Tags → New → **Google Tag**. Tag ID: `G-XXXXXXXXXX`. Trigger: **Initialization - All Pages**.
If you send page views yourself with `trackPage()`, add the configuration parameter `send_page_view` = `false` so page views aren't counted twice. To attach the user ID, add the configuration parameter `user_id` = `{{DLV - user_id}}`.

**2. Data Layer Variables.** Variables → New → **Data Layer Variable**, one for each parameter you want to read, for example `page_location`, `page_title`, `method`, `user_id` or `user_properties.plan`. Use Data Layer Version 2.

**3. Custom event tags.** Triggers → New → **Custom Event**, with the event name `cta_click`.
Tags → New → **Google Analytics: GA4 Event**. Measurement ID: `G-XXXXXXXXXX`. Event name: `{{Event}}`. Add event parameters mapped to your Data Layer Variables, and attach the trigger.

**4. Page views.** Add a Custom Event trigger for `page_view`. Then add a GA4 Event tag with the event name `page_view` and the parameters `page_location`, `page_title` and `page_referrer`, mapped to their Data Layer Variables.

**5. Ecommerce.** Add a Custom Event trigger with **Use regex matching** turned on:

```
^(view_item_list|select_item|view_item|add_to_cart|remove_from_cart|view_cart|begin_checkout|add_shipping_info|add_payment_info|purchase|refund|view_promotion|select_promotion)$
```

Then add a GA4 Event tag with the event name `{{Event}}`. Under **More Settings → Ecommerce**, turn on **Send Ecommerce data** and set **Data source** to **Data Layer**. You don't need any item or value variables, because the tag reads the `ecommerce` object directly.

Use **Preview** (Tag Assistant) to confirm each push fires the expected tag, then publish the container.

### GA4 + GTM together

Set both IDs to load `gtag.js` and `gtm.js` on the same dataLayer. For example, you might send GA4 through gtag while GTM manages ad and marketing tags.

```tsx
<GAProvider
  config={{
    measurementId: "G-XXXXXXXXXX",
    gtmId: "GTM-XXXXXXX",
    eventTransport: "gtag", // "gtag" | "dataLayer" | "both"
  }}
>
```

| `eventTransport`               | Events go to                                     | Use when                                                             |
| ------------------------------ | ------------------------------------------------ | -------------------------------------------------------------------- |
| `"dataLayer"` (default with `gtmId`) | `window.dataLayer` only                    | Your GTM container sends the GA4 events                              |
| `"gtag"` (default without `gtmId`)   | `window.gtag("event", …)` only             | gtag.js sends GA4, and GTM only handles other tags                  |
| `"both"`                       | Both                                             | Other GTM tags (ads, pixels) need the same events that gtag sends to GA4 |

> ⚠️ **Double counting.** When `measurementId` is set, gtag.js already sends GA4 hits for that property. If your GTM container also has a Google tag or GA4 Event tags for the **same** measurement ID, every page view and event is counted twice. Use **one** path per GA4 property. With `debug: true`, the library warns when both IDs are set.

---

## Advanced Configuration

### Complete Configuration Options

```tsx
const gaConfig = {
  measurementId: "G-XXXXXXXXXX",
  debug: process.env.NODE_ENV === "development",
  currency: "USD",
  disableGA: false,
  customConfig: {
    // GDPR/Privacy compliance
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",

    // Custom settings
    send_page_view: false, // Disable automatic page views
    custom_map: {
      custom_parameter_1: "user_type",
    },
  },
};

<GAProvider config={gaConfig}>
  <App />
</GAProvider>;
```

### Environment Variables

```bash
# .env.local (Next.js)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# .env (Create React App)
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Conditional Loading

```tsx
function App() {
  // Only load analytics in production
  const gaConfig = {
    measurementId: "G-XXXXXXXXXX",
    currency: "USD",
    disableGA: process.env.NODE_ENV === "development", // true will disable google analytics tracking
  };

  return (
    <GAProvider config={gaConfig}>
      <YourApp />
    </GAProvider>
  );
}
```

---

## Real-World Examples

### E-commerce Product Card

```tsx
function ProductCard({ product }) {
  const { trackItem, trackCart } = useGAEcommerce();

  const handleView = () => {
    trackItem({
      action: "view_item",
      items: [
        {
          item_id: product.sku,
          item_name: product.name,
          item_category: product.category,
          item_brand: product.brand,
          price: product.price,
          quantity: 1,
        },
      ],
      value: product.price,
    });
  };

  const handleAddToCart = () => {
    trackCart({
      action: "add_to_cart",
      items: [
        {
          item_id: product.sku,
          item_name: product.name,
          price: product.price,
          quantity: 1,
        },
      ],
      value: product.price,
      customParams: {
        product_location: "product_grid",
      },
    });
  };

  return (
    <div onClick={handleView} className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}
```

### Newsletter Signup Form

```tsx
function NewsletterForm() {
  const { trackCustomEvent, trackException } = useGoogleAnalytics();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await subscribeToNewsletter(email);

      // Track successful signup
      trackCustomEvent({
        name: "newsletter_signup",
        params: {
          method: "email",
          success: true,
          source: "footer_form",
        },
      });
    } catch (error) {
      // Track failed signup
      trackException({
        description: "Newsletter signup failed",
        fatal: false,
        customParams: {
          error_type: "subscription_error",
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <button type="submit">Subscribe</button>
    </form>
  );
}
```

### User Authentication

```tsx
function LoginForm() {
  const { trackLogin, trackException } = useGoogleAnalytics();

  const handleLogin = async (method) => {
    try {
      const user = await signIn(method);

      trackLogin({
        method: method,
        customParams: {
          user_id: user.id,
          user_type: user.isNew ? "new" : "returning",
        },
      });
    } catch (error) {
      trackException({
        description: `Login failed: ${method}`,
        fatal: false,
      });
    }
  };

  return (
    <div>
      <button onClick={() => handleLogin("google")}>Login with Google</button>
      <button onClick={() => handleLogin("email")}>Login with Email</button>
    </div>
  );
}
```

### Video Player Integration

```tsx
function VideoPlayer({ video }) {
  const { trackVideoPlay, trackCustomEvent } = useGoogleAnalytics();
  const [hasStarted, setHasStarted] = useState(false);

  const handlePlay = () => {
    if (!hasStarted) {
      trackVideoPlay({
        title: video.title,
        url: video.url,
        duration: video.duration,
        customParams: {
          video_category: video.category,
          video_quality: "1080p",
        },
      });
      setHasStarted(true);
    }
  };

  const handleProgress = (currentTime) => {
    const percent = Math.round((currentTime / video.duration) * 100);

    // Track video progress at 25%, 50%, 75%
    if ([25, 50, 75].includes(percent)) {
      trackCustomEvent({
        name: "video_progress",
        params: {
          video_title: video.title,
          video_percent: percent,
          video_current_time: currentTime,
        },
      });
    }
  };

  return (
    <video
      onPlay={handlePlay}
      onTimeUpdate={(e) => handleProgress(e.target.currentTime)}
    >
      <source src={video.url} type="video/mp4" />
    </video>
  );
}
```

---

## TypeScript Support

Full TypeScript support with intelligent autocomplete:

```tsx
import type {
  GA4Config,
  GAEvent,
  CartItem,
  EcommerceItem,
  PageViewOptions,
} from "@connectaryal/google-analytics";

// Configuration is fully typed
const config: GA4Config = {
  measurementId: "G-XXXXXXXXXX",
  debug: true,
  currency: "USD", // IntelliSense suggests valid currencies
};

// All parameters are validated at compile time
const { trackCustomEvent } = useGoogleAnalytics();

trackCustomEvent({
  name: "purchase",
  params: {
    value: 99.99, // ✅ number
    currency: "USD", // ✅ valid currency
    items: [], // ✅ EcommerceItem[]
    // invalid_param: 123 // ❌ TypeScript error
  },
});

// Cart items are strongly typed
const cartItem: CartItem = {
  item_id: "SKU123", // ✅ required
  item_name: "Product", // ✅ required
  price: 29.99, // ✅ required
  quantity: 2, // ✅ optional, defaults to 1
  item_category: "Electronics", // ✅ optional
};
```

---

## API Reference

### Core Tracking Methods

| Method                  | Description              | Parameters                                        |
| ----------------------- | ------------------------ | ------------------------------------------------- |
| `trackPage()`           | Track page views         | `PageViewOptions?`                                |
| `trackCustomEvent()`    | Track custom events      | `{name, params?, category?}`                      |
| `trackSearch()`         | Track site search        | `{searchTerm, options?}`                          |
| `trackEngagement()`     | Track user engagement    | `{type, options?}`                                |
| `trackShare()`          | Track social sharing     | `{contentType, contentId, method, customParams?}` |
| `trackVideoPlay()`      | Track video interactions | `{title, url, duration?, customParams?}`          |
| `trackFormSubmission()` | Track form submissions   | `{formId, formData, customParams?}`               |
| `trackException()`      | Track errors/exceptions  | `{description, fatal?, customParams?}`            |
| `trackTiming()`         | Track performance timing | `(category, variable, value, label?)`             |

### Core Tracking Methods

| Method          | Description             | Parameters                |
| --------------- | ----------------------- | ------------------------- |
| `trackLogin()`  | Track user login        | `{method, customParams?}` |
| `trackSignUp()` | Track user registration | `{method, customParams?}` |

### Ecommerce Methods

| Method                 | Description            | Use Cases                              |
| ---------------------- | ---------------------- | -------------------------------------- |
| `trackItem()`          | Item interactions      | View item, select item, view item list |
| `trackCart()`          | Cart operations        | Add/remove/view/update cart            |
| `trackWishlist()`      | Wishlist operations    | Add/remove/view/update wishlist        |
| `trackBeginCheckout()` | Checkout initiation    | Start checkout process                 |
| `trackShippingInfo()`  | Shipping selection     | Add shipping information               |
| `trackPaymentInfo()`   | Payment selection      | Add payment information                |
| `trackPurchase()`      | Purchase completion    | Order confirmation                     |
| `trackRefund()`        | Purchase refund        | Process refunds                        |
| `trackPromotion()`     | Promotion interactions | View/select promotions                 |

### Configuration Options

```tsx
interface GAConfig {
  measurementId?: string; // GA4 Measurement ID (G-XXXXXXXXXX), loaded via gtag.js
  gtmId?: string; // GTM container ID (GTM-XXXXXXX), loaded via gtm.js
  dataLayerName?: string; // Default "dataLayer"
  gtmAuth?: string; // GTM environment gtm_auth (requires gtmPreview)
  gtmPreview?: string; // GTM environment gtm_preview, e.g. "env-3"
  nonce?: string; // CSP nonce for injected scripts
  eventTransport?: "gtag" | "dataLayer" | "both"; // Default: "dataLayer" with gtmId, else "gtag"
  debug?: boolean; // Enable debug logging
  currency?: Currency; // Default currency (USD, EUR, etc.)
  customConfig?: Record<string, unknown>; // Consent Mode defaults: gtag("consent", "default", …)
  disableGA?: boolean; // Enable/Disable tracking
}

// `GA4Config` is still exported as an alias of `GAConfig`.
// At least one of measurementId / gtmId is required unless disableGA is true.
```

### Auth & User Methods (`useGAAuth`)

| Method                | Description                  | Parameters                |
| --------------------- | ---------------------------- | ------------------------- |
| `setUserId()`         | Set or clear the GA4 user ID | `string \| null`          |
| `setUserProperties()` | Set GA4 user properties      | `Record<string, string \| number \| boolean \| null>` |

### Utilities

| Export                                 | Description                                         |
| -------------------------------------- | --------------------------------------------------- |
| `GTMNoScript`                          | `<noscript>` iframe fallback for GTM                |
| `isValidGtmId()` / `isValidMeasurementId()` | ID format validation                           |
| `getDataLayer(name?)`                  | Returns `window[name]` if it's an array (SSR-safe) |
| `buildGtmScriptUrl()` / `buildGtmNoScriptUrl()` | Build the official GTM URLs               |

---

## Performance Optimization

The library includes several performance optimizations:

- **Event Batching**: Multiple events are batched together to reduce network calls
- **Memory Leak Prevention**: Proper cleanup of event listeners and timers
- **Lazy Script Loading**: GA script is loaded asynchronously when needed
- **Initialization Caching**: Prevents multiple initialization attempts
- **Error Boundaries**: Graceful error handling prevents crashes

---

## Debugging & Development

### Debug Mode

Enable debug mode to see detailed logging:

```tsx
<GAProvider config={{
  measurementId: "G-XXXXXXXXXX",
  debug: process.env.NODE_ENV === "development"
}}>
```

Debug output examples:

```
GA4: Initializing with measurement ID: G-XXXXXXXXXX
GA4: Tracking event "page_view" with params: { page_title: "Home", page_location: "/" }
GA4: Event sent successfully ✅
GA4: Warning: Search term is required for search events ⚠️
```

### Common Issues & Solutions

**Issue: Events not showing in GA4**

```tsx
// ✅ Ensure provider is properly configured
<GAProvider config={{ measurementId: "G-XXXXXXXXXX" }}>

// ✅ Check debug mode for errors
config={{ debug: true }}
```

**Issue: TypeScript errors**

```tsx
// ✅ Import types explicitly
import type { CartItem } from "@connectaryal/google-analytics";

// ✅ Use proper parameter types
ga.trackCustomEvent({
  name: "event_name",
  params: { key: "value" }, // Must be Record<string, unknown>
});
```

---

## Migration Guide

### From react-ga4

```tsx
// Before (react-ga4)
import ReactGA from "react-ga4";
ReactGA.initialize("G-XXXXXXXXXX");
ReactGA.send("pageview");

// After (@connectaryal/google-analytics)
import { GAProvider, useGoogleAnalytics } from "@connectaryal/google-analytics";

<GAProvider config={{ measurementId: "G-XXXXXXXXXX" }}>
  <App />
</GAProvider>;

const { trackPage } = useGoogleAnalytics();
trackPage();
```

### From `measurementId: "GTM-…"` (v1.1 and earlier)

If you were passing `GTM-…` as `measurementId`, switch to `gtmId`:

```diff
- <GAProvider config={{ measurementId: "GTM-XXXXXXX" }}>
+ <GAProvider config={{ gtmId: "GTM-XXXXXXX" }}>
```

Events now go to `window.dataLayer`, so you'll need GTM triggers and tags to forward them to GA4. See [Setting up tags in the GTM UI](#setting-up-tags-in-the-gtm-ui). Add `<GTMNoScript>` after `<body>` for no-JS visitors.

### From gtag directly

```tsx
// Before (gtag)
gtag('event', 'purchase', {
  transaction_id: '12345',
  value: 25.42,
  currency: 'USD'
});

// After (@connectaryal/google-analytics)
const { trackPurchase } = useGAEcommerce();
trackPurchase({
  transactionId: '12345',
  value: 25.42,
  items: [...]
});
```

---

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/connectaryal/google-analytics/blob/main/CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/connectaryal/google-analytics.git
cd google-analytics
npm install
npm run dev
```

### Running Tests

```bash
yarn test        # vitest + jsdom
yarn type-check
```

---

## License

MIT © [Shiva Aryal](https://github.com/connectaryal)

---

## Support & Resources

- **Documentation**: [GitHub Wiki](https://github.com/connectaryal/google-analytics/wiki)
- **Issues**: [GitHub Issues](https://github.com/connectaryal/google-analytics/issues)
- **Discussions**: [GitHub Discussions](https://github.com/connectaryal/google-analytics/discussions)
- **Examples**: [CodeSandbox Examples](https://codesandbox.io/examples/package/@connectaryal/google-analytics)

**Star this repo if it helped you!** ⭐

---

**Made with ❤️ for the React community**
