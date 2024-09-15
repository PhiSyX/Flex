// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { UserInfo } from "./entities/user_info";
import type { ChannelUserlistUserInfoPresenter } from "./presenter";

import { calculate_age } from "@phisyx/flex-date";
import { iso_to_country_flag } from "@phisyx/flex-helpers";
import { None, Option, Some } from "@phisyx/flex-safety";
import { ChannelUserlistUserInfoAPIManager } from "./datamanager/api_data_manager";

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

	response_api_user: Option<UserInfo> = None();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get presenter(): ChannelUserlistUserInfoPresenter {
		return this.presenter_ref.unwrap();
	}
	set presenter($1: ChannelUserlistUserInfoPresenter) {
		this.presenter_ref.replace($1);
	}

	get query_api_user_key() {
		return this.presenter.query_api_user_key();
	}

	get age() {
		return (
			this.response_api_user
				.and_then((user_info) => {
					return user_info.birthday
						? Some(calculate_age(user_info.birthday))
						: None();
				})
				.unwrap_or("") || null
		);
	}

	get country_from() {
		return this.response_api_user
			.and_then((user_info) => {
				return Option.from(user_info.country || user_info.city);
			})
			.unwrap_or("");
	}

	get user_flag() {
		return this.response_api_user
			.and_then((user_info) => {
				if (user_info.country) {
					return Some(iso_to_country_flag(user_info.country));
				}
				if (user_info.city) {
					return Some(
						user_info.city
							.split(/[\s-]/g)
							.map((w) => w.slice(0, 1))
							.join(""),
					);
				}

				return None();
			})
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
		data: UserInfo | undefined;
	}) {
		this.response_api_user = Option.from(response.data);
	}

	// ------- //
	// Méthode // -> Handler
	// ------- //
}
