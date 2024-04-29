// @ts-check
import { createHash } from "node:crypto";
import path from "node:path";
import { statSync } from "node:fs";

/**
 * @param {URL} url
 * @param {import('imagetools-core').ImageConfig} config
 * @param {Buffer} imageBuffer
 * @returns {Promise<string>}
 */
export async function generate_id_with_buffer(url, config, imageBuffer) {
	if (url.host) {
		const baseURL = new URL(url.origin + url.pathname);
		return hash([baseURL.href, JSON.stringify(config), imageBuffer]);
	}

	// baseURL isn't a valid URL, but just a string used for an identifier
	// use a relative path in the local case so that it's consistent across machines
	const baseURL = new URL(
		url.protocol + path.relative(process.cwd(), url.pathname)
	);
	// const { size } = statSync(path.resolve(process.cwd(), decodeURIComponent(url.pathname)))
	return hash([baseURL.href, JSON.stringify(config), imageBuffer]);
}

/**
 * @param {URL} url
 * @param {import('imagetools-core').ImageConfig} config
 * @param {Buffer} imageBuffer
 * @returns {string}
 */
export function generate_id_with_size(url, config, imageBuffer) {
	if (url.host) {
		const baseURL = new URL(url.origin + url.pathname);
		return hash([baseURL.href, JSON.stringify(config), imageBuffer]);
	}

	// baseURL isn't a valid URL, but just a string used for an identifier
	// use a relative path in the local case so that it's consistent across machines
	const baseURL = new URL(
		url.protocol + path.relative(process.cwd(), url.pathname)
	);
	const { size } = statSync(
		path.resolve(process.cwd(), decodeURIComponent(url.pathname))
	);
	return hash([baseURL.href, JSON.stringify(config), size.toString()]);
}

/**
 * @param {Array<string | NodeJS.ArrayBufferView>} keyParts
 * @returns {string}
 */
function hash(keyParts) {
	let hash = createHash("sha1");
	for (const keyPart of keyParts) {
		hash = hash.update(keyPart);
	}
	return hash.digest("hex");
}
