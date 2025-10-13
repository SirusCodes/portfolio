import type { APIRoute } from "astro";
import { buildResume } from "../resume.tex";

const resumeTex = await buildResume();
const url =
	"https://texlive2020.latexonline.cc/compile?text=" +
	encodeURIComponent(resumeTex);
const resumePdf = await fetch(url);

export const GET: APIRoute = async ({}) => {
	return new Response(resumePdf.body, {
		headers: { "Content-Type": "application/pdf" }
	});
};
