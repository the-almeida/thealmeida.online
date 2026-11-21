"use client";
import { useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { track } from "../umami";
import { VISITOR_BOUNCES, VISITOR_EVERY_MS, VISITOR_LINES, VISITOR_SPEED, WHATSAPP_URL } from "./config";
import { Eyebrow, buttonClass } from "./dialog";
import { bounce } from "./flight";
import { SAUCER } from "./pixel-art";
import { useSecrets } from "./secrets-context";
import { Flyer, Sky } from "./sky";

const SIZE = 64;
const CATCH_DELAY_MS = 450;
/** The glow changes on every wall hit, like the old DVD logo. */
const GLOWS = ["rgba(167,139,250,0.6)", "rgba(74,222,128,0.6)", "rgba(56,189,248,0.6)", "rgba(252,211,77,0.6)"];

const between = ([a, b]: [number, number]) => a + Math.random() * (b - a);

/** Hands out every line once, in random order, before repeating any. */
function useLineBag(lines: string[]) {
	const bag = useRef<string[]>([]);
	return useCallback(() => {
		if (bag.current.length === 0) bag.current = [...lines].sort(() => Math.random() - 0.5);
		return bag.current.pop()!;
	}, [lines]);
}

/**
 * After secret #2, an ET drops by every now and then, bouncing off the
 * walls a few times before leaving, with a line to share. Purely for fun, so
 * it stays home when the visitor prefers reduced motion.
 */
export const Visitor: React.FC<{ onCatch: () => void }> = ({ onCatch }) => {
	const { ready, isFound, overlay } = useSecrets();
	const reducedMotion = useReducedMotion() ?? false;
	const enabled = ready && isFound("ship") && overlay === null && !reducedMotion;
	const [flyers, setFlyers] = useState<Flyer[]>([]);
	const visits = useRef(0);
	const caught = useRef(false);
	const nextLine = useLineBag(VISITOR_LINES);
	const empty = flyers.length === 0;

	useEffect(() => {
		if (!enabled) {
			setFlyers([]);
			return;
		}
		if (!empty) return;
		const t = window.setTimeout(() => {
			caught.current = false;
			setFlyers([
				{
					id: `visitor-${++visits.current}`,
					sprite: SAUCER,
					size: SIZE,
					orientation: "level",
					route: bounce({
						speed: VISITOR_SPEED,
						bounces: Math.round(between(VISITOR_BOUNCES)),
						radius: SIZE / 2 + 8,
					}),
					label: "An ET dropped by to say something. Catch it!",
					glow: GLOWS,
					lines: [nextLine()],
				},
			]);
		}, between(VISITOR_EVERY_MS));
		return () => window.clearTimeout(t);
	}, [enabled, empty, nextLine]);

	const onDone = useCallback(() => setFlyers([]), []);
	const onHit = useCallback(() => {
		if (caught.current) return;
		caught.current = true;
		track("visitor_caught");
		setFlyers([]);
		window.setTimeout(onCatch, CATCH_DELAY_MS);
	}, [onCatch]);

	return <Sky flyers={flyers} onDone={onDone} onHit={onHit} />;
};

/** What the visitor says once caught: nothing was hidden, so come say hi. */
export const VisitorContent: React.FC<{ titleId: string; onClose: () => void }> = ({ titleId, onClose }) => (
	<div className="text-center">
		<Eyebrow>✦ Close encounter ✦</Eyebrow>
		<h2 id={titleId} className="mt-4 text-3xl text-balance text-zinc-100 font-display">
			You found what was never lost
		</h2>
		<p className="mt-4 text-zinc-400">
			No secret this time: this little one was never hiding, and neither am I. If you made it
			this far, we'd probably get along.
		</p>
		<p className="mt-4 text-zinc-200">Why not send me a hi?</p>
		<div className="flex flex-col gap-3 mt-8">
			<a
				href={WHATSAPP_URL}
				target="_blank"
				rel="noopener noreferrer"
				data-autofocus
				data-umami-event="visitor_whatsapp_clicked"
				className={buttonClass()}
			>
				<MessageCircle className="w-5 h-5" aria-hidden="true" />
				Say hi on WhatsApp
			</a>
			<button type="button" onClick={onClose} className={buttonClass("ghost")}>
				Back to the stars
			</button>
		</div>
	</div>
);
