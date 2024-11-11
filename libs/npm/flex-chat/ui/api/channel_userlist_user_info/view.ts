// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Option } from "@phisyx/flex-safety/option";
import type { UserInfoResponse } from "./entities/user_info";
import type { ChannelUserlistUserInfoPresenter } from "./presenter";

import { None } from "@phisyx/flex-safety/option";
import { ChannelUserlistUserInfoAPIManager } from "./datamanager/api_data_manager";
import { UserInfo } from "./entities/user_info";

// ---- //
// Type //
// ---- //

export interface ChannelUserlistUserInfoViewProps {
	userId: string;
	// TODO: "private" avec un jeton.
	privacy: "public";
	// NOTE: principalement pour pouvoir mock.
	endpoint?: `${string}:userid${string}`;
}

// -------------- //
// Implémentation //
// -------------- //

export class ChannelUserlistUserInfoView {
	// ------ //
	// Static //
	// ------ //

	static API_V1_USER_INFO_ENDPOINT: ChannelUserlistUserInfoViewProps["endpoint"] =
		ChannelUserlistUserInfoAPIManager.API_V1_USER_INFO_ENDPOINT;

	// --------- //
	// Propriété //
	// --------- //

	private presenter_ref: Option<ChannelUserlistUserInfoPresenter> = None();

	declare props: Required<ChannelUserlistUserInfoViewProps>;

	maybe_user_info: Option<UserInfo> = None();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get presenter(): ChannelUserlistUserInfoPresenter {
		return this.presenter_ref.unwrap();
	}
	set presenter($1: ChannelUserlistUserInfoPresenter) {
		this.presenter_ref.replace($1);
	}

	get age() {
		return (
			this.maybe_user_info
				.and_then((user_info) => user_info.age())
				.unwrap_or("") || null
		);
	}

	get country_from() {
		return this.maybe_user_info
			.and_then((user_info) => user_info.comes_from())
			.unwrap_or("");
	}

	get user_flag() {
		return this.maybe_user_info
			.and_then((user_info) => user_info.comes_from_initials())
			.unwrap_or("");
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	define_props(props: Required<ChannelUserlistUserInfoViewProps>) {
		this.props = props;
	}

	query_api_user() {
		return this.presenter.query_api_user(this.props);
	}

	set_response_from_api_user(response: {
		data: UserInfoResponse | undefined;
	}) {
		let maybe_data = UserInfo.parse(response.data);

		if (maybe_data.is_err()) {
			console.error(maybe_data.unwrap_err());
			return;
		}

		this.maybe_user_info = maybe_data.ok();
	}

	// ------- //
	// Méthode // -> Handler
	// ------- //
}
