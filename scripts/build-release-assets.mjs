import { cp, mkdir, readFile, writeFile } from "node:fs/promises";

const tag = process.env.RELEASE_TAG ?? "v1.7.5-deeplx.2";
const repository = "asasa8788/dualsubs-universal-deeplx-v175";
const baseUrl = `https://github.com/${repository}/releases/download/${tag}`;
const output = "release-assets";

const replacements = new Map([
	["https://github.com/DualSubs/Universal/releases/download/v1.7.5/Manifest.response.bundle.js", `${baseUrl}/Manifest.response.bundle.js`],
	["https://github.com/DualSubs/Universal/releases/download/v1.7.5/Composite.Subtitles.response.bundle.js", `${baseUrl}/Composite.Subtitles.response.bundle.js`],
	["https://github.com/DualSubs/Universal/releases/download/v1.7.5/Translate.response.bundle.js", `${baseUrl}/Translate.response.bundle.js`],
	["https://github.com/DualSubs/YouTube/releases/download/v1.5.11/request.bundle.js", `${baseUrl}/request.bundle.js`],
	["https://github.com/DualSubs/YouTube/releases/download/v1.5.11/response.bundle.js", `${baseUrl}/response.bundle.js`],
	["https://github.com/DualSubs/Universal/releases/latest/download/Composite.Subtitles.response.bundle.js", `${baseUrl}/Composite.Subtitles.response.bundle.js`],
	["https://github.com/DualSubs/Universal/releases/latest/download/Translate.response.bundle.js", `${baseUrl}/Translate.response.bundle.js`],
]);

function rewriteProviders(source, label) {
	let result = source;
	let replacementsApplied = 0;
	for (const [from, to] of replacements) {
		const count = result.split(from).length - 1;
		if (count) {
			result = result.replaceAll(from, to);
			replacementsApplied += count;
		}
	}
	if (replacementsApplied === 0 || result.includes("github.com/DualSubs/Universal/releases/") || result.includes("github.com/DualSubs/YouTube/releases/")) {
		throw new Error(`${label} provider rewrite validation failed`);
	}
	return result;
}

await mkdir(output, { recursive: true });
await cp("vendor/Manifest.response.v1.7.5.bundle.js", `${output}/Manifest.response.bundle.js`);
await cp("vendor/Composite.Subtitles.response.v1.7.5.bundle.js", `${output}/Composite.Subtitles.response.bundle.js`);
await cp("vendor/YouTube.request.v1.5.11.bundle.js", `${output}/request.bundle.js`);
await cp("vendor/YouTube.response.v1.5.11.bundle.js", `${output}/response.bundle.js`);
await cp("dist/Translate.response.bundle.js", `${output}/Translate.response.bundle.js`);

const universal = rewriteProviders(await readFile("vendor/DualSubs.Universal.v1.7.5.stoverride", "utf8"), "Universal");
const youtube = rewriteProviders(await readFile("vendor/DualSubs.YouTube.v1.5.11.stoverride", "utf8"), "YouTube");
await writeFile(`${output}/DualSubs.Universal.stoverride`, universal);
await writeFile(`${output}/DualSubs.YouTube.stoverride`, youtube);
console.log(`Wrote complete release assets for ${tag}`);
