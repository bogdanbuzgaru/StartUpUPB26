import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const ArrowUpRight = (p: P) => (
  <svg viewBox="0 0 16 16" {...base} {...p}>
    <path d="M5 11 11 5M6 5h5v5" />
  </svg>
);
export const ArrowRight = (p: P) => (
  <svg viewBox="0 0 16 16" {...base} {...p}>
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);
export const CopyIcon = (p: P) => (
  <svg viewBox="0 0 16 16" {...base} {...p}>
    <rect x="5.5" y="5.5" width="8" height="8" rx="1" />
    <path d="M10.5 5.5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
  </svg>
);
export const CheckIcon = (p: P) => (
  <svg viewBox="0 0 16 16" {...base} {...p}>
    <path d="m3.5 8.5 3 3 6-7" />
  </svg>
);
export const CloseIcon = (p: P) => (
  <svg viewBox="0 0 16 16" {...base} {...p}>
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);
export const AlertIcon = (p: P) => (
  <svg viewBox="0 0 16 16" {...base} {...p}>
    <circle cx="8" cy="8" r="6" />
    <path d="M8 5v3.5M8 11h.01" />
  </svg>
);
export const SendIcon = (p: P) => (
  <svg viewBox="0 0 16 16" {...base} {...p}>
    <path d="M2.5 8h9M8 4l4 4-4 4" />
  </svg>
);
export const RefreshIcon = (p: P) => (
  <svg viewBox="0 0 16 16" {...base} {...p}>
    <path d="M13 8a5 5 0 1 1-1.5-3.55M13 2.5v3h-3" />
  </svg>
);
export const SparkIcon = (p: P) => (
  <svg viewBox="0 0 16 16" {...base} {...p}>
    <path d="M8 2v3M8 11v3M2 8h3M11 8h3M4.2 4.2l1.6 1.6M10.2 10.2l1.6 1.6M11.8 4.2l-1.6 1.6M5.8 10.2l-1.6 1.6" />
  </svg>
);
export const DownloadIcon = (p: P) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden {...p}>
    <path d="M8 2v8M4.5 6.5 8 10l3.5-3.5M2.5 13.5h11" strokeLinecap="square" />
  </svg>
);
export const FlaskIcon = (p: P) => (
  <svg viewBox="0 0 16 16" {...base} {...p}>
    <path d="M6 2h4M6.5 2v4L3 13a1 1 0 0 0 .9 1.5h8.2A1 1 0 0 0 13 13L9.5 6V2M5 10h6" />
  </svg>
);
