import React from "react";

// Pixel-art sprites written as text, so there are no image assets. Each
// character is one pixel and "." is transparent. Ships face right (0 rad) so
// they can be rotated to their heading.
export type Sprite = {
	rows: string[];
	palette: Record<string, string>;
	/** Pixels that animate: an engine flame flicker, or lights that blink (two phases). */
	animate?: Record<string, "flame" | "blink" | "blink-alt">;
};

/** The quick one. It is also the ship you fly in the meteor game. */
export const NEEDLE: Sprite = {
	rows: [
		"....OOO.........",
		"....OWGO........",
		"....OWWGO.......",
		"..OOOWWWGOOO....",
		"FFOGWWWWWWWWOO..",
		"YFOGWWWWWCCCWWO.",
		"FFOGWWWWWWWWOO..",
		"..OOOWWWGOOO....",
		"....OWWGO.......",
		"....OWGO........",
		"....OOO.........",
	],
	palette: {
		O: "#3f3f46", // outline
		W: "#f4f4f5", // hull
		G: "#a1a1aa", // hull shade
		C: "#38bdf8", // cockpit
		F: "#fb923c", // flame
		Y: "#fde047", // flame core
	},
	animate: { F: "flame", Y: "flame" },
};

/** The slow, heavy one: red wings, orange exhaust, a light on the nose. */
export const RAIDER: Sprite = {
	rows: [
		"..............",
		"..RR..........",
		"..RHH.........",
		"...HHHH.......",
		"..FHHHHHHH....",
		".FFHHCCHHHHH..",
		"FFHHHCCHHHHHHL",
		"FFHHHCCHHHHHHL",
		".FFHHCCHHHHH..",
		"..FHHHHHHH....",
		"...HHHH.......",
		"..RHH.........",
		"..RR..........",
		"..............",
	],
	palette: { R: "#f87171", H: "#e4e4e7", C: "#38bdf8", F: "#fb923c", L: "#fde047" },
	animate: { F: "flame", L: "blink" },
};

/** A flying saucer with its ET at the window. Stays level while it flies. */
export const SAUCER: Sprite = {
	rows: [
		".....DDDDDD.....",
		"....DgeggegD....",
		"...DggeeeeggD...",
		"...DgekeekegD...",
		"...DggeeeeggD...",
		".RRRRRRRRRRRRRR.",
		"HHHHHHHHHHHHHHHH",
		"HYHHZHHYHHZHHYHH",
		".PPPPPPPPPPPPPP.",
		"...PP......PP...",
	],
	palette: {
		D: "#bae6fd", // dome rim
		g: "rgba(186,230,253,0.18)", // dome glass
		e: "#4ade80", // the ET
		k: "#18181b", // its eyes
		R: "#e4e4e7", // hull rim
		H: "#a78bfa", // hull
		P: "#6d28d9", // hull shade
		Y: "#fde047", // lights, phase A
		Z: "#fde047", // lights, phase B
	},
	animate: { Y: "blink", Z: "blink-alt" },
};

const ANIMATION_CLASS = { flame: "pixel-flame", blink: "pixel-blink", "blink-alt": "pixel-blink-alt" };

/** Opaque colors of a sprite, e.g. to paint an explosion in the ship's own colors. */
export function spriteColors(sprite: Sprite): string[] {
	return Object.values(sprite.palette).filter((c) => c.startsWith("#"));
}

export const PixelSprite: React.FC<{ sprite: Sprite; size: number; className?: string }> = ({
	sprite,
	size,
	className,
}) => {
	const w = sprite.rows[0].length;
	const h = sprite.rows.length;
	return (
		<svg
			viewBox={`0 0 ${w} ${h}`}
			width={size}
			height={(size * h) / w}
			shapeRendering="crispEdges"
			className={className}
			aria-hidden="true"
		>
			{sprite.rows.flatMap((row, y) =>
				Array.from(row).map((ch, x) => {
					if (ch === ".") return null;
					const anim = sprite.animate?.[ch];
					return (
						<rect
							key={`${x}-${y}`}
							x={x}
							y={y}
							width={1}
							height={1}
							fill={sprite.palette[ch]}
							className={anim ? ANIMATION_CLASS[anim] : undefined}
						/>
					);
				}),
			)}
		</svg>
	);
};
