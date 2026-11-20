import {
	Activity,
	Boxes,
	Globe,
	GraduationCap,
	HeartHandshake,
	Server,
	Users,
} from "lucide-react";
import React from "react";
import type { SceneId } from "../../data/experience";

const ICONS: Record<SceneId, React.FC<{ className?: string }>> = {
	agency: Globe,
	smartwatch: Activity,
	inventory: Boxes,
	pipeline: Server,
	engagement: HeartHandshake,
	mentoring: GraduationCap,
	matching: Users,
};

export const CompanyIcon: React.FC<{ scene: SceneId; className?: string }> = ({ scene, className }) => {
	const Icon = ICONS[scene];
	return <Icon className={className} />;
};
