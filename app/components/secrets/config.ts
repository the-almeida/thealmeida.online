// Every tunable knob of the homepage easter eggs lives here.

export type SecretId = "name" | "ship" | "score";

/**
 * In discovery order. `title` is shown once a secret is found; `hint` only
 * for the next secret still to find, so the list never spoils the journey.
 */
export const SECRETS: { id: SecretId; title: string; hint: string }[] = [
	{ id: "name", title: "Name Dropper", hint: "Some things up here are clickable." },
	{ id: "ship", title: "Reverse Abduction", hint: "Keep your eyes on the sky." },
	{ id: "score", title: "It Was Rocket Science", hint: "Prove you can fly." },
];

export const STORAGE_KEY = "thealmeida:secrets";
export const BEST_SCORE_KEY = "thealmeida:best";

/** TODO: swap for the dedicated mentoring booking link. */
export const PRIZE_SCHEDULE_URL =
	"https://calendly.com/the-almeida/introduction-call";
export const WHATSAPP_URL = "https://wa.link/dgb8r8";

/** Score needed in the meteor game to unlock secret #3. */
export const SCORE_TARGET = 3000;

// --- Secret #2: the fleet ---------------------------------------------------
// One wave = three ships at once, then an empty sky before the next wave.

/** Empty sky before each wave (the first one included). */
export const WAVE_GAP_MS = 5000;
/** How long the wandering ships roam before heading for the nearest edge. */
export const WAVE_ROAM_MS = 9000;
/** The saucer's whole trip, from bottom-left into the secrets counter. */
export const SAUCER_FLIGHT_MS = 9600;
/** 0..1, how much the saucer slows down at the top of its arc. */
export const SAUCER_APEX_SLOWDOWN = 0.7;
export const FAST_SHIP_SPEED = 400; // px/s
export const SLOW_SHIP_SPEED = 190; // px/s

/** What the ET in the saucer says, one line at a time. */
export const SAUCER_TAUNTS = [
	"Bet you can't catch me!",
	"Click me if you can 😎",
	"Too slow, earthling!",
	"I've got a secret. Come get it.",
	"Missed me again?",
];
export const TAUNT_EVERY_MS = 2600;

// --- After secret #2: the visitor -------------------------------------------
// Now and then an ET drifts in and bounces around like an idle DVD logo.

export const VISITOR_EVERY_MS: [number, number] = [25000, 40000];
export const VISITOR_SPEED = 170; // px/s
export const VISITOR_BOUNCES: [number, number] = [3, 5];

/** TODO(Gustavo): pick the final lines. Max ~10 words each. */
export const VISITOR_LINES = [
	"There's no place like 127.0.0.1. I checked.",
	"I came in peace. Then I saw your node_modules.",
	"Took me three light-years to center this div.",
	"Works on my planet. Not my problem.",
	"Earth tip from a frequent visitor: it's always DNS.",
	"I'd tell you a UDP joke, but you might not get it.",
	"A day on Venus lasts longer than its whole year.",
	"Saturn would float in a big enough bathtub.",
	"Sunlight hitting you right now left the Sun eight minutes ago.",
	"Olympus Mons is two and a half Everests tall.",
	"A teaspoon of neutron star weighs about a billion tons.",
	"Space is silent. Your screams are safe with me.",
];

/** Fired on window to make the counter pulse (e.g. the saucer docking). */
export const BADGE_PULSE_EVENT = "secrets:pulse";
