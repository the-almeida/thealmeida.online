"use client";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import type { Point, Pose, Route } from "./flight";
import { PixelSprite, Sprite, spriteColors } from "./pixel-art";

export type Flyer = {
	id: string;
	sprite: Sprite;
	/** On-screen width of the sprite, px. */
	size: number;
	route: Route;
	/** "heading" rotates the sprite to its direction; "level" only tilts it (saucers). */
	orientation: "heading" | "level";
	label: string;
	/** Glow color(s); with several, the glow changes on every wall hit, like the DVD logo. */
	glow: string[];
	/** Speech bubble: one line, or several that take turns. */
	lines?: string[];
	lineEvery?: number;
};

type SkyProps = {
	flyers: Flyer[];
	/** A flyer finished its route on its own. */
	onDone: (id: string) => void;
	/** A flyer was clicked. Its explosion is already playing at `at`. */
	onHit: (flyer: Flyer, at: Point) => void;
};

type Live = { button: HTMLButtonElement | null; body: HTMLSpanElement | null; bubble: HTMLSpanElement | null; pose: Pose | null };

const BURST_MS = 900;

/**
 * Renders the ships and moves all of them in a single animation loop that
 * only runs while something is flying. The loop is driven by
 * requestAnimationFrame, so flights freeze while the tab is hidden.
 */
export const Sky: React.FC<SkyProps> = ({ flyers, onDone, onHit }) => {
	const live = useRef(new Map<string, Live>());
	const [bursts, setBursts] = useState<{ id: number; at: Point; colors: string[] }[]>([]);
	const onDoneRef = useRef(onDone);
	onDoneRef.current = onDone;

	useEffect(() => {
		if (flyers.length === 0) return;
		const finished = new Set<string>();
		let frame = 0;
		let last = performance.now();
		const tick = (now: number) => {
			// Clamped, so a long pause (hidden tab) resumes smoothly instead of teleporting.
			const dt = Math.min((now - last) / 1000, 1 / 30);
			last = now;
			for (const f of flyers) {
				const l = live.current.get(f.id);
				if (!l || finished.has(f.id)) continue;
				const pose = f.route(dt);
				l.pose = pose;
				place(f, l, pose);
				if (pose.done) {
					finished.add(f.id);
					onDoneRef.current(f.id);
				}
			}
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [flyers]);

	// Children's refs attach before their parent's, so every ref goes through here.
	const slot = (id: string) => {
		let l = live.current.get(id);
		if (!l) live.current.set(id, (l = { button: null, body: null, bubble: null, pose: null }));
		return l;
	};

	const hit = (f: Flyer) => {
		const pose = live.current.get(f.id)?.pose;
		if (!pose) return;
		const id = performance.now();
		setBursts((b) => [...b, { id, at: pose, colors: spriteColors(f.sprite) }]);
		window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), BURST_MS);
		onHit(f, { x: pose.x, y: pose.y });
	};

	return (
		<>
			<AnimatePresence>
				{flyers.map((f) => (
					<motion.div
						key={f.id}
						className="fixed top-0 left-0 z-[45] pointer-events-none"
						exit={{ opacity: 0, transition: { duration: 0.3 } }}
					>
						<button
							ref={(el) => {
								if (el) slot(f.id).button = el;
								else live.current.delete(f.id);
							}}
							type="button"
							aria-label={f.label}
							onClick={() => hit(f)}
							// Generous padding: a touch-friendly hit area around a small sprite.
							className="absolute top-0 left-0 p-5 pointer-events-auto group cursor-target will-change-transform focus:outline-none"
							style={{ transform: "translate(-300px, -300px)", "--glow": f.glow[0] } as React.CSSProperties}
						>
							<span
								ref={(el) => {
									if (el) slot(f.id).body = el;
								}}
								className="block [filter:drop-shadow(0_0_6px_var(--glow))]"
							>
								<PixelSprite sprite={f.sprite} size={f.size} className="block" />
							</span>
							<Reticle />
							{f.lines ? (
								<Bubble
									lines={f.lines}
									every={f.lineEvery}
									innerRef={(el) => {
										if (el) slot(f.id).bubble = el;
									}}
								/>
							) : null}
						</button>
					</motion.div>
				))}
			</AnimatePresence>
			{bursts.map((b) => (
				<PixelBurst key={b.id} at={b.at} colors={b.colors} />
			))}
		</>
	);
};

/** Writes a pose straight to the DOM (no React render per frame). */
function place(f: Flyer, l: Live, pose: Pose) {
	if (!l.button) return;
	l.button.style.transform = `translate(${pose.x}px, ${pose.y}px) translate(-50%, -50%)`;
	l.button.style.opacity = String(pose.opacity);
	if (f.glow.length > 1 && pose.bounces !== undefined) {
		l.button.style.setProperty("--glow", f.glow[pose.bounces % f.glow.length]);
	}
	if (l.body) {
		// Saucers bank towards where they're going instead of turning nose-first.
		const turn = f.orientation === "heading" ? pose.angle : Math.cos(pose.angle) * 0.18;
		l.body.style.transform = `rotate(${turn}rad) scale(${pose.scale})`;
	}
	if (l.bubble) {
		// Flip under the ship near the top, and slide sideways to stay on screen.
		const below = pose.y < 110;
		const half = l.bubble.offsetWidth / 2;
		const edge = 8;
		const left = pose.x - half;
		const right = pose.x + half;
		const push = left < edge ? edge - left : right > window.innerWidth - edge ? window.innerWidth - edge - right : 0;
		l.bubble.style.transform = `translateX(calc(-50% + ${push}px))`;
		l.bubble.style.top = below ? "100%" : "";
		l.bubble.style.bottom = below ? "" : "100%";
	}
}

/** Four corner brackets that close in on the ship on hover / keyboard focus. */
const Reticle: React.FC = () => (
	<span
		aria-hidden="true"
		className="absolute duration-200 ease-out scale-150 opacity-0 pointer-events-none inset-2.5 transition-[opacity,transform] group-hover:opacity-100 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:scale-100 drop-shadow-[0_0_4px_rgba(252,211,77,0.7)]"
	>
		<span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-300" />
		<span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-300" />
		<span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-300" />
		<span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-300" />
	</span>
);

/** The pilot talking. Stays upright: it lives outside the rotating sprite. */
const Bubble: React.FC<{ lines: string[]; every?: number; innerRef: (el: HTMLSpanElement | null) => void }> = ({
	lines,
	every,
	innerRef,
}) => {
	const [i, setI] = useState(0);
	useEffect(() => {
		if (lines.length < 2 || !every) return;
		const t = window.setInterval(() => setI((n) => (n + 1) % lines.length), every);
		return () => window.clearInterval(t);
	}, [lines, every]);
	return (
		<span
			ref={innerRef}
			aria-hidden="true"
			className="absolute left-1/2 px-2.5 py-1 font-mono text-xs border rounded-md pointer-events-none whitespace-nowrap border-zinc-600 bg-zinc-900/95 text-zinc-200 shadow-lg shadow-black/50"
			style={{ bottom: "100%", transform: "translateX(-50%)" }}
		>
			<motion.span
				key={i}
				className="block"
				initial={{ opacity: 0, y: 3 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
			>
				{lines[i]}
			</motion.span>
		</span>
	);
};

/** Square pixels flying out of the hit point, in the ship's own colors. */
const PixelBurst: React.FC<{ at: Point; colors: string[] }> = ({ at, colors }) => {
	const pieces = useRef(
		Array.from({ length: 18 }, (_, i) => {
			const a = (i / 18) * Math.PI * 2 + Math.random() * 0.3;
			const d = 40 + Math.random() * 60;
			return { dx: Math.cos(a) * d, dy: Math.sin(a) * d, color: colors[i % colors.length] };
		}),
	).current;
	return (
		<div aria-hidden="true" className="fixed z-[45] pointer-events-none" style={{ left: at.x, top: at.y }}>
			{pieces.map((p, i) => (
				<motion.span
					key={i}
					className="absolute block w-[5px] h-[5px]"
					style={{ backgroundColor: p.color }}
					initial={{ x: 0, y: 0, opacity: 1 }}
					animate={{ x: p.dx, y: p.dy, opacity: 0 }}
					transition={{ duration: 0.7, ease: "easeOut" }}
				/>
			))}
		</div>
	);
};
