import { GA4Config, InitializationState } from "../types/analytics";
import { GAEvent, TrackingOptions } from "../types/core";
import { isGtagAvailable } from "../utils/validation";

export class GoogleAnalytics {
  protected readonly config: Readonly<GA4Config> = {
    measurementId: "",
    debug: process.env.NODE_ENV === "development",
    currency: "USD",
  };
  private initializationState: InitializationState = "NOT_INITIALIZED";
  private gtagLoadPromise: Promise<void> | null = null;

  protected constructor(config: GA4Config) {
    this.config = Object.freeze({ ...config });

    this.validateConfig();

    this.initializationState = "NOT_INITIALIZED";
  }

  private validateConfig(): void {
    if (!this.config.measurementId) {
      throw new Error("GA4 measurementId is required");
    }
  }

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

  private configureGA(): void {
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      // @ts-ignore
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    window.gtag("js", new Date());

    window.gtag("config", this.config.measurementId);

    if (this.config.customConfig) {
      window.gtag("consent", "default", this.config.customConfig);
    }
  }

  public isInitialized(): boolean {
    return this.initializationState === "INITIALIZED" || isGtagAvailable();
  }

  public getInitializationState(): InitializationState {
    return this.initializationState;
  }

  public async trackEvent(
    event: GAEvent,
    options: TrackingOptions = {}
  ): Promise<void> {
    if (!isGtagAvailable()) {
      console.warn("GA4: gtag not available");
      return;
    }

    try {
      const eventData = {
        ...event.event_parameters,
        ...options.customParameters,
        ...(event.timestamp && { event_timestamp: event.timestamp }),
      };

      window.gtag("event", event.event_name, eventData);
    } catch (err) {
      console.error("GA4: Error tracking event", err);
      if (options.onError) queueMicrotask(() => options.onError!(err as Error));
    }

    console.log(event, options);
  }

  public destroy(): void {
    this.gtagLoadPromise = null;
    this.initializationState = "NOT_INITIALIZED";
  }
}

export default GoogleAnalytics;
