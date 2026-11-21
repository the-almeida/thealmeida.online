import "../global.css";
import { Inter } from "next/font/google";
import LocalFont from "next/font/local";
import { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "./components/analytics";
import { UMAMI_DOMAINS, UMAMI_WEBSITE_ID } from "./components/umami";

export const metadata: Metadata = {
	title: {
		default: "The Almeida",
		template: "%s | The Almeida",
	},
	description:
		"Full-stack engineer and two-time founder. 10+ years shipping products end to end.",
	openGraph: {
		title: "thealmeida.online",
		description:
			"Full-stack engineer and two-time founder. 10+ years shipping products end to end.",
		url: "https://thealmeida.online",
		siteName: "thealmeida.online",
		images: [
			{
				url: "https://thealmeida.online/og.jpg",
				width: 1200,
				height: 630,
			},
		],
		locale: "en-US",
		type: "website",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	twitter: {
		title: "TheAlmeida",
		card: "summary_large_image",
	},
	icons: {
		shortcut: "/favicon.png",
	},
};
const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

const calSans = LocalFont({
	src: "../public/fonts/CalSans-SemiBold.ttf",
	variable: "--font-calsans",
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={[inter.variable, calSans.variable].join(" ")}>
			<body
				className="bg-black"
			>
				{process.env.NODE_ENV === "development" ? <Analytics /> : undefined}
				<Script
					src="https://cloud.umami.is/script.js"
					data-website-id={UMAMI_WEBSITE_ID}
					data-domains={UMAMI_DOMAINS}
					strategy="afterInteractive"
				/>

				{children}
			</body>
		</html>
	);
}
