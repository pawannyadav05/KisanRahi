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
        navy: "#0b2545",
        navyLight: "#133b5c",
        green: "#138808",
        greenDark: "#15803d",
        saffron: "#f97316",
        saffronDark: "#ea580c",
        canvas: "#f1f5f9",
        card: "#ffffff",
        border: "#cbd5e1",
      },
    },
  },
  plugins: [],
};
export default config;
