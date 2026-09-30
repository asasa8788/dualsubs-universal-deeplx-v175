import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile("dist/Translate.response.bundle.js", "utf8");
const requests = [];
let completed;
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
		body: "<timedtext><body><p>hello</p><p>world</p></body></timedtext>",
	},
	$httpClient: {
		post: (request, callback) => {
			requests.push(request);
			callback(null, { status: 200 }, JSON.stringify({ code: 200, data: "你好||世界" }));
		},
	},
	$done: value => {
		completed = value;
	},
};
context.globalThis = context;
vm.runInNewContext(source, context, { filename: "Translate.response.bundle.js" });
await new Promise(resolve => setTimeout(resolve, 25));

assert.equal(requests.length, 1);
assert.equal(requests[0].url, "https://example.invalid/translate");
assert.equal(requests[0].method, "POST");
assert.equal(requests[0].headers.Authorization, "Bearer test-key");
assert.equal(requests[0].headers["Content-Type"], "application/json");
assert.deepEqual(JSON.parse(requests[0].body), {
	text: "hello||world",
	source_lang: "EN",
	target_lang: "ZH",
});
assert.ok(completed?.body?.includes("你好"));
assert.ok(completed?.body?.includes("世界"));
console.log("DeepLX bundle contract test passed");
