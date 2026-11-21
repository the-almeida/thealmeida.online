"use client";
import { AnimatePresence, LayoutGroup } from "framer-motion";
import React, { useCallback } from "react";
import { SECRETS } from "./config";
import { Dialog, Eyebrow, buttonClass } from "./dialog";
import { GameOverlay } from "./game/game-overlay";
import { PrizeContent } from "./prize";
import { HUD_LAYOUT_ID, SecretsBadge } from "./secrets-badge";
import { useSecrets } from "./secrets-context";
import { ShipFleet } from "./ship-fleet";
import { Visitor, VisitorContent } from "./visitor";

/** Everything that floats above the page: counter, dialogs, ships, game. */
export const SecretsLayer: React.FC = () => {
	const { ready, found, markFound, overlay, setOverlay } = useSecrets();
	const close = useCallback(() => setOverlay(null), [setOverlay]);
	const openGame = useCallback(() => setOverlay("game"), [setOverlay]);
	const catchShip = useCallback(() => {
		markFound("ship");
		openGame();
	}, [markFound, openGame]);
	const catchVisitor = useCallback(() => setOverlay("visitor"), [setOverlay]);

	return (
		<LayoutGroup>
			<ShipFleet onCatch={catchShip} />
			<Visitor onCatch={catchVisitor} />
			<GameOverlay />

			{/* Hidden while the intro is open, so the intro card can morph into it. */}
			<AnimatePresence>
				{ready && found.length > 0 && overlay !== "intro" ? <SecretsBadge key="badge" onPlay={openGame} /> : null}
			</AnimatePresence>

			<AnimatePresence>
				{overlay === "intro" ? (
					<Dialog key="intro" onClose={close} labelledBy="secret-intro-title" layoutId={HUD_LAYOUT_ID}>
						<Eyebrow>✦ Secret 1 of {SECRETS.length} ✦</Eyebrow>
						<h2 id="secret-intro-title" className="mt-4 text-3xl text-zinc-100 font-display">
							You found a secret!
						</h2>
						<p className="mt-4 text-zinc-400">
							Curious, I like that. There are {SECRETS.length - 1} more hidden on this page. Find
							them all and you get a <strong className="text-zinc-200">special prize</strong>.
						</p>
						<p className="mt-3 text-sm italic text-zinc-500">Hint: keep your eyes on the sky.</p>
						<button type="button" onClick={close} data-autofocus className={`mt-8 ${buttonClass()}`}>
							Challenge accepted
						</button>
					</Dialog>
				) : null}

				{overlay === "prize" ? (
					<Dialog key="prize" onClose={close} labelledBy="prize-title">
						<PrizeContent titleId="prize-title" />
					</Dialog>
				) : null}

				{overlay === "visitor" ? (
					<Dialog key="visitor" onClose={close} labelledBy="visitor-title">
						<VisitorContent titleId="visitor-title" onClose={close} />
					</Dialog>
				) : null}
			</AnimatePresence>
		</LayoutGroup>
	);
};
