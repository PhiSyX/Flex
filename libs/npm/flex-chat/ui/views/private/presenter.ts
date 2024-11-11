// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { RouterContract } from "@phisyx/flex-architecture/router";
import type { PrivateOptionsRecordMenu } from "@phisyx/flex-chat/menu/private_options";
import type { PrivateParticipant } from "@phisyx/flex-chat/private/participant";
import type { PrivateRoom } from "@phisyx/flex-chat/private/room";
import type { Layer } from "@phisyx/flex-chat/store";
import type { Option } from "@phisyx/flex-safety";
import type { PrivateInteractor } from "./interactor";
import type { PrivateView } from "./view";

import { assert_non_null, None } from "@phisyx/flex-safety";
import { PrivateRouter } from "./router";

// -------------- //
// Implémentation //
// -------------- //

export class PrivatePresenter {
	constructor(router_acl: RouterContract, view: PrivateView) {
		this.router = new PrivateRouter(router_acl);
		this.view = view;
		this.view.presenter = this;
	}

	// --------- //
	// Propriété //
	// --------- //

	private interactor_ref: Option<PrivateInteractor> = None();
	view: PrivateView;
	router: PrivateRouter;

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get interactor(): PrivateInteractor {
		return this.interactor_ref.unwrap();
	}
	set interactor($1: PrivateInteractor) {
		this.interactor_ref.replace($1);
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	is_recipient_blocked(): boolean {
		return this.recipient()
			.map((r) => this.interactor.is_recipient_blocked(r))
			.unwrap_or(false);
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

	is_current_client_authenticated() {
		return this.interactor.is_current_client_authenticated();
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

	open_private_options_menu(
		evt: Required<Layer["event"]>,
		record: PrivateOptionsRecordMenu,
	) {
		this.interactor.create_private_options_menu(evt, record);
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
		return this.view.priv.get_participant(this.view.priv.id());
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
