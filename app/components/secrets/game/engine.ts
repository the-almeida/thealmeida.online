// Meteor shooter rules, with no DOM or canvas in here: easy to tune, and to
// simulate outside the browser (pass your own `rand`).
//
// The ship follows the pointer and fires on its own. Meteors fall from the
// top; a large one splits into two medium, a medium into two small, scoring
// like the original Asteroids (1979): 20 / 50 / 100.

// Tuned with a simulated-player harness (bots with human-like reaction time
// and aim noise) on a field up to 560px wide, so phones and desktops play the
// same. Reference: 3,000 points is reached by every bot skill level in ~30s;
// even a ship that never moves gets there in ~40% of runs.
export const TUNING = {
	/** The field is a portrait "arcade cabinet" column, at most this wide. */
	fieldMaxWidth: 560,
	lives: 3,
	playerRadius: 12, // hitbox, a bit smaller than the sprite on purpose
	playerMaxSpeed: 1100, // px/s
	invulnerableFor: 2, // s after being hit
	fireEvery: 0.16, // s
	bulletSpeed: 760, // px/s
	meteorRadius: [34, 21, 12] as const, // large, medium, small
	meteorScore: [20, 50, 100] as const,
	spawnEvery: 1.6, // s at the start, scaled by difficulty and field width
	minSpawnEvery: 0.38, // s
	fallSpeed: [70, 120] as const, // px/s at the start
	/** Difficulty grows by +1 every `rampEvery` seconds. */
	rampEvery: 40,
	/** Narrower fields spawn proportionally fewer meteors. */
	referenceWidth: 1100,
	stars: 60,
};

export type MeteorSize = 0 | 1 | 2;

export type Meteor = {
	id: number;
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: MeteorSize;
	r: number;
	/** Seed for the procedural pixel shape. */
	seed: number;
};

export type Spark = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string };

/** Background star; `depth` 0..1, nearer stars are bigger, brighter and faster. */
export type Star = { x: number; y: number; depth: number };

export type GameState = {
	w: number;
	h: number;
	time: number;
	score: number;
	lives: number;
	over: boolean;
	player: { x: number; y: number; invulnerableUntil: number };
	meteors: Meteor[];
	bullets: { x: number; y: number }[];
	sparks: Spark[];
	stars: Star[];
	spawnTimer: number;
	fireTimer: number;
	nextId: number;
};

export type GameEvent = { type: "meteorDestroyed"; size: MeteorSize } | { type: "playerHit" } | { type: "gameOver" };

export type Rand = () => number;

const between = (rand: Rand, min: number, max: number) => min + rand() * (max - min);
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

export function createGame(w: number, h: number, rand: Rand = Math.random): GameState {
	return {
		w,
		h,
		time: 0,
		score: 0,
		lives: TUNING.lives,
		over: false,
		player: { x: w / 2, y: h - 90, invulnerableUntil: 0 },
		meteors: [],
		bullets: [],
		sparks: [],
		stars: Array.from({ length: TUNING.stars }, () => ({ x: rand() * w, y: rand() * h, depth: rand() })),
		spawnTimer: 0.6,
		fireTimer: 0,
		nextId: 1,
	};
}

export function resizeGame(g: GameState, w: number, h: number) {
	for (const s of g.stars) {
		s.x *= w / g.w;
		s.y *= h / g.h;
	}
	g.w = w;
	g.h = h;
	g.player.x = clamp(g.player.x, 0, w);
	g.player.y = clamp(g.player.y, 0, h);
}

export const difficulty = (g: GameState) => 1 + g.time / TUNING.rampEvery;

function spawnMeteor(g: GameState, rand: Rand) {
	const r = TUNING.meteorRadius[0];
	g.meteors.push({
		id: g.nextId++,
		x: between(rand, r, g.w - r),
		y: -r,
		vx: between(rand, -35, 35),
		vy: between(rand, TUNING.fallSpeed[0], TUNING.fallSpeed[1]) * Math.sqrt(difficulty(g)),
		size: 0,
		r,
		seed: rand(),
	});
}

function burst(g: GameState, x: number, y: number, count: number, colors: string[], rand: Rand) {
	for (let i = 0; i < count; i++) {
		const angle = rand() * Math.PI * 2;
		const speed = between(rand, 60, 260);
		const life = between(rand, 0.3, 0.8);
		g.sparks.push({
			x,
			y,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			life,
			maxLife: life,
			color: colors[Math.floor(rand() * colors.length)],
		});
	}
}

const ROCK_DUST = ["#a1a1aa", "#71717a", "#d4d4d8"];
const SHIP_DEBRIS = ["#fb923c", "#fde047", "#f4f4f5"];

/** Background drift: always on, even on the intro and pause screens. */
export function driftStars(g: GameState, dt: number, rand: Rand = Math.random) {
	for (const s of g.stars) {
		s.y += (20 + s.depth * 60) * dt;
		if (s.y > g.h) {
			s.y = 0;
			s.x = rand() * g.w;
		}
	}
}

/**
 * Advances the game by `dt` seconds. `target` is where the player wants the
 * ship (the pointer). Returns what happened during the step.
 */
export function step(g: GameState, dt: number, target: { x: number; y: number }, rand: Rand = Math.random): GameEvent[] {
	const events: GameEvent[] = [];
	g.time += dt;

	// Sparks outlive the game, so the final explosion plays out.
	for (const s of g.sparks) {
		s.x += s.vx * dt;
		s.y += s.vy * dt;
		s.vx *= 0.96;
		s.vy *= 0.96;
		s.life -= dt;
	}
	g.sparks = g.sparks.filter((s) => s.life > 0);
	if (g.over) return events;

	// Ship: towards the target, capped by its max speed.
	const p = g.player;
	const dx = target.x - p.x;
	const dy = target.y - p.y;
	const dist = Math.hypot(dx, dy);
	const reach = TUNING.playerMaxSpeed * dt;
	if (dist > reach) {
		p.x += (dx / dist) * reach;
		p.y += (dy / dist) * reach;
	} else {
		p.x = target.x;
		p.y = target.y;
	}
	p.x = clamp(p.x, 16, g.w - 16);
	p.y = clamp(p.y, 60, g.h - 24);

	g.fireTimer -= dt;
	if (g.fireTimer <= 0) {
		g.fireTimer = TUNING.fireEvery;
		g.bullets.push({ x: p.x, y: p.y - 26 });
	}
	for (const b of g.bullets) b.y -= TUNING.bulletSpeed * dt;

	const d = difficulty(g);
	const widthFactor = clamp(TUNING.referenceWidth / g.w, 1, 2.2);
	g.spawnTimer -= dt;
	if (g.spawnTimer <= 0) {
		spawnMeteor(g, rand);
		g.spawnTimer = Math.max(TUNING.minSpawnEvery * widthFactor, (TUNING.spawnEvery * widthFactor) / d);
	}
	for (const m of g.meteors) {
		m.x += m.vx * dt;
		m.y += m.vy * dt;
	}

	// Bullets vs meteors: a hit meteor splits in two smaller ones.
	const pieces: Meteor[] = [];
	const destroyed = new Set<number>();
	g.bullets = g.bullets.filter((b) => {
		const m = g.meteors.find((rock) => !destroyed.has(rock.id) && Math.hypot(b.x - rock.x, b.y - rock.y) <= rock.r + 3);
		if (!m) return b.y > -20;
		destroyed.add(m.id);
		g.score += TUNING.meteorScore[m.size];
		events.push({ type: "meteorDestroyed", size: m.size });
		burst(g, m.x, m.y, 6 + (2 - m.size) * 6, ROCK_DUST, rand);
		if (m.size < 2) {
			const size = (m.size + 1) as MeteorSize;
			for (const dir of [-1, 1]) {
				pieces.push({
					id: g.nextId++,
					x: m.x + dir * m.r * 0.4,
					y: m.y,
					vx: dir * between(rand, 50, 120) + m.vx * 0.5,
					vy: m.vy * between(rand, 0.9, 1.25),
					size,
					r: TUNING.meteorRadius[size],
					seed: rand(),
				});
			}
		}
		return false;
	});
	g.meteors = g.meteors
		.filter((m) => !destroyed.has(m.id))
		.concat(pieces)
		.filter((m) => m.y - m.r < g.h + 10 && m.x + m.r > -40 && m.x - m.r < g.w + 40);

	// Meteors vs ship.
	if (g.time >= p.invulnerableUntil) {
		const hit = g.meteors.find((m) => Math.hypot(m.x - p.x, m.y - p.y) <= m.r + TUNING.playerRadius);
		if (hit) {
			g.lives -= 1;
			g.meteors = g.meteors.filter((m) => m.id !== hit.id);
			burst(g, p.x, p.y, 28, SHIP_DEBRIS, rand);
			if (g.lives <= 0) {
				g.over = true;
				events.push({ type: "gameOver" });
			} else {
				p.invulnerableUntil = g.time + TUNING.invulnerableFor;
				events.push({ type: "playerHit" });
			}
		}
	}
	return events;
}
