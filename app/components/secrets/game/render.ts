// Draws a GameState on a 2D canvas, in the same pixel-art language as the
// ships flying over the homepage.
import { NEEDLE, Sprite } from "../pixel-art";
import type { GameState, Meteor } from "./engine";

/** Rotates a sprite 90° counter-clockwise (→ becomes ↑). */
function rotateLeft(sprite: Sprite): Sprite {
	const h = sprite.rows.length;
	const w = sprite.rows[0].length;
	const rows: string[] = [];
	for (let x = w - 1; x >= 0; x--) {
		let row = "";
		for (let y = 0; y < h; y++) row += sprite.rows[y][x];
		rows.push(row);
	}
	return { ...sprite, rows };
}

/** You fly the ship you just caught, nose up. */
const PLAYER = rotateLeft(NEEDLE);
const PLAYER_PIXEL = 3;
const METEOR_PIXEL = 3;

/** Draws a sprite centered on (cx, cy). `flame` off hides its flame pixels (flicker). */
function drawSprite(ctx: CanvasRenderingContext2D, sprite: Sprite, cx: number, cy: number, pixel: number, flame: boolean) {
	const h = sprite.rows.length;
	const w = sprite.rows[0].length;
	const left = Math.round(cx - (w * pixel) / 2);
	const top = Math.round(cy - (h * pixel) / 2);
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const ch = sprite.rows[y][x];
			if (ch === "." || (!flame && sprite.animate?.[ch] === "flame")) continue;
			ctx.fillStyle = sprite.palette[ch];
			ctx.fillRect(left + x * pixel, top + y * pixel, pixel, pixel);
		}
	}
}

/** Meteor sprites are drawn once and reused until the meteor is gone. */
export type MeteorCache = Map<number, HTMLCanvasElement>;

export function render(ctx: CanvasRenderingContext2D, g: GameState | null, now: number, cache: MeteorCache) {
	const { width, height } = ctx.canvas;
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, width, height);
	ctx.restore();
	if (!g) return;

	for (const s of g.stars) {
		const size = s.depth > 0.7 ? 2 : 1;
		ctx.fillStyle = `rgba(255,255,255,${0.2 + s.depth * 0.5})`;
		ctx.fillRect(Math.round(s.x), Math.round(s.y), size, size);
	}

	const alive = new Set<number>();
	for (const m of g.meteors) {
		alive.add(m.id);
		let sprite = cache.get(m.id);
		if (!sprite) cache.set(m.id, (sprite = meteorSprite(m)));
		ctx.drawImage(sprite, Math.round(m.x - sprite.width / 2), Math.round(m.y - sprite.height / 2));
	}
	cache.forEach((_, id) => {
		if (!alive.has(id)) cache.delete(id);
	});

	ctx.fillStyle = "#fde047";
	for (const b of g.bullets) ctx.fillRect(Math.round(b.x) - 1, Math.round(b.y), 3, 9);

	// The ship blinks while invulnerable and is gone once destroyed.
	const p = g.player;
	const blinking = g.time < p.invulnerableUntil && Math.floor(now / 90) % 2 === 0;
	if (!g.over && !blinking) drawSprite(ctx, PLAYER, p.x, p.y, PLAYER_PIXEL, Math.floor(now / 70) % 2 === 0);

	for (const s of g.sparks) {
		ctx.globalAlpha = Math.max(s.life / s.maxLife, 0);
		ctx.fillStyle = s.color;
		ctx.fillRect(Math.round(s.x), Math.round(s.y), 3, 3);
	}
	ctx.globalAlpha = 1;
}

/** Procedural pixel rock: lumpy outline, lit from the top-left, a few craters. */
function meteorSprite(m: Meteor): HTMLCanvasElement {
	const cells = Math.ceil((m.r * 2) / METEOR_PIXEL) + 2;
	const canvas = document.createElement("canvas");
	canvas.width = canvas.height = cells * METEOR_PIXEL;
	const ctx = canvas.getContext("2d");
	if (!ctx) return canvas;

	// Small deterministic PRNG (Park–Miller), so a meteor keeps its shape.
	let seed = Math.floor(m.seed * 2 ** 31) || 1;
	const rand = () => {
		seed = (seed * 16807) % 2147483647;
		return (seed - 1) / 2147483646;
	};
	const phases = [rand(), rand(), rand()].map((v) => v * Math.PI * 2);
	const radius = m.r / METEOR_PIXEL;
	const c = cells / 2;
	const inside = (x: number, y: number) => {
		const dx = x + 0.5 - c;
		const dy = y + 0.5 - c;
		const a = Math.atan2(dy, dx);
		const wobble = 0.82 + 0.1 * Math.sin(a * 3 + phases[0]) + 0.06 * Math.sin(a * 5 + phases[1]) + 0.04 * Math.sin(a * 7 + phases[2]);
		return Math.hypot(dx, dy) <= radius * wobble;
	};
	const craters = Array.from({ length: m.size === 2 ? 1 : 3 }, () => ({
		x: c + (rand() - 0.5) * radius,
		y: c + (rand() - 0.5) * radius,
		r: Math.max(1, radius * (0.12 + rand() * 0.12)),
	}));

	for (let y = 0; y < cells; y++) {
		for (let x = 0; x < cells; x++) {
			if (!inside(x, y)) continue;
			const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
			const light = (c - x + (c - y)) / (radius * 2); // > 0 towards the top-left
			const crater = craters.some((cr) => Math.hypot(x + 0.5 - cr.x, y + 0.5 - cr.y) < cr.r);
			ctx.fillStyle = edge
				? light > 0
					? "#d4d4d8"
					: "#3f3f46"
				: crater
					? "#3f3f46"
					: light > 0.25
						? "#a1a1aa"
						: light < -0.25
							? "#52525b"
							: "#71717a";
			ctx.fillRect(x * METEOR_PIXEL, y * METEOR_PIXEL, METEOR_PIXEL, METEOR_PIXEL);
		}
	}
	return canvas;
}
