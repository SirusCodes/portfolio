import type { ResumeSection, ResumeBlock, ResumeLine } from "./types";

export const latexEscape = (text: string): string => {
	return text
		.replace(/\\/g, "\\textbackslash{}")
		.replace(/\^/g, "\\textasciicircum{}")
		.replace(/&/g, "\\&")
		.replace(/%/g, "\\%")
		.replace(/\$/g, "\\$")
		.replace(/#/g, "\\#")
		.replace(/_/g, "\\_")
		.replace(/{/g, "\\{")
		.replace(/}/g, "\\}")
		.replace(/~/g, "\\textasciitilde{}");
};

export const parseLatexBold = (text: string): string => {
	// First protect any markdown bold, escape special latex chars in text, and then convert **...** to \textbf{...}
	const parts = text.split(/(\*\*.*?\*\*)/g);
	return parts
		.map((part) => {
			if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
				const inner = part.slice(2, -2);
				return `\\textbf{${latexEscape(inner)}}`;
			}
			return latexEscape(part);
		})
		.join("");
};

export const buildExperienceLatex = (blocks: ResumeBlock[]): string => {
	return blocks
		.filter((block) => block.selected)
		.map((block) => {
			const activeLines = block.lines.filter((l) => l.selected);
			const items = activeLines.length > 0
				? `\\resumeItemListStart\n${activeLines
						.map((item) => `\t\t\t\t\\resumeItem{${parseLatexBold(item.text)}}`)
						.join("\n")}\n\\resumeItemListEnd`
				: "";

			return `\\resumeSubheading{${latexEscape(block.title)}}{${latexEscape(
				block.subtitle ?? ""
			)}}{${latexEscape(block.location ?? "")}}{${latexEscape(
				block.period ?? ""
			)}}\n${items}`;
		})
		.filter(Boolean)
		.join("\n\n");
};

export const buildProjectsLatex = (blocks: ResumeBlock[]): string => {
	return blocks
		.filter((block) => block.selected)
		.map((block) => {
			const activeLines = block.lines.filter((l) => l.selected);
			const linksFormatted = (block.links ?? [])
				.map(
					(link) =>
						`\\href{${latexEscape(link.href)}}{${latexEscape(link.text)}}`
				)
				.join(", ");

			const tagsFormatted = (block.tags ?? []).length > 0
				? `\\emph{${latexEscape((block.tags ?? []).join(", "))}}`
				: "";

			const headingMiddle = [linksFormatted, tagsFormatted]
				.filter(Boolean)
				.join(" $|$ ");

			const headingPart = headingMiddle
				? ` $|$ ${headingMiddle}`
				: "";

			const items = activeLines.length > 0
				? `\\resumeItemListStart\n${activeLines
						.map((item) => `\t\t\t\\resumeItem{${parseLatexBold(item.text)}}`)
						.join("\n")}\n\\resumeItemListEnd`
				: "";

			return `\\resumeProjectHeading{\\textbf{${latexEscape(
				block.title
			)}}${headingPart}}{${latexEscape(block.period ?? "")}}\n${items}`;
		})
		.filter(Boolean)
		.join("\\vspace{-15pt}\n\n");
};

export const buildTalksLatex = (blocks: ResumeBlock[]): string => {
	return blocks
		.filter((block) => block.selected)
		.map((block) => {
			const linksFormatted = (block.links ?? [])
				.map(
					(link) =>
						`\\href{${latexEscape(link.href)}}{${latexEscape(link.text)}}`
				)
				.join(", ");

			const linksPart = linksFormatted ? ` - ${linksFormatted}` : "";

			return `\\resumeItem{\\textbf{${latexEscape(
				block.title
			)}} at ${latexEscape(block.subtitle ?? "")} on ${latexEscape(
				block.period ?? ""
			)}${linksPart} }`;
		})
		.filter(Boolean)
		.join("\n\\vspace{-4pt}\n");
};

export const generateResumeLatex = (
	sections: ResumeSection[],
	baseTemplate: string
): string => {
	const experienceSection = sections.find((s) => s.id === "experience");
	const projectsSection = sections.find((s) => s.id === "projects");
	const talksSection = sections.find((s) => s.id === "talks");

	const expLatex = experienceSection && experienceSection.selected
		? buildExperienceLatex(experienceSection.blocks)
		: "";

	const projLatex = projectsSection && projectsSection.selected
		? buildProjectsLatex(projectsSection.blocks)
		: "";

	const talksLatex = talksSection && talksSection.selected
		? buildTalksLatex(talksSection.blocks)
		: "";

	let result = baseTemplate;

	// If a section is unselected or has no items, clean up the section environment if necessary, or replace comments
	result = result.replace("% {{EXPERIENCE}}", expLatex);
	result = result.replace("% {{PROJECTS}}", projLatex);
	result = result.replace("% {{TALKS}}", talksLatex);

	return result;
};

export const downloadBlob = (
	content: Blob | string,
	filename: string,
	mimeType: string = "application/octet-stream"
): void => {
	const blob = typeof content === "string" ? new Blob([content], { type: mimeType }) : content;
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
	setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const compileLatexToPdf = async (latexCode: string): Promise<Blob> => {
	// 1. Try texlive.net CGI
	try {
		const formData = new FormData();
		const texBlob = new Blob([latexCode], { type: "text/plain" });
		formData.append("filecontents[]", texBlob, "document.tex");
		formData.append("filename[]", "document.tex");
		formData.append("return", "pdf");

		const response = await fetch("https://texlive.net/cgi-bin/latexcgi", {
			method: "POST",
			body: formData
		});

		if (response.ok) {
			const blob = await response.blob();
			if (blob.type.includes("pdf") || blob.size > 1000) {
				return blob;
			}
		}
	} catch (e) {
		console.warn("texlive.net compile attempt failed, trying fallback...", e);
	}

	// 2. Try latexonline.cc
	try {
		const fallbackUrl = `https://latexonline.cc/compile?text=${encodeURIComponent(
			latexCode
		)}`;
		const fallbackResponse = await fetch(fallbackUrl);
		if (fallbackResponse.ok) {
			const blob = await fallbackResponse.blob();
			if (blob.type.includes("pdf") || blob.size > 1000) {
				return blob;
			}
		}
	} catch (e) {
		console.warn("latexonline.cc compile attempt failed", e);
	}

	throw new Error(
		"Could not compile LaTeX to PDF via online compiler. Please check your network connection or download the .tex file to compile with pdflatex or Overleaf."
	);
};
