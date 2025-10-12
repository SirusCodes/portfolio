// @ts-check
import { defineConfig } from "astro/config";

const isGHPages = process.env.IS_GH_PAGES ?? false;
// https://astro.build/config
export default defineConfig({
	site: isGHPages
		? "https://beta.darshanrander.com"
		: "https://darshanrander.com"
});
