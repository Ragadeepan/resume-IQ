/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1524",
        mist: "#e8f7fb",
        tide: "#0f9bb0",
        coral: "#ff8a57",
        sun: "#f7cb73",
        shell: "#f8f2e9",
        midnight: "#081726",
        frost: "#f7fbff"
      },
      boxShadow: {
        panel: "0 24px 60px rgba(9, 21, 35, 0.12)"
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at 15% 20%, rgba(15, 155, 176, 0.2), transparent 30%), radial-gradient(circle at 85% 15%, rgba(255, 138, 87, 0.22), transparent 28%), radial-gradient(circle at 50% 80%, rgba(247, 203, 115, 0.18), transparent 35%)"
      }
    }
  },
  plugins: []
};
