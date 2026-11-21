"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { track } from "../../umami";
import { BEST_SCORE_KEY, SCORE_TARGET, SECRETS } from "../config";
import { Eyebrow, buttonClass } from "../dialog";
import { PrizeContent } from "../prize";
import { GameState, TUNING, createGame, driftStars, resizeGame, step } from "./engine";
import { MeteorCache, render } from "./render";

// Default export: loaded with next/dynamic, only when someone opens the game.

type Status = "intro" | "countdown" | "playing" | "paused" | "won" | "over";

type GameOverlayProps = {
	/** This catch just unlocked secret #2 (vs. replaying from the counter). */
	justFound: boolean;
	/** Secret #3 was already won before this session. */
	alreadyWon: boolean;
	onWin: () => void;
	onClose: () => void;
};

const TOUCH_OFFSET = 72; // the ship sits above the finger, so it stays visible
const KEY_SPEED = 650; // px/s when steering with the keyboard
const DEATH_PAUSE_MS = 900; // let the final explosion play before "Game over"
const KEYS: Record<string, "left" | "right" | "up" | "down"> = {
	ArrowLeft: "left",
	a: "left",
	ArrowRight: "right",
	d: "right",
	ArrowUp: "up",
	w: "up",
	ArrowDown: "down",
	s: "down",
};

const fmt = (n: number) => n.toLocaleString("en-US");

function readBest() {
	try {
		return Number(window.localStorage.getItem(BEST_SCORE_KEY)) || 0;
	} catch {
		return 0;
	}
}

function saveBest(score: number) {
	try {
		if (score > readBest()) window.localStorage.setItem(BEST_SCORE_KEY, String(score));
	} catch {
		// Storage blocked: the best score just won't persist.
	}
}

export default function GameOverlay({ justFound, alreadyWon, onWin, onClose }: GameOverlayProps) {
	const field = useRef<HTMLDivElement>(null);
	const canvas = useRef<HTMLCanvasElement>(null);
	const game = useRef<GameState | null>(null);
	const target = useRef({ x: 0, y: 0 });
	const keys = useRef(new Set<string>());
	const statusRef = useRef<Status>("intro");
	const won = useRef(alreadyWon);
	const [status, setStatusState] = useState<Status>("intro");
	const [score, setScore] = useState(0);
	const [lives, setLives] = useState(TUNING.lives);
	const [best, setBest] = useState(0);
	const [count, setCount] = useState(3);
	// Callbacks through refs, so a parent re-render never restarts the loop.
	const onWinRef = useRef(onWin);
	const onCloseRef = useRef(onClose);
	onWinRef.current = onWin;
	onCloseRef.current = onClose;

	const setStatus = useCallback((next: Status) => {
		statusRef.current = next;
		setStatusState(next);
	}, []);

	useEffect(() => setBest(readBest()), []);

	const countdown = useCallback(() => {
		setCount(3);
		setStatus("countdown");
	}, [setStatus]);

	const launch = useCallback(() => {
		const f = field.current;
		if (!f) return;
		const { width, height } = f.getBoundingClientRect();
		game.current = createGame(width, height);
		target.current = { x: game.current.player.x, y: game.current.player.y };
		setScore(0);
		setLives(TUNING.lives);
		track("game_started", { endless: won.current });
		setStatus("playing");
	}, [setStatus]);

	// 3-2-1. It only counts while this tab is visible and focused: someone who
	// just opened the booking link in a new tab comes back to a full countdown.
	useEffect(() => {
		if (status !== "countdown") return;
		const t = window.setInterval(() => {
			if (document.hidden || !document.hasFocus()) {
				setCount(3);
				return;
			}
			setCount((c) => {
				if (c > 1) return c - 1;
				setStatus("playing");
				return 0;
			});
		}, 1000);
		return () => window.clearInterval(t);
	}, [status, setStatus]);

	// Hiding the tab mid-run pauses it; coming back resumes with a countdown.
	useEffect(() => {
		const onVisibility = () => {
			if (document.hidden && statusRef.current === "playing") setStatus("paused");
			else if (!document.hidden && statusRef.current === "paused") countdown();
		};
		document.addEventListener("visibilitychange", onVisibility);
		return () => document.removeEventListener("visibilitychange", onVisibility);
	}, [countdown, setStatus]);

	// Canvas sizing and the render/update loop, for the overlay's whole life.
	useEffect(() => {
		const c = canvas.current;
		const f = field.current;
		const ctx = c?.getContext("2d");
		if (!c || !f || !ctx) return;

		const dpr = window.devicePixelRatio || 1;
		const fit = () => {
			const { width, height } = f.getBoundingClientRect();
			c.width = Math.round(width * dpr);
			c.height = Math.round(height * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.imageSmoothingEnabled = false;
			if (game.current) resizeGame(game.current, width, height);
			// The intro already shows the starfield, behind the panel.
			else game.current = createGame(width, height);
		};
		fit();
		const observer = new ResizeObserver(fit);
		observer.observe(f);

		const cache: MeteorCache = new Map();
		let frame = 0;
		let last = performance.now();
		const loop = (now: number) => {
			const dt = Math.min((now - last) / 1000, 1 / 30);
			last = now;
			const g = game.current;
			const s = statusRef.current;
			if (g && s !== "paused") driftStars(g, dt);

			// "over" keeps stepping so the sparks of the last explosion finish.
			if (g && (s === "playing" || s === "over")) {
				const k = keys.current;
				const kx = (k.has("right") ? 1 : 0) - (k.has("left") ? 1 : 0);
				const ky = (k.has("down") ? 1 : 0) - (k.has("up") ? 1 : 0);
				if (kx || ky) {
					target.current = { x: g.player.x + kx * KEY_SPEED * dt, y: g.player.y + ky * KEY_SPEED * dt };
				}
				for (const e of step(g, dt, target.current)) {
					if (e.type === "meteorDestroyed") setScore(g.score);
					if (e.type === "playerHit") setLives(g.lives);
					if (e.type === "gameOver") {
						setLives(0);
						saveBest(g.score);
						setBest(readBest());
						track("game_over", { score: g.score });
						window.setTimeout(() => setStatus("over"), DEATH_PAUSE_MS);
					}
				}
				if (!won.current && !g.over && g.score >= SCORE_TARGET) {
					won.current = true;
					onWinRef.current();
					setStatus("won");
				}
			}
			render(ctx, g, now, cache);
			frame = requestAnimationFrame(loop);
		};
		frame = requestAnimationFrame(loop);
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
		};
	}, [setStatus]);

	// Keyboard: Esc closes, arrows / WASD steer.
	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "Escape") return onCloseRef.current();
			const dir = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
			if (dir && statusRef.current === "playing") {
				e.preventDefault();
				keys.current.add(dir);
			}
		};
		const up = (e: KeyboardEvent) => {
			const dir = KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
			if (dir) keys.current.delete(dir);
		};
		window.addEventListener("keydown", down);
		window.addEventListener("keyup", up);
		return () => {
			window.removeEventListener("keydown", down);
			window.removeEventListener("keyup", up);
		};
	}, []);

	// Tracked on the whole overlay: on desktop the ship keeps following the
	// pointer even outside the (narrower) play field.
	const onPointer = (e: React.PointerEvent) => {
		const r = field.current?.getBoundingClientRect();
		if (!r) return;
		const offset = e.pointerType === "touch" ? TOUCH_OFFSET : 0;
		target.current = { x: e.clientX - r.left, y: e.clientY - r.top - offset };
	};

	const progress = Math.min(score / SCORE_TARGET, 1);
	const endless = alreadyWon || won.current;

	return (
		<motion.div
			role="dialog"
			aria-modal="true"
			aria-label="Meteor shooter mini game"
			className={`fixed inset-0 z-50 flex justify-center bg-black/80 backdrop-blur-sm touch-none ${
				status === "playing" ? "cursor-none" : ""
			}`}
			onPointerMove={onPointer}
			onPointerDown={onPointer}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
		>
			{/* The portrait "arcade cabinet" */}
			<div
				ref={field}
				className="relative w-full h-full overflow-hidden select-none bg-zinc-950 sm:border-x sm:border-zinc-800"
				style={{ maxWidth: TUNING.fieldMaxWidth }}
			>
				<canvas ref={canvas} className="absolute inset-0 w-full h-full" />

				<div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 font-mono pointer-events-none text-zinc-300">
					<div>
						<p className="text-2xl tabular-nums text-zinc-100">{fmt(score)}</p>
						{endless ? (
							<p className="mt-2 text-[10px] uppercase tracking-widest whitespace-nowrap text-amber-300/80">
								✦ Prize unlocked · endless mode
							</p>
						) : (
							<div className="w-48 mt-2">
								<div className="h-1 overflow-hidden rounded-full bg-zinc-800">
									<div
										className="h-full bg-amber-300 transition-[width] duration-300"
										style={{ width: `${progress * 100}%` }}
									/>
								</div>
								<p className="mt-1 text-[10px] uppercase tracking-widest whitespace-nowrap text-zinc-500">
									✦ {fmt(SCORE_TARGET)} unlocks the last secret
								</p>
							</div>
						)}
					</div>
					<p className="pr-10 text-lg tracking-widest text-orange-400" aria-label={`${lives} lives left`}>
						{"▲".repeat(Math.max(lives, 0))}
						<span className="text-zinc-700">{"▲".repeat(TUNING.lives - Math.max(lives, 0))}</span>
					</p>
				</div>

				{status === "intro" ? (
					<Panel>
						{justFound ? <Eyebrow>✦ Secret 2 of {SECRETS.length} ✦</Eyebrow> : null}
						<h2 className="mt-3 text-3xl font-display text-zinc-100">
							{justFound ? "Welcome aboard, pilot." : "Welcome back, pilot."}
						</h2>
						<p className="mt-4 text-zinc-300">
							{alreadyWon
								? "Every secret is already yours. Back for a high score?"
								: `Score ${fmt(SCORE_TARGET)} points to unlock the last secret.`}
						</p>
						<ul className="mt-5 space-y-1 font-mono text-sm text-zinc-500">
							<li>
								<span className="hidden sm:inline">Mouse, arrows or WASD to move</span>
								<span className="sm:hidden">Drag your finger to move</span>
							</li>
							<li>Your ship fires on its own</li>
							<li>Dodge the meteors · {TUNING.lives} lives</li>
						</ul>
						{best > 0 ? <p className="mt-4 font-mono text-xs text-zinc-500">Best: {fmt(best)}</p> : null}
						<button type="button" onClick={launch} autoFocus className={`mt-8 ${buttonClass()}`}>
							Launch
						</button>
					</Panel>
				) : null}

				{status === "countdown" || status === "paused" ? (
					<div
						className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
						aria-live="polite"
					>
						<motion.p
							key={status === "paused" ? "paused" : count}
							initial={{ scale: 1.6, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							className="font-display text-8xl text-zinc-100"
						>
							{status === "paused" ? "II" : count}
						</motion.p>
						<p className="mt-4 font-mono text-sm text-zinc-400">
							{status === "paused" ? "Paused" : "Get ready, pilot"}
						</p>
					</div>
				) : null}

				{status === "won" ? (
					<Panel>
						<PrizeContent titleId="game-prize-title" onSchedule={countdown} />
						<p className="mt-6 text-sm text-zinc-500">The game goes on as long as you like.</p>
						<button type="button" onClick={countdown} className={`mt-3 ${buttonClass("ghost")}`}>
							Keep playing
						</button>
					</Panel>
				) : null}

				{status === "over" ? (
					<Panel>
						<Eyebrow>Game over</Eyebrow>
						<p className="mt-4 text-5xl tabular-nums text-zinc-100 font-display">{fmt(score)}</p>
						<p className="mt-2 font-mono text-sm text-zinc-500">Best: {fmt(best)}</p>
						{!endless ? (
							<p className="mt-4 text-zinc-400">
								{score >= SCORE_TARGET * 0.6
									? `So close! Only ${fmt(SCORE_TARGET - score)} to go.`
									: "Meteors: 1, pilot: 0. Another round?"}
							</p>
						) : null}
						<div className="flex justify-center gap-3 mt-8">
							<button type="button" onClick={launch} autoFocus className={buttonClass()}>
								Try again
							</button>
							<button type="button" onClick={onClose} className={buttonClass("ghost")}>
								Exit
							</button>
						</div>
					</Panel>
				) : null}
			</div>

			<button
				type="button"
				onClick={onClose}
				aria-label="Close game"
				className="absolute p-2 duration-200 rounded-lg top-3 right-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
			>
				<X className="w-6 h-6" />
			</button>
		</motion.div>
	);
}

const Panel: React.FC<React.PropsWithChildren> = ({ children }) => (
	<div className="absolute inset-0 flex items-center justify-center p-6">
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			className="w-full max-w-sm p-8 text-center border shadow-2xl rounded-2xl border-zinc-700 bg-zinc-950/90 shadow-black"
		>
			{children}
		</motion.div>
	</div>
);
