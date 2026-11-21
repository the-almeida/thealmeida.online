"use client";
import React, { useEffect, useRef, useState } from "react";
const SHIPS_CYCLE_MS = 15000;
const SHIPS_VISIBLE_MS = 10000;
import { FAST_SHIP, PixelSprite, SLOW_SHIP } from "./pixel-art";

import { useSecrets } from "./secrets-context";

// Secret #2: two pixel-art ships fly for SHIPS_VISIBLE_MS out of every
// SHIPS_CYCLE_MS once secret #1 is found. Clicking either opens the game.
//  - Fast ship: random waypoints, a cocky pilot taunting the visitor.
//  - Slow ship: predictable parabola from bottom-left towards the counter.
const FIRST_FLIGHT_DELAY_MS = 2500;
const FAST_SIZE = 64;
const SLOW_SIZE = 72;
const FAST_SPEED = 420; // px/s
const TAUNTS = [
	"Bet you can't catch me!",
	"Click me if you can 😎",
	"Too slow, earthling!",
	"I've got a secret. Come get it.",
	"Missed me again?",
];
const TAUNT_EVERY_MS = 2600;

type Vec = { x: number; y: number };

export const ShipFleet: React.FC = () => {
	const { ready, isFound, markFound, overlay, setOverlay } = useSecrets();
	const enabled = ready && isFound("name") && !isFound("ship") && overlay === null;
	const [flying, setFlying] = useState(false);
	const [flight, setFlight] = useState(0);

	// 15s cycle: 10s flying, 5s empty sky.
	useEffect(() => {
		if (!enabled) {
			setFlying(false);
			return;
		}
		const timers: number[] = [];
		const start = () => {
			setFlight((f) => f + 1);
			setFlying(true);
			timers.push(window.setTimeout(() => setFlying(false), SHIPS_VISIBLE_MS));
		};
		timers.push(window.setTimeout(start, FIRST_FLIGHT_DELAY_MS));
		const interval = window.setInterval(start, SHIPS_CYCLE_MS);
		return () => {
			timers.forEach(clearTimeout);
			clearInterval(interval);
		};
	}, [enabled]);

	const catchShip = () => {
		if (markFound("ship")) setOverlay("game");
	};

	if (!enabled || !flying) return null;
	return (
		<div className="fixed inset-0 z-30 pointer-events-none" aria-live="polite">
			<FastShip key={`f${flight}`} onCatch={catchShip} />
			<SlowShip key={`s${flight}`} onCatch={catchShip} />
		</div>
	);
};

const ShipButton: React.FC<
	React.PropsWithChildren<{ onCatch: () => void; label: string; innerRef: React.Ref<HTMLButtonElement> }>
> = ({ onCatch, label, innerRef, children }) => (
	<button
		ref={innerRef}
		type="button"
		onClick={onCatch}
		aria-label={label}
		className="absolute top-0 left-0 p-2 -m-2 cursor-crosshair pointer-events-auto will-change-transform focus-visible:outline focus-visible:outline-1 focus-visible:outline-zinc-400"
		style={{ transform: "translate(-200px,-200px)" }}
	>
		{children}
	</button>
);

/** Fades a ship in and out at the edges of the flight window. */
function fade(t: number, total: number) {
	return Math.min(1, t / 400, (total - t) / 400);
}

const FastShip: React.FC<{ onCatch: () => void }> = ({ onCatch }) => {
	const el = useRef<HTMLButtonElement>(null);
	const sprite = useRef<HTMLDivElement>(null);
	const [taunt, setTaunt] = useState(0);

	useEffect(() => {
		const t = window.setInterval(() => setTaunt((i) => (i + 1) % TAUNTS.length), TAUNT_EVERY_MS);
		return () => clearInterval(t);
	}, []);

	useEffect(() => {
		const margin = 80;
		const rnd = (): Vec => ({
			x: margin + Math.random() * (window.innerWidth - margin * 2),
			y: margin + Math.random() * (window.innerHeight - margin * 2),
		});
		const pos: Vec = { x: -FAST_SIZE, y: window.innerHeight * (0.2 + Math.random() * 0.4) };
		const vel: Vec = { x: FAST_SPEED, y: 0 };
		let target = rnd();
		let start = 0;
		let last = 0;
		let raf = 0;
		const step = (now: number) => {
			if (!start) start = last = now;
			const dt = Math.min((now - last) / 1000, 0.05);
			last = now;
			const dx = target.x - pos.x;
			const dy = target.y - pos.y;
			const dist = Math.hypot(dx, dy);
			if (dist < 40) target = rnd();
			// Steer towards the waypoint: smooth curves instead of sharp turns.
			const want = { x: (dx / dist) * FAST_SPEED, y: (dy / dist) * FAST_SPEED };
			vel.x += (want.x - vel.x) * Math.min(1, dt * 2.5);
			vel.y += (want.y - vel.y) * Math.min(1, dt * 2.5);
			pos.x += vel.x * dt;
			pos.y += vel.y * dt;
			const angle = Math.atan2(vel.y, vel.x);
			if (el.current) {
				el.current.style.transform = `translate(${pos.x - FAST_SIZE / 2}px, ${pos.y - FAST_SIZE / 2}px)`;
				el.current.style.opacity = String(fade(now - start, SHIPS_VISIBLE_MS));
			}
			if (sprite.current) sprite.current.style.transform = `rotate(${angle}rad)`;
			raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);
		return () => cancelAnimationFrame(raf);
	}, []);

	return (
		<ShipButton innerRef={el} onCatch={onCatch} label="Catch the fast spaceship">
			<div ref={sprite} style={{ width: FAST_SIZE, height: FAST_SIZE }} className="flex items-center justify-center">
				<PixelSprite sprite={FAST_SHIP} size={FAST_SIZE} className="drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]" />
			</div>
			{/* pilot's speech bubble stays upright above the ship */}
			<span
				key={taunt}
				className="absolute px-2 py-1 font-mono text-xs -translate-x-1/2 border rounded-md left-1/2 -top-8 whitespace-nowrap border-zinc-600 bg-zinc-900/95 text-zinc-200 animate-dialog-in"
			>
				{TAUNTS[taunt]}
			</span>
		</ShipButton>
	);
};

const SlowShip: React.FC<{ onCatch: () => void }> = ({ onCatch }) => {
	const el = useRef<HTMLButtonElement>(null);
	const sprite = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const badge = document.querySelector("[data-secrets-badge]")?.getBoundingClientRect();
		// Quadratic Bezier = parabola: bottom-left -> high arc -> the counter.
		const p0: Vec = { x: -SLOW_SIZE, y: vh - 40 };
		const p2: Vec = badge
			? { x: badge.left + badge.width / 2, y: badge.bottom + SLOW_SIZE / 2 + 8 }
			: { x: vw - 60, y: 60 };
		const p1: Vec = { x: vw * 0.3, y: Math.min(p2.y, vh * 0.15) - vh * 0.15 };
		let start = 0;
		let raf = 0;
		const step = (now: number) => {
			if (!start) start = now;
			const elapsed = now - start;
			const t = Math.min(elapsed / SHIPS_VISIBLE_MS, 1);
			const u = 1 - t;
			const x = u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x;
			const y = u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y;
			const tx = 2 * u * (p1.x - p0.x) + 2 * t * (p2.x - p1.x);
			const ty = 2 * u * (p1.y - p0.y) + 2 * t * (p2.y - p1.y);
			if (el.current) {
				el.current.style.transform = `translate(${x - SLOW_SIZE / 2}px, ${y - SLOW_SIZE / 2}px)`;
				el.current.style.opacity = String(fade(elapsed, SHIPS_VISIBLE_MS));
			}
			// Gentle tilt along the arc, the saucer stays mostly level.
			if (sprite.current) sprite.current.style.transform = `rotate(${Math.atan2(ty, tx) * 0.25}rad)`;
			if (t < 1) raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);
		return () => cancelAnimationFrame(raf);
	}, []);

	return (
		<ShipButton innerRef={el} onCatch={onCatch} label="Catch the slow spaceship">
			<div ref={sprite} style={{ width: SLOW_SIZE, height: SLOW_SIZE }} className="flex items-center justify-center">
				<PixelSprite sprite={SLOW_SHIP} size={SLOW_SIZE} className="drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]" />
			</div>
		</ShipButton>
	);
};
