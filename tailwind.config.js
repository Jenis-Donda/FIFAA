/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // FIFA Brand Colors
        fifa: {
          topbar: "#1a3a5c",
          header: "#326295",
          "header-hover": "#3d72a8",
        },
        navy: {
          700: "#15345f",
          800: "#102a4f",
          900: "#0a1e3a",
          950: "#07162f",
        },
        brand: {
          blue: "#1b76ff",
          "blue-light": "#3b8bff",
          "blue-lighter": "#68a7ff",
        },
        surface: {
          100: "#f3f5f8",
          200: "#e3e7ef",
        },
        content: {
          muted: "#8a97ad",
          secondary: "#2f3a4f",
        },
      },
      fontFamily: {
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 22px 40px rgba(7, 22, 47, 0.18)",
        card: "0 14px 32px rgba(7, 22, 47, 0.08)",
      },
      maxWidth: {
        container: "1200px",
      },
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }], // 11px
        "3xl-plus": ["2.6rem", { lineHeight: "1.2" }],
      },
      borderRadius: {
        "2xl-plus": "1.375rem", // 22px
        "3xl": "1.75rem", // 28px
      },
    },
  },
  plugins: [],
};

