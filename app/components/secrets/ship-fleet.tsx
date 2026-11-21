"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	BADGE_PULSE_EVENT,
	FAST_SHIP_SPEED,
	SAUCER_APEX_SLOWDOWN,
	SAUCER_FLIGHT_MS,
	SAUCER_TAUNTS,
	SLOW_SHIP_SPEED,
	TAUNT_EVERY_MS,
	WAVE_GAP_MS,
	WAVE_ROAM_MS,
} from "./config";
import { arc, wander } from "./flight";
import { NEEDLE, RAIDER, SAUCER } from "./pixel-art";
import { useSecrets } from "./secrets-context";
import { Flyer, Sky } from "./sky";

/** Let the explosion play before the game covers the page. */
const CATCH_DELAY_MS = 450;

/** Where the saucer docks: the middle of the secrets counter. */
function counterCenter() {
	const r = document.querySelector("[data-secrets-badge]")?.getBoundingClientRect();
	return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
}

function wave(n: number): Flyer[] {
	return [
		{
			id: `${n}-needle`,
			sprite: NEEDLE,
			size: 64,
			orientation: "heading",
			route: wander({ speed: FAST_SHIP_SPEED, roam: WAVE_ROAM_MS / 1000, turn: 2.6 }),
			label: "A fast spaceship. Catch it!",
			glow: ["rgba(56,189,248,0.5)"],
		},
		{
			id: `${n}-raider`,
			sprite: RAIDER,
			size: 56,
			orientation: "heading",
			route: wander({ speed: SLOW_SHIP_SPEED, roam: WAVE_ROAM_MS / 1000, turn: 1.8 }),
			label: "A slow red spaceship. Catch it!",
			glow: ["rgba(251,146,60,0.55)"],
		},
		{
			id: `${n}-saucer`,
			sprite: SAUCER,
			size: 72,
			orientation: "level",
			route: arc({
				duration: SAUCER_FLIGHT_MS / 1000,
				apexSlowdown: SAUCER_APEX_SLOWDOWN,
				target: counterCenter,
				onDock: () => window.dispatchEvent(new Event(BADGE_PULSE_EVENT)),
			}),
			label: "A flying saucer with an ET daring you to click. Catch it!",
			glow: ["rgba(167,139,250,0.6)"],
			lines: SAUCER_TAUNTS,
			lineEvery: TAUNT_EVERY_MS,
		},
	];
}

/**
 * Secret #2. Once the name is found, waves of three ships cross the sky: a
 * fast one and a slow one roaming at random, and the ET's saucer on an easy
 * arc into the counter. Catching any of them unlocks the secret.
 */
export const ShipFleet: React.FC<{ onCatch: () => void }> = ({ onCatch }) => {
	const { ready, isFound, overlay } = useSecrets();
	const enabled = ready && isFound("name") && !isFound("ship") && overlay === null;
	const [flyers, setFlyers] = useState<Flyer[]>([]);
	const waves = useRef(0);
	const caught = useRef(false);
	const empty = flyers.length === 0;

	useEffect(() => {
		if (!enabled) {
			setFlyers([]);
			return;
		}
		if (!empty) return;
		const t = window.setTimeout(() => {
			caught.current = false;
			setFlyers(wave(++waves.current));
		}, WAVE_GAP_MS);
		return () => window.clearTimeout(t);
	}, [enabled, empty]);

	const onDone = useCallback((id: string) => setFlyers((f) => f.filter((x) => x.id !== id)), []);
	const onHit = useCallback(() => {
		if (caught.current) return;
		caught.current = true;
		setFlyers([]);
		window.setTimeout(onCatch, CATCH_DELAY_MS);
	}, [onCatch]);

	return <Sky flyers={flyers} onDone={onDone} onHit={onHit} />;
};
