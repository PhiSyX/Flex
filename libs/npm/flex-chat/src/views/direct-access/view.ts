// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { RouterAntiCorruptionLayer } from "@phisyx/flex-architecture";
import type { Option } from "@phisyx/flex-safety";
import type { UserSession } from "../../user/session";
import type { DirectAccessPresenter } from "./presenter";

import { None } from "@phisyx/flex-safety";
import { View } from "../../view";
import { DirectAccessFormData } from "./formdata";
import { DirectAccessFormError } from "./formerror";
import { DirectAccessRouter } from "./router";

// -------------- //
// Implémentation //
// -------------- //

export class DirectAccessView {
	// ------ //
	// Static //
	// ------ //

	/**
	 * Attribut `maxlength` de l'élément `<input name="nickname">`.
	 *
	 * Taille maximale d'un pseudonyme.
	 */
	static MAXLENGTH_NICKNAME = 30;

	/**
	 * Attribut `placeholder` de l'élément `<input name="nickname">`.
	 */
	static PLACEHOLDER_NICKNAME =
		`Pseudonyme (max. ${this.MAXLENGTH_NICKNAME} caractères)`;

	/**
	 * Attribut `title` de l'élément `<input name="nickname">`.
	 *
	 * Utilisé pour indiquer à l'utilisateur la valeur attendue pour un
	 * pseudonyme.
	 */
	static VALIDATION_NICKNAME_INFO: string = `
Pour qu'un pseudonyme soit considéré comme valide, ses caractères doivent
respecter, un format précis, les conditions suivantes :
	- Il ne doit pas commencer par le caractère '-' ou par un caractère
	  numérique '0..9' ;
	- Il peut contenir les caractères: alphanumériques, 'A..Z', 'a..z',
	  '0..9'. Les caractères alphabétiques des langues étrangères sont
	  considérés comme valides. Par exemple: le russe, le japonais, etc.
	- Il peut contenir les caractères spéciaux suivants: []\`_^{|}
`.trim();

	// --------- //
	// Propriété //
	// --------- //

	private presenter_ref: Option<DirectAccessPresenter> = None();
	advanced_form = false;
	shown_password_user_field = false;
	loader = false;
	form_data: DirectAccessFormData = new DirectAccessFormData();
	error: DirectAccessFormError = new DirectAccessFormError();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get presenter(): DirectAccessPresenter {
		return this.presenter_ref.unwrap();
	}
	set presenter($1: DirectAccessPresenter) {
		this.presenter_ref.replace($1);
	}

	get user_session(): Option<UserSession> {
		return this.presenter.user_session();
	}

	// ------- //
	// Méthode // -> Instance
	// ------- //

	with_presenter(presenter: DirectAccessPresenter): this {
		this.presenter = presenter;
		return this;
	}

	with_router(router_acl: RouterAntiCorruptionLayer): this {
		this.presenter.router = new DirectAccessRouter(router_acl);
		return this;
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	/**
	 * Active le loader.
	 */
	show_loader() {
		this.loader = true;
	}

	/**
	 * Désactive le loader
	 */
	hide_loader() {
		this.loader = false;
	}

	/**
	 * Affiche plus de champ de connexion du formulaire (avancé).
	 */
	display_more_fields() {
		this.advanced_form = true;
	}

	display_password_user_field() {
		this.shown_password_user_field = true;
	}

	goto_settings_view_handler() {
		this.presenter.router.goto({ name: View.Settings });
	}

	/**
	 * Soumission du formulaire. Se connecte à notre serveur de Chat.
	 */
	async submit_form(evt: Event) {
		evt.preventDefault();

		this.show_loader();

		await this.presenter.connect_chat_server();
	}

	update_account_handler() {
		this.presenter.create_update_account_dialog(this.user_session.unwrap());
	}

	/**
	 * Gère l'événement de succès `RPL_WELCOME`.
	 */
	handle_reply_welcome() {
		this.loader = false;

		this.presenter.router.goto({ name: View.Chat });

		if (this.form_data.password_user) {
			this.presenter.send_auth_command();
		}
	}

	/**
	 * Gère l'événement d'erreur `ERR_NICKNAMEINUSE`.
	 */
	handle_reply_nicknameinuse(error: GenericErrorReply<"ERR_NICKNAMEINUSE">) {
		if (error.nickname === this.form_data.alternative_nickname) {
			this.error.alternative_nickname = error.reason.slice(
				this.form_data.alternative_nickname.length + 2,
			);
		} else {
			this.error.nickname = error.reason.slice(
				this.form_data.nickname.length + 2,
			);
		}

		this.loader = false;
	}
}
