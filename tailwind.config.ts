import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#22d3ee",
        secondary: "#0ea5e9",
        danger: "#f43f5e",
        warning: "#fbbf24",
        success: "#34d399",
        surface: "#0b1224",
        overlay: "rgba(255,255,255,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
