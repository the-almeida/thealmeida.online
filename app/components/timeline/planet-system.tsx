"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Experience, durationMonths, formatPeriod } from "../../data/experience";
import { Scene } from "./scenes";

/**
 * Option 2: each role is a planet on a flight path, oldest first. Planet size
 * follows how long the role lasted; founder roles get a ring. Clicking a
 * planet "lands" on it: a full-screen view with a custom animated scene.
 */
export const PlanetSystem: React.FC<{ items: Experience[] }> = ({ items }) => {
	const [landing, setLanding] = useState<{ e: Experience; x: number; y: number } | null>(null);

	return (
		<>
			<ol className="relative">
				<svg aria-hidden="true" className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
					<line x1="50%" y1="0" x2="50%" y2="100%" stroke="#3f3f46" strokeDasharray="2 8" />
				</svg>
				{items.map((e, i) => (
					<Planet
						key={e.id}
						e={e}
						side={i % 2 === 0 ? "left" : "right"}
						onLand={(x, y) => setLanding({ e, x, y })}
					/>
				))}
			</ol>
			<AnimatePresence>
				{landing ? <Landing key={landing.e.id} {...landing} onBack={() => setLanding(null)} /> : null}
			</AnimatePresence>
		</>
	);
};

function planetSize(e: Experience) {
	return Math.round(Math.min(64 + durationMonths(e) * 1.6, 140));
}

const Planet: React.FC<{ e: Experience; side: "left" | "right"; onLand: (x: number, y: number) => void }> = ({
	e,
	side,
	onLand,
}) => {
	const ref = useRef<HTMLButtonElement>(null);
	const size = planetSize(e);
	const [from, to] = e.colors;
	const land = () => {
		const r = ref.current?.getBoundingClientRect();
		onLand(r ? r.left + r.width / 2 : window.innerWidth / 2, r ? r.top + r.height / 2 : window.innerHeight / 2);
	};

	return (
		<motion.li
			initial={{ opacity: 0, scale: 0.8 }}
			whileInView={{ opacity: 1, scale: 1 }}
			viewport={{ once: true, margin: "-80px" }}
			transition={{ duration: 0.6, ease: "easeOut" }}
			className={`relative flex items-center gap-6 py-10 ${side === "left" ? "flex-row" : "flex-row-reverse text-right"}`}
		>
			<div className={`flex w-1/2 ${side === "left" ? "justify-end pr-10 md:pr-14" : "justify-start pl-10 md:pl-14"}`}>
				<button
					ref={ref}
					type="button"
					onClick={land}
					aria-label={`Land on ${e.company}`}
					className="relative rounded-full outline-none group focus-visible:ring-2 focus-visible:ring-zinc-400"
					style={{ width: `min(${size}px, 24vw)`, height: `min(${size}px, 24vw)` }}
				>
					<span
						className="absolute inset-0 duration-500 rounded-full group-hover:scale-110 animate-planet-float"
						style={{
							background: `radial-gradient(circle at 30% 28%, ${from}, ${to} 70%)`,
							boxShadow: `0 0 40px -6px ${from}88, inset -12px -14px 30px rgba(0,0,0,0.55)`,
						}}
					/>
					{e.founder ? (
						<span
							aria-hidden="true"
							className="absolute rounded-[50%] border-2 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[18deg]"
							style={{ width: "160%", height: "40%", borderColor: `${from}aa` }}
						/>
					) : null}
					<span className="absolute font-mono text-xs duration-300 -translate-x-1/2 opacity-0 left-1/2 -bottom-7 whitespace-nowrap text-zinc-300 group-hover:opacity-100">
						▼ land
					</span>
				</button>
			</div>
			<div className="w-1/2">
				<p className="font-mono text-xs text-zinc-500">{formatPeriod(e)}</p>
				<h3 className="mt-1 text-2xl text-zinc-100 font-display">{e.company}</h3>
				<p className="text-sm text-zinc-400">
					{e.role}
					{e.founder ? <span className="ml-2 text-amber-300/90">✦ founder</span> : null}
				</p>
				<p className={`hidden mt-2 text-zinc-300 md:block max-w-xs ${side === "right" ? "ml-auto" : ""}`}>
					{e.highlight}
				</p>
			</div>
		</motion.li>
	);
};

const Landing: React.FC<{ e: Experience; x: number; y: number; onBack: () => void }> = ({ e, x, y, onBack }) => {
	const [from, to] = e.colors;
	useEffect(() => {
		const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && onBack();
		window.addEventListener("keydown", onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", onKey);
			document.body.style.overflow = prev;
		};
	}, [onBack]);

	return (
		<motion.div
			role="dialog"
			aria-modal="true"
			aria-label={`${e.company} details`}
			className="fixed inset-0 z-50 overflow-y-auto"
			style={{ background: `radial-gradient(ellipse at 50% 120%, ${to} 0%, #050505 60%)` }}
			initial={{ clipPath: `circle(0px at ${x}px ${y}px)` }}
			animate={{ clipPath: `circle(150% at ${x}px ${y}px)` }}
			exit={{ clipPath: `circle(0px at ${x}px ${y}px)` }}
			transition={{ duration: 0.7, ease: [0.7, 0, 0.3, 1] }}
		>
			{/* planet horizon */}
			<div
				aria-hidden="true"
				className="fixed hidden md:block left-1/2 -translate-x-1/2 rounded-full pointer-events-none -bottom-[85vw] w-[140vw] h-[100vw] opacity-40"
				style={{ background: `radial-gradient(circle at 50% 0%, ${from}, ${to} 40%, transparent 70%)` }}
			/>
			<div className="relative max-w-5xl px-6 py-8 mx-auto">
				<button
					type="button"
					onClick={onBack}
					className="flex items-center gap-2 font-mono text-sm text-zinc-400 hover:text-zinc-100"
				>
					<ArrowLeft className="w-4 h-4" /> back to orbit
				</button>
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}
					className="mt-8 font-mono text-xs tracking-[0.3em] uppercase"
					style={{ color: from }}
				>
					Landed on {e.company} · {formatPeriod(e)}
				</motion.p>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.7, duration: 0.5 }}
					className="grid gap-10 mt-6 md:grid-cols-2 md:items-center"
				>
					<div className="p-4 border rounded-2xl border-zinc-800 bg-black/50">
						<Scene id={e.scene} />
					</div>
					<div>
						<h2 className="text-4xl text-zinc-50 font-display md:text-5xl">{e.role}</h2>
						<p className="mt-4 text-lg text-zinc-300">{e.mission}</p>
						<p className="flex items-baseline gap-3 mt-6">
							<span className="text-5xl text-zinc-50 font-display">{e.impact.value}</span>
							<span className="text-zinc-400">{e.impact.label}</span>
						</p>
						<ul className="mt-6 space-y-2 text-zinc-300">
							{e.shipped.map((s) => (
								<li key={s} className="flex gap-2">
									<span style={{ color: from }}>▸</span>
									{s}
								</li>
							))}
						</ul>
						<ul className="flex flex-wrap gap-2 mt-6">
							{e.stack.map((s) => (
								<li key={s} className="px-2 py-0.5 font-mono text-xs border rounded-full border-zinc-700 text-zinc-300 bg-black/40">
									{s}
								</li>
							))}
						</ul>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
};
