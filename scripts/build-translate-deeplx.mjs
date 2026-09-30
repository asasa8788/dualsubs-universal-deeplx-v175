import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const input = process.argv[2] ?? "vendor/Translate.response.v1.7.5.bundle.js";
const output = process.argv[3] ?? "dist/Translate.response.bundle.js";
const upstreamSha256 = "3289e75916b05b4700a0394b3dd03f458a68e3806adc3ab3526f45d59d85ba4b";
const marker = "}async BaiduFanyi(e=[],t=this.Source,a=this.Target,n=this.API){";
const deepLXMethod = `}async DeepLX(e=[],t=this.Source,a=this.Target,n=this.API){e=Array.isArray(e)?e:[e],t=this.#T.DeepL[t]??this.#T.DeepL[t?.split?.(/[-_]/)?.[0]]??t.toLowerCase(),a=this.#T.DeepL[a]??this.#T.DeepL[a?.split?.(/[-_]/)?.[0]]??a.toLowerCase();let s=n?.Endpoint?.trim();if(!s)throw Error("DeepLX endpoint is required");let r=[],i=[],o=0;for(let t of e){let e=[...t].length;if(e>1800)throw Error("DeepLX subtitle segment exceeds 1800 characters");let a=i.length?2:0;i.length&&o+a+e>1800?(r.push(i),i=[t],o=e):(i.push(t),o+=a+e)}i.length&&r.push(i);let u=n?.Token??n?.Auth;return(await Promise.all(r.map(async e=>{let n={url:s,headers:{Accept:"*/*","User-Agent":"DualSubs","Content-Type":"application/json"},body:JSON.stringify({text:e.join("||"),source_lang:t,target_lang:a})};return u&&(n.headers.Authorization="Bearer "+u),await l(n).then(e=>{let t=JSON.parse(e.body);if(200!==t?.code||"string"!=typeof t?.data)throw Error("DeepLX returned code "+(t?.code??"invalid"));return t.data.split("||")}).catch(e=>Promise.reject(e))}))).flat()}`;

const upstream = await readFile(input, "utf8");
const digest = createHash("sha256").update(upstream).digest("hex");
if (digest !== upstreamSha256) {
	throw new Error(`Unexpected upstream bundle SHA-256: ${digest}`);
}

const occurrences = upstream.split(marker).length - 1;
if (occurrences !== 1) {
	throw new Error(`Expected one Translate class insertion marker, found ${occurrences}`);
}

const outputBundle = upstream.replace(marker, `${deepLXMethod}${marker.slice(1)}`);
if (!outputBundle.includes("async DeepLX")) {
	throw new Error("DeepLX method was not added to the output bundle");
}

await writeFile(output, outputBundle);
console.log(`Wrote ${output}`);
