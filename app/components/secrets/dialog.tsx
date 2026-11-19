"use client";
import { X } from "lucide-react";
import React, { useEffect, useRef } from "react";

type DialogProps = React.PropsWithChildren<{
	open: boolean;
	onClose: () => void;
	labelledBy: string;
	className?: string;
}>;

/** Minimal accessible modal: backdrop click / Esc closes, focus moves inside. */
export const Dialog: React.FC<DialogProps> = ({
	open,
	onClose,
	labelledBy,
	className = "",
	children,
}) => {
	const panel = useRef<HTMLDivElement>(null);
	const lastFocus = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (!open) return;
		lastFocus.current = document.activeElement as HTMLElement | null;
		panel.current?.focus();
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("keydown", onKey);
			lastFocus.current?.focus?.();
		};
	}, [open, onClose]);

	if (!open) return null;
	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-dialog-in"
			onMouseDown={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div
				ref={panel}
				role="dialog"
				aria-modal="true"
				aria-labelledby={labelledBy}
				tabIndex={-1}
				className={`relative w-full max-w-md p-8 border outline-none rounded-2xl border-zinc-700 bg-zinc-950/95 shadow-2xl shadow-black ${className}`}
			>
				<button
					type="button"
					onClick={onClose}
					aria-label="Close"
					className="absolute p-1 duration-200 rounded-md top-3 right-3 text-zinc-500 hover:text-zinc-200"
				>
					<X className="w-5 h-5" />
				</button>
				{children}
			</div>
		</div>
	);
};
