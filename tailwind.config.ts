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
        'ijsselheem': {
          'donkerblauw': '#25377f',
          'lichtblauw': '#cbe9fb',
          'accentblauw': '#a1d9f7',
          'olijfgroen': '#beb022',
          'pastelgroen': '#f5f4de',
          'middenblauw': '#908ebc',
        },
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      fontSize: {
        'titel': ['24px', { lineHeight: '30px', fontWeight: '800' }],
        'tussenkop': ['10px', { lineHeight: '15px', fontWeight: '600' }],
        'tekst': ['10px', { lineHeight: '15px', fontWeight: '400' }],
        'bijschrift': ['8px', { lineHeight: '12px', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
};
export default config;


