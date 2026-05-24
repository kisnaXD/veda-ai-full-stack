import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        serif: ['Georgia', '"Times New Roman"', "serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#303030",
          muted: "#5E5E5E",
          subtle: "#A9A9A9",
        },
        canvas: {
          DEFAULT: "#F6F6F6",
          soft: "#F0F0F0",
          softer: "#DADADA",
          deep: "#E6E6E6",
          dark: "#2B2B2B",
          darker: "#181818",
        },
        brand: {
          DEFAULT: "#FF5623",
          soft: "#FF7950",
        },
      },
      borderRadius: {
        pill: "100px",
        card: "16px",
        xl2: "20px",
      },
      boxShadow: {
        card: "0 16px 24px rgba(0,0,0,0.12), 0 32px 24px rgba(0,0,0,0.2)",
        soft: "0 8px 24px rgba(0,0,0,0.06)",
      },
      letterSpacing: {
        tight2: "-0.04em",
      },
    },
  },
  plugins: [],
};

export default config;
