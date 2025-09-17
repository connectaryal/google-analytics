import { GA4Config, InitializationState } from "../types/analytics";
import { GAEvent, TrackingOptions } from "../types/core";
import { isGtagAvailable } from "../utils/validation";

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
  protected readonly config: Readonly<GA4Config> = {
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
  protected constructor(config: GA4Config) {
    this.config = Object.freeze({ ...config });

    this.validateConfig();

    this.initializationState = "NOT_INITIALIZED";
  }

  /**
   * Validates the Google Analytics configuration to ensure all required parameters are present.
   *
   * @throws {Error} Throws an error if the measurementId is missing from the configuration
   * @private
   */
  private validateConfig(): void {
    if (this.config.disableGA) return;

    if (!this.config.measurementId) {
      throw new Error("GA4 measurementId is required");
    }
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
    if (this.isInitialized()) return Promise.resolve();

    if (this.initializationState === "INITIALIZING") {
      return this.gtagLoadPromise ?? Promise.resolve();
    }

    this.initializationState = "INITIALIZING";

    try {
      await this.loadGoogleAnalytics();
      this.initializationState = "INITIALIZED";
      return Promise.resolve();
    } catch (error) {
      this.initializationState = "FAILED";
      return Promise.reject(
        new Error(
          `GA4 initialization failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        )
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
    if (this.isInitialized()) return Promise.resolve();

    const { measurementId } = this.config;

    this.gtagLoadPromise = new Promise<void>((resolve, reject) => {
      // Load GA script
      const scriptTag = document.createElement("script");
      scriptTag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      scriptTag.async = true;
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
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      // @ts-ignore
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
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
    if (this.config.disableGA) return true; // if GA is disabled, consider it initialized

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
    if (this.config.disableGA) return;

    if (!isGtagAvailable()) {
      console.warn("GA4: gtag not available");
      return;
    }

    try {
      const eventData = {
        ...event.event_parameters,
        ...options.customParameters,
      };

      window.gtag("event", event.event_name, eventData);
    } catch (err) {
      console.error("GA4: Error tracking event", err);
      if (options.onError) queueMicrotask(() => options.onError!(err as Error));
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

export default GoogleAnalytics;
