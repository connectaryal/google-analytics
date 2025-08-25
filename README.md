# @connectaryal/google-analytics

> 🚀 **Modern Google Analytics 4** - Type-safe, performance-optimized, production-ready.

[![npm version](https://badge.fury.io/js/@connectaryal%2Fgoogle-analytics.svg)](https://badge.fury.io/js/@connectaryal%2Fgoogle-analytics)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-16.8%2B-61dafb.svg)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-Compatible-black.svg)](https://nextjs.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## ✨ **Why Choose This Library?**

Unlike other GA4 libraries, this one is **built for modern React applications** with enterprise-grade features:

- 🔥 **Zero Configuration** - Works out of the box
- 🛡️ **100% Type Safe** - Full TypeScript support with intelligent autocomplete
- ⚡ **Performance Optimized** - Event batching, memory leak prevention
- 🛒 **Complete Ecommerce** - Enhanced ecommerce tracking with all GA4 events
- 🎯 **React Hooks** - Modern React patterns with custom hooks
- 🚫 **No Script Conflicts** - Prevents duplicate GA script loading
- 🔍 **Debug Mode** - Development-friendly error reporting
- 📊 **Event Validation** - Automatic parameter validation and sanitization

---

## 🚀 **Quick Start**

### Installation

```bash
npm install @connectaryal/google-analytics
# or
yarn add @connectaryal/google-analytics
# or
pnpm add @connectaryal/google-analytics
```

### Basic Setup (2 steps)

```tsx
// 1. Wrap your app with GAProvider
import { GAProvider } from "@connectaryal/google-analytics";

function App() {
  return (
    <GAProvider config={{ measurementId: "G-XXXXXXXXXX" }}>
      <YourApp />
    </GAProvider>
  );
}

// 2. Use analytics anywhere
import { useAnalytics } from "@connectaryal/google-analytics";

function HomePage() {
  const ga = useAnalytics();

  const handleClick = () => {
    ga.trackCustomEvent("button_click", { button_name: "hero_cta" });
  };

  return <button onClick={handleClick}>Track Me!</button>;
}
```

---

## 📋 **Core Features**

### **Page Tracking**

```tsx
const ga = useAnalytics();

// Automatic page tracking
ga.trackPageView();

// Custom page tracking
ga.trackPageView({
  path: "/custom-path",
  title: "Custom Title",
});
```

### **Event Tracking**

```tsx
// Custom events
ga.trackCustomEvent("video_play", {
  video_title: "Product Demo",
  video_duration: 120,
});

// User engagement
ga.trackEngagement("scroll", { scroll_depth: 75 });

// Search tracking
ga.trackSearch("react analytics");
```

### **Ecommerce Tracking**

```tsx
import { useGAEcommerce } from "@connectaryal/google-analytics";

function ProductPage() {
  const ecommerce = useGAEcommerce();

  const handleAddToCart = () => {
    ecommerce.trackCart(
      "add_to_cart",
      [
        {
          item_id: "SKU123",
          item_name: "Wireless Headphones",
          price: 99.99,
          quantity: 1,
        },
      ],
      99.99
    );
  };

  const handlePurchase = () => {
    ecommerce.trackPurchase("ORDER123", 199.98, [
      {
        item_id: "SKU123",
        item_name: "Wireless Headphones",
        price: 99.99,
        quantity: 2,
      },
    ]);
  };
}
```

### **Next.js Integration**

```tsx
// app/layout.tsx or pages/_app.tsx
import { GAProvider } from "@connectaryal/google-analytics";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <GAProvider
          config={{
            measurementId: process.env.NEXT_PUBLIC_GA_ID,
            debug: process.env.NODE_ENV === "development",
          }}
        >
          {children}
        </GAProvider>
      </body>
    </html>
  );
}

// Automatic route tracking in Next.js
import { useRouter } from "next/router";
import { useAnalytics } from "@connectaryal/google-analytics";

function usePageTracking() {
  const router = useRouter();
  const ga = useAnalytics();

  useEffect(() => {
    const handleRouteChange = (url) => {
      ga.trackPageView({ path: url });
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
  }, [router, ga]);
}
```

---

## 🛒 **Complete Ecommerce Events**

All GA4 Enhanced Ecommerce events supported:

```tsx
const ecommerce = useGAEcommerce();

// Shopping behavior
ecommerce.trackCart("view_item", items);
ecommerce.trackCart("add_to_cart", items, totalValue);
ecommerce.trackCart("remove_from_cart", items);
ecommerce.trackCart("view_cart", items);

// Checkout process
ecommerce.trackBeginCheckout(totalValue, items);
ecommerce.trackPurchase(transactionId, totalValue, items);
```

---

## ⚙️ **Advanced Configuration**

```tsx
<GAProvider
  config={{
    measurementId: 'G-XXXXXXXXXX',
    debug: true,                    // Enable debug logging
    currency: 'USD',               // Default currency
    customConfig: {                // GDPR/Privacy settings
      analytics_storage: 'granted',
      ad_storage: 'denied'
    }
  }}
>
```

---

## 🎯 **TypeScript Support**

Fully typed with intelligent autocomplete:

```tsx
import type {
  GA4Config,
  GAEvent,
  CartItem,
  EcommerceItem,
} from "@connectaryal/google-analytics";

// All parameters are typed and validated
ga.trackCustomEvent("purchase", {
  value: 99.99, // ✅ number
  currency: "USD", // ✅ string
  items: [], // ✅ EcommerceItem[]
  invalid_param: 123, // ❌ TypeScript error
});
```

---

## 🔧 **API Reference**

### **Core Methods**

| Method               | Description             | Parameters                           |
| -------------------- | ----------------------- | ------------------------------------ |
| `trackPageView()`    | Track page views        | `path?`, `title?`, `referrer?`       |
| `trackCustomEvent()` | Track custom events     | `eventName`, `parameters?`           |
| `trackSearch()`      | Track site search       | `searchTerm`, `options?`             |
| `trackLogin()`       | Track user login        | `method`, `customParams?`            |
| `trackSignUp()`      | Track user registration | `method`, `customParams?`            |
| `trackShare()`       | Track social sharing    | `contentType`, `contentId`, `method` |

### **Ecommerce Methods**

| Method                 | Description        | Use Case             |
| ---------------------- | ------------------ | -------------------- |
| `trackCart()`          | Cart interactions  | Add/remove/view cart |
| `trackBeginCheckout()` | Checkout started   | Checkout flow        |
| `trackPurchase()`      | Purchase completed | Order confirmation   |

---

## 🎨 **Examples & Demos**

### E-commerce Store

```tsx
function ProductCard({ product }) {
  const ecommerce = useGAEcommerce();

  return (
    <div onClick={() => ecommerce.trackCart("view_item", [product])}>
      <h3>{product.name}</h3>
      <button
        onClick={() =>
          ecommerce.trackCart("add_to_cart", [product], product.price)
        }
      >
        Add to Cart
      </button>
    </div>
  );
}
```

---

## 🐛 **Debugging & Development**

Enable debug mode to see all tracking calls:

```tsx
<GAProvider config={{
  measurementId: 'G-XXXXXXXXXX',
  debug: process.env.NODE_ENV === 'development'
}}>
```

Debug output:

```
GA4: Tracking event "page_view" with params: { page_title: "Home", page_location: "/" }
GA4: Event sent successfully ✅
```

---

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](https://github.com/connectaryal/google-analytics/blob/main/CONTRIBUTING.md).

---

## 📄 **License**

MIT © [Shiva Aryal](https://github.com/connectaryal)

---

## 🌟 **Support**

- 📖 [Documentation](https://github.com/connectaryal/google-analytics/wiki)
- 🐛 [Issues](https://github.com/connectaryal/google-analytics/issues)
- 💬 [Discussions](https://github.com/connectaryal/google-analytics/discussions)
- ⭐ Star this repo if it helped you!

---

**Made with ❤️ for the React community**
