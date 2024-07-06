// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { customElement } from "@phisyx/flex-custom-element";
import {
	div,
	form,
	h1,
	label,
	main,
	section,
	span,
} from "@phisyx/flex-html-element-extension";

import { signal } from "@phisyx/flex-signal";

import {
	MAXLENGTH_NICKNAME,
	PLACEHOLDER_NICKNAME,
	RememberMeStorage,
	VALIDATION_NICKNAME_INFO,
} from "@phisyx/flex-chat";
import {
	buttonIcon,
	inputSwitch,
	textInput,
	uiButton,
} from "@phisyx/flex-uikit";
import scss from "./login-view.scss?url";

@customElement({ mode: "open", styles: [scss] })
export default class LoginView {
	declare static TAG_NAME: string;

	advancedInfo = signal(false);
	websocketServerURL = signal("");
	passwordServer = signal("");
	nickname = signal("");
	alternativeNickname = signal("");
	realname = signal("");
	channels = signal("");
	rememberMe = new RememberMeStorage();
	loader = signal(false);

	render() {
		return main(
			section(
				h1("Accès direct au Chat"),

				form(
					textInput(
						this.websocketServerURL,
						{
							label: "url",
							name: "server",
						},
						{
							placeholder: "URL WebSocket du serveur de Chat",
							type: "url",
						},
					)
						.displayWhen(this.advancedInfo)
						// FIXME: trouver un moyen d'automatiser cette partie.
						.on("sync:model", (evt: CustomEvent<string>) => {
							this.websocketServerURL.set(evt.detail);
						}),

					textInput(
						this.passwordServer,
						{
							label: "password",
							name: "password_server",
						},
						{
							placeholder: "Mot de passe du serveur de Chat",
							type: "password",
						},
					)
						.displayWhen(this.advancedInfo)
						// FIXME: trouver un moyen d'automatiser cette partie.
						.on("sync:model", (evt: CustomEvent<string>) => {
							this.passwordServer.set(evt.detail);
						}),

					textInput(
						this.nickname,
						{
							label: "user",
							name: "nickname",
							// error: errors.nickname
						},
						{
							maxLength: MAXLENGTH_NICKNAME,
							placeholder: PLACEHOLDER_NICKNAME,
						},
					)
						.title(VALIDATION_NICKNAME_INFO)
						// FIXME: trouver un moyen d'automatiser cette partie.
						.on("sync:model", (evt: CustomEvent<string>) => {
							this.nickname.set(evt.detail);
						}),

					textInput(
						this.alternativeNickname,
						{
							label: "user",
							name: "alternative_nickname",
						},
						{
							maxLength: MAXLENGTH_NICKNAME,
							placeholder: "Pseudonyme alternatif",
						},
					)
						.displayWhen(this.advancedInfo)
						.title(VALIDATION_NICKNAME_INFO)
						// FIXME: trouver un moyen d'automatiser cette partie.
						.on("sync:model", (evt: CustomEvent<string>) => {
							this.alternativeNickname.set(evt.detail);
						}),

					textInput(
						this.realname,
						{
							label: "user",
							name: "realname",
						},
						{
							placeholder: "Nom réel",
						},
					)
						.displayWhen(this.advancedInfo)
						// FIXME: trouver un moyen d'automatiser cette partie.
						.on("sync:model", (evt: CustomEvent<string>) => {
							this.alternativeNickname.set(evt.detail);
						}),

					textInput(
						this.channels,
						{
							label: "channel",
							name: "channels",
						},
						{
							placeholder: "Salons à rejoindre",
						},
					)
						// FIXME: trouver un moyen d'automatiser cette partie.
						.on("sync:model", (evt: CustomEvent<string>) => {
							this.channels.set(evt.detail);
						}),
				)
					.id("#chat-login-form")
					.class("ov:h flex! border/radius=1")
					.action("/chat/login")
					.method("POST")
					.submitWith({
						success: this.submitHandler,
					}),
				div(
					buttonIcon("plus")
						.title("Afficher les champs avancés")
						.onClick(this.displayAdvancedInfoHandler),
				)
					.class("align-t:center")
					.displayWhen(this.advancedInfo.computed((b) => !b)),
				div(
					label(
						"Connexion automatique lors de vos prochaines sessions :",
					),
					inputSwitch(this.rememberMe.value, {
						labelN: "Non",
						labelY: "Oui",
						name: "remember_me",
					}).on("sync:model", (evt: CustomEvent<boolean>) => {
						this.rememberMe.set(evt.detail);
					}),
				).class("remember-me [ m:a align-t:center w=35 ]"),

				this.loader.computed((loader) =>
					uiButton(
						{
							icon: loader ? "loader" : undefined,
							position: "right",
							type: "submit",
						},
						{
							// @ts-expect-error à corriger
							form: "chat-login-form",
						},
						span("Accéder au Chat").class("flex:full"),
					).class("flex align-jc:se p=2 b:none cursor:pointer"),
				),
			).class("flex! gap=3 min-w=43"),
			// 	<UiButton icon="settings" class="color-scheme" @click="toSettingsView" />
			//
			// <ModulesProgress />
		)
			.id("#chat-login-view")
			.class("scroll:y flex! flex/center:full m:a pos-r");
	}

	/**
	 * Affiche les informations de connexion avancées.
	 */
	displayAdvancedInfoHandler = () => {
		this.advancedInfo.set(true);
	};

	submitHandler = (evt: SubmitEvent) => {
		console.log(this, evt);
	};
}
