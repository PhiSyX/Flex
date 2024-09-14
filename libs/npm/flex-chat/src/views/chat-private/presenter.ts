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
import type { PrivateParticipant } from "../../private/participant";
import type { PrivateRoom } from "../../private/room";
import type { Layer } from "../../store";
import type { PrivateInteractor } from "./interactor";
import type { PrivateRouter } from "./router";
import type { PrivateView } from "./view";

import { assert_non_null } from "@phisyx/flex-safety";

// -------------- //
// Implémentation //
// -------------- //

export class PrivatePresenter {
	view!: PrivateView;
	interactor!: PrivateInteractor;
	router!: PrivateRouter;

	// ------- //
	// Méthode // -> Instance
	// ------- //

	with_interactor(interactor: PrivateInteractor): this {
		this.interactor = interactor;
		return this;
	}

	with_view(view: PrivateView): this {
		this.view = view;
		return this;
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	is_recipient_blocked(): boolean {
		return this.interactor.is_recipient_blocked(this.recipient());
	}

	close() {
		assert_non_null(this.view.priv);
		return this.interactor.close(this.view.priv.id());
	}

	completion_list(): Array<string> {
		return this.interactor.get_all_commands(this.view.priv);
	}

	current_client_id() {
		return this.interactor.get_current_client_id();
	}

	current_client_nickname() {
		return this.current_client_user().nickname;
	}

	current_client_user() {
		// SAFETY(unwrap): les conversations conservées dans l'application du
		// client courant contiennent automatiquement les info du client
		// courant.
		return this.view.priv
			.get_participant(this.current_client_id())
			.unwrap();
	}

	open_colors_box(evt: Event) {
		this.interactor.create_colors_box(evt);
	}

	open_private_pending_request_dialog(participant: PrivateParticipant) {
		this.interactor.create_private_pending_request_dialog(participant);
	}
	destroy_private_pending_request_dialog() {
		this.interactor.destroy_private_pending_request_dialog();
	}

	open_room(room_id: RoomID) {
		this.interactor.open_room(room_id);
	}

	open_user_change_nickname_dialog(evt: Required<Layer["event"]>) {
		this.interactor.create_user_change_nickname_dialog(evt);
	}

	get_priv_from_route(): Option<PrivateRoom> {
		return this.interactor.find_by_id(this.router.param_id());
	}

	get_current_user_nickname(): string {
		return this.interactor.get_current_client_nickname();
	}

	layout_settings() {
		return this.interactor.layout_settings();
	}

	personalization_settings() {
		return this.interactor.personalization_settings();
	}

	recipient() {
		return this.view.priv.get_participant(this.view.priv.id()).unwrap();
	}

	send(message: string) {
		assert_non_null(this.view.priv);
		this.interactor.send_to(this.view.priv.id(), message);
	}

	ignore(nickname: Origin["nickname"]) {
		this.interactor.ignore(nickname);
	}
	unignore(nickname: Origin["nickname"]) {
		this.interactor.unignore(nickname);
	}
}
