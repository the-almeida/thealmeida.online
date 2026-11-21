// Flight paths for everything that crosses the sky. A route is a stateful
// function: give it the frame's dt, get back where the ship is. Routes read
// the viewport size every frame, so resizing mid-flight just works.

export type Point = { x: number; y: number };

export type Pose = Point & {
	/** Direction of travel, radians. */
	angle: number;
	scale: number;
	opacity: number;
	/** Walls hit so far (bouncing routes only). */
	bounces?: number;
	/** The flight is over: remove the ship. */
	done?: boolean;
};

export type Route = (dt: number) => Pose;

const vw = () => window.innerWidth;
const vh = () => window.innerHeight;
const between = (a: number, b: number) => a + Math.random() * (b - a);
const offscreen = (p: Point, m: number) => p.x < -m || p.x > vw() + m || p.y < -m || p.y > vh() + m;

/** Random point on a random edge, `out` px outside the viewport. */
function edgePoint(out: number): Point {
	switch (Math.floor(Math.random() * 4)) {
		case 0:
			return { x: -out, y: Math.random() * vh() };
		case 1:
			return { x: vw() + out, y: Math.random() * vh() };
		case 2:
			return { x: Math.random() * vw(), y: -out };
		default:
			return { x: Math.random() * vw(), y: vh() + out };
	}
}

/**
 * Enters from a random edge and steers between random waypoints (smooth
 * curves, never sharp turns). After `roam` seconds it heads for the nearest
 * edge, speeding up, and is done once it is out.
 */
export function wander({ speed, roam, turn }: { speed: number; roam: number; turn: number }): Route {
	const margin = 80;
	const waypoint = (): Point => ({
		x: margin + Math.random() * Math.max(vw() - margin * 2, 1),
		y: margin + Math.random() * Math.max(vh() - margin * 2, 1),
	});
	const p = edgePoint(60);
	let goal = waypoint();
	const heading = Math.atan2(goal.y - p.y, goal.x - p.x);
	const v = { x: Math.cos(heading) * speed, y: Math.sin(heading) * speed };
	let leaving = false;
	let t = 0;

	return (dt) => {
		t += dt;
		if (!leaving && t > roam) {
			leaving = true;
			const exits = [
				{ d: p.x, x: -150, y: p.y },
				{ d: vw() - p.x, x: vw() + 150, y: p.y },
				{ d: p.y, x: p.x, y: -150 },
				{ d: vh() - p.y, x: p.x, y: vh() + 150 },
			].sort((a, b) => a.d - b.d);
			goal = exits[0];
		}
		if (!leaving && Math.hypot(goal.x - p.x, goal.y - p.y) < 60) goal = waypoint();

		const target = leaving ? speed * 1.6 : speed;
		const dx = goal.x - p.x;
		const dy = goal.y - p.y;
		const len = Math.hypot(dx, dy) || 1;
		const k = Math.min(1, dt * turn);
		v.x += ((dx / len) * target - v.x) * k;
		v.y += ((dy / len) * target - v.y) * k;
		p.x += v.x * dt;
		p.y += v.y * dt;
		// The time cap is a safety net for a goal that ends up unreachable.
		const done = (leaving && offscreen(p, 100)) || t > roam + 8;
		return { x: p.x, y: p.y, angle: Math.atan2(v.y, v.x), scale: 1, opacity: 1, done };
	};
}

/**
 * A thrown-object parabola (quadratic Bézier) from the bottom-left corner
 * into `target()`. Time is warped so the ship is slowest at the apex, which
 * makes it the easy one to catch. It shrinks into the target at the end and
 * calls `onDock`.
 */
export function arc({
	duration,
	apexSlowdown,
	target,
	onDock,
}: {
	duration: number;
	apexSlowdown: number;
	target: () => Point | null;
	onDock: () => void;
}): Route {
	const DOCK_FROM = 0.93; // the last stretch of the curve is the docking
	let t = 0;
	let docked = false;

	return (dt) => {
		t += dt;
		const w = vw();
		const h = vh();
		const p0 = { x: -40, y: h - 70 };
		const p1 = { x: w * 0.45, y: -h * 0.3 };
		const p2 = target() ?? { x: w - 60, y: h - 42 };
		const s = Math.min(t / duration, 1);
		// Speed factor 1 + a·cos(2πs): slow mid-route, still monotonic for a < 1.
		const u = s + (apexSlowdown * Math.sin(2 * Math.PI * s)) / (2 * Math.PI);
		const a = (1 - u) * (1 - u);
		const b = 2 * u * (1 - u);
		const c = u * u;
		const tx = 2 * (1 - u) * (p1.x - p0.x) + 2 * u * (p2.x - p1.x);
		const ty = 2 * (1 - u) * (p1.y - p0.y) + 2 * u * (p2.y - p1.y);
		const dock = Math.max(0, (u - DOCK_FROM) / (1 - DOCK_FROM));
		if (s >= 1 && !docked) {
			docked = true;
			onDock();
		}
		return {
			x: a * p0.x + b * p1.x + c * p2.x,
			y: a * p0.y + b * p1.y + c * p2.y,
			angle: Math.atan2(ty, tx),
			scale: 1 - dock * 0.75,
			opacity: 1 - dock,
			done: docked,
		};
	};
}

/**
 * The idle-DVD-logo flight: in from an edge on a diagonal, constant speed,
 * reflecting off the viewport walls. After `bounces` hits it stops
 * reflecting and drifts out. `radius` keeps the whole sprite inside.
 */
export function bounce({ speed, bounces, radius }: { speed: number; bounces: number; radius: number }): Route {
	const fromLeft = Math.random() < 0.5;
	const p = { x: fromLeft ? -radius : vw() + radius, y: between(0.2, 0.8) * vh() };
	const angle = between(30, 55) * (Math.PI / 180) * (Math.random() < 0.5 ? -1 : 1);
	const v = { x: Math.cos(angle) * speed * (fromLeft ? 1 : -1), y: Math.sin(angle) * speed };
	let hits = 0;
	let inside = false;
	let t = 0;

	return (dt) => {
		t += dt;
		p.x += v.x * dt;
		p.y += v.y * dt;
		const w = vw();
		const h = vh();
		// Walls only count once the ship is fully on screen.
		if (!inside) inside = p.x > radius && p.x < w - radius && p.y > radius && p.y < h - radius;
		if (inside && hits < bounces) {
			if ((p.x < radius && v.x < 0) || (p.x > w - radius && v.x > 0)) {
				v.x *= -1;
				hits += 1;
			}
			if ((p.y < radius && v.y < 0) || (p.y > h - radius && v.y > 0)) {
				v.y *= -1;
				hits += 1;
			}
		}
		const done = (hits >= bounces && offscreen(p, radius * 2)) || t > 60;
		return { x: p.x, y: p.y, angle: Math.atan2(v.y, v.x), scale: 1, opacity: 1, bounces: hits, done };
	};
}
