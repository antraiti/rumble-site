import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: ["light", "dark", "cupcake", "forest", "business", {
      mytheme: {
        "primary": "#18181b",
        "secondary": "#1f1f23",
        "accent": "#35353b",
        "neutral": "#1f1f23",
        "base-100": "#0e0e10",
        "info": "#fef08a",
        "success": "#86efac",
        "warning": "#fdba74",
        "error": "#fca5a5",
        },
      superbowl: {
        "primary": "#bcbebf",
        "secondary": "#dfbd69",
        "accent": "#c7a95d",
        "neutral": "#fff3c2",
        "base-100": "#bcbebf",
        "info": "#fef08a",
        "success": "#005e11",
        "warning": "#fdba74",
        "error": "#452101",
      },
      halloween: {
        "primary": "#060606",
        "secondary": "#0C0C0C",
        "accent": "#0C0C0C",
        "neutral": "#240039",
        "base-100": "#000000",
        "info": "#FFB400",
        "success": "#FFB400",
        "warning": "#FFB400",
        "error": "#FFB400",
        },
      golgari: {
        "primary": "#154F00",
        "secondary": "#000000",
        "accent": "#000000",
        "neutral": "#041000",
        "base-100": "#000000",
        "info": "#279400",
        "success": "#279400",
        "warning": "#279400",
        "error": "#279400",
        },
      willbo: {
        "primary": "#47899E",
        "secondary": "#CF4037",
        "accent": "#47929E",
        "neutral": "#64A8B7",
        "base-100": "#bcbebf",
        "info": "#fef08a",
        "success": "#000000",
        "warning": "#000000",
        "error": "#000000",
      },
    }],
  },
}
export default config
