"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import GATracker from "../../core/GATracker";
import type { GAConfig } from "../../types/analytics";

type GAContextType = GATracker | null;

const GAContext = createContext<GAContextType>(null);

export interface GAProviderProps {
  config: GAConfig;
  children: React.ReactNode;
}

export const GAProvider: React.FC<GAProviderProps> = ({ config, children }) => {
  const gaTrackerRef = useRef<GATracker | null>(null);
  const configRef = useRef(config);

  // Create once; safe during SSR because GATracker does not touch the DOM in its constructor.
  if (gaTrackerRef.current === null) {
    gaTrackerRef.current = new GATracker(config);
  }

  configRef.current = config;

  useEffect(() => {
    if (configRef.current.disableGA) return;

    const tracker = gaTrackerRef.current;
    if (!tracker || tracker.isInitialized()) return;

    let cancelled = false;

    tracker.init().catch((error) => {
      if (!cancelled && configRef.current.debug) {
        console.error("Failed to initialize GA Tracker:", error);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

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
