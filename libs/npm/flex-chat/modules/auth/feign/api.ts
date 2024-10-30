// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// -------- //
// Constant //
// -------- //

const DEFAULT_FETCH_OPTIONS: RequestInit = {
	headers: {
		Accept: "application/json",
		"Content-Type": "application/json",
	},
	credentials: "same-origin",
};

// -------------- //
// Implémentation // -> Interface
// -------------- //

class HTTPClient {
	async fetch<T>(endpoint: string, options: RequestInit): Promise<T> {
		let fetch_options: RequestInit = {
			...DEFAULT_FETCH_OPTIONS,
			...options,
		};

		let response = await fetch(endpoint, fetch_options);

		let content_type = response.headers.get("Content-Type");
		let is_json_content_type = (content_type?.indexOf("json") ?? -1) > 0;

		if (response.ok) {
			if (is_json_content_type) {
				return response.json();
			}
			return response.text() as T;
		}

		let is_error = response.status >= 400 && response.status < 600;

		if (is_json_content_type || is_error) {
			return Promise.reject(await response.json());
		}

		return Promise.reject(response);
	}

	post<T>(endpoint: string, data: object): Promise<T> {
		return this.fetch(endpoint, {
			method: "POST",
			body: JSON.stringify(data),
		});
	}
}

export class AuthApiHTTPClient extends HTTPClient {
	static AUTH_IDENTIFY_ENDPOINT = "/api/v1/auth/identify";
	static AUTH_REGISTER_ENDPOINT = "/api/v1/auth/register";

	identify(payload: AuthIdentifyFormData): Promise<AuthIdentifyHttpResponse> {
		return this.post(AuthApiHTTPClient.AUTH_IDENTIFY_ENDPOINT, payload);
	}

	register(payload: AuthRegisterFormData): Promise<AuthRegisterHttpResponse> {
		return this.post(AuthApiHTTPClient.AUTH_REGISTER_ENDPOINT, payload);
	}
}
