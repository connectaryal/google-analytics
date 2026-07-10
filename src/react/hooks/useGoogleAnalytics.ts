"use client";

import { useEffect, useMemo } from "react";
import type { PageViewOptions } from "../../types/analytics";
import { useAnalytics } from "../context/GAProvider";

export function useGoogleAnalytics() {
  const analytics = useAnalytics();

  return useMemo(
    () => ({
      trackPage: analytics.trackPage,
      trackEvent: analytics.trackEvent,
      trackTiming: analytics.trackTiming,
      trackCustomEvent: analytics.trackCustomEvent,
      trackSearch: analytics.trackSearch,
      trackEngagement: analytics.trackEngagement,
      trackShare: analytics.trackShare,
      trackVideoPlay: analytics.trackVideoPlay,
      trackException: analytics.trackException,
      trackFormSubmission: analytics.trackFormSubmission,
    }),
    [analytics]
  );
}

/**
 * Tracks a page view on the client after mount or when route metadata changes.
 * Safe for SSR — the effect only runs in the browser.
 */
export function useTrackPage({
  path,
  title,
  referrer,
  customParams,
}: PageViewOptions = {}) {
  const { trackPage } = useGoogleAnalytics();

  useEffect(() => {
    trackPage({ path, title, referrer, customParams });
  }, [trackPage, path, title, referrer, customParams]);
}
