"use client";
import React from "react";
import { SECRETS } from "./config";
import { Dialog } from "./dialog";
import { PrizeContent } from "./prize";
import { SecretsBadge } from "./secrets-badge";
import { useSecrets } from "./secrets-context";
import { ShipFleet } from "./ship-fleet";

/** Everything that floats above the page: badge, dialogs, ships, game. */
export const SecretsLayer: React.FC = () => {
	const { overlay, setOverlay } = useSecrets();
	const close = () => setOverlay(null);

	return (
		<>
			<SecretsBadge />
			<ShipFleet />

			<Dialog open={overlay === "found-name"} onClose={close} labelledBy="secret-1-title">
				<p className="font-mono text-xs tracking-[0.3em] text-amber-300/80 uppercase">
					✦ Secret 1 of {SECRETS.length} ✦
				</p>
				<h2 id="secret-1-title" className="mt-4 text-3xl text-zinc-100 font-display">
					You found the first secret
				</h2>
				<p className="mt-4 text-zinc-400">
					Curious, I like that. There are {SECRETS.length - 1} more secrets
					hidden on this page. Find all of them and you get a special prize.
				</p>
				<p className="mt-4 text-zinc-400">
					Your progress lives in the counter at the top right. Keep your eyes
					on the sky.
				</p>
				<button
					type="button"
					onClick={close}
					className="px-5 py-2.5 mt-8 font-medium duration-200 rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white"
				>
					I'm on it
				</button>
			</Dialog>

			<Dialog open={overlay === "prize"} onClose={close} labelledBy="prize-title">
				<PrizeContent titleId="prize-title" />
			</Dialog>
		</>
	);
};
