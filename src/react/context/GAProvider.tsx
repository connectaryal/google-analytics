"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import GATracker from "../../core/GATracker";
import type { GA4Config } from "../../types/analytics";

type GAContextType = GATracker | null;

const GAContext = createContext<GAContextType>(null);

export interface GAProviderProps {
  config: GA4Config;
  children: React.ReactNode;
}

export const GAProvider: React.FC<GAProviderProps> = ({ config, children }) => {
  // Use useRef to ensure single instance creation across re-renders
  const gaTrackerRef = useRef<GATracker | null>(null);

  // Only create instance once
  gaTrackerRef.current ??= new GATracker(config);

  useEffect(() => {
    // Initialize only if not already initialized
    if (gaTrackerRef.current && !gaTrackerRef.current.isInitialized()) {
      gaTrackerRef.current.init();
    }
  }, []); // Empty dependency array to run only once

  return (
    <GAContext.Provider value={gaTrackerRef.current}>
      {children}
    </GAContext.Provider>
  );
};

// Hook to consume GA
export const useAnalytics = (): GATracker => {
  const context = useContext(GAContext);
  if (!context) {
    throw new Error("useAnalytics must be used within GAProvider");
  }
  return context;
};
