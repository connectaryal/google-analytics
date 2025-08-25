import { GAEvent } from "../../types/core";
import { useAnalytics } from "../context/GAProvider";

export function useGoogleAnalytics() {
  const ga = useAnalytics();

  return {
    // Page views
    trackPage: ({ path, title }: { path?: string; title?: string }) => {
      ga.trackPageView({ path, title });
    },

    // Engagement
    trackEvent: (
      eventName: GAEvent,
      params?: Record<string, unknown>
    ) => {
      ga.trackEvent(eventName, params);
    },

    // Timing / performance
    trackTiming: (
      category: string,
      variable: string,
      value: number,
      label?: string
    ) => {
      ga.trackTiming(category, variable, value, label);
    },
  };
}
