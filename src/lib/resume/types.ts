export interface ResumeLink {
	href: string;
	text: string;
	icon?: string;
}

export interface ResumeLine {
	id: string;
	text: string;
	selected: boolean;
	originalText: string;
}

export interface ResumeBlock {
	id: string;
	type: "experience" | "project" | "talk";
	title: string; // Company name, Project name, or Talk title
	subtitle?: string; // Position, or Talk event
	location?: string;
	period?: string; // Years / timeline / date string
	selected: boolean;
	lines: ResumeLine[];
	tags?: string[];
	links?: ResumeLink[];
}

export interface ResumeSection {
	id: "experience" | "projects" | "talks";
	title: string;
	selected: boolean;
	blocks: ResumeBlock[];
}

export interface ResumeState {
	sections: ResumeSection[];
	lastSaved?: string;
}

export interface RawCollectionData {
	experience: Array<{
		id: number;
		name: string;
		years: string;
		location: string;
		position: string;
		description: string[];
		link: { href: string; text: string };
		inResume?: boolean;
	}>;
	projects: Array<{
		id: number;
		name: string;
		timeline?: string;
		description: string[];
		tags: string[];
		links?: Array<{ icon: string; href: string; text: string }>;
		inResume?: boolean;
	}>;
	talks: Array<{
		id: number;
		event: string;
		title: string;
		date: string | Date;
		links?: Array<{ href: string; text: string }>;
		inResume?: boolean;
	}>;
}
