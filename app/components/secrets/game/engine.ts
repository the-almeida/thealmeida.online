// Meteor shooter: framework-free game state + update + render, driven by the
// overlay's rAF loop. Coordinates are CSS pixels inside the field.

export const TUNING = {
	lives: 3,
	shipRadius: 14,
	shipMaxSpeed: 1100, // px/s when chasing the pointer
	keyboardSpeed: 520, // px/s with arrow keys
	minShipY: 0.3, // ship can't go above 30% of the field height
	fireEvery: 0.16, // s, auto-fire
	bulletSpeed: 760,
	spawnStart: 0.85, // s between meteors at t=0
	spawnMin: 0.3,
	rampSeconds: 100, // time to reach max difficulty
	meteorSpeedStart: 90,
	meteorSpeedEnd: 270,
	invulnerable: 1.6, // s after being hit
	// points by meteor size
	points: { small: 60, medium: 100, large: 150 },
	hp: { small: 1, medium: 2, large: 3 },
	radius: { small: 13, medium: 20, large: 30 },
} as const;

type Size = "small" | "medium" | "large";
type Vec = { x: number; y: number };
type Meteor = Vec & { r: number; vx: number; vy: number; hp: number; size: Size; rot: number; spin: number; shape: number[]; flash: number };
type Bullet = Vec;
type Particle = Vec & { vx: number; vy: number; life: number; color: string };

export type GameState = {
	w: number;
	h: number;
	time: number;
	ship: Vec;
	target: Vec;
	bullets: Bullet[];
	meteors: Meteor[];
	particles: Particle[];
	stars: (Vec & { s: number })[];
	score: number;
	lives: number;
	invulnUntil: number;
	spawnIn: number;
	fireIn: number;
	over: boolean;
};

export function createGame(w: number, h: number): GameState {
	const ship = { x: w / 2, y: h * 0.82 };
	return {
		w,
		h,
		time: 0,
		ship,
		target: { ...ship },
		bullets: [],
		meteors: [],
		particles: [],
		stars: Array.from({ length: 60 }, () => ({ x: Math.random() * w, y: Math.random() * h, s: Math.random() })),
		score: 0,
		lives: TUNING.lives,
		invulnUntil: 0,
		spawnIn: 0.6,
		fireIn: 0,
		over: false,
	};
}

export function resizeGame(g: GameState, w: number, h: number) {
	const sx = w / g.w;
	const sy = h / g.h;
	g.ship.x *= sx;
	g.ship.y *= sy;
	g.target.x *= sx;
	g.target.y *= sy;
	g.w = w;
	g.h = h;
}

export function setTarget(g: GameState, x: number, y: number) {
	g.target.x = clamp(x, TUNING.shipRadius, g.w - TUNING.shipRadius);
	g.target.y = clamp(y, g.h * TUNING.minShipY, g.h - TUNING.shipRadius);
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function difficulty(g: GameState) {
	return Math.min(g.time / TUNING.rampSeconds, 1);
}

function spawnMeteor(g: GameState) {
	const roll = Math.random();
	const size: Size = roll < 0.45 ? "small" : roll < 0.8 ? "medium" : "large";
	const r = TUNING.radius[size];
	const d = difficulty(g);
	const speed = TUNING.meteorSpeedStart + (TUNING.meteorSpeedEnd - TUNING.meteorSpeedStart) * d;
	const sizeFactor = size === "small" ? 1.2 : size === "medium" ? 1 : 0.8;
	g.meteors.push({
		x: r + Math.random() * (g.w - r * 2),
		y: -r,
		r,
		vx: (Math.random() - 0.5) * 60,
		vy: speed * sizeFactor * (0.85 + Math.random() * 0.3),
		hp: TUNING.hp[size],
		size,
		rot: Math.random() * Math.PI,
		spin: (Math.random() - 0.5) * 2,
		shape: Array.from({ length: 9 }, () => 0.75 + Math.random() * 0.3),
		flash: 0,
	});
}

function burst(g: GameState, x: number, y: number, n: number, color: string) {
	for (let i = 0; i < n; i++) {
		const a = Math.random() * Math.PI * 2;
		const s = 60 + Math.random() * 220;
		g.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.4 + Math.random() * 0.4, color });
	}
}

/** Advances the game by dt seconds. Returns points scored this step. */
export function updateGame(g: GameState, dt: number, keys: Vec | null): number {
	if (g.over) return 0;
	g.time += dt;
	let gained = 0;

	// Ship movement: arrows drive the target, then the ship chases it.
	if (keys && (keys.x || keys.y)) {
		setTarget(g, g.ship.x + keys.x * TUNING.keyboardSpeed * dt * 3, g.ship.y + keys.y * TUNING.keyboardSpeed * dt * 3);
		const step = TUNING.keyboardSpeed * dt;
		const dx = g.target.x - g.ship.x;
		const dy = g.target.y - g.ship.y;
		const dist = Math.hypot(dx, dy) || 1;
		g.ship.x += (dx / dist) * Math.min(step, dist);
		g.ship.y += (dy / dist) * Math.min(step, dist);
	} else {
		const dx = g.target.x - g.ship.x;
		const dy = g.target.y - g.ship.y;
		const dist = Math.hypot(dx, dy);
		const step = TUNING.shipMaxSpeed * dt;
		if (dist <= step) {
			g.ship.x = g.target.x;
			g.ship.y = g.target.y;
		} else {
			g.ship.x += (dx / dist) * step;
			g.ship.y += (dy / dist) * step;
		}
	}

	// Auto-fire.
	g.fireIn -= dt;
	if (g.fireIn <= 0) {
		g.fireIn = TUNING.fireEvery;
		g.bullets.push({ x: g.ship.x, y: g.ship.y - TUNING.shipRadius });
	}
	for (const b of g.bullets) b.y -= TUNING.bulletSpeed * dt;
	g.bullets = g.bullets.filter((b) => b.y > -10);

	// Spawning.
	g.spawnIn -= dt;
	if (g.spawnIn <= 0) {
		spawnMeteor(g);
		const d = difficulty(g);
		g.spawnIn = TUNING.spawnStart + (TUNING.spawnMin - TUNING.spawnStart) * d;
		// Narrow fields get fewer meteors so phones aren't harder than desktop.
		g.spawnIn *= clamp(480 / g.w, 1, 1.35);
	}

	for (const m of g.meteors) {
		m.x += m.vx * dt;
		m.y += m.vy * dt;
		m.rot += m.spin * dt;
		m.flash = Math.max(0, m.flash - dt);
		if (m.x < m.r || m.x > g.w - m.r) m.vx *= -1;
	}

	// Bullet vs meteor.
	for (const b of g.bullets) {
		for (const m of g.meteors) {
			if (m.hp > 0 && Math.hypot(b.x - m.x, b.y - m.y) < m.r) {
				b.y = -100;
				m.hp -= 1;
				m.flash = 0.08;
				if (m.hp <= 0) {
					gained += TUNING.points[m.size];
					burst(g, m.x, m.y, m.size === "large" ? 18 : 10, "#d4d4d8");
				}
				break;
			}
		}
	}

	// Meteor vs ship.
	if (g.time >= g.invulnUntil) {
		for (const m of g.meteors) {
			if (m.hp > 0 && Math.hypot(g.ship.x - m.x, g.ship.y - m.y) < m.r + TUNING.shipRadius * 0.75) {
				m.hp = 0;
				g.lives -= 1;
				g.invulnUntil = g.time + TUNING.invulnerable;
				burst(g, g.ship.x, g.ship.y, 24, "#fb923c");
				if (g.lives <= 0) g.over = true;
				break;
			}
		}
	}
	g.meteors = g.meteors.filter((m) => m.hp > 0 && m.y < g.h + m.r);

	for (const p of g.particles) {
		p.x += p.vx * dt;
		p.y += p.vy * dt;
		p.vx *= 0.96;
		p.vy *= 0.96;
		p.life -= dt;
	}
	g.particles = g.particles.filter((p) => p.life > 0);

	for (const s of g.stars) {
		s.y += (20 + s.s * 60) * dt;
		if (s.y > g.h) {
			s.y = 0;
			s.x = Math.random() * g.w;
		}
	}

	g.score += gained;
	return gained;
}

export function renderGame(ctx: CanvasRenderingContext2D, g: GameState, shipImg: CanvasImageSource | null) {
	ctx.clearRect(0, 0, g.w, g.h);
	for (const s of g.stars) {
		ctx.fillStyle = `rgba(255,255,255,${0.2 + s.s * 0.5})`;
		ctx.fillRect(s.x, s.y, s.s > 0.7 ? 2 : 1, s.s > 0.7 ? 2 : 1);
	}

	ctx.fillStyle = "#fde047";
	for (const b of g.bullets) ctx.fillRect(b.x - 1.5, b.y - 6, 3, 10);

	for (const m of g.meteors) {
		ctx.save();
		ctx.translate(m.x, m.y);
		ctx.rotate(m.rot);
		ctx.beginPath();
		m.shape.forEach((k, i) => {
			const a = (i / m.shape.length) * Math.PI * 2;
			const px = Math.cos(a) * m.r * k;
			const py = Math.sin(a) * m.r * k;
			i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
		});
		ctx.closePath();
		ctx.fillStyle = m.flash > 0 ? "#ffffff" : "#3f3f46";
		ctx.strokeStyle = "#a1a1aa";
		ctx.lineWidth = 2;
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	}

	for (const p of g.particles) {
		ctx.globalAlpha = Math.max(p.life * 1.8, 0);
		ctx.fillStyle = p.color;
		ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
	}
	ctx.globalAlpha = 1;

	const blinking = g.time < g.invulnUntil && Math.floor(g.time * 10) % 2 === 0;
	if (!g.over && !blinking && shipImg) {
		const size = TUNING.shipRadius * 3.2;
		ctx.save();
		ctx.translate(g.ship.x, g.ship.y);
		ctx.rotate(-Math.PI / 2); // sprite points right, the game ship points up
		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(shipImg, -size / 2, -size / 2, size, size);
		ctx.restore();
	}
}
