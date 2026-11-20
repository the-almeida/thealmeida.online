"use client";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ChevronDown } from "lucide-react";
import React, { useRef, useState } from "react";
import { Experience, formatPeriod } from "../../data/experience";
import { Card } from "../card";
import { CompanyIcon } from "./company-icon";

/**
 * Option 1: vertical timeline, oldest first. Clicking a card expands it into
 * a "mission report": mission, what shipped, the headline impact, full stack.
 */
export const MissionLog: React.FC<{ items: Experience[] }> = ({ items }) => {
	const list = useRef<HTMLOListElement>(null);
	const { scrollYProgress } = useScroll({ target: list, offset: ["start 70%", "end 60%"] });
	const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
	const [open, setOpen] = useState<string | null>(null);

	return (
		<ol ref={list} className="relative">
			{/* track + scroll-driven fill */}
			<div aria-hidden="true" className="absolute top-0 bottom-0 w-px left-4 md:left-1/2 bg-zinc-800" />
			<motion.div
				aria-hidden="true"
				className="absolute top-0 bottom-0 w-px origin-top left-4 md:left-1/2 bg-gradient-to-b from-zinc-200 via-zinc-400 to-zinc-500"
				style={{ scaleY: fill }}
			/>
			{items.map((e, i) => (
				<Entry
					key={e.id}
					e={e}
					side={i % 2 === 0 ? "left" : "right"}
					open={open === e.id}
					onToggle={() => setOpen((o) => (o === e.id ? null : e.id))}
				/>
			))}
		</ol>
	);
};

const Entry: React.FC<{ e: Experience; side: "left" | "right"; open: boolean; onToggle: () => void }> = ({
	e,
	side,
	open,
	onToggle,
}) => (
	<motion.li
		initial={{ opacity: 0, y: 24 }}
		whileInView={{ opacity: 1, y: 0 }}
		viewport={{ once: true, margin: "-80px" }}
		transition={{ duration: 0.5, ease: "easeOut" }}
		className={`relative pl-12 pb-12 md:pl-0 md:w-1/2 ${side === "left" ? "md:pr-12" : "md:ml-auto md:pl-12"}`}
	>
		{/* node on the line */}
		<span
			aria-hidden="true"
			className={`absolute top-6 left-4 -translate-x-1/2 flex items-center justify-center w-3 h-3 rounded-full ring-4 ring-black ${
				open ? "bg-amber-300" : "bg-zinc-300"
			} ${side === "left" ? "md:left-auto md:right-0 md:translate-x-1/2" : "md:left-0"}`}
		/>
		<div className="rounded-xl bg-zinc-950/85 backdrop-blur-sm">
		<Card>
			<button
				type="button"
				onClick={onToggle}
				aria-expanded={open}
				className="relative z-20 w-full p-5 text-left md:p-6"
			>
				<div className="flex items-start gap-4">
					<span className="flex items-center justify-center w-10 h-10 border rounded-lg shrink-0 border-zinc-700 bg-zinc-900 text-zinc-300">
						<CompanyIcon scene={e.scene} className="w-5 h-5" />
					</span>
					<div className="flex-1 min-w-0">
						<p className="font-mono text-xs text-zinc-500">
							{formatPeriod(e)} · {e.where}
						</p>
						<h3 className="mt-1 text-xl text-zinc-100 font-display">{e.company}</h3>
						<p className="text-sm text-zinc-400">
							{e.role}
							{e.founder ? <span className="ml-2 text-amber-300/90">✦ founder</span> : null}
						</p>
					</div>
					<ChevronDown className={`w-5 h-5 mt-1 text-zinc-500 duration-300 ${open ? "rotate-180" : ""}`} />
				</div>
				<p className="mt-4 text-zinc-300">{e.highlight}</p>
				{!open ? (
					<ul className="flex flex-wrap gap-2 mt-4">
						{e.stack.slice(0, 4).map((s) => (
							<Chip key={s}>{s}</Chip>
						))}
						{e.stack.length > 4 ? <Chip>+{e.stack.length - 4}</Chip> : null}
					</ul>
				) : null}
			</button>
			<AnimatePresence initial={false}>
				{open ? (
					<motion.div
						key="report"
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.35, ease: "easeInOut" }}
						className="relative z-20 overflow-hidden"
					>
						<MissionReport e={e} />
					</motion.div>
				) : null}
			</AnimatePresence>
		</Card>
		</div>
	</motion.li>
);

const MissionReport: React.FC<{ e: Experience }> = ({ e }) => (
	<div className="px-5 pb-6 font-mono text-sm md:px-6">
		<div className="pt-4 border-t border-dashed border-zinc-700">
			<p className="text-xs tracking-[0.25em] text-amber-300/80 uppercase">
				Mission report · {e.id.toUpperCase()}
			</p>
			<Field label="Mission">
				<p className="font-sans text-zinc-300">{e.mission}</p>
			</Field>
			<Field label="Shipped">
				<ul className="space-y-1.5 font-sans text-zinc-300">
					{e.shipped.map((s) => (
						<li key={s} className="flex gap-2">
							<span className="text-emerald-400">▸</span>
							{s}
						</li>
					))}
				</ul>
			</Field>
			<Field label="Impact">
				<p className="flex items-baseline gap-3">
					<span className="text-4xl text-zinc-50 font-display">{e.impact.value}</span>
					<span className="font-sans text-zinc-400">{e.impact.label}</span>
				</p>
			</Field>
			<Field label="Stack">
				<ul className="flex flex-wrap gap-2">
					{e.stack.map((s) => (
						<Chip key={s}>{s}</Chip>
					))}
				</ul>
			</Field>
			<p className="mt-5 text-xs text-emerald-400/80">STATUS: MISSION COMPLETE ✓</p>
		</div>
	</div>
);

const Field: React.FC<React.PropsWithChildren<{ label: string }>> = ({ label, children }) => (
	<div className="mt-4">
		<p className="mb-1.5 text-xs uppercase text-zinc-500">{label}</p>
		{children}
	</div>
);

const Chip: React.FC<React.PropsWithChildren> = ({ children }) => (
	<li className="px-2 py-0.5 font-mono text-xs border rounded-full border-zinc-700 text-zinc-400 bg-zinc-900/60">
		{children}
	</li>
);
