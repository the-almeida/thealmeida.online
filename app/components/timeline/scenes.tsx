"use client";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import type { SceneId } from "../../data/experience";

// One small animated illustration per experience (option 2). All scenes draw
// in a 320x320 viewBox and loop, so they work at any size.

const W = 320;

function useCounter(to: number, ms: number, delay = 0) {
	const [n, setN] = useState(0);
	useEffect(() => {
		let raf = 0;
		let start = 0;
		const t = window.setTimeout(() => {
			const step = (now: number) => {
				if (!start) start = now;
				const p = Math.min((now - start) / ms, 1);
				setN(to * p);
				if (p < 1) raf = requestAnimationFrame(step);
			};
			raf = requestAnimationFrame(step);
		}, delay);
		return () => {
			clearTimeout(t);
			cancelAnimationFrame(raf);
		};
	}, [to, ms, delay]);
	return n;
}

const Frame: React.FC<React.PropsWithChildren<{ caption: string }>> = ({ caption, children }) => (
	<figure className="w-full">
		<svg viewBox={`0 0 ${W} ${W}`} className="w-full h-auto" role="img" aria-label={caption}>
			{children}
		</svg>
		<figcaption className="mt-2 font-mono text-xs text-center text-zinc-500">{caption}</figcaption>
	</figure>
);

/** GalileoSoft: 25 client sites light up one by one. */
const Agency: React.FC = () => {
	const n = Math.round(useCounter(25, 3000, 300));
	return (
		<Frame caption={`clients online: ${n}/25`}>
			{Array.from({ length: 25 }, (_, i) => {
				const x = 22 + (i % 5) * 58;
				const y = 30 + Math.floor(i / 5) * 54;
				const on = i < n;
				return (
					<g key={i} transform={`translate(${x} ${y})`}>
						<rect width="48" height="40" rx="4" fill={on ? "#1e3a8a" : "#18181b"} stroke={on ? "#60a5fa" : "#3f3f46"} />
						<rect width="48" height="8" rx="2" fill={on ? "#60a5fa" : "#3f3f46"} />
						{on ? (
							<motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
								<rect x="6" y="14" width="22" height="4" fill="#bfdbfe" />
								<rect x="6" y="22" width="36" height="3" fill="#93c5fd" opacity=".6" />
								<rect x="6" y="28" width="30" height="3" fill="#93c5fd" opacity=".6" />
							</motion.g>
						) : null}
					</g>
				);
			})}
		</Frame>
	);
};

/** CuideMe: smartwatch with a live heartbeat streaming to the API. */
const Smartwatch: React.FC = () => {
	const [bpm, setBpm] = useState(72);
	useEffect(() => {
		const t = window.setInterval(() => setBpm(68 + Math.round(Math.random() * 10)), 900);
		return () => clearInterval(t);
	}, []);
	const ecg = "M0 40 L30 40 L38 30 L44 52 L52 10 L60 62 L66 40 L120 40";
	return (
		<Frame caption={`TCP ▸ API · ${bpm} bpm · all good`}>
			<rect x="120" y="20" width="80" height="40" rx="10" fill="#27272a" />
			<rect x="120" y="260" width="80" height="40" rx="10" fill="#27272a" />
			<rect x="85" y="55" width="150" height="210" rx="34" fill="#18181b" stroke="#52525b" strokeWidth="4" />
			<rect x="100" y="70" width="120" height="180" rx="22" fill="#0a0a0a" />
			<text x="160" y="125" textAnchor="middle" fill="#fafafa" fontSize="34" fontFamily="monospace">{bpm}</text>
			<text x="160" y="145" textAnchor="middle" fill="#f87171" fontSize="12" fontFamily="monospace">♥ BPM</text>
			<g transform="translate(100 165)">
				<motion.path
					d={ecg}
					fill="none"
					stroke="#f87171"
					strokeWidth="3"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: [0, 1, 1] , opacity: [1, 1, 0]}}
					transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
				/>
			</g>
			{[0, 1, 2].map((i) => (
				<motion.circle
					key={i}
					r="4"
					fill="#fca5a5"
					initial={{ cx: 235, cy: 160, opacity: 0 }}
					animate={{ cx: [235, 310], opacity: [0, 1, 0] }}
					transition={{ duration: 1.2, delay: i * 0.4, repeat: Infinity }}
				/>
			))}
		</Frame>
	);
};

/** Kine: spreadsheet chaos becomes a tidy inventory. */
const Inventory: React.FC = () => (
	<Frame caption="spreadsheet.xlsx → inventory app">
		{[0, 1, 2].map((r) => (
			<rect key={r} x="40" y={110 + r * 70} width="240" height="6" rx="2" fill="#3f3f46" />
		))}
		{Array.from({ length: 12 }, (_, i) => {
			const row = Math.floor(i / 4);
			const col = i % 4;
			return (
				<motion.g
					key={i}
					initial={{ y: -200, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.2 + i * 0.18, type: "spring", stiffness: 180, damping: 14 }}
				>
					<rect x={52 + col * 58} y={68 + row * 70} width="42" height="42" rx="4" fill="#065f46" stroke="#34d399" />
					<path d={`M${52 + col * 58} ${84 + row * 70} h42`} stroke="#34d399" opacity=".6" />
					<text x={73 + col * 58} y={102 + row * 70} textAnchor="middle" fill="#a7f3d0" fontSize="10" fontFamily="monospace">
						#{String(i + 1).padStart(2, "0")}
					</text>
				</motion.g>
			);
		})}
		<motion.text
			x="160"
			y="40"
			textAnchor="middle"
			fill="#a7f3d0"
			fontSize="14"
			fontFamily="monospace"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: 2.6 }}
		>
			stock: 12 · synced ✓
		</motion.text>
	</Frame>
);

/** TecnoSpeed: producer → queue → workers, behind a Go gateway. */
const Pipeline: React.FC = () => (
	<Frame caption="gateway (Go) → queue → node workers">
		<rect x="14" y="135" width="64" height="50" rx="8" fill="#422006" stroke="#fbbf24" />
		<text x="46" y="165" textAnchor="middle" fill="#fde68a" fontSize="12" fontFamily="monospace">Go API</text>
		<rect x="100" y="148" width="100" height="24" rx="4" fill="#18181b" stroke="#52525b" />
		{[0, 1, 2].map((i) => (
			<g key={i}>
				<rect x="236" y={70 + i * 70} width="70" height="40" rx="8" fill="#422006" stroke="#fbbf24" />
				<motion.circle
					cx="250"
					cy={90 + i * 70}
					r="5"
					fill="#fbbf24"
					animate={{ opacity: [0.3, 1, 0.3] }}
					transition={{ duration: 1, delay: i * 0.3, repeat: Infinity }}
				/>
				<text x="282" y={94 + i * 70} textAnchor="middle" fill="#fde68a" fontSize="10" fontFamily="monospace">w{i + 1}</text>
			</g>
		))}
		{Array.from({ length: 6 }, (_, i) => {
			const lane = i % 3;
			return (
				<motion.rect
					key={i}
					width="12"
					height="12"
					rx="2"
					fill="#fbbf24"
					initial={{ x: 78, y: 154 }}
					animate={{ x: [78, 110, 185, 236], y: [154, 154, 154, 84 + lane * 70], opacity: [0, 1, 1, 0] }}
					transition={{ duration: 2.4, delay: i * 0.4, repeat: Infinity, ease: "easeInOut" }}
				/>
			);
		})}
		<text x="150" y="200" textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="monospace">redis · postgres · mongo</text>
	</Frame>
);

/** Banyan: sessions per week, before and after. */
const Engagement: React.FC = () => {
	const after = useCounter(1.5, 1600, 600);
	return (
		<Frame caption="avg sessions / member / week">
			<line x1="40" y1="270" x2="290" y2="270" stroke="#3f3f46" />
			<motion.rect
				x="70"
				width="70"
				fill="#3f3f46"
				initial={{ y: 270, height: 0 }}
				animate={{ y: 270 - 75 * 1.2, height: 75 * 1.2 }}
				transition={{ duration: 0.8 }}
			/>
			<motion.rect
				x="190"
				width="70"
				fill="#a78bfa"
				initial={{ y: 270, height: 0 }}
				animate={{ y: 270 - 150 * 1.2, height: 150 * 1.2 }}
				transition={{ duration: 1.6, delay: 0.6, ease: "easeOut" }}
			/>
			<text x="105" y="290" textAnchor="middle" fill="#a1a1aa" fontSize="12" fontFamily="monospace">before</text>
			<text x="225" y="290" textAnchor="middle" fill="#c4b5fd" fontSize="12" fontFamily="monospace">after</text>
			<text x="105" y="168" textAnchor="middle" fill="#d4d4d8" fontSize="16" fontFamily="monospace">0.75</text>
			<text x="225" y="78" textAnchor="middle" fill="#ede9fe" fontSize="20" fontFamily="monospace">{after.toFixed(2)}</text>
			<motion.text
				x="225"
				y="50"
				textAnchor="middle"
				fill="#c4b5fd"
				fontSize="14"
				fontFamily="monospace"
				initial={{ opacity: 0, scale: 0.5 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 2.3 }}
			>
				2× ↑
			</motion.text>
		</Frame>
	);
};

/** Magnificent Mentorship: three stars rise from zero to "hired". */
const Mentoring: React.FC = () => {
	const tracks = ["Python & data", "JS/TS full-stack", "English & confidence"];
	return (
		<Frame caption="3 of 3 mentees hired">
			<line x1="30" y1="60" x2="290" y2="60" stroke="#2dd4bf" strokeDasharray="4 6" opacity=".6" />
			<text x="160" y="40" textAnchor="middle" fill="#99f6e4" fontSize="12" fontFamily="monospace">HIRED</text>
			<line x1="30" y1="280" x2="290" y2="280" stroke="#3f3f46" />
			<text x="160" y="305" textAnchor="middle" fill="#71717a" fontSize="11" fontFamily="monospace">zero code</text>
			{tracks.map((t, i) => {
				const x = 70 + i * 90;
				return (
					<g key={t}>
						<motion.path
							d={`M${x} 280 C ${x - 30} 210, ${x + 30} 140, ${x} 60`}
							fill="none"
							stroke="#2dd4bf"
							strokeWidth="1.5"
							opacity=".5"
							initial={{ pathLength: 0 }}
							animate={{ pathLength: 1 }}
							transition={{ duration: 1.6, delay: 0.3 + i * 0.5 }}
						/>
						<motion.text
							x={x}
							textAnchor="middle"
							fontSize="22"
							fill="#ccfbf1"
							initial={{ y: 288 }}
							animate={{ y: 68 }}
							transition={{ duration: 1.6, delay: 0.3 + i * 0.5, ease: "easeInOut" }}
						>
							✦
						</motion.text>
						<motion.text
							x={x}
							y={i === 1 ? 116 : 96}
							textAnchor="middle"
							fill="#5eead4"
							fontSize="9"
							fontFamily="monospace"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 2 + i * 0.5 }}
						>
							{t}
						</motion.text>
					</g>
				);
			})}
		</Frame>
	);
};

/** Sommar: people at the same venue get matched by embeddings. */
const PEOPLE = [
	[80, 90], [240, 80], [60, 200], [150, 250], [260, 220], [120, 140], [210, 150], [280, 130],
];
const PAIRS = [[0, 5], [1, 6], [2, 3], [4, 7]];
const Matching: React.FC = () => (
	<Frame caption="same venue · cosine similarity > 0.82 · match">
		<circle cx="160" cy="160" r="135" fill="none" stroke="#831843" strokeDasharray="3 6" />
		<text x="160" y="172" textAnchor="middle" fontSize="28">📍</text>
		{PAIRS.map(([a, b], i) => (
			<motion.line
				key={i}
				x1={PEOPLE[a][0]}
				y1={PEOPLE[a][1]}
				x2={PEOPLE[b][0]}
				y2={PEOPLE[b][1]}
				stroke="#f472b6"
				strokeWidth="2"
				initial={{ pathLength: 0, opacity: 0 }}
				animate={{ pathLength: 1, opacity: 1 }}
				transition={{ duration: 0.7, delay: 0.8 + i * 0.6 }}
			/>
		))}
		{PEOPLE.map(([x, y], i) => (
			<motion.circle
				key={i}
				cx={x}
				cy={y}
				r="9"
				fill="#fbcfe8"
				stroke="#f472b6"
				strokeWidth="2"
				initial={{ scale: 0 }}
				animate={{ scale: [0, 1.2, 1] }}
				transition={{ delay: i * 0.08 }}
			/>
		))}
		<motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3.4 }}>
			<rect x="114" y="14" width="92" height="26" rx="13" fill="#831843" />
			<text x="160" y="31" textAnchor="middle" fill="#fce7f3" fontSize="11" fontFamily="monospace">“same band?”</text>
		</motion.g>
	</Frame>
);

const SCENES: Record<SceneId, React.FC> = {
	agency: Agency,
	smartwatch: Smartwatch,
	inventory: Inventory,
	pipeline: Pipeline,
	engagement: Engagement,
	mentoring: Mentoring,
	matching: Matching,
};

export const Scene: React.FC<{ id: SceneId }> = ({ id }) => {
	const C = SCENES[id];
	return <C />;
};
