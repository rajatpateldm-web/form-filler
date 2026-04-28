import type { Config } from "tailwindcss"

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#0f172a"
        }
      },
      boxShadow: {
        floating: "0 10px 30px rgba(2, 6, 23, 0.18)"
      }
    }
  },
  plugins: []
} satisfies Config
