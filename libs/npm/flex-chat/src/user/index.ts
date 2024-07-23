// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { None, type Option, Some } from "@phisyx/flex-safety";
import { isUser } from "../asserts/user";

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

export class User {
	static from(userOrigin: Origin | User): User {
		let user: User;

		if (isUser(userOrigin)) {
			user = userOrigin;
		} else {
			user = new User(userOrigin);
		}

		return user;
	}

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
	id: Origin["id"];

	/**
	 * Pseudonyme de l'utilisateur.
	 */
	nickname: Origin["nickname"];

	/**
	 * Identifiant de l'utilisateur.
	 */
	ident: Origin["ident"];

	/**
	 * Hôte de l'utilisateur.
	 */
	host: Origin["host"];

	/**
	 * Est-ce le pseudonyme est le pseudonyme courant connecté.
	 */
	isCurrentClient = false;

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
	get className(): string {
		if (this.away) return "is-away";
		return "";
	}

	get fullAddress(): MaskAddr {
		return `${this.nickname}!${this.ident}@${this.hostname}` as MaskAddr;
	}

	// ------- //
	// Méthode //
	// ------- //

	address(
		ty:
			| "*!ident@hostname"
			| "*!*ident@hostname"
			| "*!*@hostname"
			| "*!*ident@*.hostname"
			| "*!*@*.hostname"
			| "nick!ident@hostname"
			| "nick!*ident@hostname"
			| "nick!*@hostname"
			| "nick!*ident@*.hostname"
			| "nick!*@*.hostname"
			| "nick!*@*"
			| "*!*@*",
	): MaskAddr {
		let tmp: MaskAddr | string = this.fullAddress;

		switch (ty) {
			case "*!ident@hostname":
				tmp = `*!${this.ident}@${this.hostname}`;
				break;
			case "*!*ident@hostname":
				tmp = `*!*${this.ident}@${this.hostname}`;
				break;
			case "*!*@hostname":
				tmp = `*!*@${this.hostname}`;
				break;
			case "*!*ident@*.hostname":
				tmp = `*!*${this.ident}@${this.hostname}`.replace(
					/[@][^.]+(.*)/,
					"@*$1",
				);
				break;
			case "*!*@*.hostname":
				tmp = `*!*@${this.hostname}`.replace(/[@][^.]+(.*)/, "@*$1");
				break;
			case "nick!ident@hostname":
				break;
			case "nick!*ident@hostname":
				tmp = `${this.nickname}!*${this.ident}@${this.hostname}`;
				break;
			case "nick!*@hostname":
				tmp = `${this.nickname}!*@${this.hostname}`;
				break;
			case "nick!*ident@*.hostname":
				tmp =
					`${this.nickname}!*${this.ident}@${this.hostname}`.replace(
						/[@][^.]+(.*)/,
						"@*$1",
					);
				break;
			case "nick!*@*.hostname":
				tmp = `${this.nickname}!*@${this.hostname}`.replace(
					/[@][^.]+(.*)/,
					"@*$1",
				);
				break;
			case "nick!*@*":
				tmp = `${this.nickname}!*@*`;
				break;
			case "*!*@*":
				tmp = "*!*@*";
				break;

			default:
				throw new Error(`[$address]: le type ${ty} n'existe pas`);
		}

		return tmp as MaskAddr;
	}

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
	 * Est-ce que l'utilisateur donné correspond à celui de l'instance.
	 */
	eq(other: this): boolean {
		return (
			other === this ||
			(other.id === this.id &&
				other.nickname === this.nickname &&
				other.ident === this.ident &&
				other.hostname === this.hostname)
		);
	}

	/**
	 * Est-ce que l'utilisateur est un opérateur local?
	 */
	isLocalOperator() {
		return this.operator
			.filter((flag) => flag === UserFlag.LocalOperator)
			.is_some();
	}

	/**
	 * Est-ce que l'utilisateur est un opérateur global?
	 */
	isGlobalOperator() {
		return this.operator
			.filter((flag) => flag === UserFlag.GlobalOperator)
			.is_some();
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
	 * Est-ce que l'utilisateur donné correspond à celui de l'instance,
	 * comparaison partielle
	 */
	partialEq(user: this): boolean {
		return user.nickname.toLowerCase() === this.nickname.toLowerCase();
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
	 * Définit le pseudo comme étant celui actuellement connecté en tant que
	 * client.
	 */
	withIsCurrentClient(bool: boolean): this {
		this.isCurrentClient = bool;
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
