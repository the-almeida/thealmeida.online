import React from "react";

// Tiny pixel-art sprites drawn as SVG rects. Each char is one pixel; "." is
// transparent. Sprites point to the right (0 rad) so they can be rotated to
// the direction of travel.
export type Sprite = { rows: string[]; palette: Record<string, string> };

export const FAST_SHIP: Sprite = {
	rows: [
		"..............",
		"..aa..........",
		"..abb.........",
		"...bbbb.......",
		"..cbbbbbbb....",
		".ccbbwwbbbbb..",
		"ccbbbwwbbbbbbd",
		"ccbbbwwbbbbbbd",
		".ccbbwwbbbbb..",
		"..cbbbbbbb....",
		"...bbbb.......",
		"..abb.........",
		"..aa..........",
		"..............",
	],
	palette: { a: "#f87171", b: "#e4e4e7", c: "#fb923c", w: "#38bdf8", d: "#fde047" },
};

export const SLOW_SHIP: Sprite = {
	rows: [
		"..............",
		".....gggg.....",
		"....gwwwwg....",
		"....gwwwwg....",
		"..hhhhhhhhhh..",
		".hhkkhhhhkkhh.",
		"hhhhhhhhhhhhhh",
		".hhhhhhhhhhhh.",
		"..yy..yy..yy..",
		"..............",
	],
	palette: { g: "#a1a1aa", w: "#86efac", h: "#c084fc", k: "#fde047", y: "#fbbf24" },
};

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
				Array.from(row).map((ch, x) =>
					ch === "." ? null : (
						<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={sprite.palette[ch]} />
					),
				),
			)}
		</svg>
	);
};
