"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { NameCues } from "./name-cues";
import { useSecrets } from "./secrets-context";
import { useReducedMotion } from "./use-reduced-motion";

const LETTER_CLASS =
	"inline-block text-transparent bg-white bg-clip-text text-edge-outline";
const GLINT_EVERY_MS = 4000;
const SCATTER_MS = 1100;

/**
 * The hero name. Secret #1: clicking it scatters the letters into stars that
 * fly back into place. This only works once: after the secret is found the
 * name is plain text again. Until then: a periodic star glint, a pointer
 * cursor and the shooting star + whisper cue (see name-cues.tsx).
 */
export const NameTrigger: React.FC<{ text: string }> = ({ text }) => {
	const { ready, isFound, markFound, setOverlay, overlay } = useSecrets();
	const reducedMotion = useReducedMotion();
	const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const busy = useRef(false);
	const [glint, setGlint] = useState<{ index: number; tick: number } | null>(null);
	const [sparks, setSparks] = useState<{ id: number; x: number; y: number; dx: number; dy: number }[]>([]);

	const found = ready && isFound("name");
	const active = ready && !found;
	const chars = Array.from(text);

	// Periodic glint on a random letter while the secret is still hidden.
	useEffect(() => {
		if (!active || reducedMotion) return;
		let tick = 0;
		const t = window.setInterval(() => {
			tick += 1;
			setGlint({ index: Math.floor(Math.random() * chars.length), tick });
		}, GLINT_EVERY_MS);
		return () => clearInterval(t);
	}, [active, reducedMotion, chars.length]);

	const ripple = useCallback((from: number) => {
		letterRefs.current.forEach((el, i) => {
			el?.animate(
				[
					{ transform: "translateY(0)" },
					{ transform: "translateY(-0.12em)", filter: "brightness(1.6)" },
					{ transform: "translateY(0)" },
				],
				{ duration: 450, delay: Math.abs(i - from) * 45, easing: "ease-out" },
			);
		});
	}, []);

	const scatter = useCallback(() => {
		const box = wrapperRef.current?.getBoundingClientRect();
		const next: typeof sparks = [];
		letterRefs.current.forEach((el, i) => {
			if (!el) return;
			const a = Math.random() * Math.PI * 2;
			const d = 120 + Math.random() * 220;
			el.animate(
				[
					{ transform: "translate(0,0) rotate(0) scale(1)", opacity: 1 },
					{
						transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px) rotate(${(Math.random() - 0.5) * 540}deg) scale(0.15)`,
						opacity: 0.6,
						filter: "brightness(3) drop-shadow(0 0 8px white)",
						offset: 0.45,
					},
					{ transform: "translate(0,0) rotate(0) scale(1)", opacity: 1 },
				],
				{ duration: SCATTER_MS, easing: "cubic-bezier(.2,.7,.3,1)" },
			);
			if (box) {
				const r = el.getBoundingClientRect();
				for (let k = 0; k < 4; k++) {
					const sa = Math.random() * Math.PI * 2;
					const sd = 60 + Math.random() * 200;
					next.push({
						id: i * 10 + k + Date.now(),
						x: r.left - box.left + r.width / 2,
						y: r.top - box.top + r.height / 2,
						dx: Math.cos(sa) * sd,
						dy: Math.sin(sa) * sd,
					});
				}
			}
		});
		setSparks(next);
		window.setTimeout(() => setSparks([]), SCATTER_MS);
	}, []);

	const onClick = () => {
		if (busy.current || found) return;
		busy.current = true;
		if (!reducedMotion) scatter();
		window.setTimeout(
			() => {
				busy.current = false;
				if (markFound("name")) setOverlay("intro");
			},
			reducedMotion ? 0 : SCATTER_MS,
		);
	};

	const letters = chars.map((c, i) => (
		<span
			key={i}
			ref={(el) => {
				letterRefs.current[i] = el;
			}}
			className={`relative ${LETTER_CLASS}`}
		>
			{c}
			{glint?.index === i && active ? <Glint key={glint.tick} /> : null}
		</span>
	));

	return (
		<div ref={wrapperRef} className="relative z-10">
			<h1 className="text-4xl duration-1000 animate-title font-display sm:text-6xl md:text-9xl whitespace-nowrap">
				{found || !ready ? (
					<span className="cursor-default">{letters}</span>
				) : (
					<button
						type="button"
						onClick={onClick}
						aria-label={`${text} (there's a secret here)`}
						className="cursor-pointer rounded-xl outline-none focus-visible:ring-1 focus-visible:ring-zinc-500"
					>
						{letters}
					</button>
				)}
			</h1>
			{sparks.map((s) => (
				<Spark key={s.id} {...s} />
			))}
			<NameCues
				letters={letterRefs}
				container={wrapperRef}
				enabled={active && overlay === null}
				reducedMotion={reducedMotion}
				onImpact={ripple}
			/>
		</div>
	);
};

const Glint: React.FC = () => (
	<span
		aria-hidden="true"
		className="absolute pointer-events-none -top-1 -right-1 text-[0.25em] text-white animate-glint"
		style={{ WebkitTextFillColor: "white" }}
	>
		✦
	</span>
);

const Spark: React.FC<{ x: number; y: number; dx: number; dy: number }> = ({ x, y, dx, dy }) => {
	const el = useRef<HTMLSpanElement>(null);
	useEffect(() => {
		el.current?.animate(
			[
				{ transform: "translate(0,0) scale(1)", opacity: 1 },
				{ transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0 },
			],
			{ duration: SCATTER_MS * 0.8, easing: "ease-out", fill: "forwards" },
		);
	}, [dx, dy]);
	return (
		<span
			ref={el}
			aria-hidden="true"
			className="absolute w-1 h-1 bg-white rounded-full pointer-events-none shadow-[0_0_6px_2px_rgba(255,255,255,0.7)]"
			style={{ left: x, top: y }}
		/>
	);
};
