// Work history, oldest first. Source: CV (Nov 2026).
//
// Writing rules for this file:
// - `outcome` is the one line a recruiter reads. Lead with the result; wrap
//   real numbers in **double asterisks** to emphasize them. No fake metrics.
// - `context` answers "what was this place and what was my scope?" in one or
//   two sentences. Skip it when the outcome already says it.
// - `work` lists what I built or led, starting with a verb or the thing built.
// - `tags` is the stack (or skills, for non-engineering roles).

export type Experience = {
	id: string;
	company: string;
	role: string;
	start: string; // "YYYY-MM"
	end: string; // "YYYY-MM"
	where: string;
	outcome: string;
	context?: string;
	work: string[];
	tags: string[];
};

export const experiences: Experience[] = [
	{
		id: "galileosoft",
		company: "GalileoSoft",
		role: "Co-Founder & Lead Engineer",
		start: "2016-01",
		end: "2020-01",
		where: "Maringá, Brazil",
		outcome: "Co-founded a web agency and grew it to **25 clients**.",
		context:
			"I ran engineering and the team: junior developers, a designer and sales, across several client projects at once.",
		work: [
			"Institutional websites and Laravel MVC apps for clients in different industries",
			"Infrastructure on AWS EC2 with NGINX/Apache and Let's Encrypt, plus GalileoCloud, our branded ownCloud on EC2 + EFS",
			"Integrations with major Brazilian management software providers",
		],
		tags: ["PHP", "Laravel", "jQuery", "Bootstrap", "AWS EC2", "EFS", "NGINX"],
	},
	{
		id: "cuideme",
		company: "CuideMe.Care",
		role: "Co-Founder & Lead Engineer",
		start: "2019-08",
		end: "2021-02",
		where: "Remote",
		outcome: "Took a smartwatch-based elderly care product from idea to launch.",
		context:
			"A healthtech startup monitoring elderly people's health in real time. Besides building the whole stack, I owned design direction and the roadmap.",
		work: [
			"Node.js API receiving live health metrics from the watches over TCP",
			"React web dashboard and a React Native app published on Google Play",
			"Website with PagSeguro payments",
		],
		tags: ["Node.js", "TCP", "React", "React Native", "PagSeguro"],
	},
	{
		id: "kine",
		company: "Kine Climatizações",
		role: "Full Stack Engineer",
		start: "2021-03",
		end: "2021-08",
		where: "Freelance",
		outcome: "Designed and built their inventory management system, end to end.",
		work: [
			"Gathered requirements with managers and staff, and validated the flows in Figma and Whimsical before writing code",
			"React frontend on Vercel, Node.js API with PostgreSQL on Heroku",
		],
		tags: ["React", "Node.js", "PostgreSQL", "Vercel", "Heroku", "Figma"],
	},
	{
		id: "tecnospeed",
		company: "TecnoSpeed TI",
		role: "Full Stack Engineer",
		start: "2021-07",
		end: "2023-08",
		where: "Maringá, Brazil",
		outcome: "Built high-throughput Node.js services behind a Go API gateway.",
		work: [
			"Producer-consumer microservices and workers for large data volumes, and new routes in the Go gateway",
			"Data pipelines with PostgreSQL triggers, MongoDB and Redis caching",
			"CI/CD with GitLab (Docker-in-Docker) deploying to AWS ECS",
			"Led the new Vue.js interface while keeping the AngularJS apps running",
			"Introduced unit and integration tests with Jest, and ran internal training on architecture and caching",
		],
		tags: ["Node.js", "Go", "PostgreSQL", "MongoDB", "Redis", "Docker", "GitLab CI", "AWS ECS", "Vue.js", "Jest"],
	},
	{
		id: "banyan",
		company: "Banyan",
		role: "Senior Software Engineer",
		start: "2024-02",
		end: "2025-04",
		where: "Remote",
		outcome: "Built a recommendation engine that **doubled** weekly session attendance, from 0.75 to 1.5.",
		context: "Small, autonomous senior team deciding what to build directly with the CEO, design and operations.",
		work: [
			"The intention, reflection and recommendation engine behind that jump",
			"A peer-group assignment flow that replaced a months-long manual process for the whole user base",
			"Owned the Zoom SDK and Circle API integrations: fixes, upgrades and migrations",
			"Found a Zoom API bug that had hit the platform for over a year, and fixed it with Zoom's engineers",
		],
		tags: ["React", "GraphQL", "Firestore", "Cloud Functions", "Zoom SDK", "Playwright", "Cypress"],
	},
	{
		id: "mentorship",
		company: "Magnificent Mentorship",
		role: "Software Engineering Mentor",
		start: "2025-07",
		end: "2026-06",
		where: "Remote",
		outcome: "Took 3 people from zero code to jobs in tech: **3 of 3** hired.",
		work: [
			"Weekly group sessions plus 1:1s, with a plan built around each person's goal",
			"Three different tracks: Python and data, JS/TS full-stack, and English and confidence",
			"Focused on self-directed learning, so they keep growing without me",
		],
		tags: ["Mentoring", "1:1s", "Development plans", "Curriculum design"],
	},
	{
		id: "sommar",
		company: "Sommar",
		role: "Founding Engineer",
		start: "2025-12",
		end: "2026-09",
		where: "Remote · Contract",
		outcome: "Sole engineer on a social app for people at the same place, from concept to **2 live pilots**.",
		context: "I partnered with the PM and built the product from an empty repo.",
		work: [
			"Architecture on Next.js and Supabase with vertical slices and hexagonal design, so features stay isolated and the domain stays free of infrastructure",
			"AI matching: user embeddings with OpenAI and pgvector, and profile narratives written by the Claude API",
			"Real-time event lobbies with in-lobby messaging on Supabase Realtime",
			"Pilots live with a commercial venue and a municipal government",
		],
		tags: ["Next.js", "TypeScript", "Supabase", "pgvector", "Claude API", "OpenAI", "Vercel"],
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
