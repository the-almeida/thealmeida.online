// Central knobs for the homepage easter eggs.

export type SecretId = "name" | "ship" | "score";

export const SECRETS: { id: SecretId; label: string; hint: string }[] = [
	{ id: "name", label: "Clicked the name", hint: "Something up top wants attention" },
	{ id: "ship", label: "Caught a spaceship", hint: "Keep an eye on the sky" },
	{ id: "score", label: "Beat the high score", hint: "Unlocked by secret #2" },
];

export const STORAGE_KEY = "thealmeida:secrets";

/** TODO: swap for the dedicated mentoring booking link. */
export const PRIZE_SCHEDULE_URL =
	"https://calendly.com/the-almeida/introduction-call";

/** Score needed in the meteor game to unlock secret #3. */
export const SCORE_TARGET = 3000;

/** Ship fleet cycle: ships fly for SHIPS_VISIBLE_MS out of every SHIPS_CYCLE_MS. */
export const SHIPS_CYCLE_MS = 15000;
export const SHIPS_VISIBLE_MS = 10000;
