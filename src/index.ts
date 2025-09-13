// Core exports
export { GoogleAnalytics } from './core/GoogleAnalytics';
export { GATracker } from './core/GATracker';

// React exports
export { GAProvider, useAnalytics } from './react/context/GAProvider';
export { useGoogleAnalytics } from './react/hooks/useGoogleAnalytics';
export { useGAEcommerce } from './react/hooks/useGAEcommerce';
export { useGAAuth } from './react/hooks/useGAAuth';

// types
export * from './types/analytics';
export * from './types/core';
export * from './types/ecommerce';

// Utils
export * from './utils/constants';
export * from './utils/validation';

// Version
export const version = '1.0.0';
