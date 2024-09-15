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
import type { PrivateRoom } from "../../private/room";
import type { Layer } from "../../store";
import type { PrivatePresenter } from "./presenter";

import { None } from "@phisyx/flex-safety";

// -------------- //
// Implémentation //
// -------------- //

export class PrivateView {
	private presenter_ref: Option<PrivatePresenter> = None();

	maybe_private: Option<PrivateRoom> = None();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get presenter(): PrivatePresenter {
		return this.presenter_ref.unwrap();
	}
	set presenter($1: PrivatePresenter) {
		this.presenter_ref.replace($1);
	}

	get priv() {
		return this.maybe_private.unwrap();
	}

	/**
	 * Client courant, qui est un participant de la chambre privée.
	 */
	get current_client_user() {
		return this.presenter.current_client_user();
	}

	/**
	 * Pseudo du client courant.
	 */
	get current_client_nickname() {
		return this.presenter.current_client_nickname();
	}

	/**
	 * Est-ce que le participant est bloqué?
	 */
	get is_recipient_blocked() {
		return this.presenter.is_recipient_blocked();
	}

	/**
	 * La liste de la complétion de la boite de saisie.
	 */
	get completion_list(): Array<string> {
		return this.presenter.completion_list();
	}

	/**
	 * Participant de la chambre.
	 */
	get recipient() {
		return this.presenter.recipient();
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

	initialize() {
		if (this.maybe_private.is_none()) {
			return;
		}

		let participant = this.priv.get_participant_unchecked(this.priv.id());

		if (this.priv.is_active() && this.priv.is_pending()) {
			this.presenter.open_private_pending_request_dialog(participant);
		}
	}

	drop() {
		if (this.maybe_private.is_none()) {
			return;
		}

		this.presenter.destroy_private_pending_request_dialog();
	}

	set_private_from_route_param() {
		this.maybe_private = this.presenter.get_priv_from_route();
	}

	// ------- //
	// Méthode // -> Handler
	// ------- //

	/**
	 * Ferme le privé actif.
	 */
	close_handler = () => {
		this.presenter.close();
	};

	/**
	 * Ouvre la boite de dialogue de changement de pseudonyme.
	 */
	open_change_nickname_dialog_handler = (evt: Required<Layer["event"]>) => {
		this.presenter.open_user_change_nickname_dialog(evt);
	};

	/**
	 * Ouvre la boite de couleur du champ de saisie.
	 */
	open_colors_box_handler = (evt: MouseEvent) => {
		this.presenter.open_colors_box(evt);
	};

	/**
	 * Ouvre une chambre.
	 */
	open_room_handler = (room_id: RoomID) => {
		this.presenter.open_room(room_id);
	};

	/**
	 * Envoie du message au privé actif.
	 */
	send_message_handler = (message: string) => {
		this.presenter.send(message);
	};

	/**
	 * Envoie de la commande `/SILENCE +<user>`.
	 */
	send_ignore_user_command_handler = (origin: Origin) => {
		this.presenter.ignore(origin.nickname);
	};

	/**
	 * Envoie de la commande `/SILENCE -<user>`.
	 */
	send_unignore_user_command_handler = (origin: Origin) => {
		this.presenter.unignore(origin.nickname);
	};
}
