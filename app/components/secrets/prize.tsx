"use client";
import { CalendarCheck } from "lucide-react";
import React from "react";
import { PRIZE_SCHEDULE_URL } from "./config";

/** Shared content for the final prize (shown in the game and from the badge). */
export const PrizeContent: React.FC<{
	titleId: string;
	onSchedule?: () => void;
}> = ({ titleId, onSchedule }) => (
	<div className="text-center">
		<p className="font-mono text-xs tracking-[0.3em] text-amber-300/80 uppercase">
			✦ 3 of 3 secrets found ✦
		</p>
		<h2
			id={titleId}
			className="mt-4 text-3xl text-zinc-100 font-display md:text-4xl"
		>
			Curious people move the world forward
		</h2>
		<p className="mt-4 text-zinc-400">
			You poked around, found every secret and beat the game. That kind of
			curiosity is what builds great things, and I want to support it.
		</p>
		<p className="mt-4 text-zinc-200">
			You've won a <strong>free 1-hour mentoring session</strong> with me.
			Career, code, startups, whatever helps you most.
		</p>
		<a
			href={PRIZE_SCHEDULE_URL}
			target="_blank"
			rel="noopener noreferrer"
			onClick={onSchedule}
			className="inline-flex items-center gap-2 px-5 py-3 mt-8 font-medium duration-200 rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white"
		>
			<CalendarCheck className="w-5 h-5" />
			Schedule my session
		</a>
	</div>
);
