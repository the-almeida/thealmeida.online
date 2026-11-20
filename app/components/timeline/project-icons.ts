import type { Experience } from "../../data/experience";
import type { Sprite } from "../secrets/pixel-art";

// 12x12 pixel icons, one per project, in the site's palette: light and dim
// zinc with a single sun-amber accent (the same amber as the timeline stars).
const palette = { a: "#d4d4d8", b: "#71717a", c: "#fcd34d" };

export const PROJECT_ICONS: Record<Experience["icon"], Sprite> = {
	// GalileoSoft: a website
	browser: {
		palette,
		rows: [
			"............",
			".aaaaaaaaaa.",
			".acbcbbbbba.",
			".aaaaaaaaaa.",
			".a........a.",
			".a.bbbb...a.",
			".a........a.",
			".a.bbbbbb.a.",
			".a........a.",
			".a.bbbbb..a.",
			".aaaaaaaaaa.",
			"............",
		],
	},
	// CuideMe.Care: a smartwatch with a heart
	watch: {
		palette,
		rows: [
			"....bbbb....",
			"....bbbb....",
			"...aaaaaa...",
			"..a......a..",
			"..acc.cc.a..",
			"..accccc.ab.",
			"..a.ccc..a..",
			"..a..c...a..",
			"..a......a..",
			"...aaaaaa...",
			"....bbbb....",
			"....bbbb....",
		],
	},
	// Kine: inventory boxes on a shelf
	boxes: {
		palette,
		rows: [
			"............",
			"...aaaaaa...",
			"...a.cc.a...",
			"...a....a...",
			"...aaaaaa...",
			".aaaaa.aaaaa",
			".a.c.a.a.c.a",
			".a...a.a...a",
			".a...a.a...a",
			".aaaaa.aaaaa",
			"bbbbbbbbbbbb",
			"............",
		],
	},
	// TecnoSpeed: a server rack
	server: {
		palette,
		rows: [
			"............",
			".aaaaaaaaaa.",
			".a.c.bbbbba.",
			".aaaaaaaaaa.",
			".a.c.bbbbba.",
			".aaaaaaaaaa.",
			".a.c.bbbbba.",
			".aaaaaaaaaa.",
			"......a.....",
			"...aaaaaa...",
			"............",
			"............",
		],
	},
	// Banyan: a banyan tree, aerial roots included
	tree: {
		palette,
		rows: [
			"...aa..aa...",
			"..aaaaaaaaa.",
			".aaaaaaacaaa",
			"aaaaaaaaaaa.",
			".aacaaaaaaa.",
			"..aaaaaaaa..",
			"....bbbb....",
			"..b.bbbb.b..",
			"..b.bbbb.b..",
			"..b..bb..b..",
			".bbb.bb.bbb.",
			"............",
		],
	},
	// Mentorship: three stars, each one brighter and higher
	stars: {
		palette,
		rows: [
			"............",
			".........c..",
			"........ccc.",
			".........c..",
			"......a.....",
			".....aaa....",
			"......a.....",
			"...b........",
			"..bbb.......",
			"...b........",
			"............",
			"............",
		],
	},
	// Sommar: a location pin with a sun inside
	pin: {
		palette,
		rows: [
			"....aaaa....",
			"...aaaaaa...",
			"..aaaccaaa..",
			"..aaccccaa..",
			"..aaccccaa..",
			"..aaaccaaa..",
			"...aaaaaa...",
			"....aaaa....",
			".....aa.....",
			".....aa.....",
			"..bbbbbbbb..",
			"............",
		],
	},
};
