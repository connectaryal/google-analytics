/**
 * Resets every global the library touches so each test starts from a blank page.
 */
export function resetBrowserGlobals(): void {
  document.head.innerHTML = "";
  document.body.innerHTML = "";
  const w = window as unknown as Record<string, unknown>;
  for (const key of ["dataLayer", "gtag", "customLayer", "google_tag_manager"]) {
    delete w[key];
  }
}

/** Converts `arguments` objects pushed by gtag() into plain arrays for assertions. */
export function normalizeDataLayer(layer: unknown[] = []): unknown[] {
  return layer.map((entry) =>
    Object.prototype.toString.call(entry) === "[object Arguments]"
      ? Array.from(entry as ArrayLike<unknown>)
      : entry
  );
}

export function injectedScripts(): HTMLScriptElement[] {
  return Array.from(document.querySelectorAll("script"));
}

/** Fires the `load` event on a script so init() promises resolve under jsdom. */
export function loadScript(script: HTMLScriptElement | undefined): void {
  if (!script) throw new Error("script not found");
  script.dispatchEvent(new Event("load"));
  script.onload?.(new Event("load"));
}
