import { useEffect } from "react";

const BASE_TITLE = "Aleatory";

/**
 * Sets the browser tab title for the current page.
 * Reverts to the base title on unmount.
 * Usage: usePageTitle("Lottery Machine") → "Lottery Machine — Aleatory"
 */
export const usePageTitle = (pageTitle?: string) => {
  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} — ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [pageTitle]);
};
