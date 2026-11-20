// Work history, oldest first. Source: CV (Nov 2026).

export type SceneId =
	| "agency"
	| "smartwatch"
	| "inventory"
	| "pipeline"
	| "engagement"
	| "mentoring"
	| "matching";

export type Experience = {
	id: string;
	company: string;
	role: string;
	start: string; // "YYYY-MM"
	end: string; // "YYYY-MM"
	where: string;
	/** One-line highlight shown on the collapsed card. */
	highlight: string;
	/** "Mission": the context in one or two sentences. */
	mission: string;
	shipped: string[];
	/** Headline result, shown big. */
	impact: { value: string; label: string };
	stack: string[];
	founder?: boolean;
	scene: SceneId;
	/** Planet colors for option 2 (from, to). */
	colors: [string, string];
};

export const experiences: Experience[] = [
	{
		id: "galileosoft",
		company: "GalileoSoft",
		role: "Co-Founder & Lead Engineer",
		start: "2016-01",
		end: "2020-01",
		where: "Maringá, Brazil",
		highlight: "Co-founded a web agency and grew it to 25 clients.",
		mission:
			"Build a web agency from zero while still in university, and lead a team of junior developers, a designer and sales.",
		shipped: [
			"Institutional websites and PHP (Laravel) MVC apps for diverse clients",
			"GalileoCloud: a branded ownCloud deployment on AWS EC2 + EFS",
			"Custom integrations with major Brazilian management software providers",
		],
		impact: { value: "25", label: "clients served" },
		stack: ["PHP", "Laravel", "jQuery", "Bootstrap", "AWS EC2", "NGINX"],
		founder: true,
		scene: "agency",
		colors: ["#60a5fa", "#1e3a8a"],
	},
	{
		id: "cuideme",
		company: "CuideMe.Care",
		role: "Co-Founder & Lead Engineer",
		start: "2019-08",
		end: "2021-02",
		where: "Remote",
		highlight: "Smartwatch-based monitoring for elderly care, from idea to launch.",
		mission:
			"Give families peace of mind: watch an elderly relative's health in real time through a smartwatch.",
		shipped: [
			"Node.js API ingesting real-time smartwatch health metrics over TCP",
			"React web dashboard and a React Native app on Google Play",
			"Institutional website with PagSeguro payments",
		],
		impact: { value: "0 → 1", label: "healthtech product launched" },
		stack: ["Node.js", "TCP", "React", "React Native", "PagSeguro"],
		founder: true,
		scene: "smartwatch",
		colors: ["#f87171", "#7f1d1d"],
	},
	{
		id: "kine",
		company: "Kine Climatizações",
		role: "Full Stack Software Engineer",
		start: "2021-03",
		end: "2021-08",
		where: "Freelance",
		highlight: "Designed and built a full inventory management system.",
		mission:
			"Replace spreadsheets with a system the managers and the field team would actually use.",
		shipped: [
			"Requirements gathered with managers and employees, flows validated in Figma and Whimsical",
			"React frontend on Vercel, Node.js API with PostgreSQL on Heroku",
		],
		impact: { value: "1", label: "system replacing spreadsheets" },
		stack: ["React", "Node.js", "PostgreSQL", "Vercel", "Heroku", "Figma"],
		scene: "inventory",
		colors: ["#34d399", "#064e3b"],
	},
	{
		id: "tecnospeed",
		company: "TecnoSpeed TI",
		role: "Full Stack Software Engineer",
		start: "2021-07",
		end: "2023-08",
		where: "Maringá, Brazil",
		highlight: "High-throughput Node.js workers behind a Go API gateway.",
		mission:
			"Process large data volumes reliably, and modernize the frontend without stopping the legacy apps.",
		shipped: [
			"Producer-consumer microservices with Node.js workers and a Go gateway",
			"Data pipelines with PostgreSQL triggers, MongoDB and Redis caching",
			"GitLab CI/CD (Docker-in-Docker) deploying to AWS ECS",
			"A new Vue.js interface alongside legacy AngularJS",
		],
		impact: { value: "CI/CD", label: "from GitLab to AWS ECS, built from scratch" },
		stack: ["Node.js", "Go", "PostgreSQL", "MongoDB", "Redis", "Docker", "AWS ECS", "Vue.js", "Jest"],
		scene: "pipeline",
		colors: ["#fbbf24", "#78350f"],
	},
	{
		id: "banyan",
		company: "Banyan",
		role: "Senior Software Engineer",
		start: "2024-02",
		end: "2025-04",
		where: "Remote",
		highlight: "Built a recommendation engine that doubled user engagement.",
		mission:
			"Small senior team working directly with the CEO: get members to show up to more peer sessions.",
		shipped: [
			"Intention, reflection and recommendation engine",
			"Peer-group assignment flow that replaced a months-long manual process",
			"Fixed a year-old Zoom API bug together with Zoom's engineers",
		],
		impact: { value: "2×", label: "sessions per week (0.75 → 1.5)" },
		stack: ["React", "GraphQL", "Firestore", "Cloud Functions", "Zoom SDK", "Playwright", "Cypress"],
		scene: "engagement",
		colors: ["#a78bfa", "#3b0764"],
	},
	{
		id: "mentorship",
		company: "Magnificent Mentorship",
		role: "Software Engineering Mentor",
		start: "2025-07",
		end: "2026-06",
		where: "Remote",
		highlight: "Took 3 people from zero code to jobs in tech.",
		mission:
			"Turn complete beginners into self-directed developers, with a plan built around each person's goal.",
		shipped: [
			"Weekly group sessions and 1:1s",
			"Individual tracks: Python and data, JS/TS full-stack, English and confidence",
		],
		impact: { value: "3 / 3", label: "mentees now employed" },
		stack: ["Mentoring", "1:1s", "Development plans", "Curriculum design"],
		scene: "mentoring",
		colors: ["#2dd4bf", "#134e4a"],
	},
	{
		id: "sommar",
		company: "Sommar",
		role: "Founding Engineer",
		start: "2025-12",
		end: "2026-09",
		where: "Remote, Contract",
		highlight: "Sole engineer: a presence-based social platform, concept to pilots.",
		mission:
			"Connect people who are in the same place at the same time, starting with a venue and a city government.",
		shipped: [
			"Vertical-slice + hexagonal architecture on Next.js and Supabase",
			"AI matching: pgvector embeddings and Claude-written profile narratives",
			"Real-time event lobbies with in-lobby messaging",
		],
		impact: { value: "2", label: "live pilots: a venue and a municipality" },
		stack: ["Next.js", "TypeScript", "Supabase", "pgvector", "Claude API", "OpenAI", "Vercel"],
		scene: "matching",
		colors: ["#f472b6", "#831843"],
	},
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatPeriod(e: Experience) {
	const f = (s: string) => {
		const [y, m] = s.split("-").map(Number);
		return `${MONTHS[m - 1]} ${y}`;
	};
	return `${f(e.start)} – ${f(e.end)}`;
}

export function durationMonths(e: Experience) {
	const [sy, sm] = e.start.split("-").map(Number);
	const [ey, em] = e.end.split("-").map(Number);
	return (ey - sy) * 12 + (em - sm) + 1;
}
