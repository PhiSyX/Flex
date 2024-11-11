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

import { is_string } from "@phisyx/flex-asserts/primitive";
import { None, Some } from "@phisyx/flex-safety";

import { is_user } from "../asserts/user";

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
	static from(user_origin: Origin | User): User {
		let user: User;

		if (is_user(user_origin)) {
			user = user_origin;
		} else {
			user = new User(user_origin);
		}

		return user;
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(user: Origin | User) {
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
	is_current_client = false;

	/**
	 * Drapeau d'opérateur de l'utilisateur.
	 */
	operator: Option<UserFlag> = None();

	/**
	 * Les salons (en communs) de l'utilisateur.
	 */
	channels: Set<ChannelID> = new Set();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	/**
	 * Nom d'hôte de l'utilisateur.
	 */
	get hostname() {
		return this.host.vhost || this.host.cloaked;
	}

	/**
	 * Les classes CSS de l'utilisateur à appliquer aux composants de pseudo.
	 */
	get class_name(): string {
		if (this.away) {
			return "is-away";
		}
		return "";
	}

	get full_address(): MaskAddr {
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
		let tmp: MaskAddr | string = this.full_address;

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
	parse_flag(flag: string): Option<UserFlag> {
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
	eq(other: this | string): boolean {
		if (is_string(other)) {
			return (
				other === this.id ||
				other === this.nickname ||
				other === this.ident
			);
		}

		return (
			other === this ||
			(other.id === this.id &&
				other.nickname === this.nickname &&
				other.ident === this.ident &&
				other.hostname === this.hostname)
		);
	}

	/**
	 * Englobe l'instance dans un type Option.Some
	 */
	into_some(): Option<this> {
		return Some(this);
	}

	/**
	 * Est-ce que l'utilisateur est un opérateur local?
	 */
	is_local_operator() {
		return this.operator
			.filter((flag) => flag === UserFlag.LocalOperator)
			.is_some();
	}

	/**
	 * Est-ce que l'utilisateur est un opérateur global?
	 */
	is_global_operator() {
		return this.operator
			.filter((flag) => flag === UserFlag.GlobalOperator)
			.is_some();
	}

	/**
	 * Est-ce que l'utilisateur est un opérateur local ou global?
	 */
	is_operator() {
		return this.is_local_operator() || this.is_global_operator();
	}

	/**
	 * Marque l'utilisateur comme étant absent.
	 */
	marks_as_away() {
		this.away = true;
	}

	/**
	 * Marque l'utilisateur comme n'étant plus absent.
	 */
	marks_as_no_longer_away() {
		this.away = false;
	}

	/**
	 * Est-ce que l'utilisateur donné correspond à celui de l'instance,
	 * comparaison partielle
	 */
	partial_eq(user: this): boolean;
	partial_eq(nickname: string): boolean;
	partial_eq(other: unknown): boolean {
		if (is_string(other)) {
			return other.toLowerCase() === this.nickname.toLowerCase();
		}

		if (is_user(other)) {
			return other.nickname.toLowerCase() === this.nickname.toLowerCase();
		}

		return false;
	}

	/**
	 * Définit un nouveau pseudonyme pour l'utilisateur.
	 */
	set_nickname(nickname: string) {
		this.nickname = nickname;
	}

	with_id(id: this["id"]): this {
		this.id = id;
		return this;
	}

	/**
	 * Ajoute des salons à l'utilisateur.
	 */
	with_channel(channel_id: ChannelID): this {
		this.channels.add(channel_id);
		return this;
	}

	/**
	 * Définit le pseudo comme étant celui actuellement connecté en tant que
	 * client.
	 */
	with_is_current_client(bool: boolean): this {
		this.is_current_client = bool;
		return this;
	}

	/**
	 * Ajoute des drapeaux d'opérateurs à l'utilisateur.
	 */
	with_operator_flag(flag: UserFlag | string): this {
		if (is_string(flag)) {
			this.operator = this.parse_flag(flag);
		} else {
			this.operator.replace(flag);
		}
		return this;
	}
}
