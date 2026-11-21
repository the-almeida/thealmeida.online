"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import React, { useEffect, useRef } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

type DialogProps = React.PropsWithChildren<{
	onClose: () => void;
	labelledBy: string;
	/**
	 * Shared layout id: on close the card morphs into the element that mounts
	 * with the same id (the intro card shrinks into the secrets counter).
	 */
	layoutId?: string;
}>;

/**
 * Accessible modal. Render it inside <AnimatePresence> to get the exit
 * animation. Focus goes to the `[data-autofocus]` element (or the first
 * focusable one), Tab is trapped inside, Esc and the backdrop close it, and
 * focus returns to where it was on unmount.
 */
export const Dialog: React.FC<DialogProps> = ({ onClose, labelledBy, layoutId, children }) => {
	const card = useRef<HTMLDivElement>(null);
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;

	useEffect(() => {
		const previous = document.activeElement as HTMLElement | null;
		const first =
			card.current?.querySelector<HTMLElement>("[data-autofocus]") ??
			card.current?.querySelector<HTMLElement>(FOCUSABLE);
		first?.focus({ preventScroll: true });
		return () => previous?.focus?.({ preventScroll: true });
	}, []);

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Escape") {
			e.stopPropagation();
			onCloseRef.current();
			return;
		}
		if (e.key !== "Tab" || !card.current) return;
		const items = Array.from(card.current.querySelectorAll<HTMLElement>(FOCUSABLE));
		if (items.length === 0) return;
		const first = items[0];
		const last = items[items.length - 1];
		if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={onKeyDown}>
			<motion.div
				aria-hidden="true"
				className="absolute inset-0 bg-black/70 backdrop-blur-sm"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={() => onCloseRef.current()}
			/>
			<motion.div
				ref={card}
				role="dialog"
				aria-modal="true"
				aria-labelledby={labelledBy}
				layoutId={layoutId}
				initial={{ opacity: 0, scale: 0.94, y: 12 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				// With a layoutId the morph is the exit, a fade would fight it.
				exit={layoutId ? undefined : { opacity: 0, scale: 0.96, y: 8 }}
				transition={{ type: "spring", stiffness: 280, damping: 28 }}
				// borderRadius in style so framer keeps it round while morphing.
				style={{ borderRadius: 16 }}
				className="relative w-full max-w-md p-8 overflow-hidden text-center border shadow-2xl border-zinc-700 bg-zinc-950/95 shadow-black"
			>
				{/* The content fades first, so only the empty shell morphs. */}
				<motion.div exit={{ opacity: 0, transition: { duration: 0.12 } }}>
					<button
						type="button"
						onClick={() => onCloseRef.current()}
						aria-label="Close"
						className="absolute p-1 duration-200 rounded-md top-3 right-3 text-zinc-500 hover:text-zinc-200 focus-visible:outline focus-visible:outline-1 focus-visible:outline-zinc-500"
					>
						<X className="w-5 h-5" />
					</button>
					{children}
				</motion.div>
			</motion.div>
		</div>
	);
};

/** Small all-caps line above dialog titles: "✦ Secret 1 of 3 ✦". */
export const Eyebrow: React.FC<React.PropsWithChildren> = ({ children }) => (
	<p className="font-mono text-xs tracking-[0.3em] text-amber-300/80 uppercase">{children}</p>
);

const BUTTON_BASE =
	"inline-flex items-center justify-center gap-2 px-5 py-3 font-medium whitespace-nowrap duration-200 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-100";

export const buttonClass = (variant: "primary" | "ghost" = "primary") =>
	`${BUTTON_BASE} ${
		variant === "primary"
			? "bg-zinc-100 text-zinc-900 hover:bg-white"
			: "border border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:border-zinc-500"
	}`;
