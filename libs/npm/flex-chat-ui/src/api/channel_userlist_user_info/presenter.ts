// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Option } from "@phisyx/flex-safety";
import type { ChannelUserlistUserInfoInteractor } from "./interactor";
import type {
	ChannelUserlistUserInfoView,
	ChannelUserlistUserInfoViewProps,
} from "./view";

import { None } from "@phisyx/flex-safety";

// @ts-expect-error - Vit env
const CACHE_MINUTE = import.meta.env.DEV ? 5 : 60;

// -------------- //
// Implémentation //
// -------------- //

export class ChannelUserlistUserInfoPresenter {
	constructor(view: ChannelUserlistUserInfoView) {
		this.view = view;
		this.view.presenter = this;
	}

	// --------- //
	// Propriété //
	// --------- //

	private interactor_ref: Option<ChannelUserlistUserInfoInteractor> = None();
	view: ChannelUserlistUserInfoView;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get interactor(): ChannelUserlistUserInfoInteractor {
		return this.interactor_ref.unwrap();
	}
	set interactor($1: ChannelUserlistUserInfoInteractor) {
		this.interactor_ref.replace($1);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	query_api_user_key(
		privacy: ChannelUserlistUserInfoViewProps["privacy"],
		userId: ChannelUserlistUserInfoViewProps["userId"],
	) {
		return `user_info${userId}${privacy}`;
	}

	query_api_user(props: Required<ChannelUserlistUserInfoViewProps>) {
		return {
			queryKey: [this.query_api_user_key(props.privacy, props.userId)],
			queryFn: () => this.interactor.query_api_user(props),
			retry: 5,
			retryDelay: 10e3,
			staleTime: CACHE_MINUTE * 6e4,
			refetchInterval: CACHE_MINUTE * 6e4 + 1,
		};
	}
}
