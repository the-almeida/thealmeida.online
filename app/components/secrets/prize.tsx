"use client";
import { CalendarHeart } from "lucide-react";
import React from "react";
import { PRIZE_SCHEDULE_URL, SECRETS } from "./config";
import { Eyebrow, buttonClass } from "./dialog";

/** The final prize, shown right after winning the game and from the counter. */
export const PrizeContent: React.FC<{
	titleId: string;
	/** Called after the booking link opens (in a new tab). */
	onSchedule?: () => void;
}> = ({ titleId, onSchedule }) => (
	<div className="text-center">
		<Eyebrow>
			✦ {SECRETS.length} of {SECRETS.length} secrets found ✦
		</Eyebrow>
		<h2 id={titleId} className="mt-4 text-3xl text-zinc-100 font-display md:text-4xl">
			Curious people move the world forward
		</h2>
		<p className="mt-4 text-zinc-400">
			You poked around, found every secret and beat the game. That kind of curiosity is what
			builds great things, and I want to support it.
		</p>
		<p className="mt-4 text-zinc-200">
			You've won a <strong>free 1-hour mentoring session</strong> with me. Career, code,
			startups, whatever helps you most.
		</p>
		<a
			href={PRIZE_SCHEDULE_URL}
			target="_blank"
			rel="noopener noreferrer"
			onClick={onSchedule}
			data-autofocus
			data-umami-event="prize_schedule_clicked"
			className={`mt-8 ${buttonClass()}`}
		>
			<CalendarHeart className="w-5 h-5" aria-hidden="true" />
			Schedule my session
		</a>
	</div>
);
