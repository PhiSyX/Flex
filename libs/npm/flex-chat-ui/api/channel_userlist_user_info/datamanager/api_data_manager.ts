// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { UserInfoResponse } from "../entities/user_info";
import type { ChannelUserlistUserInfoViewProps } from "../view";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelUserlistUserInfoAPIManager {
	// TODO: Récupérer l'URL depuis une les points d'entrées du site.
	static API_V1_USER_INFO_ENDPOINT: ChannelUserlistUserInfoViewProps["endpoint"] =
		"/api/v1/users/:userid/info";

	async query_api_user_fetcher(
		props: Required<ChannelUserlistUserInfoViewProps>,
	): Promise<UserInfoResponse> {
		let endpoint = props.endpoint.replaceAll(":userid", props.userId);
		let res = await fetch(`${endpoint}?privacy=${props.privacy}`, {
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "same-origin",
		});
		return res.json();
	}
}
