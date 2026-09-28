// @vitest-environment node
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GAProvider, GATracker, GTMNoScript, useGoogleAnalytics } from "../index";

describe("SSR", () => {
  it("renders GAProvider with gtmId without touching window or document", async () => {
    expect(typeof window).toBe("undefined");
    expect(typeof document).toBe("undefined");

    const Page = () => {
      useGoogleAnalytics();
      return <p>hi</p>;
    };
    const html = renderToString(
      <GAProvider config={{ gtmId: "GTM-PDL6QFSP", measurementId: "G-ABC1234567" }}>
        <GTMNoScript gtmId="GTM-PDL6QFSP" />
        <Page />
      </GAProvider>
    );
    expect(html).toContain("ns.html?id=GTM-PDL6QFSP");
    expect(html).toContain("<p>hi</p>");
  });

  it("makes every tracker call a no-op on the server", async () => {
    const tracker = new GATracker({ gtmId: "GTM-PDL6QFSP" });
    await tracker.init();
    await tracker.trackPage({ path: "/x" });
    await tracker.trackCustomEvent({ name: "x" });
    tracker.setUserId("u");
    expect(tracker.getInitializationState()).toBe("NOT_INITIALIZED");
  });
});
