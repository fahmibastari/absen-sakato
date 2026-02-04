import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                // Neo-Brutalism Palette
                neo: {
                    yellow: "#E4FF00", // Primary
                    blue: "#3B82F6",   // Secondary
                    pink: "#FF6B6B",   // Accent 1
                    green: "#4ADE80",  // Accent 2
                    white: "#FDFBF7",  // Neutral Background
                    black: "#1A1A1A",  // Text/Borders
                },
                // Maintaining some semantic naming for compatibility
                primary: "#E4FF00",
                secondary: "#3B82F6",
            },
            boxShadow: {
                'neo': '4px 4px 0px 0px #1A1A1A',
                'neo-sm': '2px 2px 0px 0px #1A1A1A',
                'neo-lg': '8px 8px 0px 0px #1A1A1A',
            },
            borderRadius: {
                'none': '0',
                'sm': '0.125rem',
                DEFAULT: '4px',
                'md': '0.375rem',
                'lg': '0.5rem',
                'xl': '0.75rem', // Keeping some rounding for modern feel, but tighter
            },
            fontFamily: {
                sans: ['var(--font-geist-sans)'], // Keeping Geist for now, maybe change later
                mono: ['var(--font-geist-mono)'],
            },
        },
    },
    plugins: [],
};
export default config;
