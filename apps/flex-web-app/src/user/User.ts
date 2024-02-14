// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { None, Option, Some } from "@phisyx/flex-safety";

import { Layer, OverlayerStore } from "~/store/OverlayerStore";

// ---- //
// Type //
// ---- //

export type UserID = UUID;

export interface UserChangeNicknameRecordDialog {}

// ----------- //
// Énumération //
// ----------- //

export enum UserFlag {
	/**
	 * Drapeau Opérateur Local
	 */
	LocalOperator = 10,
	/**
	 * Drapeau Opérateur Global
	 */
	GlobalOperator = 20,
}

// -------------- //
// Implémentation //
// -------------- //

export class UserChangeNicknameDialog {
	// ------ //
	// Static //
	// ------ //

	static ID = "user-change-nickname-dialog";

	static create(overlayerStore: OverlayerStore, { event }: { event: MouseEvent }) {
		overlayerStore.create({
			id: UserChangeNicknameDialog.ID,
			centered: true,
			event,
		});
		return new UserChangeNicknameDialog(overlayerStore);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private overlayerStore: OverlayerStore) {}

	// ------- //
	// Méthode //
	// ------- //

	destroy() {
		this.overlayerStore.destroy(UserChangeNicknameDialog.ID);
	}

	get(): Layer<UserChangeNicknameRecordDialog> | undefined {
		return this.overlayerStore.get(UserChangeNicknameDialog.ID) as
			| Layer<UserChangeNicknameRecordDialog>
			| undefined;
	}

	getUnchecked(): Layer<UserChangeNicknameRecordDialog> {
		return this.overlayerStore.get(
			UserChangeNicknameDialog.ID,
		) as Layer<UserChangeNicknameRecordDialog>;
	}

	exists(): boolean {
		return this.overlayerStore.has(UserChangeNicknameDialog.ID);
	}

	withData(data: UserChangeNicknameRecordDialog) {
		this.overlayerStore.updateData(UserChangeNicknameDialog.ID, data);
	}
}

export class User {
	// ----------- //
	// Constructor //
	// ----------- //
	constructor(user: Origin) {
		this.id = user.id;
		this.nickname = user.nickname;
		this.ident = user.ident;
		this.host = user.host;
	}

	// -------- //
	// Property //
	// -------- //

	/**
	 * Est-ce que l'utilisateur est absent.
	 */
	away = false;

	/**
	 * ID de l'utilisateur.
	 */
	declare id: Origin["id"];

	/**
	 * Pseudonyme de l'utilisateur.
	 */
	declare nickname: Origin["nickname"];

	/**
	 * Identifiant de l'utilisateur.
	 */
	declare ident: Origin["ident"];

	/**
	 * Hôte de l'utilisateur.
	 */
	declare host: Origin["host"];

	/**
	 * Drapeau d'opérateur de l'utilisateur.
	 */
	operator: Option<UserFlag> = None();

	/**
	 * Les salons (en communs) de l'utilisateur.
	 */
	channels: Set<string> = new Set();

	/**
	 * Nom d'hôte de l'utilisateur.
	 */
	get hostname() {
		return this.host.vhost || this.host.cloaked;
	}

	/**
	 * Les classes CSS de l'utilisateur à appliquer aux composants de pseudo.
	 */
	get className() {
		if (this.away) return "is-away";
		return "";
	}

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Analyse d'un drapeau.
	 */
	parseFlag(flag: string): Option<UserFlag> {
		switch (flag.toLowerCase()) {
			case "localoperator":
				return Some(UserFlag.LocalOperator);
			case "globaloperator":
				return Some(UserFlag.GlobalOperator);
		}
		return None();
	}

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	/**
	 * Est-ce que l'utilisateur est un opérateur local?
	 */
	isLocalOperator() {
		return this.operator.filter((flag) => flag === UserFlag.LocalOperator).is_some();
	}

	/**
	 * Est-ce que l'utilisateur est un opérateur global?
	 */
	isGlobalOperator() {
		return this.operator.filter((flag) => flag === UserFlag.GlobalOperator).is_some();
	}

	/**
	 * Est-ce que l'utilisateur est un opérateur local ou global?
	 */
	isOperator() {
		return this.isLocalOperator() || this.isGlobalOperator();
	}

	/**
	 * Marque l'utilisateur comme étant absent.
	 */
	marksAsAway() {
		this.away = true;
	}

	/**
	 * Marque l'utilisateur comme n'étant plus absent.
	 */
	marksAsNoLongerAway() {
		this.away = false;
	}

	/**
	 * Définit un nouveau pseudonyme pour l'utilisateur.
	 */
	setNickname(nickname: string) {
		this.nickname = nickname;
	}

	/**
	 * Ajoute des salons à l'utilisateur.
	 */
	withChannel(channelID: string): this {
		this.channels.add(channelID);
		return this;
	}

	/**
	 * Ajoute des drapeaux d'opérateurs à l'utilisateur.
	 */
	withOperatorFlag(flag: UserFlag | string): this {
		if (typeof flag === "string") {
			this.operator = this.parseFlag(flag);
			return this;
		}
		this.operator.replace(flag);
		return this;
	}
}
