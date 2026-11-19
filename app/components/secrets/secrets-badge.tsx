"use client";
import { Check, Gamepad2, Gift, Lock, RotateCcw } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { SECRETS } from "./config";
import { useSecrets } from "./secrets-context";

export const BADGE_ID = "secrets-badge";

/** Top-right counter, visible once the first secret is found. */
export const SecretsBadge: React.FC = () => {
	const { ready, found, isFound, reset, setOverlay } = useSecrets();
	const [open, setOpen] = useState(false);
	const [bump, setBump] = useState(0);
	const root = useRef<HTMLDivElement>(null);
	const prevCount = useRef(found.length);

	// Pulse the badge whenever the count goes up.
	useEffect(() => {
		if (found.length > prevCount.current) setBump((b) => b + 1);
		prevCount.current = found.length;
	}, [found.length]);

	useEffect(() => {
		if (!open) return;
		const onDown = (e: MouseEvent) => {
			if (!root.current?.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
		document.addEventListener("mousedown", onDown);
		window.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDown);
			window.removeEventListener("keydown", onKey);
		};
	}, [open]);

	if (!ready || found.length === 0) return null;
	const total = SECRETS.length;

	return (
		<div ref={root} className="fixed z-40 top-4 right-4 animate-dialog-in">
			<button
				id={BADGE_ID}
				key={bump}
				type="button"
				onClick={() => setOpen((o) => !o)}
				aria-expanded={open}
				aria-label={`Secrets found: ${found.length} of ${total}`}
				className={`flex items-center gap-2 px-3 py-1.5 font-mono text-sm border rounded-full backdrop-blur border-zinc-700 bg-zinc-900/80 text-zinc-200 hover:border-zinc-400 duration-200 ${
					bump ? "animate-badge-bump" : ""
				}`}
			>
				<span className="text-amber-300">✦</span>
				{found.length}/{total} secrets
			</button>

			{open ? (
				<div className="absolute right-0 p-4 mt-2 border w-72 rounded-xl border-zinc-700 bg-zinc-950/95 shadow-2xl shadow-black">
					<ul className="space-y-2 text-sm">
						{SECRETS.map((s, i) => {
							const got = isFound(s.id);
							return (
								<li key={s.id} className="flex items-start gap-2">
									{got ? (
										<Check className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
									) : (
										<Lock className="w-4 h-4 mt-0.5 text-zinc-600 shrink-0" />
									)}
									<span className={got ? "text-zinc-200" : "text-zinc-500"}>
										#{i + 1} {got ? s.label : `??? ${s.hint}`}
									</span>
								</li>
							);
						})}
					</ul>
					<div className="flex flex-col gap-2 pt-4 mt-4 border-t border-zinc-800">
						{isFound("ship") ? (
							<button
								type="button"
								onClick={() => {
									setOpen(false);
									setOverlay("game");
								}}
								className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white"
							>
								<Gamepad2 className="w-4 h-4" /> Play the game
							</button>
						) : null}
						{isFound("score") ? (
							<button
								type="button"
								onClick={() => {
									setOpen(false);
									setOverlay("prize");
								}}
								className="flex items-center gap-2 text-sm text-amber-300 hover:text-amber-200"
							>
								<Gift className="w-4 h-4" /> See my prize
							</button>
						) : null}
						<button
							type="button"
							onClick={() => {
								setOpen(false);
								reset();
							}}
							className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300"
						>
							<RotateCcw className="w-4 h-4" /> Reset progress
						</button>
					</div>
				</div>
			) : null}
		</div>
	);
};
