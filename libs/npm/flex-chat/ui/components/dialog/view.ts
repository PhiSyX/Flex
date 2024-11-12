// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { DialogClass, DialogInterface } from "@phisyx/flex-chat/dialogs/interface";
import type { Layer } from "@phisyx/flex-chat/store/overlayer";
import type { Option } from "@phisyx/flex-safety/option";
import type { DialogPresenter } from "./presenter";

import { None } from "@phisyx/flex-safety/option";
import { Countries } from "./entities/countries";

// ---- //
// Type //
// ---- //

type FIXME = any;

// -------------- //
// Implémentation //
// -------------- //

// TODO: créer une classe abstraite et créer des classes à part
export class DialogView {
	// --------- //
	// Propriété //
	// --------- //

	private presenter_ref: Option<DialogPresenter> = None();
	declare dialog: DialogClass<DialogInterface>;

	maybe_countries_list: Option<Countries> = None();
	private uploaded_file: Option<File> = None();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get presenter(): DialogPresenter {
		return this.presenter_ref.unwrap();
	}

	set presenter($1: DialogPresenter) {
		this.presenter_ref.replace($1);
	}

	get data(): Layer<FIXME>["data"] {
		return this.presenter.get_data_dialog(
			this.dialog.ID,
		) as Layer<FIXME>["data"];
	}

	get has_data() {
		return this.presenter.has_data_dialog(this.dialog.ID);
	}

	get is_layer_exists() {
		return this.presenter.is_dialog_exists(this.dialog.ID);
	}

	get layer_name() {
		return this.dialog.ID;
	}

	get teleport_id() {
		return `#${this.dialog.ID}_teleport`;
	}

	get text_format() {
		return this.presenter.personalization_settings().formats;
	}

	get text_colors() {
		return this.presenter.personalization_settings().colors;
	}

	get countries_list() {
		return this.maybe_countries_list.map((c) => c.data()).unwrap_or([]);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	define_dialog<D extends DialogClass<DialogInterface<T>>, T>(dialog: D) {
		this.dialog = dialog;
	}

	// TODO: à déplacer dans créer une classe à part
	query_api_countries() {
		return this.presenter.fetch_countries();
	}

	set_response_from_api_countries(response: {
		data: Array<{ code: string; country: string }> | undefined;
	}) {
		let maybe_data = Countries.parse(response.data);

		if (maybe_data.is_err()) {
			console.error(maybe_data.unwrap_err());
			return;
		}

		this.maybe_countries_list = maybe_data.ok();
	}

	// ------- //
	// Méthode // -> Handler
	// ------- //

	close_dialog = () => {
		this.presenter.destroy_dialog(this.dialog.ID);
	};

	update_dialog = () => {
		this.presenter.update_dialog(this.dialog.ID);
	};

	// TODO: à déplacer dans créer une classe à part
	join_channel_handler = (channels: ChannelID, keys: string) => {
		if (!channels) {
			return;
		}

		this.presenter.join(channels, keys);
		this.close_dialog();
	};

	/**
	 * Envoie de la commande de changement de pseudo.
	 */
	// TODO: à déplacer dans une classe à part
	send_change_nick_command_handler = (nickname: string) => {
		this.presenter.change_nick(nickname);
		this.close_dialog();
	};

	/**
	 * Soumission du formulaire.
	 */
	// TODO: à déplacer dans une classe à part
	submit_form_data_handler = (
		modes_settings: Partial<Command<"MODE">["modes"]>,
	) => {
		this.presenter.apply_channel_settings(
			this.data.room.name,
			modes_settings as Command<"MODE">["modes"],
		);
	};

	/**
	 * Mise à jour du sujet.
	 */
	// TODO: à déplacer dans une classe à part
	update_topic_handler = (topic?: string) => {
		if (this.data.room.topic.get() === topic) {
			return;
		}
		this.presenter.update_topic(this.data.room.name, topic);
	};

	/**
	 * Envoie de la commande de changement de pseudo.
	 */
	// TODO: à déplacer dans une classe à part
	accept = () => {
		this.presenter.accept_participant(this.data);
		this.close_dialog();
	};

	// TODO: à déplacer dans une classe à part
	decline = () => {
		this.presenter.decline_participant(this.data);
		this.close_dialog();
	};

	upload_file_handler = (file: File) => {
		this.uploaded_file.replace(file);
	};

	update_account_submit_handler = async (evt: Event) => {
		let form = evt.target as HTMLFormElement;
		let form_data = new FormData(form);
		this.presenter.patch_user_account(this.data.id, form_data);
		this.close_dialog();
	};

	logout_handler = () => {
		this.presenter.logout_user();
	};
}
