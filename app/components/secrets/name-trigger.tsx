"use client";
import { motion, useReducedMotion } from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { NameCues, SPARKLE_PATH } from "./name-cues";
import { useSecrets } from "./secrets-context";

type Point = { x: number; y: number };

/** Upper bound on stardust particles, so phones keep 60fps. */
const MAX_DOTS = 2400;
/** Share of the dust that burns sun-amber while flying (the site's accent). */
const AMBER_SHARE = 0.08;

/**
 * The hero name. Secret #1: clicking it turns the letters into stardust that
 * bursts away from the click and falls back into place. Works once; after
 * that the name is plain text. Until then it glints now and then and the
 * shooting-star cue (name-cues.tsx) points at it.
 */
export const NameTrigger: React.FC<{ text: string }> = ({ text }) => {
	const { ready, isFound, markFound, overlay, setOverlay } = useSecrets();
	const reducedMotion = useReducedMotion() ?? false;
	const chars = useMemo(() => Array.from(text), [text]);
	const letters = useRef<(HTMLSpanElement | null)[]>([]);
	const baseline = useRef<HTMLSpanElement>(null);
	const wrapper = useRef<HTMLDivElement>(null);
	const busy = useRef(false);
	const [dissolved, setDissolved] = useState(false);

	const found = ready && isFound("name");
	const hidden = ready && !found;
	const glint = useGlint(chars, hidden && !dissolved);

	const onClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
		if (busy.current || found) return;
		busy.current = true;
		const rect = e.currentTarget.getBoundingClientRect();
		// Keyboard activation carries no pointer position (detail === 0).
		const origin =
			e.detail === 0 ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: e.clientX, y: e.clientY };

		if (reducedMotion) {
			setDissolved(true);
			await wait(300);
			setDissolved(false);
		} else {
			const dust = sampleLetters(letters.current, baseline.current);
			setDissolved(true);
			await scatter(dust, origin, () => setDissolved(false));
		}
		busy.current = false;
		if (markFound("name")) setOverlay("intro");
	};

	const content = (
		<>
			<span className="sr-only">{text}</span>
			<span aria-hidden="true" className={`transition-opacity duration-150 ${dissolved ? "opacity-0" : "opacity-100"}`}>
				{chars.map((c, i) =>
					c === " " ? (
						<span key={i}> </span>
					) : (
						<span
							key={i}
							ref={(el) => {
								letters.current[i] = el;
							}}
							className="relative inline-block"
						>
							{c}
							{glint?.index === i ? <Glint key={glint.tick} /> : null}
						</span>
					),
				)}
			</span>
			{/* Zero-height marker on the baseline: dust sampling and the whisper use it. */}
			<span ref={baseline} aria-hidden="true" className="inline-block w-0 h-0 align-baseline" />
		</>
	);

	return (
		<div ref={wrapper} className="relative z-10">
			<h1 className="text-4xl text-white duration-1000 text-edge-outline animate-title font-display sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl whitespace-nowrap">
				{hidden ? (
					<button
						type="button"
						onClick={onClick}
						className="cursor-pointer rounded-xl outline-none focus-visible:ring-1 focus-visible:ring-zinc-500"
					>
						{content}
					</button>
				) : (
					<span>{content}</span>
				)}
			</h1>
			{/* Outside the h1, so the bubble doesn't inherit the title's text stroke. */}
			<NameCues
				letters={letters}
				baseline={baseline}
				container={wrapper}
				enabled={hidden && !dissolved && overlay === null}
				reducedMotion={reducedMotion}
			/>
		</div>
	);
};

/** Every few seconds, a glint on a random letter (never the same one twice in a row). */
function useGlint(chars: string[], enabled: boolean) {
	const [glint, setGlint] = useState<{ index: number; tick: number } | null>(null);
	useEffect(() => {
		if (!enabled) {
			setGlint(null);
			return;
		}
		const candidates = chars.flatMap((c, i) => (c === " " ? [] : [i]));
		let tick = 0;
		let last = -1;
		const show = () => {
			if (document.hidden) return;
			let index = last;
			while (index === last && candidates.length > 1) {
				index = candidates[Math.floor(Math.random() * candidates.length)];
			}
			last = index;
			setGlint({ index, tick: ++tick });
		};
		let interval: number | undefined;
		// The title has its own entrance animation; let it finish first.
		const start = window.setTimeout(() => {
			show();
			interval = window.setInterval(show, 3200);
		}, 2200);
		return () => {
			window.clearTimeout(start);
			window.clearInterval(interval);
		};
	}, [chars, enabled]);
	return glint;
}

const Glint: React.FC = () => (
	<motion.svg
		aria-hidden="true"
		viewBox="0 0 24 24"
		className="pointer-events-none absolute -top-[0.06em] -right-[0.14em] w-[0.3em] h-[0.3em] text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]"
		initial={{ scale: 0, rotate: -45, opacity: 0 }}
		animate={{ scale: [0, 1, 0], rotate: [-45, 0, 45], opacity: [0, 1, 0] }}
		transition={{ duration: 1, ease: "easeInOut" }}
	>
		<path fill="currentColor" d={SPARKLE_PATH} />
	</motion.svg>
);

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Dust = { dots: Point[]; size: number };

/**
 * Draws each letter into an offscreen canvas at its on-screen position and
 * returns the filled pixels on a grid, in viewport coordinates.
 */
function sampleLetters(letterEls: (HTMLSpanElement | null)[], baselineEl: HTMLSpanElement | null): Dust {
	const els = letterEls.filter((el): el is HTMLSpanElement => !!el);
	if (els.length === 0 || !baselineEl) return { dots: [], size: 2 };

	const style = getComputedStyle(els[0]);
	const fontSize = parseFloat(style.fontSize);
	const rects = els.map((el) => el.getBoundingClientRect());
	const pad = fontSize;
	const left = Math.min(...rects.map((r) => r.left)) - pad;
	const top = Math.min(...rects.map((r) => r.top)) - pad;
	const width = Math.max(...rects.map((r) => r.right)) - left + pad;
	const height = Math.max(...rects.map((r) => r.bottom)) - top + pad;
	const base = baselineEl.getBoundingClientRect().top;

	const canvas = document.createElement("canvas");
	canvas.width = Math.ceil(width);
	canvas.height = Math.ceil(height);
	const ctx = canvas.getContext("2d", { willReadFrequently: true });
	if (!ctx) return { dots: [], size: 2 };
	ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
	ctx.textBaseline = "alphabetic";
	ctx.fillStyle = "#fff";
	els.forEach((el, i) => ctx.fillText(el.textContent ?? "", rects[i].left - left, base - top));

	const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const read = (gap: number) => {
		const dots: Point[] = [];
		for (let y = 0; y < canvas.height; y += gap) {
			for (let x = 0; x < canvas.width; x += gap) {
				if (data[(y * canvas.width + x) * 4 + 3] > 128) dots.push({ x: left + x, y: top + y });
			}
		}
		return dots;
	};
	// A coarser grid beats dropping random dots: the letters stay readable.
	let gap = Math.max(2, Math.round(fontSize / 32));
	let dots = read(gap);
	while (dots.length > MAX_DOTS) dots = read(++gap);
	return { dots, size: gap };
}

/**
 * Blows the dust away from `origin`, then springs it back home. Calls
 * `onSettled` once it is home (to show the real text again) and resolves
 * after the overlay canvas has faded out.
 */
function scatter({ dots, size }: Dust, origin: Point, onSettled: () => void): Promise<void> {
	return new Promise((resolve) => {
		const dpr = window.devicePixelRatio || 1;
		const canvas = document.createElement("canvas");
		canvas.setAttribute("aria-hidden", "true");
		Object.assign(canvas.style, {
			position: "fixed",
			inset: "0",
			width: "100vw",
			height: "100vh",
			pointerEvents: "none",
			zIndex: "30",
			transition: "opacity 250ms ease-out",
		});
		canvas.width = window.innerWidth * dpr;
		canvas.height = window.innerHeight * dpr;
		const ctx = canvas.getContext("2d");
		if (!ctx || dots.length === 0) {
			onSettled();
			resolve();
			return;
		}
		document.body.appendChild(canvas);
		ctx.scale(dpr, dpr);

		const particles = dots.map((home) => {
			const dx = home.x - origin.x;
			const dy = home.y - origin.y;
			const len = Math.hypot(dx, dy) || 1;
			const speed = 400 + Math.random() * 800;
			return {
				home,
				x: home.x,
				y: home.y,
				vx: (dx / len) * speed + (Math.random() - 0.5) * 500,
				vy: (dy / len) * speed + (Math.random() - 0.5) * 500,
				returnAt: 0.55 + Math.random() * 0.45,
				alpha: 0.5 + Math.random() * 0.5,
				amber: Math.random() < AMBER_SHARE,
			};
		});

		const STIFFNESS = 120;
		const DAMPING = 2 * Math.sqrt(STIFFNESS); // critically damped: home without wobbling
		const SETTLE_AT = 1.75; // s
		// Dots live in viewport space; if the page scrolls meanwhile, follow it.
		const scrollStart = window.scrollY;
		let last = performance.now();
		let t = 0;

		const frame = (now: number) => {
			const dt = Math.min((now - last) / 1000, 1 / 30);
			last = now;
			t += dt;
			const shift = scrollStart - window.scrollY;
			const landing = t >= SETTLE_AT - 0.3;
			ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
			for (const p of particles) {
				if (t < p.returnAt) {
					const drag = Math.exp(-3 * dt);
					p.vx *= drag;
					p.vy *= drag;
				} else {
					p.vx += (STIFFNESS * (p.home.x - p.x) - DAMPING * p.vx) * dt;
					p.vy += (STIFFNESS * (p.home.y - p.y) - DAMPING * p.vy) * dt;
				}
				p.x += p.vx * dt;
				p.y += p.vy * dt;
				// Twinkling while in flight, solid white once it lands.
				ctx.globalAlpha = landing ? 1 : p.alpha;
				ctx.fillStyle = p.amber && !landing ? "#fcd34d" : "#fff";
				ctx.fillRect(p.x, p.y + shift, size * 0.8, size * 0.8);
			}
			if (t < SETTLE_AT) {
				requestAnimationFrame(frame);
				return;
			}
			onSettled();
			canvas.style.opacity = "0";
			window.setTimeout(() => {
				canvas.remove();
				resolve();
			}, 260);
		};
		requestAnimationFrame(frame);
	});
}
