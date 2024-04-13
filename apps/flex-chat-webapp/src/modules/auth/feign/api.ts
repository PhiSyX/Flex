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
		"Accept": "application/json",
		"Content-Type": "application/json",
	},
	credentials: "same-origin",
};

// -------------- //
// Implémentation // -> Interface
// -------------- //

class HTTPClient
{
	fetch<T>(endpoint: string, options: RequestInit): Promise<T>
	{
		const fetchOpts: RequestInit = {
			...DEFAULT_FETCH_OPTIONS,
			...options,
		};

		return fetch(endpoint, fetchOpts).then(async (res) => {
			const contentType = res.headers.get("Content-Type");
			const isJsonContentType = (contentType?.indexOf("json") ?? -1) > 0;

			if (res.ok) {
				if (isJsonContentType) return res.json();
				return res.text();
			}

			const isError = res.status >= 400 && res.status < 600;

			if (isJsonContentType || isError) {
				return Promise.reject(await res.json());
			}

			return Promise.reject(res);
		});
	}

	post<T>(endpoint: string, data: object): Promise<T>
	{
		return this.fetch(endpoint, {
			method: "POST",
			body: JSON.stringify(data),
		});
	}
}

export class AuthApiHTTPClient extends HTTPClient
{
	static AUTH_IDENTIFY_ENDPOINT = "/api/v1/auth/identify";
	static AUTH_REGISTER_ENDPOINT = "/api/v1/auth/register";

	identify(payload: AuthIdentifyFormData): Promise<AuthIdentifyHttpResponse>
	{
		return this.post(AuthApiHTTPClient.AUTH_IDENTIFY_ENDPOINT, payload);
	}

	register(payload: AuthRegisterFormData): Promise<AuthRegisterHttpResponse>
	{
		return this.post(AuthApiHTTPClient.AUTH_REGISTER_ENDPOINT, payload);
	}
}
