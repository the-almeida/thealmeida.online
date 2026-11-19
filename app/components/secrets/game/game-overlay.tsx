"use client";
import { X } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { SCORE_TARGET } from "../config";
import { FAST_SHIP } from "../pixel-art";
import { PrizeContent } from "../prize";
import { useSecrets } from "../secrets-context";
import { GameState, TUNING, createGame, renderGame, resizeGame, setTarget, updateGame } from "./engine";

type Status = "intro" | "countdown" | "playing" | "paused" | "won" | "over";

const BEST_KEY = "thealmeida:best";
const TOUCH_OFFSET = 72; // ship sits above the finger so it stays visible
const KEYS: Record<string, [number, number]> = {
	ArrowLeft: [-1, 0],
	ArrowRight: [1, 0],
	ArrowUp: [0, -1],
	ArrowDown: [0, 1],
};

function spriteImage(): HTMLCanvasElement {
	const rows = FAST_SHIP.rows;
	const c = document.createElement("canvas");
	c.width = rows[0].length;
	c.height = rows.length;
	const ctx = c.getContext("2d")!;
	rows.forEach((row, y) =>
		Array.from(row).forEach((ch, x) => {
			if (ch === ".") return;
			ctx.fillStyle = FAST_SHIP.palette[ch];
			ctx.fillRect(x, y, 1, 1);
		}),
	);
	return c;
}

function readBest() {
	try {
		return Number(window.localStorage.getItem(BEST_KEY)) || 0;
	} catch {
		return 0;
	}
}

export const GameOverlay: React.FC = () => {
	const { overlay, setOverlay } = useSecrets();
	if (overlay !== "game") return null;
	return <Game onClose={() => setOverlay(null)} />;
};

const Game: React.FC<{ onClose: () => void }> = ({ onClose }) => {
	const { isFound, markFound } = useSecrets();
	const field = useRef<HTMLDivElement>(null);
	const canvas = useRef<HTMLCanvasElement>(null);
	const game = useRef<GameState | null>(null);
	const keys = useRef(new Set<string>());
	const ship = useRef<HTMLCanvasElement | null>(null);
	const prizeUnlocked = useRef(isFound("score"));
	const [status, setStatus] = useState<Status>("intro");
	const statusRef = useRef<Status>("intro");
	const [count, setCount] = useState(3);
	const [score, setScore] = useState(0);
	const [lives, setLives] = useState<number>(TUNING.lives);
	const [best, setBest] = useState(0);
	const [endless, setEndless] = useState(prizeUnlocked.current);

	const go = (s: Status) => {
		statusRef.current = s;
		setStatus(s);
	};

	// Canvas sizing (DPR aware).
	useEffect(() => {
		ship.current = spriteImage();
		setBest(readBest());
		const fit = () => {
			const f = field.current;
			const c = canvas.current;
			if (!f || !c) return;
			const w = f.clientWidth;
			const h = f.clientHeight;
			const dpr = window.devicePixelRatio || 1;
			c.width = w * dpr;
			c.height = h * dpr;
			c.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
			if (game.current) resizeGame(game.current, w, h);
			else game.current = createGame(w, h);
			const ctx = c.getContext("2d");
			if (ctx && game.current) renderGame(ctx, game.current, ship.current);
		};
		fit();
		window.addEventListener("resize", fit);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("resize", fit);
			document.body.style.overflow = prevOverflow;
		};
	}, []);

	const startCountdown = useCallback(() => {
		setCount(3);
		go("countdown");
	}, []);

	const newRun = useCallback(() => {
		const f = field.current;
		if (!f) return;
		game.current = createGame(f.clientWidth, f.clientHeight);
		setScore(0);
		setLives(TUNING.lives);
		startCountdown();
	}, [startCountdown]);

	// Countdown: ticks only while the tab is visible, so a visitor who went to
	// the booking tab comes back to a fresh 3-2-1.
	useEffect(() => {
		if (status !== "countdown") return;
		const t = window.setInterval(() => {
			if (document.hidden) {
				setCount(3);
				return;
			}
			setCount((c) => {
				if (c <= 1) {
					go("playing");
					return 0;
				}
				return c - 1;
			});
		}, 1000);
		return () => clearInterval(t);
	}, [status]);

	// Pause when the tab is hidden mid-game, resume with a countdown.
	useEffect(() => {
		const onVis = () => {
			if (document.hidden && statusRef.current === "playing") go("paused");
			else if (!document.hidden && statusRef.current === "paused") startCountdown();
		};
		document.addEventListener("visibilitychange", onVis);
		return () => document.removeEventListener("visibilitychange", onVis);
	}, [startCountdown]);

	// Main loop.
	useEffect(() => {
		if (status !== "playing") return;
		let raf = 0;
		let last = performance.now();
		const ctx = canvas.current?.getContext("2d");
		const step = (now: number) => {
			const g = game.current;
			if (!g || !ctx) return;
			const dt = Math.min((now - last) / 1000, 0.05);
			last = now;
			let kx = 0;
			let ky = 0;
			keys.current.forEach((k) => {
				kx += KEYS[k][0];
				ky += KEYS[k][1];
			});
			const gained = updateGame(g, dt, { x: kx, y: ky });
			renderGame(ctx, g, ship.current);
			if (gained) setScore(g.score);
			setLives(g.lives);
			if (!prizeUnlocked.current && g.score >= SCORE_TARGET) {
				prizeUnlocked.current = true;
				markFound("score");
				setEndless(true);
				go("won");
				return;
			}
			if (g.over) {
				if (g.score > readBest()) {
					try {
						window.localStorage.setItem(BEST_KEY, String(g.score));
					} catch {}
				}
				setBest(readBest());
				go("over");
				return;
			}
			raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);
		return () => cancelAnimationFrame(raf);
	}, [status, markFound]);

	// Keyboard: arrows move, Esc closes.
	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "Escape") return onClose();
			if (KEYS[e.key]) {
				e.preventDefault();
				keys.current.add(e.key);
			}
		};
		const up = (e: KeyboardEvent) => keys.current.delete(e.key);
		window.addEventListener("keydown", down);
		window.addEventListener("keyup", up);
		return () => {
			window.removeEventListener("keydown", down);
			window.removeEventListener("keyup", up);
		};
	}, [onClose]);

	const onPointer = (e: React.PointerEvent) => {
		const g = game.current;
		const c = canvas.current;
		if (!g || !c) return;
		const r = c.getBoundingClientRect();
		const touch = e.pointerType !== "mouse";
		setTarget(g, e.clientX - r.left, e.clientY - r.top - (touch ? TOUCH_OFFSET : 0));
	};

	const progress = Math.min(score / SCORE_TARGET, 1);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm sm:p-4 animate-dialog-in"
			role="dialog"
			aria-modal="true"
			aria-label="Meteor shooter mini game"
		>
			<div
				ref={field}
				className="relative w-full h-full overflow-hidden border-zinc-700 bg-zinc-950 sm:border sm:rounded-2xl sm:max-w-[560px] sm:max-h-[900px] select-none"
			>
				<canvas
					ref={canvas}
					className="absolute inset-0 w-full h-full cursor-none touch-none"
					onPointerMove={onPointer}
					onPointerDown={onPointer}
				/>

				{/* HUD */}
				<div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 font-mono pointer-events-none text-zinc-300">
					<div className="flex-1">
						<p className="text-lg tabular-nums">{score.toLocaleString("en-US")}</p>
						{endless ? (
							<p className="mt-1 text-xs text-amber-300">✦ Prize unlocked · endless mode</p>
						) : (
							<div className="w-40 h-1.5 mt-2 overflow-hidden rounded-full bg-zinc-800">
								<div className="h-full bg-amber-300 transition-[width] duration-200" style={{ width: `${progress * 100}%` }} />
							</div>
						)}
					</div>
					<p className="pr-10 text-lg tracking-widest text-orange-400" aria-label={`${lives} lives left`}>
						{"▲".repeat(Math.max(lives, 0))}
						<span className="text-zinc-700">{"▲".repeat(TUNING.lives - Math.max(lives, 0))}</span>
					</p>
				</div>
				<button
					type="button"
					onClick={onClose}
					aria-label="Close game"
					className="absolute p-1 duration-200 rounded-md top-3 right-3 text-zinc-500 hover:text-zinc-200"
				>
					<X className="w-6 h-6" />
				</button>

				{status === "intro" ? (
					<Panel>
						{endless ? (
							<>
								<Eyebrow>Meteor shooter · endless mode</Eyebrow>
								<h2 className="mt-4 text-3xl text-zinc-100 font-display">Back for more?</h2>
								<p className="mt-4 text-zinc-400">Best score: {best.toLocaleString("en-US")}</p>
							</>
						) : (
							<>
								<Eyebrow>✦ Secret 2 of 3 found ✦</Eyebrow>
								<h2 className="mt-4 text-3xl text-zinc-100 font-display">You caught a ship!</h2>
								<p className="mt-4 text-zinc-400">
									Last secret: score <strong className="text-zinc-200">{SCORE_TARGET.toLocaleString("en-US")}</strong> points
									to unlock the prize.
								</p>
							</>
						)}
						<Controls />
						<PrimaryButton onClick={newRun}>Start</PrimaryButton>
					</Panel>
				) : null}

				{status === "countdown" || status === "paused" ? (
					<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
						<span key={count} className="text-8xl text-zinc-100 font-display animate-dialog-in">
							{status === "paused" ? "II" : count || "GO"}
						</span>
					</div>
				) : null}

				{status === "won" ? (
					<Panel>
						<PrizeContent titleId="game-prize-title" onSchedule={startCountdown} />
						<button type="button" onClick={startCountdown} className="block mx-auto mt-4 text-sm underline text-zinc-400 hover:text-zinc-200 underline-offset-4">
							Keep playing
						</button>
					</Panel>
				) : null}

				{status === "over" ? (
					<Panel>
						<Eyebrow>Game over</Eyebrow>
						<p className="mt-4 text-5xl tabular-nums text-zinc-100 font-display">{score.toLocaleString("en-US")}</p>
						<p className="mt-2 text-zinc-500">Best: {best.toLocaleString("en-US")}</p>
						{!endless ? (
							<p className="mt-4 text-zinc-400">
								{(SCORE_TARGET - score).toLocaleString("en-US")} points to go. You've got this.
							</p>
						) : null}
						<PrimaryButton onClick={newRun}>Try again</PrimaryButton>
					</Panel>
				) : null}
			</div>
		</div>
	);
};

const Panel: React.FC<React.PropsWithChildren> = ({ children }) => (
	<div className="absolute inset-0 flex items-center justify-center p-6 bg-zinc-950/75">
		<div className="max-w-sm text-center animate-dialog-in">{children}</div>
	</div>
);

const Eyebrow: React.FC<React.PropsWithChildren> = ({ children }) => (
	<p className="font-mono text-xs tracking-[0.3em] text-amber-300/80 uppercase">{children}</p>
);

const PrimaryButton: React.FC<React.PropsWithChildren<{ onClick: () => void }>> = ({ onClick, children }) => (
	<button
		type="button"
		onClick={onClick}
		className="px-6 py-3 mt-8 font-medium duration-200 rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white"
	>
		{children}
	</button>
);

const Controls: React.FC = () => (
	<ul className="mt-6 space-y-1 font-mono text-sm text-zinc-500">
		<li>
			<span className="hidden sm:inline">Mouse or arrow keys to move</span>
			<span className="sm:hidden">Drag your finger to move</span>
		</li>
		<li>Firing is automatic</li>
		<li>Dodge the meteors · 3 lives</li>
	</ul>
);
