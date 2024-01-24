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
    }],
  },
}
export default config
