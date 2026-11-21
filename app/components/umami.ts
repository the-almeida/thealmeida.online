// Custom events for Umami (https://umami.is). The script is loaded in the root
// layout; until it arrives, or when it is blocked, tracking is a silent no-op.
//
// Plain link clicks don't need this: give the element a `data-umami-event`
// attribute and Umami records the click by itself.

type EventData = Record<string, string | number | boolean>;

declare global {
	interface Window {
		umami?: { track: (event: string, data?: EventData) => void };
	}
}

export const UMAMI_WEBSITE_ID = "9deee6f7-cf42-47b6-9218-4ff6318187df";
/** Only these hosts report, so localhost and Vercel previews stay out of the stats. */
export const UMAMI_DOMAINS = "thealmeida.online,www.thealmeida.online";

export function track(event: string, data?: EventData) {
	try {
		window.umami?.track(event, data);
	} catch {
		// Analytics must never break the page.
	}
}
