import { afterEach, describe, expect, it, vi } from "vitest";
import { GATracker } from "../core/GATracker";
import { isValidGtmId, isValidMeasurementId } from "../utils/validation";

describe("config validation", () => {
  afterEach(() => vi.restoreAllMocks());

  it("requires measurementId or gtmId unless disableGA is set", () => {
    expect(() => new GATracker({})).toThrow(/measurementId or GTM gtmId is required/);
    expect(() => new GATracker({ disableGA: true })).not.toThrow();
  });

  it("rejects malformed IDs", () => {
    expect(() => new GATracker({ measurementId: "UA-12345-1" })).toThrow(
      /Invalid GA4 Measurement ID/
    );
    expect(() => new GATracker({ measurementId: "g-abc123" })).toThrow(
      /Invalid GA4 Measurement ID/
    );
    expect(() => new GATracker({ gtmId: "GTM-" })).toThrow(/Invalid GTM container ID/);
    expect(() => new GATracker({ gtmId: "G-ABC123" })).toThrow(/Invalid GTM container ID/);
    expect(() => new GATracker({ gtmId: "gtm-pdl6qfsp" })).toThrow(/Invalid GTM container ID/);
  });

  it("explains the fix when a GTM ID is passed as measurementId", () => {
    expect(() => new GATracker({ measurementId: "GTM-PDL6QFSP" })).toThrow(
      "This is a GTM container ID. Pass it as `gtmId`, not `measurementId`."
    );
  });

  it("accepts valid GA4, GTM and combined configs", () => {
    expect(() => new GATracker({ measurementId: "G-ABC1234567" })).not.toThrow();
    expect(() => new GATracker({ gtmId: "GTM-PDL6QFSP" })).not.toThrow();
    expect(
      () => new GATracker({ measurementId: "G-ABC1234567", gtmId: "GTM-PDL6QFSP" })
    ).not.toThrow();
  });

  it("requires gtmAuth and gtmPreview together", () => {
    expect(() => new GATracker({ gtmId: "GTM-PDL6QFSP", gtmAuth: "abc" })).toThrow(
      /gtmAuth and gtmPreview/
    );
  });

  it("rejects an unknown eventTransport", () => {
    expect(
      // @ts-expect-error invalid on purpose
      () => new GATracker({ gtmId: "GTM-PDL6QFSP", eventTransport: "beacon" })
    ).toThrow(/Invalid eventTransport/);
  });

  it("warns about double counting in debug mode when both IDs are set", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    new GATracker({ measurementId: "G-ABC1234567", gtmId: "GTM-PDL6QFSP" });
    expect(warn).not.toHaveBeenCalled();

    new GATracker({ measurementId: "G-ABC1234567", gtmId: "GTM-PDL6QFSP", debug: true });
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/counted twice/));
  });

  it("exposes the ID validators", () => {
    expect(isValidGtmId("GTM-PDL6QFSP")).toBe(true);
    expect(isValidGtmId("G-PDL6QFSP")).toBe(false);
    expect(isValidMeasurementId("G-ABC1234567")).toBe(true);
    expect(isValidMeasurementId("GTM-ABC")).toBe(false);
  });
});
