# Changelog

All notable changes to this project are documented in this file.

## [2.0.0] - 2026-09-28

### Added

- **Google Tag Manager support.** The new `gtmId` config option loads a GTM container with Google's official `gtm.js` snippet. The library initialises the dataLayer, pushes the `gtm.js` start event and injects the script asynchronously.
- New config options: `dataLayerName`, `gtmAuth`/`gtmPreview` (GTM environments), `nonce` (CSP) and `eventTransport` (`"gtag" | "dataLayer" | "both"`). `eventTransport` defaults to `"dataLayer"` when `gtmId` is set and `"gtag"` otherwise.
- **dataLayer event transport.** Custom events are pushed as `{ event, ...params }`. Page views include `page_path`. Ecommerce events use Google's GA4 GTM format: a `{ ecommerce: null }` push, then `{ event, ecommerce: {…} }`.
- `setUserId()` and `setUserProperties()` on `GATracker` and `useGAAuth()`. They use `gtag("set", …)` on the gtag transport and dataLayer variables (`user_id`, `user_properties`) on the dataLayer transport.
- `GTMNoScript` component for the `<noscript>` iframe fallback.
- Exports: `GAConfig`, `EventTransport`, `UserProperties`, `GTMNoScriptProps`, `DataLayer`, `isValidGtmId`, `isValidMeasurementId`, `isDataLayerAvailable`, `getDataLayer`, `buildGtmScriptUrl`, `buildGtmNoScriptUrl`, `buildGtagScriptUrl`.
- Consent defaults (`customConfig`) are pushed before `gtm.js` loads, as a gtag-style `arguments` push (Consent Mode v2).
- When `measurementId` and `gtmId` are both set, both scripts load and share one dataLayer. A debug warning explains the double-counting risk.
- Test suite (vitest + jsdom), run in CI.

### Changed

- `measurementId` is now optional, but at least one of `measurementId` or `gtmId` is required unless `disableGA` is set.
- `GA4Config` is now a deprecated alias of `GAConfig`.
- ID formats are validated. `measurementId` must match `/^G-[A-Z0-9]+$/` and `gtmId` must match `/^GTM-[A-Z0-9]+$/`. `VALIDATION_PATTERNS.MEASUREMENT_ID` was loosened from exactly 10 characters to match.

### Breaking changes

- Passing a GTM container ID as `measurementId` now throws: *"This is a GTM container ID. Pass it as `gtmId`, not `measurementId`."* Before, it loaded the Google tag instead of the container. Switch to `gtmId`.
- A `measurementId` that isn't in `G-XXXXXXXXXX` format now throws at construction time.

### Unchanged

- `measurementId`-only configs make the same network request (`gtag/js?id=…`) and the same `gtag()` call sequence as before.
