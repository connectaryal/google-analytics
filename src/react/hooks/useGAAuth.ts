"use client";

import { useAnalytics } from "../context/GAProvider";

export function useGAAuth() {
  const { trackLogin, trackSignUp } = useAnalytics();

  return {
    trackLogin,
    trackSignUp,
  };
}
