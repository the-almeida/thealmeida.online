"use client";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ChevronDown } from "lucide-react";
import React, { useId, useRef, useState } from "react";
import { Experience, formatDuration, formatPeriod } from "../../data/experience";
import { Card } from "../card";
import { PixelSprite } from "../secrets/pixel-art";
import { PROJECT_ICONS } from "./project-icons";

/**
 * Experience timeline, oldest first. Cards alternate sides on desktop and sit
 * to the right of the line on mobile. Each card opens in place to show the
 * work bullets and the full stack; several can be open at once so opening one
 * never moves the card you were reading.
 */
export const Timeline: React.FC<{ items: Experience[] }> = ({ items }) => {
	const list = useRef<HTMLOListElement>(null);
	const { scrollYProgress } = useScroll({ target: list, offset: ["start 70%", "end 60%"] });
	const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

	return (
		<ol ref={list} className="relative">
			<div aria-hidden="true" className="absolute top-0 bottom-0 w-px left-4 md:left-1/2 bg-zinc-800" />
			<motion.div
				aria-hidden="true"
				className="absolute top-0 bottom-0 w-px origin-top left-4 md:left-1/2 bg-gradient-to-b from-amber-200/80 via-zinc-300/70 to-zinc-500/60"
				style={{ scaleY: fill }}
			/>
			{items.map((e, i) => (
				<Entry key={e.id} e={e} side={i % 2 === 0 ? "left" : "right"} />
			))}
		</ol>
	);
};

const VISIBLE_TAGS = 4;

const Entry: React.FC<{ e: Experience; side: "left" | "right" }> = ({ e, side }) => {
	const [open, setOpen] = useState(false);
	// Once the full stack has been revealed it stays revealed.
	const [allTags, setAllTags] = useState(false);
	const detailsId = useId();
	const toggle = () => {
		setOpen((o) => !o);
		setAllTags(true);
	};
	const hidden = e.tags.length - VISIBLE_TAGS;
	const tags = allTags || hidden <= 0 ? e.tags : e.tags.slice(0, VISIBLE_TAGS);

	return (
		<motion.li
			initial={{ opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-80px" }}
			transition={{ duration: 0.5, ease: "easeOut" }}
			className={`relative pl-12 pb-12 md:pl-0 md:w-1/2 ${side === "left" ? "md:pr-12" : "md:ml-auto md:pl-12"}`}
		>
			<SunStar side={side} active={open} />
			<div className="rounded-xl bg-zinc-950/85 backdrop-blur-sm">
				<Card>
					<article
						onClick={() => {
							// Let people select text without toggling the card.
							if (!window.getSelection()?.toString()) toggle();
						}}
						className="relative z-20 p-5 cursor-pointer md:p-6"
					>
						<div className="flex items-start gap-4">
							<span className="flex items-center justify-center w-11 h-11 border rounded-lg shrink-0 border-zinc-700 bg-zinc-900">
								<PixelSprite sprite={PROJECT_ICONS[e.icon]} size={24} />
							</span>
							<div className="min-w-0">
								<p className="font-mono text-xs text-zinc-500">
									<span className="whitespace-nowrap">{formatPeriod(e)}</span> ·{" "}
									<span className="whitespace-nowrap">{formatDuration(e)}</span>
								</p>
								<h3 className="mt-1 text-2xl leading-tight text-zinc-100 font-display">{e.company}</h3>
								<p className="text-sm text-zinc-400">
									{e.role} · {e.where}
								</p>
							</div>
						</div>
						<p className="mt-4 leading-relaxed text-zinc-300">
							<Emphasis text={e.outcome} />
						</p>
						<ul className="flex flex-wrap gap-2 mt-4" aria-label="Stack">
							{tags.map((t) => (
								<li key={t} className={CHIP}>
									{t}
								</li>
							))}
							{!allTags && hidden > 0 ? (
								<li>
									<button
										type="button"
										onClick={(ev) => {
											ev.stopPropagation();
											setAllTags(true);
										}}
										aria-label={`Show ${hidden} more`}
										className={`${CHIP} hover:text-zinc-100 hover:border-zinc-500 duration-200`}
									>
										+{hidden}
									</button>
								</li>
							) : null}
						</ul>

						<AnimatePresence initial={false}>
							{open ? (
								<motion.div
									id={detailsId}
									key="details"
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.3, ease: "easeInOut" }}
									className="overflow-hidden"
								>
									<ul className="pt-5 mt-5 space-y-3 text-sm border-t border-zinc-800 text-zinc-300">
										{e.work.map((w) => (
											<li key={w} className="flex gap-3 leading-relaxed">
												<span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-300/80" />
												{w}
											</li>
										))}
									</ul>
								</motion.div>
							) : null}
						</AnimatePresence>

						<button
							type="button"
							onClick={(ev) => {
								ev.stopPropagation();
								toggle();
							}}
							aria-expanded={open}
							aria-controls={detailsId}
							className="inline-flex items-center gap-1 mt-4 text-sm duration-200 rounded text-zinc-500 hover:text-zinc-200 focus-visible:outline focus-visible:outline-1 focus-visible:outline-zinc-500"
						>
							{open ? "Show less" : "Show details"}
							<ChevronDown className={`w-4 h-4 duration-300 ${open ? "rotate-180" : ""}`} />
						</button>
					</article>
				</Card>
			</div>
		</motion.li>
	);
};

const CHIP = "block px-2 py-0.5 font-mono text-xs border rounded-full border-zinc-700 text-zinc-400 bg-zinc-900/60";

/** Renders **x** as emphasized text; everything else stays plain. */
const Emphasis: React.FC<{ text: string }> = ({ text }) => (
	<>
		{text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
			part.startsWith("**") ? (
				<strong key={i} className="font-semibold text-zinc-50">
					{part.slice(2, -2)}
				</strong>
			) : (
				part
			),
		)}
	</>
);

/**
 * Timeline node: a small sun-colored star with a soft glow and a faint
 * four-point flare. It ignites when its card scrolls into view, and a moon
 * orbits it while its card is open.
 */
const SunStar: React.FC<{ side: "left" | "right"; active: boolean }> = ({ side, active }) => (
	// Positioning lives on a plain span: framer-motion's transform would
	// override Tailwind's translate classes on the animated element.
	<span
		aria-hidden="true"
		className={`absolute z-10 top-8 left-4 -translate-x-1/2 -translate-y-1/2 ${
			side === "left" ? "md:left-auto md:right-0 md:translate-x-1/2" : "md:left-0"
		}`}
	>
		<motion.span
			className="relative block w-4 h-4"
			initial={{ opacity: 0.25, scale: 0.5 }}
			whileInView={{ opacity: 1, scale: 1 }}
			viewport={{ once: true, margin: "-35% 0px -35% 0px" }}
			transition={{ duration: 0.8, ease: "easeOut" }}
		>
			<span className="absolute inset-0 animate-twinkle">
				{/* flare */}
				<span className="absolute h-px -translate-y-1/2 left-1/2 top-1/2 w-9 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-200/70 to-transparent" />
				<span className="absolute w-px h-9 -translate-x-1/2 left-1/2 top-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-amber-200/70 to-transparent" />
				{/* core */}
				<span
					className="absolute inset-0 rounded-full"
					style={{
						background: "radial-gradient(circle at 40% 40%, #fffbeb 0%, #fde68a 35%, #f59e0b 75%, #b45309 100%)",
						boxShadow: "0 0 10px 2px rgba(251,191,36,0.55), 0 0 26px 8px rgba(245,158,11,0.22)",
					}}
				/>
			</span>
			{/* the open card's star gets a little moon in orbit */}
			<AnimatePresence>
				{active ? (
					<motion.span
						key="moon"
						className="absolute pointer-events-none left-1/2 top-1/2 w-10 h-10 -ml-5 -mt-5"
						initial={{ opacity: 0, scale: 0.6 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.6 }}
						transition={{ duration: 0.4 }}
					>
						<span className="absolute inset-0 border rounded-full border-zinc-400/15" />
						<span className="absolute inset-0 animate-orbit motion-reduce:animate-none">
							<span
								className="absolute top-0 left-1/2 w-[7px] h-[7px] -ml-[3.5px] -mt-[3.5px] rounded-full"
								style={{
									background: "radial-gradient(circle at 35% 35%, #fafafa 0%, #d4d4d8 45%, #71717a 100%)",
									boxShadow: "0 0 6px 1px rgba(228,228,231,0.35)",
								}}
							/>
						</span>
					</motion.span>
				) : null}
			</AnimatePresence>
		</motion.span>
	</span>
);
