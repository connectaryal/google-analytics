import { DEFAULT_CONFIG, GOOGLE_TAG_URLS } from "./constants";

/**
 * A dataLayer array. Entries are either plain objects (`{ event: … }`) or the
 * `arguments` objects pushed by `gtag()`.
 */
export type DataLayer = Record<string, unknown>[];

export interface GTMEnvironmentOptions {
  readonly gtmAuth?: string;
  readonly gtmPreview?: string;
}

/**
 * Returns `window[dataLayerName]` if it is an array, otherwise `undefined`.
 * Safe to call during SSR.
 */
export const getDataLayer = (
  dataLayerName: string = DEFAULT_CONFIG.DATA_LAYER_NAME
): DataLayer | undefined => {
  if (typeof window === "undefined") return undefined;
  const layer = (window as unknown as Record<string, unknown>)[dataLayerName];
  return Array.isArray(layer) ? (layer as DataLayer) : undefined;
};

/**
 * Returns `window[dataLayerName]`, creating it first if needed. Browser only.
 */
export const ensureDataLayer = (
  dataLayerName: string = DEFAULT_CONFIG.DATA_LAYER_NAME
): DataLayer => {
  const w = window as unknown as Record<string, unknown>;
  w[dataLayerName] = getDataLayer(dataLayerName) ?? [];
  return w[dataLayerName] as DataLayer;
};

/**
 * Builds a `gtag()`-compatible function that pushes its `arguments` object onto
 * `window[dataLayerName]`, exactly like Google's official snippet.
 */
export const createGtag = (
  dataLayerName: string = DEFAULT_CONFIG.DATA_LAYER_NAME
): ((...args: unknown[]) => void) => {
  return function gtag() {
    // gtag.js and GTM only recognise commands pushed as `arguments` objects.
    // eslint-disable-next-line prefer-rest-params
    ensureDataLayer(dataLayerName).push(arguments as unknown as Record<string, unknown>);
  };
};

const environmentQuery = ({ gtmAuth, gtmPreview }: GTMEnvironmentOptions) =>
  gtmAuth && gtmPreview
    ? `&gtm_auth=${encodeURIComponent(gtmAuth)}&gtm_preview=${encodeURIComponent(
        gtmPreview
      )}&gtm_cookies_win=x`
    : "";

const dataLayerQuery = (dataLayerName: string) =>
  dataLayerName !== DEFAULT_CONFIG.DATA_LAYER_NAME
    ? `&l=${encodeURIComponent(dataLayerName)}`
    : "";

/**
 * `https://www.googletagmanager.com/gtm.js?id=GTM-XXXX[&l=…][&gtm_auth=…&gtm_preview=…&gtm_cookies_win=x]`
 */
export const buildGtmScriptUrl = (
  gtmId: string,
  options: GTMEnvironmentOptions & { readonly dataLayerName?: string } = {}
): string => {
  const { dataLayerName = DEFAULT_CONFIG.DATA_LAYER_NAME } = options;
  return `${GOOGLE_TAG_URLS.GTM}?id=${gtmId}${dataLayerQuery(
    dataLayerName
  )}${environmentQuery(options)}`;
};

/**
 * `https://www.googletagmanager.com/ns.html?id=GTM-XXXX[&gtm_auth=…&gtm_preview=…&gtm_cookies_win=x]`
 */
export const buildGtmNoScriptUrl = (
  gtmId: string,
  options: GTMEnvironmentOptions = {}
): string => {
  return `${GOOGLE_TAG_URLS.GTM_NOSCRIPT}?id=${gtmId}${environmentQuery(options)}`;
};

/**
 * `https://www.googletagmanager.com/gtag/js?id=G-XXXX[&l=…]`
 */
export const buildGtagScriptUrl = (
  measurementId: string,
  dataLayerName: string = DEFAULT_CONFIG.DATA_LAYER_NAME
): string => {
  return `${GOOGLE_TAG_URLS.GTAG}?id=${measurementId}${dataLayerQuery(
    dataLayerName
  )}`;
};

/**
 * Finds an existing `<script>` whose `src` loads the given script on the page
 * (e.g. a snippet already pasted into `index.html`).
 */
export const findExistingScript = (
  path: "gtm.js" | "gtag/js",
  id: string
): HTMLScriptElement | null => {
  const candidates = document.querySelectorAll<HTMLScriptElement>(
    `script[src*="${path}?id=${id}"]`
  );
  // `src*=` would also match GTM-ABC inside GTM-ABCD, so compare the id exactly.
  for (const script of Array.from(candidates)) {
    try {
      if (new URL(script.src, document.baseURI).searchParams.get("id") === id) {
        return script;
      }
    } catch {
      // Ignore unparsable src attributes.
    }
  }
  return null;
};
