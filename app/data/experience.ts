// Work history, oldest first. Source: CV (Nov 2026). Same voice as the CV
// (its verbs and word choices), but short: one idea per bullet, one line if
// possible. The card is for scanning, the CV is for detail.
//
// - `outcome`: the one line shown on the closed card. Wrap the key result in
//   **double asterisks** to emphasize it. Real numbers only.
// - `work`: short bullets shown in "Show details". Don't repeat the outcome.
// - `tags`: the stack (skills for non-engineering roles). The first 4 show on
//   the closed card.
// - `icon`: pixel-art icon key, see app/components/timeline/project-icons.ts.

export type Experience = {
	id: string;
	company: string;
	role: string;
	start: string; // "YYYY-MM"
	end: string; // "YYYY-MM"
	where: string;
	outcome: string;
	work: string[];
	tags: string[];
	icon: "browser" | "watch" | "boxes" | "server" | "tree" | "stars" | "pin";
};

export const experiences: Experience[] = [
	{
		id: "galileosoft",
		company: "GalileoSoft",
		role: "Co-Founder & Lead Engineer",
		start: "2016-01",
		end: "2020-01",
		where: "Maringá, Brazil",
		outcome:
			"Co-founded a web agency and grew it to **25 clients**.",
		work: [
			"Managed a team of junior developers, a designer, and sales across client projects.",
			"Delivered institutional websites and Laravel MVC apps for diverse clients.",
			"Set up the AWS EC2 infrastructure and GalileoCloud, our branded ownCloud on EC2 + EFS.",
			"Built API integrations with major Brazilian management software providers.",
		],
		tags: ["PHP", "Laravel", "jQuery", "Bootstrap", "AWS EC2", "EFS", "NGINX"],
		icon: "browser",
	},
	{
		id: "cuideme",
		company: "CuideMe.Care",
		role: "Co-Founder & Lead Engineer",
		start: "2019-08",
		end: "2021-02",
		where: "Remote",
		outcome:
			"Took a smartwatch-based elderly care product from idea to launch.",
		work: [
			"Built the entire stack: a Node.js API collecting real-time smartwatch metrics via TCP, a React dashboard, and a React Native app on Google Play.",
			"Shipped the institutional website with PagSeguro payments.",
			"Led design direction, stakeholder communication, and the product roadmap as technical co-founder.",
		],
		tags: ["Node.js", "TCP", "React", "React Native", "PagSeguro"],
		icon: "watch",
	},
	{
		id: "kine",
		company: "Kine Climatizações",
		role: "Full Stack Software Engineer",
		start: "2021-03",
		end: "2021-08",
		where: "Freelance",
		outcome:
			"Designed and built their inventory management system, end to end.",
		work: [
			"Gathered requirements from managers and employees, and validated the UI/UX flows in Figma.",
			"Built the React frontend on Vercel and the Node.js + PostgreSQL API on Heroku.",
		],
		tags: ["React", "Node.js", "PostgreSQL", "Vercel", "Heroku", "Figma"],
		icon: "boxes",
	},
	{
		id: "tecnospeed",
		company: "TecnoSpeed TI",
		role: "Full Stack Software Engineer",
		start: "2021-07",
		end: "2023-08",
		where: "Maringá, Brazil",
		outcome:
			"Built high-throughput Node.js services behind a Go API gateway.",
		work: [
			"Designed data pipelines with PostgreSQL triggers, MongoDB, and Redis caching.",
			"Established GitLab CI/CD (Docker-in-Docker) with deployments to AWS ECS.",
			"Led the frontend modernization to Vue.js while maintaining the legacy AngularJS apps.",
			"Raised code quality with Jest tests and led internal training on architecture and caching.",
		],
		tags: ["Node.js", "Go", "PostgreSQL", "MongoDB", "Redis", "Docker", "GitLab CI/CD", "AWS ECS", "Vue.js", "Jest"],
		icon: "server",
	},
	{
		id: "banyan",
		company: "Banyan",
		role: "Senior Software Engineer",
		start: "2024-02",
		end: "2025-04",
		where: "Remote",
		outcome:
			"Built a recommendation engine that **doubled** weekly session attendance, from 0.75 to 1.5.",
		work: [
			"Worked in a small, autonomous senior team, directly with the CEO, design, and operations.",
			"Owned the core integrations (Zoom SDK, Circle API), from bug fixes to upgrades and migrations.",
			"Evolved the peer-group assignment flow, replacing a months-long manual process for the entire user base.",
			"Identified and resolved a year-old Zoom API bug in partnership with Zoom's engineering team.",
		],
		tags: ["React", "GraphQL", "Firestore", "Cloud Functions", "Zoom SDK", "Circle API", "Playwright", "Cypress"],
		icon: "tree",
	},
	{
		id: "mentorship",
		company: "Magnificent Mentorship",
		role: "Software Engineering Mentor",
		start: "2025-07",
		end: "2026-06",
		where: "Remote",
		outcome:
			"Took 3 people from zero code to jobs in tech: **3 of 3** hired.",
		work: [
			"Ran weekly group sessions and 1:1s with an individual plan per mentee.",
			"Adapted each track to the goal: Python and data, JS/TS full-stack, or English and confidence.",
			"Focused on self-directed learning, so they keep growing on their own.",
		],
		tags: ["Mentoring", "1:1s", "Individual Development Plans", "Coaching", "Curriculum Design"],
		icon: "stars",
	},
	{
		id: "sommar",
		company: "Sommar",
		role: "Founding Engineer",
		start: "2025-12",
		end: "2026-09",
		where: "Remote · Contract",
		outcome:
			"Sole engineer on a social app for people at the same place, from concept to **2 live pilots**.",
		work: [
			"Partnered with the PM to take the product from concept to production.",
			"Architected the codebase from scratch on Next.js and Supabase, with vertical-slice and hexagonal architecture.",
			"Built the AI matching core: OpenAI embeddings, pgvector, and Claude-generated profile narratives.",
			"Shipped real-time event lobbies with in-lobby messaging on Supabase Realtime.",
			"Now live in pilots with a commercial venue and a municipal government.",
		],
		tags: ["Next.js", "TypeScript", "Supabase", "pgvector", "Claude API", "OpenAI Embeddings", "Vercel"],
		icon: "pin",
	},
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const parse = (s: string) => s.split("-").map(Number) as [number, number];

export function formatPeriod(e: Experience) {
	const f = (s: string) => {
		const [y, m] = parse(s);
		return `${MONTHS[m - 1]} ${y}`;
	};
	return `${f(e.start)} – ${f(e.end)}`;
}

/** LinkedIn-style duration, counting both the first and last month. */
export function formatDuration(e: Experience) {
	const [sy, sm] = parse(e.start);
	const [ey, em] = parse(e.end);
	const total = (ey - sy) * 12 + (em - sm) + 1;
	const y = Math.floor(total / 12);
	const m = total % 12;
	const parts = [];
	if (y) parts.push(`${y} yr${y > 1 ? "s" : ""}`);
	if (m) parts.push(`${m} mo${m > 1 ? "s" : ""}`);
	return parts.join(" ");
}
