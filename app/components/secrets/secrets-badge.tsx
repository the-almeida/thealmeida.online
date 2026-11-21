"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { BADGE_PULSE_EVENT, SECRETS } from "./config";
import { buttonClass } from "./dialog";
import { useSecrets } from "./secrets-context";

/** Shared with the intro dialog, which morphs into this counter on close. */
export const HUD_LAYOUT_ID = "secrets-hud";

/**
 * Bottom-right "✦ 1/3" counter with a progress popover. Pulses when a
 * secret is found, when the intro card lands in it and when the saucer
 * docks into it.
 */
export const SecretsBadge: React.FC<{ onPlay: () => void }> = ({ onPlay }) => {
	const { found, isFound, reset, setOverlay } = useSecrets();
	const [open, setOpen] = useState(false);
	const [pulse, setPulse] = useState(0);
	const root = useRef<HTMLDivElement>(null);
	const count = useRef(found.length);

	useEffect(() => {
		if (found.length > count.current) setPulse((p) => p + 1);
		count.current = found.length;
	}, [found.length]);

	useEffect(() => {
		const onPulse = () => setPulse((p) => p + 1);
		window.addEventListener(BADGE_PULSE_EVENT, onPulse);
		return () => window.removeEventListener(BADGE_PULSE_EVENT, onPulse);
	}, []);

	useEffect(() => {
		if (!open) return;
		const onDown = (e: PointerEvent) => {
			if (!root.current?.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("pointerdown", onDown);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("pointerdown", onDown);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	const total = SECRETS.length;
	const complete = found.length === total;
	const next = SECRETS.find((s) => !isFound(s.id));
	const act = (fn: () => void) => () => {
		setOpen(false);
		fn();
	};

	return (
		<div ref={root} className="fixed z-40 bottom-6 right-6">
			<AnimatePresence>
				{open ? (
					<motion.div
						id="secrets-popover"
						initial={{ opacity: 0, y: 8, scale: 0.96 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 8, scale: 0.96 }}
						transition={{ duration: 0.15 }}
						style={{ transformOrigin: "bottom right" }}
						className="absolute right-0 p-5 border shadow-2xl bottom-14 w-72 rounded-xl border-zinc-700 bg-zinc-950/95 shadow-black backdrop-blur"
					>
						<p className="font-mono text-xs tracking-[0.3em] uppercase text-zinc-500">Secrets</p>
						<ul className="mt-4 space-y-3">
							{SECRETS.map((s, i) => {
								const got = isFound(s.id);
								return (
									<li key={s.id} className="flex gap-3">
										<span
											className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
												got ? "border-amber-300/60 text-amber-300" : "border-zinc-700 text-zinc-600"
											}`}
										>
											{got ? (
												<Check className="w-3 h-3" aria-hidden="true" />
											) : (
												<Lock className="w-3 h-3" aria-hidden="true" />
											)}
										</span>
										<div className="text-sm">
											<p className={got ? "text-zinc-100" : "text-zinc-500"}>
												{got ? s.title : `Secret #${i + 1}`}
												<span className="sr-only">{got ? " (found)" : " (not found yet)"}</span>
											</p>
											{s.id === next?.id ? <p className="mt-0.5 text-zinc-400">{s.hint}</p> : null}
										</div>
									</li>
								);
							})}
						</ul>

						<div className="flex flex-col gap-2 mt-5">
							{complete ? (
								<button
									type="button"
									onClick={act(() => setOverlay("prize"))}
									className={`${buttonClass()} py-2 text-sm !bg-amber-300 hover:!bg-amber-200`}
								>
									✦ Claim your prize
								</button>
							) : null}
							{isFound("ship") ? (
								<button type="button" onClick={act(onPlay)} className={`${buttonClass("ghost")} py-2 text-sm`}>
									Play the game
								</button>
							) : null}
							<button
								type="button"
								onClick={act(reset)}
								className="self-center mt-1 text-xs underline duration-200 text-zinc-600 hover:text-zinc-400 underline-offset-4"
							>
								Reset progress
							</button>
						</div>
					</motion.div>
				) : null}
			</AnimatePresence>

			{pulse > 0 ? (
				<motion.span
					key={pulse}
					aria-hidden="true"
					className="absolute inset-0 border rounded-full pointer-events-none border-amber-300"
					initial={{ scale: 1, opacity: 0.9 }}
					animate={{ scale: 1.8, opacity: 0 }}
					transition={{ duration: 0.9, ease: "easeOut" }}
				/>
			) : null}
			<motion.div
				layoutId={HUD_LAYOUT_ID}
				style={{ borderRadius: 20 }}
				className="overflow-hidden"
				// The intro card just landed here: point at it.
				onLayoutAnimationComplete={() => setPulse((p) => p + 1)}
			>
				<button
					type="button"
					data-secrets-badge
					onClick={() => setOpen((o) => !o)}
					aria-expanded={open}
					aria-controls="secrets-popover"
					aria-label={`Secrets found: ${found.length} of ${total}`}
					className={`flex items-center gap-2 px-4 py-2 font-mono text-sm duration-200 border rounded-full bg-zinc-950/80 backdrop-blur hover:text-zinc-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-zinc-400 ${
						complete ? "border-amber-300/60 text-amber-200" : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
					}`}
				>
					<span aria-hidden="true" className="text-amber-300">
						✦
					</span>
					{found.length}/{total}
				</button>
			</motion.div>
		</div>
	);
};
