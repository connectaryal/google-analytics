# @connectaryal/google-analytics

> **Modern Google Analytics 4** - Type-safe, performance-optimized, production-ready React library.

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
interface GA4Config {
  measurementId: string; // Required: GA4 Measurement ID
  debug?: boolean; // Enable debug logging
  currency?: Currency; // Default currency (USD, EUR, etc.)
  customConfig?: Record<string, unknown>; // Custom gtag config
  disableGA?: boolean; // Enable/Disable GA4
}
```

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
npm test
npm run test:coverage
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
