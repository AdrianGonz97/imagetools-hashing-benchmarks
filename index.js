// @ts-check
import { Bench } from "tinybench";
import path from "node:path";
import sharp from "sharp";
import { parseURL } from "imagetools-core";

import { generate_id_with_buffer, generate_id_with_size } from "./hash.js";

const bench = new Bench({ time: 1000 });

const imgsDir = path.resolve("images");
const imgPaths = {
	"11mb": path.resolve(imgsDir, "11mb.png"),
	"5mb": path.resolve(imgsDir, "5mb.png"),
	"2.5mb": path.resolve(imgsDir, "2.5mb.png"),
	"1mb": path.resolve(imgsDir, "1mb.png"),
	"500kb": path.resolve(imgsDir, "500kb.png"),
	"350kb": path.resolve(imgsDir, "350kb.png"),
	"100kb": path.resolve(imgsDir, "100kb.png"),
};

const urls = {};
const imgBuffers = {};
for (const name in imgPaths) {
	const pathname = imgPaths[name];
	urls[name] = parseURL(pathname);
	imgBuffers[name] = await sharp(pathname).clone().toBuffer();
}

bench
	// base
	.add("hash with size - base (500kb)", () => {
		generate_id_with_size(urls["500kb"], {}, imgBuffers["500kb"]);
	})
	.add("hash with buffer - base (500kb)", () => {
		generate_id_with_buffer(urls["500kb"], {}, imgBuffers["500kb"]);
	});

for (const name in imgPaths) {
	bench.add(`hash with buffer - ${name}`, async () => {
		generate_id_with_buffer(urls[name], {}, imgBuffers[name]);
	});
}

await bench.warmup(); // make results more reliable, ref: https://github.com/tinylibs/tinybench/pull/50
await bench.run();

console.table(bench.table());

// Output:
// ┌─────────┬───────────────────────────────────┬───────────┬────────────────────┬──────────┬─────────┐
// │ (index) │ Task Name                         │ ops/sec   │ Average Time (ns)  │ Margin   │ Samples │
// ├─────────┼───────────────────────────────────┼───────────┼────────────────────┼──────────┼─────────┤
// │ 0       │ 'hash with size - base (500kb)'   │ '231,842' │ 4313.26988522398   │ '±0.63%' │ 231843  │
// │ 1       │ 'hash with buffer - base (500kb)' │ '5,979'   │ 167226.18963211094 │ '±0.23%' │ 5980    │
// │ 2       │ 'hash with buffer - 11mb'         │ '165'     │ 6036291.090361429  │ '±0.43%' │ 166     │
// │ 3       │ 'hash with buffer - 5mb'          │ '311'     │ 3215181.397435922  │ '±0.31%' │ 312     │
// │ 4       │ 'hash with buffer - 2.5mb'        │ '1,099'   │ 909751.2799999929  │ '±0.20%' │ 1100    │
// │ 5       │ 'hash with buffer - 1mb'          │ '2,599'   │ 384681.17346155015 │ '±0.40%' │ 2600    │
// │ 6       │ 'hash with buffer - 500kb'        │ '5,875'   │ 170197.13359428805 │ '±0.28%' │ 5876    │
// │ 7       │ 'hash with buffer - 350kb'        │ '6,425'   │ 155626.61889200658 │ '±0.25%' │ 6426    │
// │ 8       │ 'hash with buffer - 100kb'        │ '16,379'  │ 61051.895238088415 │ '±0.44%' │ 16380   │
// └─────────┴───────────────────────────────────┴───────────┴────────────────────┴──────────┴─────────┘
