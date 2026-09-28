import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GATracker } from "../core/GATracker";
import { CartType } from "../types/ecommerce";
import type { GAConfig } from "../types/analytics";
import {
  injectedScripts,
  loadScript,
  normalizeDataLayer,
  resetBrowserGlobals,
} from "./helpers";

const GTM_ID = "GTM-PDL6QFSP";
const NOW = new Date("2026-01-01T00:00:00Z");

async function initTracker(config: GAConfig): Promise<GATracker> {
  const tracker = new GATracker(config);
  const init = tracker.init();
  injectedScripts().forEach(loadScript);
  await init;
  return tracker;
}

describe("GTM loading", () => {
  beforeEach(() => {
    resetBrowserGlobals();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it("injects gtm.js once with the official snippet URL and attributes", async () => {
    const tracker = await initTracker({ gtmId: GTM_ID });

    const scripts = injectedScripts();
    expect(scripts).toHaveLength(1);
    expect(scripts[0]!.src).toBe(`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`);
    expect(scripts[0]!.async).toBe(true);
    expect(scripts[0]!.hasAttribute("nonce")).toBe(false);
    expect(tracker.getInitializationState()).toBe("INITIALIZED");

    // Calling init again (e.g. React StrictMode) does not inject again.
    await tracker.init();
    expect(injectedScripts()).toHaveLength(1);
  });

  it("pushes the gtm.js start event and does not define window.gtag", async () => {
    await initTracker({ gtmId: GTM_ID });
    expect(window.dataLayer).toEqual([{ "gtm.start": NOW.getTime(), event: "gtm.js" }]);
    expect(window.gtag).toBeUndefined();
  });

  it("adds &l= for a custom dataLayerName and uses that array", async () => {
    await initTracker({ gtmId: GTM_ID, dataLayerName: "customLayer" });

    expect(injectedScripts()[0]!.src).toBe(
      `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}&l=customLayer`
    );
    const custom = (window as unknown as Record<string, unknown>).customLayer;
    expect(custom).toEqual([{ "gtm.start": NOW.getTime(), event: "gtm.js" }]);
    expect(window.dataLayer).toBeUndefined();
  });

  it("adds GTM environment parameters and the CSP nonce", async () => {
    await initTracker({
      gtmId: GTM_ID,
      gtmAuth: "aBc_123",
      gtmPreview: "env-3",
      nonce: "n0nce",
    });

    const [script] = injectedScripts();
    expect(script!.src).toBe(
      `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}&gtm_auth=aBc_123&gtm_preview=env-3&gtm_cookies_win=x`
    );
    expect(script!.getAttribute("nonce")).toBe("n0nce");
  });

  it("pushes consent defaults as gtag arguments before gtm.js is inserted", async () => {
    const consent = { ad_storage: "denied", analytics_storage: "denied" };
    let dataLayerAtInsert: unknown[] = [];
    const appendChild = document.head.appendChild.bind(document.head);
    vi.spyOn(document.head, "appendChild").mockImplementation((node) => {
      dataLayerAtInsert = normalizeDataLayer([...window.dataLayer]);
      return appendChild(node);
    });

    await initTracker({ gtmId: GTM_ID, customConfig: consent });

    const expected = [
      ["consent", "default", consent],
      { "gtm.start": NOW.getTime(), event: "gtm.js" },
    ];
    expect(dataLayerAtInsert).toEqual(expected);
    expect(normalizeDataLayer(window.dataLayer)).toEqual(expected);
    // Consent Mode needs a real `arguments` object, not an array.
    expect(Object.prototype.toString.call(window.dataLayer[0])).toBe("[object Arguments]");
  });

  it("inserts before the first existing script, like Google's snippet", async () => {
    const other = document.createElement("script");
    other.src = "https://example.com/app.js";
    document.body.appendChild(other);

    await initTracker({ gtmId: GTM_ID });

    expect(other.previousElementSibling).toBe(
      document.querySelector(`script[src*="gtm.js"]`)
    );
  });

  it("does not inject or re-fire gtm.js when the snippet is already on the page", async () => {
    window.dataLayer = [{ "gtm.start": 1, event: "gtm.js" }];
    const existing = document.createElement("script");
    existing.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
    document.head.appendChild(existing);

    const tracker = new GATracker({ gtmId: GTM_ID });
    await tracker.init();

    expect(injectedScripts()).toHaveLength(1);
    expect(window.dataLayer).toEqual([{ "gtm.start": 1, event: "gtm.js" }]);
    expect(tracker.isInitialized()).toBe(true);
  });

  it("does not treat a different container's script as a duplicate", async () => {
    const existing = document.createElement("script");
    existing.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}X`;
    document.head.appendChild(existing);

    await initTracker({ gtmId: GTM_ID });
    expect(injectedScripts()).toHaveLength(2);
  });

  it("still loads GTM when some other script already created window.dataLayer", async () => {
    window.dataLayer = [];
    const tracker = new GATracker({ gtmId: GTM_ID });
    expect(tracker.isInitialized()).toBe(false);
    const init = tracker.init();
    injectedScripts().forEach(loadScript);
    await init;
    expect(injectedScripts()).toHaveLength(1);
  });

  it("rejects init when gtm.js fails to load", async () => {
    const tracker = new GATracker({ gtmId: GTM_ID });
    const init = tracker.init();
    injectedScripts()[0]!.dispatchEvent(new Event("error"));
    await expect(init).rejects.toThrow(/Failed to load Google Tag Manager script/);
    expect(tracker.getInitializationState()).toBe("FAILED");
  });

  it("loads gtag.js and gtm.js together on one dataLayer, consent first", async () => {
    const consent = { analytics_storage: "denied" };
    await initTracker({
      measurementId: "G-ABC1234567",
      gtmId: GTM_ID,
      customConfig: consent,
    });

    expect(injectedScripts().map((s) => s.src).sort()).toEqual([
      "https://www.googletagmanager.com/gtag/js?id=G-ABC1234567",
      `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`,
    ]);
    expect(normalizeDataLayer(window.dataLayer)).toEqual([
      ["consent", "default", consent],
      ["js", NOW],
      ["config", "G-ABC1234567", { debug_mode: undefined }],
      { "gtm.start": NOW.getTime(), event: "gtm.js" },
    ]);
    expect(typeof window.gtag).toBe("function");
  });

  it("passes the custom dataLayerName to gtag.js when both are loaded", async () => {
    await initTracker({
      measurementId: "G-ABC1234567",
      gtmId: GTM_ID,
      dataLayerName: "customLayer",
    });
    expect(injectedScripts().map((s) => s.src)).toContain(
      "https://www.googletagmanager.com/gtag/js?id=G-ABC1234567&l=customLayer"
    );
  });
});

describe("dataLayer transport", () => {
  beforeEach(() => {
    resetBrowserGlobals();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  /** dataLayer entries pushed after initialisation. */
  const pushed = (from = 1) => window.dataLayer.slice(from);

  it("pushes custom events as { event, ...params }", async () => {
    const tracker = await initTracker({ gtmId: GTM_ID });
    await tracker.trackCustomEvent({
      name: "cta_click",
      params: { id: 7, event: "hijack" },
    });
    expect(pushed()).toEqual([{ event: "cta_click", id: 7 }]);
  });

  it("merges TrackingOptions.customParameters", async () => {
    const tracker = await initTracker({ gtmId: GTM_ID });
    await tracker.trackEvent(
      { event_name: "signup_step", event_parameters: { step: 1 } },
      { customParameters: { flow: "b" } }
    );
    expect(pushed()).toEqual([{ event: "signup_step", step: 1, flow: "b" }]);
  });

  it("pushes page views with page_path", async () => {
    const tracker = await initTracker({ gtmId: GTM_ID });
    await tracker.trackPage({
      path: "https://example.com/shop/shirts?color=red",
      title: "Shirts",
      referrer: "https://google.com/",
    });
    expect(pushed()).toEqual([
      {
        event: "page_view",
        page_path: "/shop/shirts",
        page_title: "Shirts",
        page_location: "https://example.com/shop/shirts?color=red",
        page_referrer: "https://google.com/",
      },
    ]);
  });

  it("defaults page view fields from the browser", async () => {
    window.history.replaceState(null, "", "/pricing?plan=pro");
    document.title = "Pricing";
    const tracker = await initTracker({ gtmId: GTM_ID });
    await tracker.trackPage({});
    expect(pushed()).toEqual([
      expect.objectContaining({
        event: "page_view",
        page_path: "/pricing",
        page_title: "Pricing",
        page_location: "http://localhost:3000/pricing?plan=pro",
      }),
    ]);
  });

  it("pushes purchase in GA4 ecommerce format, clearing ecommerce first", async () => {
    const tracker = await initTracker({ gtmId: GTM_ID, currency: "EUR" });
    await tracker.trackPurchase({
      transactionId: "T-1",
      value: 20.004,
      items: [{ item_id: "sku1", item_name: "Shirt", price: 10.002, quantity: 2 }],
      customParams: { coupon: "WELCOME", shipping: 5, tax: 1.2 },
    });
    expect(pushed()).toEqual([
      { ecommerce: null },
      {
        event: "purchase",
        ecommerce: {
          transaction_id: "T-1",
          currency: "EUR",
          value: 20,
          items: [{ item_id: "sku1", item_name: "Shirt", price: 10, quantity: 2 }],
          coupon: "WELCOME",
          shipping: 5,
          tax: 1.2,
        },
      },
    ]);
  });

  it("uses the ecommerce format for every useGAEcommerce event", async () => {
    const tracker = await initTracker({ gtmId: GTM_ID, currency: "USD" });
    const items = [{ item_id: "a", item_name: "A", price: 1, quantity: 1 }];
    await tracker.trackCart({ action: CartType.ADD_TO_CART, items, value: 1 });
    await tracker.trackBeginCheckout({ value: 1, items });
    await tracker.trackRefund({ transactionId: "T-1", value: 1, items });

    const events = pushed().filter((e) => "event" in e);
    expect(events.map((e) => e.event)).toEqual(["add_to_cart", "begin_checkout", "refund"]);
    expect(pushed().filter((e) => e.ecommerce === null)).toHaveLength(3);
    events.forEach((e) => expect(e).toHaveProperty("ecommerce.items", items));
  });

  it("pushes user ID and user properties as dataLayer variables", async () => {
    const tracker = await initTracker({ gtmId: GTM_ID });
    tracker.setUserId("u-42");
    tracker.setUserProperties({ plan: "pro" });
    tracker.setUserId(null);
    expect(pushed()).toEqual([
      { user_id: "u-42" },
      { user_properties: { plan: "pro" } },
      { user_id: null },
    ]);
  });

  it("queues events to the dataLayer while gtm.js is still loading", async () => {
    const tracker = new GATracker({ gtmId: GTM_ID });
    void tracker.init();
    await tracker.trackCustomEvent({ name: "early" });
    expect(pushed()).toEqual([{ event: "early" }]);
  });

  it("drops events with a warning before the dataLayer exists", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const tracker = new GATracker({ gtmId: GTM_ID, debug: true });
    await tracker.trackCustomEvent({ name: "too_early" });
    expect(window.dataLayer).toBeUndefined();
    expect(warn).toHaveBeenCalledWith("GA4: dataLayer not available", "too_early");
  });

  it("defaults to the dataLayer when both IDs are set", async () => {
    const tracker = await initTracker({ measurementId: "G-ABC1234567", gtmId: GTM_ID });
    const gtag = vi.fn();
    window.gtag = gtag;
    const before = window.dataLayer.length;
    await tracker.trackCustomEvent({ name: "x" });
    expect(gtag).not.toHaveBeenCalled();
    expect(pushed(before)).toEqual([{ event: "x" }]);
  });

  it("sends through gtag and the dataLayer with eventTransport: both", async () => {
    const tracker = await initTracker({
      measurementId: "G-ABC1234567",
      gtmId: GTM_ID,
      eventTransport: "both",
    });
    const gtag = vi.fn();
    window.gtag = gtag;
    const before = window.dataLayer.length;
    await tracker.trackCustomEvent({ name: "x", params: { a: 1 } });
    tracker.setUserId("u-1");
    expect(gtag.mock.calls).toEqual([
      ["event", "x", { a: 1 }],
      ["set", { user_id: "u-1" }],
    ]);
    expect(pushed(before)).toEqual([{ event: "x", a: 1 }, { user_id: "u-1" }]);
  });

  it("uses gtag('set') for user data on the gtag transport", async () => {
    const tracker = await initTracker({ measurementId: "G-ABC1234567" });
    const gtag = vi.fn();
    window.gtag = gtag;
    tracker.setUserId("u-1");
    tracker.setUserProperties({ plan: "pro" });
    expect(gtag.mock.calls).toEqual([
      ["set", { user_id: "u-1" }],
      ["set", "user_properties", { plan: "pro" }],
    ]);
  });

  it("does nothing when disableGA is set", async () => {
    const tracker = new GATracker({ gtmId: GTM_ID, disableGA: true });
    await tracker.init();
    await tracker.trackCustomEvent({ name: "x" });
    expect(injectedScripts()).toHaveLength(0);
    expect(window.dataLayer).toBeUndefined();
  });
});
