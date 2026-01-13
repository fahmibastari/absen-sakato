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
                // Modern Clean Color Scheme
                brown: {
                    50: "#EFEBE9",
                    100: "#D7CCC8",
                    200: "#BCAAA4",
                    300: "#A1887F",
                    400: "#8D6E63",
                    500: "#795548",
                    600: "#6D4C41",
                    700: "#5D4037",
                    800: "#4E342E",
                    900: "#3E2723",
                },
                mustard: {
                    50: "#FFF3E0",
                    100: "#FFE0B2",
                    200: "#FFCC80",
                    300: "#FFB74D",
                    400: "#FFA726",
                    500: "#FF9800",
                    600: "#FB8C00",
                    700: "#F57C00",
                    800: "#EF6C00",
                    900: "#E65100",
                },
            },
            fontFamily: {
                sans: ['var(--font-geist-sans)'],
                mono: ['var(--font-geist-mono)'],
            },
        },
    },
    plugins: [],
};
export default config;
