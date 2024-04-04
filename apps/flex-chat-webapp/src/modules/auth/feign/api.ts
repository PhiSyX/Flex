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
		"Content-Type": "application/json",
	},
	credentials: "same-origin",
};

// --------- //
// Interface //
// --------- //

interface AuthRegisterResponse
{
	code: string;
	message: string;
	id: UUID;
}

// -------------- //
// Implémentation // -> Interface
// -------------- //

export class AuthApiHTTPClient
{
	static AUTH_IDENTIFY_ENDPOINT = "/api/v1/auth/identify";
	static AUTH_REGISTER_ENDPOINT = "/api/v1/auth/register";

	identify(payload: AuthIdentifyFormData)
	{
		const fetchOpts: RequestInit = {
			...DEFAULT_FETCH_OPTIONS,
			method: "POST",
			body: JSON.stringify(payload),
		};

		return fetch(AuthApiHTTPClient.AUTH_IDENTIFY_ENDPOINT, fetchOpts)
			.then((response) => {
				if (response.ok) return response.json();
				return Promise.reject(response);
			});
	}

	register(payload : AuthRegisterFormData): Promise<AuthRegisterResponse>
	{
		const fetchOpts: RequestInit = {
			...DEFAULT_FETCH_OPTIONS,
			method: "POST",
			body: JSON.stringify(payload),
		};

		return fetch(AuthApiHTTPClient.AUTH_REGISTER_ENDPOINT, fetchOpts)
			.then((response) => {
				if (response.ok) return response.json();
				return Promise.reject(response);
			});
	}
}
