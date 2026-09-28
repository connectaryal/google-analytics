import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GATracker } from "../core/GATracker";
import { CartType } from "../types/ecommerce";
import {
  injectedScripts,
  loadScript,
  normalizeDataLayer,
  resetBrowserGlobals,
} from "./helpers";

/**
 * Golden tests for the GA4-only (`measurementId`) path. These were written and
 * run against v1.0.14 *before* GTM support landed, so they pin the exact
 * network request and gtag() call sequence existing users depend on.
 */
describe("GA4-only path (v1.x compatibility)", () => {
  beforeEach(() => {
    resetBrowserGlobals();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("injects exactly one gtag.js script with the legacy URL and attributes", async () => {
    const tracker = new GATracker({ measurementId: "G-ABC1234567" });
    const init = tracker.init();

    const scripts = injectedScripts();
    expect(scripts).toHaveLength(1);
    expect(scripts[0]!.outerHTML).toBe(
      '<script src="https://www.googletagmanager.com/gtag/js?id=G-ABC1234567"></script>'
    );
    expect(scripts[0]!.async).toBe(true);
    expect(scripts[0]!.parentNode).toBe(document.head);

    loadScript(scripts[0]);
    await init;
    expect(tracker.getInitializationState()).toBe("INITIALIZED");
  });

  it("pushes js, config and consent to window.dataLayer in the legacy order", async () => {
    const consent = { analytics_storage: "denied" };
    const tracker = new GATracker({
      measurementId: "G-ABC1234567",
      debug: true,
      customConfig: consent,
    });
    const init = tracker.init();
    loadScript(injectedScripts()[0]);
    await init;

    expect(normalizeDataLayer(window.dataLayer)).toEqual([
      ["js", new Date("2026-01-01T00:00:00Z")],
      ["config", "G-ABC1234567", { debug_mode: true }],
      ["consent", "default", consent],
    ]);
    expect(typeof window.gtag).toBe("function");
  });

  it("sends events through window.gtag('event', …) with unchanged params", async () => {
    const tracker = new GATracker({
      measurementId: "G-ABC1234567",
      currency: "USD",
    });
    const init = tracker.init();
    loadScript(injectedScripts()[0]);
    await init;

    const gtag = vi.fn();
    window.gtag = gtag;

    await tracker.trackCustomEvent({ name: "cta_click", params: { id: 7 } });
    await tracker.trackPage({
      path: "https://example.com/about",
      title: "About",
      referrer: "https://google.com/",
    });
    await tracker.trackCart({
      action: CartType.ADD_TO_CART,
      items: [{ item_id: "sku1", item_name: "Shirt", price: 10.005, quantity: 2 }],
      value: 20.01,
    });
    await tracker.trackPurchase({
      transactionId: "T-1",
      value: 20.01,
      items: [{ item_id: "sku1", item_name: "Shirt", price: 10, quantity: 2 }],
    });

    expect(gtag.mock.calls).toEqual([
      ["event", "cta_click", { id: 7 }],
      [
        "event",
        "page_view",
        {
          page_title: "About",
          page_location: "https://example.com/about",
          page_referrer: "https://google.com/",
        },
      ],
      [
        "event",
        "add_to_cart",
        {
          currency: "USD",
          value: 20.01,
          items: [{ item_id: "sku1", item_name: "Shirt", price: 10.01, quantity: 2 }],
        },
      ],
      [
        "event",
        "purchase",
        {
          transaction_id: "T-1",
          currency: "USD",
          value: 20.01,
          items: [{ item_id: "sku1", item_name: "Shirt", price: 10, quantity: 2 }],
        },
      ],
    ]);
    // Nothing is pushed straight to the dataLayer in gtag mode.
    expect(window.dataLayer.some((e) => "event" in (e as object))).toBe(false);
  });

  it("does not inject a second script when gtag.js is already on the page", async () => {
    const existing = document.createElement("script");
    existing.src = "https://www.googletagmanager.com/gtag/js?id=G-ABC1234567";
    document.head.appendChild(existing);

    const tracker = new GATracker({ measurementId: "G-ABC1234567" });
    await tracker.init();

    expect(injectedScripts()).toHaveLength(1);
    expect(tracker.isInitialized()).toBe(true);
  });

  it("drops events with a warning when gtag is unavailable", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const tracker = new GATracker({ measurementId: "G-ABC1234567", debug: true });

    await tracker.trackCustomEvent({ name: "early" });

    expect(warn).toHaveBeenCalledWith("GA4: gtag not available", "early");
    expect(window.dataLayer).toBeUndefined();
  });

  it("throws when measurementId is missing and GA is enabled", () => {
    expect(() => new GATracker({ measurementId: "" })).toThrow();
    expect(() => new GATracker({ measurementId: "", disableGA: true })).not.toThrow();
  });
});
