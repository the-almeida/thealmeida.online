"use client";
import Link from "next/link";
import React from "react";

export const CenteredNavigation: React.FC = () => {
	return (
		<nav className="py-16 animate-fade-in">
			<div className="flex items-center justify-center gap-4">
				<Link
					href="https://github.com/the-almeida"
					target="_blank"
					className="text-sm md:text-lg duration-500 text-zinc-400 hover:text-zinc-300"
				>
					Projects
				</Link>
				<Link
					href="/contact"
					className="text-sm md:text-lg duration-500 text-zinc-400 hover:text-zinc-300"
				>
					Contact
				</Link>
			</div>
		</nav>
	);
};
