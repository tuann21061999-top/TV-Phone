/** @type {import('tailwindcss').Config} */
export const content = [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
];
export const theme = {
  extend: {
    keyframes: {
      float: {
        '0%':   { transform: 'translateY(0px) rotate(0deg)' },
        '50%':  { transform: 'translateY(-15px) rotate(2deg)' },
        '100%': { transform: 'translateY(0px) rotate(0deg)' },
      },
      fadeIn: {
        '0%':   { opacity: '0', transform: 'translateY(20px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
    },
    animation: {
      float:   'float 3s ease-in-out infinite',
      fadeIn:  'fadeIn 0.3s ease-in-out',
    },
  },
};
export const plugins = [];