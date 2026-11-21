"use client";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

// Tells visitors the hero name is clickable (secret #1). Repeats until found:
//   1. a shooting star crosses the sky and hits a random letter,
//   2. a sparkle flashes on impact and the name ripples out from that letter,
//   3. a whisper bubble pops out under the letter and types "> psst… click my name".

const FIRST_CUE_MS = 2500;
const CYCLE_MS = 14000;
const STAR_FLIGHT_MS = 900;
const STREAK = 200; // px
const WHISPER = "> psst… click my name";
const TYPE_MS = 55;
const HOLD_MS = 8000;
const ERASE_MS = 25;
const EDGE = 12; // min gap between the bubble and the viewport edge
const CARET_INSET = 14;

export const SPARKLE_PATH =
	"M12 0C12.6 7.5 16.5 11.4 24 12 16.5 12.6 12.6 16.5 12 24 11.4 16.5 7.5 12.6 0 12 7.5 11.4 11.4 7.5 12 0Z";

type Point = { x: number; y: number };
type Shot = { id: number; index: number; from: Point; to: Point };
type Whisper = { id: number; x: number };

type NameCuesProps = {
	letters: React.MutableRefObject<(HTMLSpanElement | null)[]>;
	/** Zero-height marker on the text baseline; the bubble hangs from it. */
	baseline: React.RefObject<HTMLSpanElement | null>;
	/** Positioned wrapper shared by the name and the bubble. */
	container: React.RefObject<HTMLDivElement | null>;
	enabled: boolean;
	reducedMotion: boolean;
};

export const NameCues: React.FC<NameCuesProps> = ({ letters, baseline, container, enabled, reducedMotion }) => {
	const [shot, setShot] = useState<Shot | null>(null);
	const [whisper, setWhisper] = useState<Whisper | null>(null);

	useEffect(() => {
		if (!enabled) {
			setShot(null);
			setWhisper(null);
			return;
		}
		const cue = () => {
			// Nobody is watching: don't spend a cue.
			if (document.hidden) return;
			const els = letters.current;
			const indexes = els.flatMap((el, i) => (el ? [i] : []));
			if (indexes.length === 0) return;
			const first = els[indexes[0]]!.getBoundingClientRect();
			// Scrolled away from the hero: the cue would play to an empty room.
			if (first.bottom < 0 || first.top > window.innerHeight) return;

			if (reducedMotion) {
				const last = els[indexes[indexes.length - 1]]!.getBoundingClientRect();
				setWhisper({ id: Date.now(), x: (first.left + last.right) / 2 });
				return;
			}
			const index = indexes[Math.floor(Math.random() * indexes.length)];
			const r = els[index]!.getBoundingClientRect();
			const to = { x: r.left + r.width / 2, y: r.top + r.height * 0.35 };
			// Start inside the viewport, so the whole flight is visible even on
			// a phone, coming down at roughly 35 degrees from either side.
			const side = Math.random() < 0.5 ? -1 : 1;
			const fromY = Math.max(24, to.y - 380);
			const fromX = Math.min(Math.max(to.x + side * (to.y - fromY) * 1.4, 24), window.innerWidth - 24);
			setShot({ id: Date.now(), index, from: { x: fromX, y: fromY }, to });
		};
		let interval: number | undefined;
		const start = window.setTimeout(() => {
			cue();
			interval = window.setInterval(cue, CYCLE_MS);
		}, FIRST_CUE_MS);
		return () => {
			window.clearTimeout(start);
			window.clearInterval(interval);
		};
	}, [enabled, reducedMotion, letters]);

	const onImpact = useCallback(
		(hit: Shot) => {
			// Ripple out from the letter that was hit, with a little overshoot.
			letters.current.forEach((el, i) => {
				el?.animate(
					[
						{ transform: "none", easing: "ease-out" },
						{ transform: "translateY(-0.14em)", offset: 0.35, easing: "ease-in-out" },
						{ transform: "translateY(0.04em)", offset: 0.7, easing: "ease-out" },
						{ transform: "none" },
					],
					{ duration: 650, delay: Math.abs(i - hit.index) * 45 },
				);
			});
			setWhisper({ id: hit.id, x: hit.to.x });
		},
		[letters],
	);
	const clearShot = useCallback(() => setShot(null), []);
	const clearWhisper = useCallback(() => setWhisper(null), []);

	return (
		<>
			{shot ? <ShootingStar key={shot.id} shot={shot} onImpact={onImpact} onDone={clearShot} /> : null}
			{whisper ? (
				<WhisperBubble
					key={whisper.id}
					anchorX={whisper.x}
					baseline={baseline}
					container={container}
					reducedMotion={reducedMotion}
					onDone={clearWhisper}
				/>
			) : null}
		</>
	);
};

const ShootingStar: React.FC<{
	shot: Shot;
	onImpact: (shot: Shot) => void;
	onDone: () => void;
}> = ({ shot, onImpact, onDone }) => {
	const streak = useRef<HTMLDivElement>(null);
	const flash = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const { from, to } = shot;
		const angle = Math.atan2(to.y - from.y, to.x - from.x);
		// The head is the streak's right end (its transform-origin), placed on the point.
		const at = (p: Point) => `translate(${p.x - STREAK}px, ${p.y - 1}px) rotate(${angle}rad)`;
		const flight = streak.current?.animate(
			[
				{ transform: at(from), opacity: 0 },
				{ transform: at(from), opacity: 1, offset: 0.1 },
				{ transform: at(to), opacity: 1 },
			],
			{ duration: STAR_FLIGHT_MS, easing: "linear", fill: "forwards" },
		);
		let done: number | undefined;
		if (flight) {
			flight.onfinish = () => {
				onImpact(shot);
				streak.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" });
				flash.current?.animate(
					[
						{ transform: "translate(-50%, -50%) scale(0) rotate(-45deg)", opacity: 0 },
						{ transform: "translate(-50%, -50%) scale(1.2) rotate(0deg)", opacity: 1, offset: 0.3 },
						{ transform: "translate(-50%, -50%) scale(0) rotate(45deg)", opacity: 0 },
					],
					{ duration: 700, easing: "ease-out", fill: "forwards" },
				);
				done = window.setTimeout(onDone, 750);
			};
		}
		return () => {
			flight?.cancel();
			window.clearTimeout(done);
		};
	}, [shot, onImpact, onDone]);

	return (
		// `fixed` is safe here: no ancestor of the hero has a transform or filter.
		<div aria-hidden="true" className="fixed inset-0 z-20 pointer-events-none">
			<div
				ref={streak}
				className="absolute top-0 left-0 h-[3px] rounded-full opacity-0 bg-gradient-to-r from-white/0 via-white/40 to-white"
				style={{ width: STREAK, transformOrigin: `${STREAK}px 1px` }}
			>
				<span className="absolute right-0 w-1.5 h-1.5 -translate-y-1/2 bg-white rounded-full top-1/2 shadow-[0_0_10px_3px_rgba(255,255,255,0.8)]" />
			</div>
			<div
				ref={flash}
				className="absolute w-10 h-10 opacity-0 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
				style={{ left: shot.to.x, top: shot.to.y }}
			>
				<svg viewBox="0 0 24 24" className="w-full h-full">
					<path fill="currentColor" d={SPARKLE_PATH} />
				</svg>
			</div>
		</div>
	);
};

/**
 * Terminal-style whisper in a speech bubble. Its caret points up at
 * `anchorX` (the letter that was hit) even when the bubble itself has to be
 * pushed aside to stay inside the viewport. Types, holds, erases, fades.
 */
const WhisperBubble: React.FC<{
	anchorX: number;
	baseline: React.RefObject<HTMLSpanElement | null>;
	container: React.RefObject<HTMLDivElement | null>;
	reducedMotion: boolean;
	onDone: () => void;
}> = ({ anchorX, baseline, container, reducedMotion, onDone }) => {
	const bubble = useRef<HTMLDivElement>(null);
	const [layout, setLayout] = useState<{ left: number; top: number; caret: number } | null>(null);
	const [typed, setTyped] = useState(reducedMotion ? WHISPER.length : 0);
	const [visible, setVisible] = useState(true);

	useLayoutEffect(() => {
		const place = () => {
			const box = container.current?.getBoundingClientRect();
			const base = baseline.current?.getBoundingClientRect();
			const width = bubble.current?.offsetWidth ?? 0;
			if (!box || !base) return;
			const left = Math.min(Math.max(anchorX - width / 2, EDGE), window.innerWidth - EDGE - width);
			setLayout({
				left: left - box.left,
				top: base.top - box.top + 14,
				caret: Math.min(Math.max(anchorX - left, CARET_INSET), width - CARET_INSET),
			});
		};
		place();
		window.addEventListener("resize", place);
		return () => window.removeEventListener("resize", place);
	}, [anchorX, baseline, container]);

	useEffect(() => {
		const timers: number[] = [];
		const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
		const n = WHISPER.length;
		let t = 0;
		if (!reducedMotion) for (let i = 1; i <= n; i++) at((t += TYPE_MS), () => setTyped(i));
		t += HOLD_MS;
		if (!reducedMotion) for (let i = n - 1; i >= 0; i--) at((t += ERASE_MS), () => setTyped(i));
		at(t, () => setVisible(false));
		at(t + 300, onDone);
		return () => timers.forEach((id) => window.clearTimeout(id));
	}, [reducedMotion, onDone]);

	return (
		<div
			ref={bubble}
			aria-hidden="true"
			className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-zinc-700 bg-zinc-900/95 px-3 py-1.5 font-mono text-sm text-zinc-300 shadow-lg shadow-black/50 transition-[opacity,transform] duration-150 md:text-base ${
				layout && visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
			}`}
			style={{
				left: layout?.left ?? 0,
				top: layout?.top ?? 0,
				// Grow out of the caret, as if the letter said it.
				transformOrigin: layout ? `${layout.caret}px 0` : undefined,
			}}
		>
			<span
				className="absolute w-2.5 h-2.5 -top-[6px] -ml-[5px] rotate-45 border-l border-t border-zinc-700 bg-zinc-900"
				style={{ left: layout?.caret ?? 0 }}
			/>
			{WHISPER.slice(0, typed)}
			<span className="animate-pulse">_</span>
			{/* The untyped rest keeps the width fixed while typing. */}
			<span className="invisible">{WHISPER.slice(typed)}</span>
		</div>
	);
};
