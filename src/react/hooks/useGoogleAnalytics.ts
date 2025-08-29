import { useAnalytics } from "../context/GAProvider";

export function useGoogleAnalytics() {
  const {
    trackPage,
    trackEvent,
    trackTiming,
    trackCustomEvent,
    trackSearch,
    trackEngagement,
    trackShare,
    trackVideoPlay,
    trackException,
  } = useAnalytics();

  return {
    trackPage,
    trackEvent,
    trackTiming,
    trackCustomEvent,
    trackSearch,
    trackEngagement,
    trackShare,
    trackVideoPlay,
    trackException,
  };
}
