import type { Config } from 'tailwindcss'
const config: Config = {
  darkMode: 'class',
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: { 600: '#c1121f', 700: '#a00f1a' },
      },
    },
  },
  plugins: [],
}
export default config
