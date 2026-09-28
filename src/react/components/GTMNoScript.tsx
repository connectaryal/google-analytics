import React from "react";
import { buildGtmNoScriptUrl } from "../../utils/gtm";
import { isValidGtmId } from "../../utils/validation";

export interface GTMNoScriptProps {
  /** GTM container ID (`GTM-XXXXXXX`). */
  readonly gtmId: string;
  /** GTM environment `gtm_auth` parameter. Requires `gtmPreview`. */
  readonly gtmAuth?: string;
  /** GTM environment `gtm_preview` parameter. Requires `gtmAuth`. */
  readonly gtmPreview?: string;
}

/**
 * Google Tag Manager `<noscript>` fallback for visitors with JavaScript disabled.
 *
 * Render it immediately after the opening `<body>` tag — in the Next.js App
 * Router that is `app/layout.tsx`. It has no effect once JavaScript runs, so it
 * only matters when the page is server-rendered or statically generated.
 *
 * Renders nothing if `gtmId` is not a valid `GTM-XXXXXXX` ID.
 *
 * @example
 * ```tsx
 * <body>
 *   <GTMNoScript gtmId="GTM-XXXXXXX" />
 *   <GAProvider config={{ gtmId: "GTM-XXXXXXX" }}>{children}</GAProvider>
 * </body>
 * ```
 */
export const GTMNoScript: React.FC<GTMNoScriptProps> = ({
  gtmId,
  gtmAuth,
  gtmPreview,
}) => {
  if (!isValidGtmId(gtmId)) return null;

  return (
    <noscript>
      <iframe
        src={buildGtmNoScriptUrl(gtmId, { gtmAuth, gtmPreview })}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
};

export default GTMNoScript;
