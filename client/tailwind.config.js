/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        NavPurple: "#694F8E",
        Navbtn: "#E3A5C7",
        Loaderclr: "#E3A5C7",
      },
      fontFamily: {
        sans: ["Roboto", "sans-serif"], // Roboto as default for font-sans
      },
    },
  },

  plugins: [],
};
