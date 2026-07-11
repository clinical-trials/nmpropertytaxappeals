import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // quiet, editorial palette — desert sand + high-desert sky
        sand: {
          50: "#faf7f2",
          100: "#f3ece1",
          200: "#e6d8c3",
        },
        ink: {
          DEFAULT: "#1c1a17",
          soft: "#4a453d",
          faint: "#7a7266",
        },
        clay: {
          DEFAULT: "#a2543a",
          dark: "#83422d",
        },
        sky: {
          DEFAULT: "#2f5d74",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
