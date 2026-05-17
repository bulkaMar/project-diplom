import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "secondary-container": "#223da1",
        "inverse-on-surface": "#4e5568",
        "surface-bright": "#212c45",
        "secondary": "#8197ff",
        "on-secondary": "#001660",
        "on-surface-variant": "#a4abc0",
        "inverse-surface": "#faf8ff",
        "on-background": "#dfe5fc",
        "surface-dim": "#070e1e",
        "on-tertiary-fixed-variant": "#6d2177",
        "secondary-fixed": "#c7cfff",
        "outline-variant": "#41485a",
        "on-tertiary-container": "#63156d",
        "on-secondary-container": "#c5ceff",
        "error-dim": "#d7383b",
        "error-container": "#9f0519",
        "on-tertiary": "#6e2178",
        "on-error-container": "#ffa8a3",
        "on-surface": "#dfe5fc",
        "primary-fixed-dim": "#5591ff",
        "tertiary-container": "#f89efc",
        "tertiary-fixed": "#f89efc",
        "inverse-primary": "#005ac5",
        "tertiary-dim": "#e891ee",
        "surface-container-lowest": "#000000",
        "on-primary": "#002c67",
        "surface-container-low": "#0b1325",
        "secondary-dim": "#8197ff",
        "surface-container-high": "#161f34",
        "surface-tint": "#86adff",
        "primary-container": "#6f9fff",
        "secondary-fixed-dim": "#b5c0ff",
        "on-primary-fixed": "#000000",
        "on-primary-container": "#002150",
        "outline": "#6e7589",
        "on-tertiary-fixed": "#460050",
        "background": "#070e1e",
        "surface-container-highest": "#1b253c",
        "on-primary-fixed-variant": "#002a62",
        "primary": "#86adff",
        "primary-dim": "#026fef",
        "error": "#ff716c",
        "surface-container": "#11192d",
        "on-error": "#490006",
        "on-secondary-fixed-variant": "#2f47ac",
        "tertiary-fixed-dim": "#e891ee",
        "surface": "#070e1e",
        "primary-fixed": "#6f9fff",
        "tertiary": "#fdb3ff",
        "on-secondary-fixed": "#03278f",
        "surface-variant": "#1b253c"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      fontFamily: {
        "headline": ["Space Grotesk", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
};
export default config;
