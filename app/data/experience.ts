// Work history, oldest first. Wording follows the CV (Nov 2026): same
// verbs, same tone. Edit the CV first, then mirror it here.
//
// - `outcome`: the one line shown on the closed card. Wrap the key result in
//   **double asterisks** to emphasize it. Real numbers only.
// - `work`: the CV bullets, shown in "Show details".
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
		outcome: "Co-founded a web development agency and grew it to **25 clients**.",
		work: [
			"Managed a multidisciplinary team of junior developers, a designer, and sales professionals across multiple client projects.",
			"Delivered institutional websites for diverse clients using HTML, CSS, jQuery, and Bootstrap, and built MVC applications with PHP (Laravel).",
			"Set up and managed cloud infrastructure: Apache/NGINX servers with LetsEncrypt on AWS EC2 and a branded ownCloud deployment (GalileoCloud) on EC2 + EFS.",
			"Built custom API integrations with major Brazilian management software providers.",
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
			"Co-founded a healthtech startup delivering **smartwatch-based monitoring for elderly care**, from ideation and branding through to launch.",
		work: [
			"Built the entire technical stack: a Node.js API collecting real-time smartwatch health metrics via TCP, a React.js web dashboard, a React Native mobile app (published on Google Play), and an institutional website with PagSeguro payment integration.",
			"Managed design direction, stakeholder communication, and product roadmap as a technical co-founder.",
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
		outcome: "Designed and built a **full inventory management system**.",
		work: [
			"Gathered requirements from managers and employees, then validated UI/UX flows via Figma and Whimsical.",
			"Built the React.js frontend on Vercel and the Node.js API with PostgreSQL on Heroku.",
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
			"Built **high-throughput backend systems** using Node.js workers and microservices in a producer-consumer architecture, processing large data volumes behind a Go-based API gateway.",
		work: [
			"Designed and maintained data pipelines with PostgreSQL triggers, MongoDB collections, and Redis caching layers, and extended API routes in the Go-based gateway.",
			"Established CI/CD delivery pipelines using GitLab (Docker-in-Docker) with deployments to AWS ECS and container images stored in ECR.",
			"Led frontend modernization, delivering a new Vue.js interface aligned with the company design system while maintaining legacy AngularJS applications in parallel.",
			"Raised code quality standards by implementing unit and integration tests with Jest and leading internal training sessions on system architecture, caching strategies, and engineering best practices.",
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
			"Designed and built an intention, reflection, and recommendation engine that **doubled user engagement**, from 0.75 to 1.5 sessions per week.",
		work: [
			"Operated as a core member of a small, autonomous senior engineering team, collaborating directly with the CEO, design, and operations to prioritize features and ship product improvements.",
			"Owned and evolved core platform integrations (Zoom SDK, Circle API, peer-group assignment system), handling bug fixes, version upgrades, and migrations.",
			"The peer-group assignment flow alone replaced a months-long manual process, impacting the entire user base.",
			"Identified and resolved a critical Zoom API bug in partnership with Zoom's engineering team, fixing an issue that had affected the platform for over a year.",
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
			"Mentored 3 aspiring developers from zero programming knowledge to jobs in tech (**3 of 3 now employed**).",
		work: [
			"Built the self-directed learning and problem-solving skills that let them keep growing on their own.",
			"Ran weekly group sessions and 1:1s with an individual plan per mentee, adapting the track to each goal: Python and data, JS/TS full-stack, or English and confidence coaching.",
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
			"As the sole engineer, partnering with the PM, took a presence-based social platform from concept to production, now **live in pilots** with a commercial venue and a municipal government.",
		work: [
			"Architected the codebase from scratch on Next.js and Supabase using vertical-slice and hexagonal architecture, keeping features isolated and the domain independent of infrastructure.",
			"Built the AI matching core: user embeddings (OpenAI, pgvector) and LLM-generated profile narratives (Claude API) to connect people sharing the same event or venue.",
			"Shipped real-time event lobbies with in-lobby messaging on Supabase Realtime.",
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
