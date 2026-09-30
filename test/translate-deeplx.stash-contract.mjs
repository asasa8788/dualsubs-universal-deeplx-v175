import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile("dist/Translate.response.bundle.js", "utf8");
const requests = [];
let completed;
const lines = ["a".repeat(900), "b".repeat(900), "c".repeat(100)];
const config = {
	YouTube: { Settings: { Type: "Translate", Languages: ["AUTO", "ZH-HANS"], CacheSize: 10, LogLevel: "DEBUG" } },
	Translate: { Settings: { Vendor: "DeepLX", Method: "Part", Times: 0, Interval: 1, Exponential: false } },
	API: { Settings: { DeepLX: { Endpoint: "https://example.invalid/translate", Auth: "test-key" } } },
};
const context = {
	console,
	setTimeout,
	clearTimeout,
	URL,
	TextEncoder,
	TextDecoder,
	Uint8Array,
	ArrayBuffer,
	$environment: { "stash-version": "3.0.0" },
	$argument: undefined,
	$script: { startTime: Date.now() },
	$persistentStore: { read: key => (key === "DualSubs" ? JSON.stringify(config) : null), write: () => true },
	$request: { url: "https://www.youtube.com/api/timedtext?lang=en&subtype=Translate" },
	$response: {
		headers: { "Content-Type": "text/xml" },
		body: `<timedtext><body>${lines.map(text => `<p>${text}</p>`).join("")}</body></timedtext>`,
	},
	$httpClient: {
		post: (request, callback) => {
			requests.push(request);
			const text = JSON.parse(request.body).text;
			const translated = text.split("||").map((_, index) => `translation-${requests.length}-${index}`).join("||");
			callback(null, { status: 200 }, JSON.stringify({ code: 200, data: translated }));
		},
	},
	$done: value => {
		completed = value;
	},
};
context.globalThis = context;
vm.runInNewContext(source, context, { filename: "Translate.response.bundle.js" });
await new Promise(resolve => setTimeout(resolve, 25));

assert.equal(requests.length, 2);
assert.equal(requests[0].url, "https://example.invalid/translate");
assert.equal(requests[0].method, "POST");
assert.equal(requests[0].headers.Authorization, "Bearer test-key");
assert.equal(requests[0].headers["Content-Type"], "application/json");
assert.deepEqual(requests.map(request => JSON.parse(request.body).text), [
	lines[0],
	`${lines[1]}||${lines[2]}`,
]);
for (const request of requests) {
	assert.ok([...JSON.parse(request.body).text].length <= 1800);
}
assert.ok(completed?.body?.includes("translation-1-0"));
assert.ok(completed?.body?.includes("translation-2-1"));
console.log("DeepLX bundle contract test passed");
