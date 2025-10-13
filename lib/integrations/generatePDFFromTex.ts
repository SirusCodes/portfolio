import type { AstroIntegration } from "astro";
import { openAsBlob } from "node:fs";
import { copyFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export default function generatePDFFromTex(): AstroIntegration {
	return {
		name: "generate-pdf-from-tex",
		hooks: {
			"astro:build:done": async ({ dir, logger }) => {
				logger.info("Generating PDF from TeX...");
				const formData = new FormData();

				const resumeTex = await openAsBlob(
					new URL("./resume.tex", dir),
					{ type: "text/plain" }
				);
				formData.append("filecontents[]", resumeTex, "document.tex");
				formData.append("filename[]", "document.tex");
				formData.append("return", "pdf");

				const url = "https://texlive.net/cgi-bin/latexcgi";

				const resumePdf = await fetch(url, {
					method: "POST",
					body: formData
				});

				if (!resumePdf.ok) {
					const errorText = await resumePdf.text();
					throw new Error(`Failed to generate PDF: ${errorText}`);
				}

				const outFile = fileURLToPath(new URL("./resume.pdf", dir));
				const copyDest = fileURLToPath(
					new URL("./resume-darshan-rander.pdf", dir)
				);

				await writeFile(outFile, await resumePdf.bytes());
				await copyFile(outFile, copyDest);
				logger.info("PDF written to dist/resume.pdf");
			}
		}
	};
}
