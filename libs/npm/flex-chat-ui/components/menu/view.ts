// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { ChannelMember } from "@phisyx/flex-chat/channel/member";
import type { MenuClass, MenuInterface } from "@phisyx/flex-chat/menu";
import type { PrivateParticipant } from "@phisyx/flex-chat/private/participant";
import type { Layer } from "@phisyx/flex-chat/store";
import type { Option } from "@phisyx/flex-safety";
import type { MenuPresenter } from "./presenter";

import { None } from "@phisyx/flex-safety";

// ---- //
// Type //
// ---- //

type FIXME = any;

// -------------- //
// Implémentation //
// -------------- //

// TODO: créer une classe abstraite et créer des classes à part
export class MenuView {
	// --------- //
	// Propriété //
	// --------- //

	private presenter_ref: Option<MenuPresenter> = None();
	declare menu: MenuClass<MenuInterface>;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get presenter(): MenuPresenter {
		return this.presenter_ref.unwrap();
	}

	set presenter($1: MenuPresenter) {
		this.presenter_ref.replace($1);
	}

	get data(): Layer<FIXME>["data"] {
		return this.presenter.get_data_menu(
			this.menu.ID,
		) as Layer<FIXME>["data"];
	}

	get has_data() {
		return this.presenter.has_data_menu(this.menu.ID);
	}

	get is_layer_exists() {
		return this.presenter.is_menu_exists(this.menu.ID);
	}

	get layer_name() {
		return this.menu.ID;
	}

	get teleport_id() {
		return `#${this.menu.ID}_teleport`;
	}

	// Le client courant, qui est membre du salon.
	//
	// NOTE: l'utilisateur courant PEUT être sanctionné à tout moment, c'est
	//       pourquoi on évitera de .unwrap() le retour de la fonction
	//       `get_current_member_from`.
	get current_client_channel_member(): Option<ChannelMember> {
		return this.presenter.get_current_member();
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	define_menu<D extends MenuClass<MenuInterface<T>>, T>(menu: D) {
		this.menu = menu;
	}

	// ------- //
	// Méthode // -> Handler
	// ------- //

	close_menu = () => {
		this.presenter.destroy_menu(this.menu.ID);
	};

	update_menu = () => {
		this.presenter.update_menu(this.menu.ID);
	};

	/**
	 * Ouvre la boite de dialogue des paramètres du salon.
	 */
	// TODO: à déplacer das une class à part
	open_channel_settings_handler = () => {
		this.presenter.open_channel_settings_dialog();
		this.close_menu();
	};

	// TODO: à déplacer das une class à part
	part_channel_handler = () => {
		this.presenter.close_room();
		this.close_menu();
	};

	// TODO: à déplacer das une class à part
	close_room_handler = () => {
		this.presenter.close_room();
		this.close_menu();
	};

	// TODO: à déplacer das une class à part
	open_update_account_dialog_handler = () => {
		this.presenter.open_update_account_dialog();
		this.close_menu();
	};

	ignore_user_handler = (recipient: PrivateParticipant) => {
		this.presenter.ignore_user(recipient);
		this.close_menu();
	};
	unignore_user_handler = (recipient: PrivateParticipant) => {
		this.presenter.unignore_user(recipient);
		this.close_menu();
	};
}
