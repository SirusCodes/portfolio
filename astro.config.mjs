// @ts-check
import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import generatePDFFromTex from "./lib/integrations/generatePDFFromTex";

import yeskunallumami from "@yeskunall/astro-umami";

const isGHPages = process.env.IS_GH_PAGES ?? false;
// https://astro.build/config
export default defineConfig({
	site: isGHPages
		? "https://beta.darshanrander.com"
		: "https://darshanrander.com",

	integrations: [
		preact(),
		sitemap(),
		robotsTxt(),
		generatePDFFromTex(),
		yeskunallumami({
			id: "a9e17105-6708-419e-bba4-32930be50670",
			endpointUrl: "https://analytics.darshanrander.com"
		})
	]
});
