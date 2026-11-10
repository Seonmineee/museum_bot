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
        museum: {
          50: "#faf6f0",
          100: "#f3ebde",
          200: "#e6d5bf",
          300: "#d7bd9c",
          400: "#c7a27a",
          500: "#ba8b5f",
          600: "#a97452",
          700: "#8c5b43",
          800: "#734a3b",
          900: "#5e3e33",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'Pretendard'",
          "'Noto Sans KR'",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
