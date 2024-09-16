// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { Layer, ServerCustomRoom } from "@phisyx/flex-chat";
import type { Option } from "@phisyx/flex-safety";
import { None } from "@phisyx/flex-safety";
import type { CustomRoomServerPresenter } from "./presenter";

// ---- //
// Type //
// ---- //

export interface CustomRoomServerViewProps {
	// La chambre du serveur.
	room: ServerCustomRoom;
}

// -------------- //
// Implémentation //
// -------------- //

export class CustomRoomServerView {
	// --------- //
	// Propriété //
	// --------- //

	private presenter_ref: Option<CustomRoomServerPresenter> = None();
	declare props: Required<CustomRoomServerViewProps>;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get presenter(): CustomRoomServerPresenter {
		return this.presenter_ref.unwrap();
	}

	set presenter($1: CustomRoomServerPresenter) {
		this.presenter_ref.replace($1);
	}

	get room() {
		return this.props.room;
	}

	// Liste de la complétion pour la boite de saisie.
	get completion_list(): Array<string> {
		return this.presenter.completion_list();
	}

	get current_client_user_nickname(): string {
		return this.presenter.get_current_user_nickname();
	}

	// L'URL du forum.
	get forum_url() {
		// @ts-expect-error - Vite env
	 	return import.meta.env.VITE_APP_FORUM_URL || "#";
	}
	// L'URL du vademecum.
	get vademecum_url() {
		// @ts-expect-error - Vite env
		return import.meta.env.VITE_APP_VADEMECUM_URL || "#";
	}

	get text_format() {
		return this.presenter.personalization_settings().formats;
	}

	get text_colors() {
		return this.presenter.personalization_settings().colors;
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	define_props(props: Required<CustomRoomServerViewProps>) {
		this.props = props;
	}

	// ------- //
	// Méthode // -> Handler
	// ------- //

	/**
	 * Ouvre la boite de dialogue de changement de pseudonyme.
	 */
	open_change_nickname_dialog_handler = (event: Required<Layer["event"]>) => {
		this.presenter.open_user_change_nickname_dialog(event);
	};

	/**
	 * Ouvre la boite de couleur du champ de saisie.
	 */
	open_colors_box_handler = (event: Event) => {
		this.presenter.open_colors_box(event);
	};

	/**
	 * Ouvre une chambre.
	 */
	open_room_handler = (room_id: RoomID) => {
		this.presenter.open_room(room_id);
	};

	/**
	 * Envoie un message à la chambre active.
	 */
	send_message_handler = (message: string) => {
		this.presenter.send(message);
	};
}
