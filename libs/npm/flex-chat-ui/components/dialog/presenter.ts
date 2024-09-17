// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { PrivateParticipant, UserSession } from "@phisyx/flex-chat";
import type { Option } from "@phisyx/flex-safety";
import type { DialogInteractor } from "./interactor";
import type { DialogView } from "./view";

import { None } from "@phisyx/flex-safety";

// -------------- //
// Implémentation //
// -------------- //

export class DialogPresenter {
	constructor(view: DialogView) {
		this.view = view;
		this.view.presenter = this;
	}

	// --------- //
	// Propriété //
	// --------- //

	private interactor_ref: Option<DialogInteractor> = None();
	view: DialogView;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get interactor(): DialogInteractor {
		return this.interactor_ref.unwrap();
	}
	set interactor($1: DialogInteractor) {
		this.interactor_ref.replace($1);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	destroy_dialog(id: string) {
		return this.interactor.destroy_dialog(id);
	}

	has_data_dialog(id: string) {
		return this.interactor.has_data_dialog(id);
	}

	get_data_dialog(id: string) {
		return this.interactor.get_data_dialog(id);
	}

	update_dialog(id: string) {
		return this.interactor.update_dialog(id);
	}

	is_dialog_exists(id: string) {
		return this.interactor.is_dialog_exists(id);
	}

	layout_settings() {
		return this.interactor.layout_settings();
	}

	personalization_settings() {
		return this.interactor.personalization_settings();
	}

	join(names: ChannelID, keys: string) {
		this.interactor.join(names, keys);
	}

	change_nick(nickname: string) {
		this.interactor.change_nick(nickname);
	}

	apply_channel_settings(
		target: string,
		modes_settings: Command<"MODE">["modes"],
	) {
		this.interactor.apply_channel_settings(target, modes_settings);
	}

	accept_participant(participant: PrivateParticipant) {
		this.interactor.accept_participant(participant);
	}
	decline_participant(participant: PrivateParticipant) {
		this.interactor.decline_participant(participant);
	}

	update_topic(channel_name: ChannelID, topic?: string) {
		this.interactor.update_topic(channel_name, topic);
	}

	patch_user_account(user_id: UserSession["id"], form_data: FormData) {
		this.interactor.patch_user_account(user_id, form_data);
	}
}
