// @ts-check
import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";
import generatePDFFromTex from "./lib/integrations/generatePDFFromTex";

const isGHPages = process.env.IS_GH_PAGES ?? false;
// https://astro.build/config
export default defineConfig({
	site: isGHPages
		? "https://beta.darshanrander.com"
		: "https://darshanrander.com",

	integrations: [preact(), sitemap(), robotsTxt(), generatePDFFromTex()]
});
