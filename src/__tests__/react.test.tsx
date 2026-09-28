import React, { act, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import {
  GAProvider,
  GTMNoScript,
  useGAAuth,
  useGAEcommerce,
  useGoogleAnalytics,
} from "../index";
import { CartType } from "../types/ecommerce";
import { injectedScripts, loadScript, resetBrowserGlobals } from "./helpers";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("GTMNoScript", () => {
  it("renders Google's official noscript iframe", () => {
    expect(renderToStaticMarkup(<GTMNoScript gtmId="GTM-PDL6QFSP" />)).toBe(
      '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PDL6QFSP" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>'
    );
  });

  it("includes GTM environment parameters", () => {
    expect(
      renderToStaticMarkup(
        <GTMNoScript gtmId="GTM-PDL6QFSP" gtmAuth="abc" gtmPreview="env-3" />
      )
    ).toContain(
      'src="https://www.googletagmanager.com/ns.html?id=GTM-PDL6QFSP&amp;gtm_auth=abc&amp;gtm_preview=env-3&amp;gtm_cookies_win=x"'
    );
  });

  it("renders nothing for an invalid container ID", () => {
    expect(renderToStaticMarkup(<GTMNoScript gtmId="G-ABC123" />)).toBe("");
  });
});

describe("GAProvider with gtmId", () => {
  beforeEach(resetBrowserGlobals);

  it("loads gtm.js once and routes every hook to window.dataLayer", async () => {
    let hooks: {
      page: ReturnType<typeof useGoogleAnalytics>;
      ecommerce: ReturnType<typeof useGAEcommerce>;
      auth: ReturnType<typeof useGAAuth>;
    } | null = null;

    const Probe = () => {
      const page = useGoogleAnalytics();
      const ecommerce = useGAEcommerce();
      const auth = useGAAuth();
      useEffect(() => {
        hooks = { page, ecommerce, auth };
      }, [page, ecommerce, auth]);
      return null;
    };

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    await act(async () => {
      root.render(
        <React.StrictMode>
          <GAProvider config={{ gtmId: "GTM-PDL6QFSP" }}>
            <Probe />
          </GAProvider>
        </React.StrictMode>
      );
    });

    const gtmScripts = injectedScripts().filter((s) => s.src.includes("gtm.js"));
    expect(gtmScripts).toHaveLength(1);
    loadScript(gtmScripts[0]);
    expect(window.dataLayer.filter((e) => e.event === "gtm.js")).toHaveLength(1);
    expect(window.gtag).toBeUndefined();

    const start = window.dataLayer.length;
    const items = [{ item_id: "a", item_name: "A", price: 5, quantity: 1 }];
    await hooks!.page.trackPage({ path: "/home", title: "Home", referrer: "" });
    await hooks!.page.trackCustomEvent({ name: "cta_click" });
    await hooks!.ecommerce.trackCart({ action: CartType.ADD_TO_CART, items, value: 5 });
    await hooks!.auth.trackLogin({ method: "email" });
    hooks!.auth.setUserId("u-1");

    expect(window.dataLayer.slice(start).map((e) => e.event ?? Object.keys(e)[0])).toEqual([
      "page_view",
      "cta_click",
      "ecommerce",
      "add_to_cart",
      "login",
      "user_id",
    ]);

    act(() => root.unmount());
  });
});
