import type { Config } from "tailwindcss";

// Orbit brand design system (see CONTEXT.md §20).
// Colors are driven by CSS variables defined in globals.css so light/dark
// both work from one source of truth.
const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        elev: "var(--bg-elev)",
        sunken: "var(--bg-sunken)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        "ink-faint": "var(--ink-faint)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        accent: "var(--accent)",
        "accent-bright": "var(--accent-bright)",
        "accent-deep": "var(--accent-deep)",
        "on-accent": "var(--on-accent)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "18px",
        "2xl": "26px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(60,45,25,0.05), 0 4px 14px rgba(60,45,25,0.05)",
        md: "0 4px 12px rgba(60,45,25,0.07), 0 18px 44px rgba(60,45,25,0.09)",
        lg: "0 10px 30px rgba(60,45,25,0.10), 0 32px 70px rgba(60,45,25,0.13)",
      },
    },
  },
  plugins: [],
};

export default config;
