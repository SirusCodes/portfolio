import { file } from "astro/loaders";
import { defineCollection, z } from "astro:content";
import yaml from "js-yaml";
import { time } from "node:console";

const customParser = (content: string): any[] => {
	const data = yaml.load(content) as any[];

	return data.map((item, index) => ({
		...item,
		id: index
	}));
};

const experience = defineCollection({
	loader: file("src/data/experience.yaml", {
		parser: customParser
	}),
	schema: z.object({
		id: z.number(),
		name: z.string(),
		years: z.string(),
		location: z.string(),
		position: z.string(),
		image: z.object({
			src: z.string(),
			alt: z.string()
		}),
		description: z.array(z.string()),
		link: z.object({
			href: z.string().url(),
			text: z.string()
		}),
		inResume: z.boolean().optional().default(false)
	})
});

const projects = defineCollection({
	loader: file("src/data/projects.yaml", {
		parser: customParser
	}),
	schema: z.object({
		id: z.number(),
		name: z.string(),
		timeline: z.string().optional(),
		description: z.array(z.string()),
		tags: z.array(z.string()),
		image: z
			.object({
				src: z.string(),
				alt: z.string()
			})
			.optional(),
		links: z
			.array(
				z.object({
					icon: z.string(),
					href: z.string(),
					text: z.string()
				})
			)
			.optional(),
		inResume: z.boolean().optional().default(false)
	})
});

export const collections = { experience, projects };
