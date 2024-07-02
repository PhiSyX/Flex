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
	use,
} from "@phisyx/flex-html-element-extension";

import { signal } from "@phisyx/flex-signal";

import {
	MAXLENGTH_NICKNAME,
	PLACEHOLDER_NICKNAME,
	RememberMeStorage,
	VALIDATION_NICKNAME_INFO,
} from "@phisyx/flex-chat";
import ButtonIcon from "../../uikit/icons/button-icon";
import InputSwitch from "../../uikit/inputswitch/input-switch";
import TextInput from "../../uikit/textinput/text-input";

import scss from "./login-view.scss?inline";

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

	render() {
		return main(
			section(
				h1("Accès direct au Chat"),

				form(
					use(
						TextInput,
						{
							label: "url",
							name: "server",
							model: this.websocketServerURL,
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

					use(
						TextInput,
						{
							label: "password",
							name: "password_server",
							model: this.passwordServer,
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

					use(
						TextInput,
						{
							label: "user",
							name: "nickname",
							model: this.nickname,
							// error: errors.nickname
						},
						{
							maxlength: MAXLENGTH_NICKNAME,
							placeholder: PLACEHOLDER_NICKNAME,
							title: VALIDATION_NICKNAME_INFO,
						},
					)
						// FIXME: trouver un moyen d'automatiser cette partie.
						.on("sync:model", (evt: CustomEvent<string>) => {
							this.nickname.set(evt.detail);
						}),

					use(
						TextInput,
						{
							label: "user",
							name: "alternative_nickname",
							model: this.alternativeNickname,
						},
						{
							maxlength: MAXLENGTH_NICKNAME,
							placeholder: "Pseudonyme alternatif",
							title: VALIDATION_NICKNAME_INFO,
						},
					)
						.displayWhen(this.advancedInfo)
						// FIXME: trouver un moyen d'automatiser cette partie.
						.on("sync:model", (evt: CustomEvent<string>) => {
							this.alternativeNickname.set(evt.detail);
						}),

					use(
						TextInput,
						{
							label: "user",
							name: "realname",
							model: this.realname,
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

					use(
						TextInput,
						{
							label: "channel",
							name: "channels",
							model: this.channels,
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
					use(
						ButtonIcon,
						{
							icon: "plus",
						},
						{
							title: "Afficher les champs avancés",
						},
					).onClick(this.displayAdvancedInfoHandler),
				)
					.class("align-t:center")
					.displayWhen(this.advancedInfo.computed((b) => !b)),
				div(
					label(
						"Connexion automatique lors de vos prochaines sessions :",
					),
					use(InputSwitch, {
						labelN: "Non",
						labelY: "Oui",
						name: "remember_me",
						// @ts-expect-error à corriger
						model: this.rememberMe.value,
					}).on("sync:model", (evt: CustomEvent<boolean>) => {
						this.rememberMe.set(evt.detail);
					}),
				).class("remember-me [ m:a align-t:center w=35 ]"),
				//
				// <UiButton
				// 	:icon="loader ? 'loader' : undefined"
				// 	position="right"
				// 	type="submit"
				// 	form="chat-login-form"
				// 	class="[ flex align-jc:se p=2 b:none cursor:pointer ]"
				// >
				// 	<span class="[ flex:full ]">Accéder au Chat</span>
				// </UiButton>
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
