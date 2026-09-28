"use client";

import { useMemo } from "react";
import { useAnalytics } from "../context/GAProvider";

export function useGAAuth() {
  const analytics = useAnalytics();

  return useMemo(
    () => ({
      trackLogin: analytics.trackLogin,
      trackSignUp: analytics.trackSignUp,
      setUserId: analytics.setUserId,
      setUserProperties: analytics.setUserProperties,
    }),
    [analytics]
  );
}
