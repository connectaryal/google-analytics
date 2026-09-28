// Core exports
export { GoogleAnalytics } from "./core/GoogleAnalytics";
export { GATracker } from "./core/GATracker";

// React exports
export { GAProvider, useAnalytics } from "./react/context/GAProvider";
export { useGoogleAnalytics, useTrackPage } from "./react/hooks/useGoogleAnalytics";
export { useGAEcommerce } from "./react/hooks/useGAEcommerce";
export { useGAAuth } from "./react/hooks/useGAAuth";
export { GTMNoScript } from "./react/components/GTMNoScript";
export type { GTMNoScriptProps } from "./react/components/GTMNoScript";

// types
export * from "./types/analytics";
export * from "./types/core";
export * from "./types/ecommerce";

// Utils
export * from "./utils/constants";
export * from "./utils/validation";
export {
  getDataLayer,
  buildGtmScriptUrl,
  buildGtmNoScriptUrl,
  buildGtagScriptUrl,
} from "./utils/gtm";
export type { DataLayer, GTMEnvironmentOptions } from "./utils/gtm";

// Version
export const version = "2.0.0";
