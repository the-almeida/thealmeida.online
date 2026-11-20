const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx}",
		"./mdx-components.tsx",
		"content/**/*.mdx",
	],

	theme: {
		extend: {
			typography: {
				quoteless: {
					css: {
						"blockquote p:first-of-type::before": { content: "none" },
						"blockquote p:first-of-type::after": { content: "none" },
					},
				},
			},
			fontFamily: {
				sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
				display: ["var(--font-calsans)"],
			},
			backgroundImage: {
				"gradient-radial":
					"radial-gradient(50% 50% at 50% 50%, var(--tw-gradient-stops))",
			},
			animation: {
				"fade-in": "fade-in 1s ease-in-out forwards",
				title: "title 1s ease-out forwards",
				"fade-left": "fade-left 1s ease-in-out forwards",
				"fade-right": "fade-right 1s ease-in-out forwards",
				"dialog-in": "dialog-in 200ms ease-out both",
				"badge-bump": "badge-bump 600ms ease-out",
				glint: "glint 900ms ease-in-out both",
				"planet-float": "planet-float 6s ease-in-out infinite",
			},
			keyframes: {
				"dialog-in": {
					"0%": { opacity: "0", transform: "scale(0.96)" },
					"100%": { opacity: "1", transform: "scale(1)" },
				},
				"planet-float": {
					"0%, 100%": { translate: "0 0" },
					"50%": { translate: "0 -6px" },
				},
				glint: {
					"0%": { opacity: "0", transform: "scale(0) rotate(0deg)" },
					"50%": { opacity: "1", transform: "scale(1.4) rotate(90deg)" },
					"100%": { opacity: "0", transform: "scale(0) rotate(180deg)" },
				},
				"badge-bump": {
					"0%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(252,211,77,0.6)" },
					"40%": { transform: "scale(1.15)" },
					"100%": { transform: "scale(1)", boxShadow: "0 0 0 14px rgba(252,211,77,0)" },
				},
				"fade-in": {
					"0%": {
						opacity: "0%",
					},
					"75%": {
						opacity: "0%",
					},
					"100%": {
						opacity: "100%",
					},
				},
				"fade-left": {
					"0%": {
						transform: "translateX(100%)",
						opacity: "0%",
					},

					"30%": {
						transform: "translateX(0%)",
						opacity: "100%",
					},
					"100%": {
						opacity: "0%",
					},
				},
				"fade-right": {
					"0%": {
						transform: "translateX(-100%)",
						opacity: "0%",
					},

					"30%": {
						transform: "translateX(0%)",
						opacity: "100%",
					},
					"100%": {
						opacity: "0%",
					},
				},
				title: {
					"0%": {
						"line-height": "0%",
						"letter-spacing": "0.25em",
						opacity: "0",
					},
					"25%": {
						"line-height": "0%",
						opacity: "0%",
					},
					"80%": {
						opacity: "100%",
					},

					"100%": {
						"line-height": "100%",
						opacity: "100%",
					},
				},
			},
		},
	},
	plugins: [
		require("@tailwindcss/typography"),
	],
};
