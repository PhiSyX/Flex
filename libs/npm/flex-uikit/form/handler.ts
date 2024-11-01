// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { FormLinkEmits } from "./emits";
import type { FormLinkProps } from "./props";

// -------- //
// Fonction //
// -------- //

function split_once(str: string, pattern: string) {
	let [head, ...tail] = str.split(pattern);
	return [head, tail.join(pattern)];
}

function get_cookie(name: string): string | null {
	const raw_cookies = decodeURIComponent(document.cookie);
	const cookies_map = Object.fromEntries(
		raw_cookies.split("; ").map((cookie) => split_once(cookie, "=")),
	);
	return cookies_map[name] ?? null;
}

export async function submit_form_link(
	evt: Event,
	emit: FormLinkEmits,
	form: {
		el: HTMLFormElement | null;
		action: string | URL;
		method: FormLinkProps["method"];
	},
) {
	evt.preventDefault();

	if (!form.el) {
		return;
	}

	let fetch_headers = new Headers();
	fetch_headers.append("Accept", "application/json");
	fetch_headers.append("Content-Type", "application/json");
	fetch_headers.append("X-Requested-With", "XMLHttpRequest");

	let xsrf_token = get_cookie("XSRF-TOKEN");
	if (xsrf_token) {
		fetch_headers.append("X-XSRF-TOKEN", xsrf_token);
	}

	let form_data = new FormData(form.el);
	let form_json = Object.fromEntries(form_data);

	try {
		let response = await fetch(form.action, {
			headers: fetch_headers,
			redirect: "follow",
			method: form.method,
			body: JSON.stringify(form_json),
			credentials: "same-origin",
		});

		if (response.redirected === true) {
			emit("redirect", response.url);
		}

		if (response.ok) {
			emit("success", response);
			return;
		}

		return Promise.reject(response);
	} catch (err) {
		emit("error", err);
	}
}
