// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { IMAGE_CACHE, IMAGE_SIZE_FALLBACK } from "./cache";

// -------- //
// Fonction //
// -------- //

export function get_img_src(
	src: string,
	fallback: string,
	opt: {
		intersected: boolean;
		refresh_source: boolean;
		refresh_time: number;
		refresh_timeout: number;
	},
) {
	if (IMAGE_CACHE.has(src)) {
		let img = IMAGE_CACHE.get(src);
		if (img) {
			if (img.expires.getTime() >= Date.now()) {
				return img.source;
			}

			if (!opt.refresh_source && img.loaded) {
				return img.source;
			}
		}
	}

	let img_src = opt.intersected ? src : fallback;

	if (img_src !== fallback) {
		let expires = new Date();
		let current_minute = expires.getMinutes();
		expires.setMinutes(current_minute + opt.refresh_time);

		IMAGE_CACHE.set(src, {
			expires,
			loaded: false,
			source: img_src,
		});
	}

	// biome-ignore lint/style/useTemplate: non
	return img_src + "?r=" + opt.refresh_timeout;
}

export function parse_image_size(size?: { toString(): string }) {
	return Number.parseInt(size?.toString() || IMAGE_SIZE_FALLBACK, 10);
}
