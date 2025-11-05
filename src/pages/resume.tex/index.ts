import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { readFile } from "node:fs/promises";

const experience = await getCollection(
	"experience",
	(entry) => entry.data.inResume
);
const projects = await getCollection(
	"projects",
	(entry) => entry.data.inResume
);
const talks = await getCollection(
	"talksAndConferences",
	(entry) => entry.data.inResume
);

type ProjectData = (typeof projects)[number]["data"];

const latexEscape = (text: string) => {
	return text
		.replace(/\^/g, "\\textasciicircum{}")
		.replace(/\\/g, "\\textbackslash{}")
		.replace(/&/g, "\\&")
		.replace(/%/g, "\\%")
		.replace(/\$/g, "\\$")
		.replace(/#/g, "\\#")
		.replace(/_/g, "\\_")
		.replace(/{/g, "\\{")
		.replace(/}/g, "\\}")
		.replace(/~/g, "\\textasciitilde{}");
};

const buildExperience = () => {
	return experience
		.map((exp) => {
			const data = exp.data;
			return `\\resumeSubheading{${latexEscape(data.name)}}{${latexEscape(
				data.position
			)}}{${latexEscape(data.location)}}{${latexEscape(data.years)}}
			\\resumeItemListStart
				${data.description
					.map((item: string) => `\\resumeItem{${latexEscape(item)}}`)
					.join("\n")}
			\\resumeItemListEnd`;
		})
		.join("\n\n");
};

const buildProjects = () => {
	const buildLinks = (data: ProjectData["links"]) =>
		data
			?.map(
				(link) =>
					`\\href{${latexEscape(link.href)}}{${latexEscape(
						link.text
					)}}`
			)
			.join(", ");

	const buildTags = (data: string[]) =>
		`\\emph{${latexEscape(data.join(", "))}}`;
	return projects
		.map((proj) => {
			const data = proj.data;
			return `\\resumeProjectHeading{\\textbf{${latexEscape(
				data.name
			)}} $|$ ${buildLinks(data.links)} $|$  ${buildTags(
				data.tags
			)}}{${latexEscape(data.timeline ?? "")}}
          \\resumeItemListStart
		  	${data.description
				.map((item: string) => `\\resumeItem{${latexEscape(item)}}`)
				.join("\n")}
          \\resumeItemListEnd`;
		})
		.join("\\vspace{-15pt}\n\n");
};

const buildTalks = () => {
	return talks
		.map((talk) => {
			const data = talk.data;
			const dateFormatted = Intl.DateTimeFormat("en-US", {
				month: "short",
				year: "numeric"
			}).format(new Date(data.date));

			const links = data.links
				?.map(
					(link) =>
						`\\href{${latexEscape(link.href)}}{${latexEscape(
							link.text
						)}}`
				)
				.join(", ");

			return `\\resumeItem{\\textbf{${latexEscape(
				data.title
			)}} at ${latexEscape(data.event)} on ${latexEscape(
				dateFormatted
			)} - ${links} }`;
		})
		.join("\n\\vspace{-4pt}\n");
};

const customParser = (text: string) => {
	return text
		.replace("% {{EXPERIENCE}}", buildExperience())
		.replace("% {{PROJECTS}}", buildProjects())
		.replace("% {{TALKS}}", buildTalks());
};

export const buildResume = async () => {
	const base = await readFile("src/pages/resume.tex/_base.tex", "utf-8");
	return customParser(base);
};

export const GET: APIRoute = async ({}) => {
	const resume = await buildResume();

	return new Response(resume, {
		headers: { "Content-Type": "text/plain; charset=utf-8" }
	});
};
