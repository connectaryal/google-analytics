import {
  EventTransport,
  GAConfig,
  InitializationState,
  UserProperties,
} from "../types/analytics";
import { GAEvent, TEventParams, TrackingOptions } from "../types/core";
import {
  DEFAULT_CONFIG,
  ERROR_MESSAGES,
  EventCategory,
  GA_ECOMMERCE_EVENTS,
  GA_EVENTS,
} from "../utils/constants";
import {
  buildGtagScriptUrl,
  buildGtmScriptUrl,
  createGtag,
  ensureDataLayer,
  findExistingScript,
  getDataLayer,
} from "../utils/gtm";
import {
  isBrowser,
  isDataLayerAvailable,
  isGtagAvailable,
  isValidGtmId,
  isValidMeasurementId,
} from "../utils/validation";

const EVENT_TRANSPORTS: readonly EventTransport[] = ["gtag", "dataLayer", "both"];

export class GoogleAnalytics {
  /**
   * Configuration object for Google Analytics 4 (GA4) integration.
   *
   * This readonly configuration defines the essential settings for GA4 tracking,
   * including measurement identification, debug mode, and default currency settings.
   *
   * @readonly
   * @protected
   * @property {string} measurementId - The GA4 measurement ID (e.g., "G-XXXXXXXXXX")
   * @property {boolean} debug - Debug mode flag, automatically enabled in development environment
   * @property {string} currency - Default currency code for e-commerce tracking (ISO 4217 format)
   */
  protected readonly config: Readonly<GAConfig> = {
    measurementId: "",
    debug: process.env.NODE_ENV === "development" || false,
    currency: "USD",
    disableGA: false,
  };

  /**
   * Tracks the current initialization state of the Google Analytics instance.
   * Used to prevent multiple initializations and ensure proper sequencing of operations.
   *
   * @private
   * @default "NOT_INITIALIZED"
   */
  private initializationState: InitializationState = "NOT_INITIALIZED";

  /**
   * Promise that resolves when the Google Analytics script is loaded.
   *
   * @private
   */
  private gtagLoadPromise: Promise<void> | null = null;

  /**
   * Creates a new GoogleAnalytics instance with the provided configuration.
   *
   * @param config - The GA4 configuration object containing settings for Google Analytics
   * @protected - This constructor is protected and can only be called by subclasses
   *
   * @remarks
   * The constructor performs the following operations:
   * - Freezes the configuration object to prevent mutations
   * - Validates the provided configuration
   * - Sets the initial state to "NOT_INITIALIZED"
   */
  protected constructor(config: GAConfig) {
    this.config = Object.freeze({ ...config });

    this.validateConfig();

    this.initializationState = "NOT_INITIALIZED";
  }

  /**
   * Validates the configuration: at least one of `measurementId` / `gtmId`,
   * correct ID formats, and a coherent GTM environment.
   *
   * @throws {Error} If the configuration is invalid
   * @private
   */
  private validateConfig(): void {
    if (this.config.disableGA) return;

    const { measurementId, gtmId, gtmAuth, gtmPreview, eventTransport } =
      this.config;

    if (!measurementId && !gtmId) {
      throw new Error(`GA4: ${ERROR_MESSAGES.MISSING_TRACKING_ID}`);
    }

    if (measurementId) {
      if (/^GTM-/i.test(measurementId)) {
        throw new Error(
          `GA4: "${measurementId}" is not a GA4 measurement ID. ${ERROR_MESSAGES.GTM_ID_AS_MEASUREMENT_ID}`
        );
      }
      if (!isValidMeasurementId(measurementId)) {
        throw new Error(
          `GA4: "${measurementId}" — ${ERROR_MESSAGES.INVALID_MEASUREMENT_ID}`
        );
      }
    }

    if (gtmId && !isValidGtmId(gtmId)) {
      throw new Error(`GA4: "${gtmId}" — ${ERROR_MESSAGES.INVALID_GTM_ID}`);
    }

    if (!gtmAuth !== !gtmPreview) {
      throw new Error(
        "GA4: gtmAuth and gtmPreview must be set together to load a GTM environment"
      );
    }

    if (eventTransport && !EVENT_TRANSPORTS.includes(eventTransport)) {
      throw new Error(
        `GA4: Invalid eventTransport "${eventTransport}". Expected one of ${EVENT_TRANSPORTS.join(", ")}`
      );
    }

    if (measurementId && gtmId && this.config.debug) {
      console.warn(
        `GA4: Both measurementId (${measurementId}) and gtmId (${gtmId}) are set. ` +
          `Make sure the GTM container does not also fire a GA4 tag for ${measurementId}, ` +
          "or every event will be counted twice."
      );
    }
  }

  /**
   * Name of the global dataLayer array (default `"dataLayer"`).
   */
  protected get dataLayerName(): string {
    return this.config.dataLayerName || DEFAULT_CONFIG.DATA_LAYER_NAME;
  }

  /**
   * Resolved event transport: explicit config, else `"dataLayer"` with GTM, else `"gtag"`.
   */
  protected get eventTransport(): EventTransport {
    return this.config.eventTransport ?? (this.config.gtmId ? "dataLayer" : "gtag");
  }

  private get usesGtagTransport(): boolean {
    return this.eventTransport !== "dataLayer";
  }

  private get usesDataLayerTransport(): boolean {
    return this.eventTransport !== "gtag";
  }

  /**
   * Initializes the Google Analytics 4 (GA4) tracking.
   *
   * This method ensures that Google Analytics is loaded and configured properly.
   * It implements a singleton pattern to prevent multiple initialization attempts
   * and handles concurrent initialization requests gracefully.
   *
   * @returns A Promise that resolves when initialization is complete
   * @throws {Error} Throws an error if GA4 initialization fails, with details about the failure
   *
   * @remarks
   * - If already initialized, returns immediately with a resolved Promise
   * - If initialization is in progress, returns the existing initialization Promise
   * - Updates internal state to track initialization progress (INITIALIZING -> INITIALIZED/FAILED)
   * - Safe to call multiple times concurrently
   *
   * @example
   * ```typescript
   * try {
   *   await googleAnalytics.init();
   *   console.log('Google Analytics initialized successfully');
   * } catch (error) {
   *   console.error('Failed to initialize Google Analytics:', error.message);
   * }
   * ```
   */
  public async init(): Promise<void> {
    if (this.config.disableGA || !isBrowser()) return;

    if (this.isInitialized()) return;

    if (this.initializationState === "INITIALIZING") {
      return this.gtagLoadPromise ?? Promise.resolve();
    }

    this.initializationState = "INITIALIZING";

    try {
      await this.loadGoogleAnalytics();
      this.initializationState = "INITIALIZED";
      return;
    } catch (error) {
      this.initializationState = "FAILED";
      throw new Error(
        `GA4 initialization failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Loads the Google Analytics script asynchronously and initializes the gtag library.
   *
   * This method creates a script element that loads the Google Analytics tracking code
   * from Google Tag Manager. It ensures that the script is only loaded once by checking
   * if GA is already initialized. The method configures Google Analytics after the
   * script is appended to the document head.
   *
   * @returns A Promise that resolves when the Google Analytics script has been
   *          successfully loaded and configured, or rejects if the script fails to load.
   *          If Google Analytics is already initialized, returns a resolved Promise immediately.
   *
   * @throws {Error} Throws an error with message "Failed to load Google Analytics script"
   *                 if the script fails to load from the Google Tag Manager CDN.
   *
   * @example
   * ```typescript
   * try {
   *   await googleAnalytics.loadGoogleAnalytics();
   *   console.log('Google Analytics loaded successfully');
   * } catch (error) {
   *   console.error('Failed to load Google Analytics:', error);
   * }
   * ```
   */
  public async loadGoogleAnalytics(): Promise<void> {
    if (!isBrowser()) return;

    if (this.isInitialized()) return;

    if (this.gtagLoadPromise) {
      return this.gtagLoadPromise;
    }

    if (this.config.gtmId) {
      this.gtagLoadPromise = this.loadWithTagManager(this.config.gtmId);
      return this.gtagLoadPromise;
    }

    const { measurementId = "" } = this.config;

    if (isGtagAvailable()) {
      this.initializationState = "INITIALIZED";
      return;
    }

    const scriptSelector = `script[src*="googletagmanager.com/gtag/js?id=${measurementId}"]`;
    const existingScript =
      document.querySelector<HTMLScriptElement>(scriptSelector);

    if (existingScript) {
      this.gtagLoadPromise = this.waitForScriptLoad(existingScript);
      return this.gtagLoadPromise;
    }

    this.gtagLoadPromise = new Promise<void>((resolve, reject) => {
      const scriptTag = document.createElement("script");
      scriptTag.src = buildGtagScriptUrl(measurementId, this.dataLayerName);
      scriptTag.async = true;
      this.applyNonce(scriptTag);
      document.head.appendChild(scriptTag);
      this.configureGA();

      scriptTag.onload = () => {
        resolve();
      };

      scriptTag.onerror = () => {
        reject(new Error("Failed to load Google Analytics script"));
      };
    });

    return this.gtagLoadPromise;
  }

  /**
   * Loads a GTM container (and gtag.js too when `measurementId` is also set),
   * reproducing Google's official GTM snippet.
   *
   * Order of dataLayer pushes, all before any script is inserted:
   * 1. Consent Mode defaults (`gtag("consent", "default", customConfig)`)
   * 2. gtag `js` / `config` (only when `measurementId` is set)
   * 3. `{ "gtm.start": Date.now(), event: "gtm.js" }`
   *
   * Scripts already on the page (e.g. a snippet in `index.html`) are not
   * injected again, and `gtm.js` is not re-fired for them.
   */
  private loadWithTagManager(gtmId: string): Promise<void> {
    const { measurementId, customConfig, gtmAuth, gtmPreview, debug } =
      this.config;
    const dataLayer = ensureDataLayer(this.dataLayerName);
    const existingGtm = findExistingScript("gtm.js", gtmId);
    const existingGtag = measurementId
      ? findExistingScript("gtag/js", measurementId)
      : null;

    // The global gtag is only needed when gtag.js is loaded or events use it;
    // otherwise a local shim is enough to push consent defaults for GTM.
    const needsGlobalGtag = Boolean(measurementId) || this.usesGtagTransport;
    const gtagAlreadyDefined = isGtagAvailable();
    if (needsGlobalGtag && !gtagAlreadyDefined) {
      window.gtag = createGtag(this.dataLayerName);
    }
    const gtag = needsGlobalGtag ? window.gtag : createGtag(this.dataLayerName);

    if (customConfig) {
      if (existingGtm && debug) {
        console.warn(
          "GA4: GTM was already loaded by a page snippet; consent defaults pushed now arrive after gtm.js. " +
            "Put them in the page before the snippet instead."
        );
      }
      gtag("consent", "default", customConfig);
    }

    if (measurementId && !(existingGtag && gtagAlreadyDefined)) {
      gtag("js", new Date());
      gtag("config", measurementId, { debug_mode: debug });
    }

    const loads: Promise<void>[] = [];

    if (!existingGtm) {
      dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      const script = document.createElement("script");
      script.async = true;
      script.src = buildGtmScriptUrl(gtmId, {
        dataLayerName: this.dataLayerName,
        gtmAuth,
        gtmPreview,
      });
      this.applyNonce(script);
      loads.push(this.insertScript(script, "Failed to load Google Tag Manager script"));
    }

    if (measurementId && !existingGtag) {
      const script = document.createElement("script");
      script.async = true;
      script.src = buildGtagScriptUrl(measurementId, this.dataLayerName);
      this.applyNonce(script);
      loads.push(this.insertScript(script, "Failed to load Google Analytics script"));
    }

    return Promise.all(loads).then(() => undefined);
  }

  /**
   * Inserts a script before the first `<script>` on the page (as Google's
   * snippet does), falling back to `<head>`, and resolves on load.
   */
  private insertScript(script: HTMLScriptElement, errorMessage: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      script.addEventListener("load", () => resolve(), { once: true });
      script.addEventListener("error", () => reject(new Error(errorMessage)), {
        once: true,
      });

      const firstScript = document.getElementsByTagName("script")[0];
      if (firstScript?.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }
    });
  }

  private applyNonce(script: HTMLScriptElement): void {
    if (this.config.nonce) {
      script.setAttribute("nonce", this.config.nonce);
    }
  }

  /**
   * Waits for an existing GA script tag to finish loading.
   * Used when the script was injected externally (e.g. Next.js Script).
   */
  private waitForScriptLoad(script: HTMLScriptElement): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.configureGA();

      if (isGtagAvailable()) {
        resolve();
        return;
      }

      script.addEventListener("load", () => resolve(), { once: true });
      script.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Analytics script")),
        { once: true }
      );
    });
  }

  /**
   * Configures Google Analytics 4 (GA4) by initializing the global site tag (gtag) library.
   *
   * This method performs the following setup steps:
   * - Initializes the dataLayer array if it doesn't exist
   * - Creates and assigns the gtag function to the window object
   * - Sends the current timestamp to GA4
   * - Configures GA4 with the measurement ID and debug settings
   * - Applies custom consent configuration if provided
   *
   * @private
   * @returns {void}
   */
  private configureGA(): void {
    if (!isBrowser()) return;

    window.gtag = createGtag(this.dataLayerName);
    window.gtag("js", new Date());

    window.gtag("config", this.config.measurementId, {
      debug_mode: this.config.debug,
    });

    if (this.config.customConfig) {
      window.gtag("consent", "default", this.config.customConfig);
    }
  }

  /**
   * Checks whether Google Analytics has been properly initialized.
   *
   * @returns `true` if the Google Analytics instance is initialized or if gtag is globally available, `false` otherwise
   */
  public isInitialized(): boolean {
    if (this.config.disableGA) return true;

    // With GTM, a pre-existing gtag or dataLayer (from another script) does not
    // mean the container is loaded, so only trust our own state.
    if (this.config.gtmId) return this.initializationState === "INITIALIZED";

    return this.initializationState === "INITIALIZED" || isGtagAvailable();
  }

  /**
   * Gets the current initialization state of the Google Analytics instance.
   *
   * @returns The current initialization state indicating whether the analytics
   * service is uninitialized, initializing, initialized, or failed to initialize.
   */
  public getInitializationState(): InitializationState {
    return this.initializationState;
  }

  /**
   * Tracks a Google Analytics 4 event with optional custom parameters and error handling.
   *
   * This method sends an event to GA4 using the gtag function. It combines event parameters
   * with custom parameters and includes timestamp if provided. The method handles cases where
   * gtag is not available and provides error handling with optional callback.
   *
   * @param event - The GA4 event object containing event name, parameters, and optional timestamp
   * @param options - Optional tracking configuration including custom parameters and error callback
   * @param options.customParameters - Additional parameters to merge with event parameters
   * @param options.onError - Optional callback function to handle tracking errors
   *
   * @returns A promise that resolves when the event tracking attempt is complete
   *
   * @throws Will log errors to console and optionally call the onError callback if tracking fails
   *
   * @example
   * ```typescript
   * await googleAnalytics.trackEvent(
   *   {
   *     event_name: 'purchase',
   *     event_parameters: { value: 29.99, currency: 'USD' }
   *   },
   *   {
   *     customParameters: { user_id: '12345' },
   *     onError: (err) => console.error('Tracking failed:', err)
   *   }
   * );
   * ```
   */
  public async trackEvent(
    event: GAEvent,
    options: TrackingOptions = {}
  ): Promise<void> {
    if (this.config.disableGA || !isBrowser()) return;

    if (!this.isTransportReady()) {
      if (this.config.debug) {
        console.warn(
          this.usesGtagTransport ? "GA4: gtag not available" : "GA4: dataLayer not available",
          event.event_name
        );
      }
      return;
    }

    try {
      const eventData: TEventParams = {
        ...event.event_parameters,
        ...options.customParameters,
      };

      this.sendEvent(event.event_name, eventData, event.event_category);
    } catch (err) {
      if (this.config.debug) {
        console.error("GA4: Error tracking event", err);
      }
      if (options.onError) queueMicrotask(() => options.onError!(err as Error));
    }
  }

  /**
   * Whether at least one configured transport can accept events:
   * `window.gtag` for gtag, `window[dataLayerName]` for dataLayer.
   */
  protected isTransportReady(): boolean {
    return (
      (this.usesGtagTransport && isGtagAvailable()) ||
      (this.usesDataLayerTransport && isDataLayerAvailable(this.dataLayerName))
    );
  }

  /**
   * The single dispatch point for events. Routes to gtag and/or the dataLayer
   * according to `eventTransport`.
   *
   * On the dataLayer, ecommerce events follow Google's GA4 GTM format
   * (`{ ecommerce: null }` then `{ event, ecommerce: {…} }`) and `page_view`
   * gains a `page_path`.
   */
  protected sendEvent(
    eventName: string,
    params: TEventParams,
    category?: EventCategory
  ): void {
    if (this.usesGtagTransport && isGtagAvailable()) {
      window.gtag("event", eventName, params);
    }

    const dataLayer = this.usesDataLayerTransport
      ? getDataLayer(this.dataLayerName)
      : undefined;
    if (!dataLayer) return;

    if (category === EventCategory.ECOMMERCE || GA_ECOMMERCE_EVENTS.has(eventName)) {
      dataLayer.push({ ecommerce: null });
      dataLayer.push({ event: eventName, ecommerce: { ...params } });
      return;
    }

    if (eventName === GA_EVENTS.PAGE_VIEW && params.page_path === undefined) {
      dataLayer.push({
        page_path: toPagePath(params.page_location),
        ...params,
        event: eventName,
      });
      return;
    }

    // `event` last so a parameter named "event" cannot hijack the GTM trigger.
    dataLayer.push({ ...params, event: eventName });
  }

  /**
   * Sets (or with `null`, clears) the GA4 user ID for subsequent events.
   *
   * gtag: `gtag("set", { user_id })`. dataLayer: `push({ user_id })`, readable
   * in GTM as a Data Layer Variable named `user_id`.
   */
  protected applyUserId(userId: string | null): void {
    this.sendUserData({ user_id: userId }, () =>
      window.gtag("set", { user_id: userId })
    );
  }

  /**
   * Sets GA4 user properties for subsequent events.
   *
   * gtag: `gtag("set", "user_properties", props)`. dataLayer:
   * `push({ user_properties: props })`, readable in GTM as `user_properties.<name>`.
   */
  protected applyUserProperties(properties: UserProperties): void {
    this.sendUserData({ user_properties: { ...properties } }, () =>
      window.gtag("set", "user_properties", properties)
    );
  }

  private sendUserData(
    dataLayerPayload: Record<string, unknown>,
    sendViaGtag: () => void
  ): void {
    if (this.config.disableGA || !isBrowser()) return;

    if (!this.isTransportReady()) {
      if (this.config.debug) {
        console.warn("GA4: Cannot set user data before the tracker is initialized");
      }
      return;
    }

    if (this.usesGtagTransport && isGtagAvailable()) sendViaGtag();
    if (this.usesDataLayerTransport) {
      getDataLayer(this.dataLayerName)?.push(dataLayerPayload);
    }
  }

  /**
   * Destroys the GoogleAnalytics instance by resetting its internal state.
   *
   * This method cleans up the instance by clearing the gtag load promise
   * and resetting the initialization state back to NOT_INITIALIZED.
   * Call this method when you need to completely reset the analytics
   * instance or before disposing of it.
   *
   * @public
   */
  public destroy(): void {
    this.gtagLoadPromise = null;
    this.initializationState = "NOT_INITIALIZED";
  }
}

/**
 * Derives a GTM-style `page_path` (pathname only) from a page_location value.
 */
function toPagePath(location: unknown): string | undefined {
  if (typeof location !== "string" || !location) return undefined;
  try {
    return new URL(location, window.location.href).pathname;
  } catch {
    return location;
  }
}

export default GoogleAnalytics;
