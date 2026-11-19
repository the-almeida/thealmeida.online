"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

// Cue telling visitors the hero name is clickable (secret #1), repeated while
// the secret hasn't been found:
//   1. a shooting star crosses the sky and hits a random letter,
//   2. on impact the name ripples and a whisper bubble pops out right under
//      that letter, pointing at it, and types "> psst… click my name".
const FIRST_CUE_MS = 2500;
const CYCLE_MS = 14000;
const STAR_FLIGHT_MS = 900;
const STREAK_LENGTH = 200;
const WHISPER = "> psst… click my name";
const TYPE_MS = 55;
const HOLD_MS = 8000;
const ERASE_MS = 25;
const EDGE = 12;

type Letters = React.MutableRefObject<(HTMLSpanElement | null)[]>;
type Shot = { id: number; from: { x: number; y: number }; to: { x: number; y: number } };
type Whisper = { id: number; index: number };

type NameCuesProps = {
	letters: Letters;
	/** Positioned wrapper that the bubble is placed in. */
	container: React.RefObject<HTMLDivElement | null>;
	enabled: boolean;
	reducedMotion: boolean;
	onImpact: (index: number) => void;
};

export const NameCues: React.FC<NameCuesProps> = ({
	letters,
	container,
	enabled,
	reducedMotion,
	onImpact,
}) => {
	const [shot, setShot] = useState<Shot | null>(null);
	const [whisper, setWhisper] = useState<Whisper | null>(null);
	const onImpactRef = useRef(onImpact);
	onImpactRef.current = onImpact;

	useEffect(() => {
		if (!enabled) {
			setShot(null);
			setWhisper(null);
			return;
		}
		let id = 0;
		const timers: number[] = [];
		const later = (fn: () => void, ms: number) =>
			timers.push(window.setTimeout(fn, ms));

		const fire = () => {
			id += 1;
			const els = letters.current.filter(Boolean) as HTMLSpanElement[];
			if (els.length === 0) return;
			if (reducedMotion) {
				setWhisper({ id, index: Math.floor(els.length / 2) });
				return;
			}
			const index = Math.floor(Math.random() * els.length);
			const r = els[index].getBoundingClientRect();
			const to = { x: r.left + r.width / 2, y: r.top + r.height * 0.45 };
			// Come in from the upper-left or upper-right, roughly 35 degrees down.
			const dir = Math.random() < 0.5 ? -1 : 1;
			const dist = Math.max(window.innerWidth * 0.45, 320);
			const from = { x: to.x + dir * dist, y: to.y - dist * 0.7 };
			const shotId = id;
			setShot({ id: shotId, from, to });
			later(() => {
				setShot((s) => (s?.id === shotId ? null : s));
				onImpactRef.current(index);
				setWhisper({ id: shotId, index });
			}, STAR_FLIGHT_MS);
		};

		later(fire, FIRST_CUE_MS);
		const interval = window.setInterval(fire, CYCLE_MS);
		return () => {
			timers.forEach(clearTimeout);
			clearInterval(interval);
		};
	}, [enabled, reducedMotion, letters]);

	return (
		<>
			{shot ? <ShootingStar key={shot.id} shot={shot} /> : null}
			{whisper ? (
				<WhisperBubble
					key={whisper.id}
					letter={letters.current[whisper.index]}
					container={container}
					onDone={() => setWhisper((w) => (w?.id === whisper.id ? null : w))}
				/>
			) : null}
		</>
	);
};

const ShootingStar: React.FC<{ shot: Shot }> = ({ shot }) => {
	const el = useRef<HTMLDivElement>(null);
	useLayoutEffect(() => {
		const { from, to } = shot;
		const angle = Math.atan2(to.y - from.y, to.x - from.x);
		const rot = `rotate(${angle}rad)`;
		const anim = el.current?.animate(
			[
				{ transform: `translate(${from.x}px, ${from.y}px) ${rot}`, opacity: 0 },
				{ opacity: 1, offset: 0.15 },
				{ transform: `translate(${to.x}px, ${to.y}px) ${rot}`, opacity: 1 },
			],
			{ duration: STAR_FLIGHT_MS, easing: "cubic-bezier(.5,0,.9,.6)", fill: "forwards" },
		);
		return () => anim?.cancel();
	}, [shot]);

	return (
		<div aria-hidden="true" className="fixed inset-0 z-20 pointer-events-none">
			<div ref={el} className="absolute top-0 left-0" style={{ width: 0, height: 0 }}>
				{/* streak trails behind the head, which sits at the origin */}
				<div
					className="absolute top-0 h-[2px] -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-white/40 to-white"
					style={{ width: STREAK_LENGTH, right: 0 }}
				/>
				<div className="absolute w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-[0_0_10px_3px_rgba(255,255,255,0.8)]" />
			</div>
		</div>
	);
};

const WhisperBubble: React.FC<{
	letter: HTMLSpanElement | null | undefined;
	container: React.RefObject<HTMLDivElement | null>;
	onDone: () => void;
}> = ({ letter, container, onDone }) => {
	const bubble = useRef<HTMLDivElement>(null);
	const [pos, setPos] = useState<{ left: number; top: number; arrow: number } | null>(null);
	const [typed, setTyped] = useState(0);
	const [visible, setVisible] = useState(false);
	const onDoneRef = useRef(onDone);
	onDoneRef.current = onDone;

	// Place the bubble under the hit letter, clamped to the viewport; the
	// arrow keeps pointing at the letter even when the bubble is pushed aside.
	useLayoutEffect(() => {
		const place = () => {
			const box = container.current?.getBoundingClientRect();
			const b = bubble.current;
			if (!letter || !box || !b) return;
			const r = letter.getBoundingClientRect();
			const w = b.offsetWidth;
			const cx = r.left + r.width / 2;
			const vwLeft = Math.min(Math.max(cx - w / 2, EDGE), window.innerWidth - w - EDGE);
			setPos({
				left: vwLeft - box.left,
				top: r.bottom - box.top + 14,
				arrow: Math.min(Math.max(cx - vwLeft, 14), w - 14),
			});
		};
		place();
		window.addEventListener("resize", place);
		return () => window.removeEventListener("resize", place);
	}, [letter, container]);

	useEffect(() => {
		const timers: number[] = [];
		setVisible(true);
		let t = 0;
		for (let i = 1; i <= WHISPER.length; i++) {
			t += TYPE_MS;
			timers.push(window.setTimeout(() => setTyped(i), t));
		}
		t += HOLD_MS;
		for (let i = WHISPER.length - 1; i >= 0; i--) {
			t += ERASE_MS;
			timers.push(window.setTimeout(() => setTyped(i), t));
		}
		timers.push(window.setTimeout(() => setVisible(false), t));
		timers.push(window.setTimeout(() => onDoneRef.current(), t + 200));
		return () => timers.forEach(clearTimeout);
	}, []);

	return (
		<div
			ref={bubble}
			aria-hidden="true"
			className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-lg border border-zinc-700 bg-zinc-900/95 px-3 py-1.5 font-mono text-sm text-zinc-300 shadow-lg shadow-black/50 transition-[opacity,transform] duration-150 md:text-base ${
				visible && pos ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
			}`}
			style={{ left: pos?.left ?? 0, top: pos?.top ?? 0 }}
		>
			{pos ? (
				<span
					className="absolute w-3 h-3 rotate-45 -translate-x-1/2 border-t border-l -top-[7px] border-zinc-700 bg-zinc-900"
					style={{ left: pos.arrow }}
				/>
			) : null}
			{/* invisible full text reserves the width so typing doesn't shift it */}
			<span className="invisible">{WHISPER}</span>
			<span className="absolute inset-0 px-3 py-1.5">
				{WHISPER.slice(0, typed)}
				<span className="animate-pulse">▍</span>
			</span>
		</div>
	);
};
