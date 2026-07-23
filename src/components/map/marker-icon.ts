import L from "leaflet";

const MARKER_WIDTH = 92;
const MARKER_HEIGHT = 28;

/**
 * Builds a pill-shaped marker showing an abbreviated price, styled to match
 * the brand palette. Labels are always currency-formatted strings produced
 * by src/lib/currency.ts, never raw user input, so interpolating them into
 * the marker's HTML is safe.
 */
export function createPriceMarkerIcon(label: string, isActive: boolean): L.DivIcon {
  const background = isActive ? "var(--color-brand-700)" : "var(--color-ink-900)";
  return L.divIcon({
    className: "raiz-price-marker",
    html: `
      <div style="
        display:flex;
        align-items:center;
        justify-content:center;
        width:100%;
        height:100%;
        background:${background};
        color:#fff;
        font-family:var(--font-inter, sans-serif);
        font-size:12px;
        font-weight:600;
        line-height:1;
        border-radius:999px;
        box-shadow:0 2px 6px rgba(0,0,0,0.35);
        white-space:nowrap;
        border:2px solid white;
        box-sizing:border-box;
      ">${label}</div>
    `,
    iconSize: [MARKER_WIDTH, MARKER_HEIGHT],
    iconAnchor: [MARKER_WIDTH / 2, MARKER_HEIGHT / 2],
  });
}
