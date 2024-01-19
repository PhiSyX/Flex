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
import { ChannelAccessLevelGroup } from "./ChannelAccessLevel";
import { ChannelNick } from "./ChannelNick";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelUsers {
	// --------- //
	// Propriété //
	// --------- //

	/**
	 * Les membres du salon organisé par groupes de niveaux d'access.
	 */
	private members: Record<ChannelAccessLevelGroup, Map<string, ChannelNick>> =
		{
			owners: new Map(),
			adminOperators: new Map(),
			operators: new Map(),
			halfOperators: new Map(),
			vips: new Map(),
			users: new Map(),
		};

	// --------------- //
	// Getter | Setter //
	// --------------- //

	/**
	 * Le nombre total de membres.
	 */
	get size(): number {
		return (
			this.members.owners.size +
			this.members.adminOperators.size +
			this.members.operators.size +
			this.members.halfOperators.size +
			this.members.vips.size +
			this.members.users.size
		);
	}

	/**
	 * Les modérateurs de la liste des membres.
	 */
	get moderators() {
		const owners = sort(Array.from(this.members.owners.values()));
		const adminOperators = sort(
			Array.from(this.members.adminOperators.values()),
		);
		const operators = Array.from(this.members.operators.values());
		const halfOperators = sort(
			Array.from(this.members.halfOperators.values()),
		);
		return [...owners, ...adminOperators, ...operators, ...halfOperators];
	}

	/**
	 * Les VIP's de la liste des membres.
	 */
	get vips() {
		const vips = sort(Array.from(this.members.vips.values()));
		return vips;
	}

	/**
	 * Les utilisateurs de la liste des membres.
	 */
	get users() {
		const users = sort(Array.from(this.members.users.values()));
		return users;
	}

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Ajoute un pseudo de salon dans la liste des membres du salon.
	 */
	add(nick: ChannelNick) {
		const group = this.members[nick.highestAccessLevel.group];
		group.set(nick.nickname.toLowerCase(), nick);
	}

	/**
	 * Récupère le pseudo du salon en fonction d'un pseudonyme donné, s'il
	 * existe.
	 */
	get(nickname: string): Option<ChannelNick> {
		for (const map of Object.values(this.members)) {
			const nick = map.get(nickname.toLowerCase());
			if (nick) return Some(nick);
		}
		return None();
	}

	/**
	 * Supprime un pseudo de la liste des membres, en fonction d'un pseudonyme
	 * donné, s'il existe.
	 */
	remove(nickname: string): Option<ChannelNick> {
		const foundNick: Option<ChannelNick> = None();
		for (const map of Object.values(this.members)) {
			const nick = map.get(nickname.toLowerCase());
			if (nick) {
				foundNick.replace(nick);
				map.delete(nickname.toLowerCase());
				break;
			}
		}
		return foundNick;
	}
}

// -------- //
// Fonction //
// -------- //

function sort(list: Array<ChannelNick>): Array<ChannelNick> {
	list.sort((l, r) =>
		l.nickname.toLowerCase() < r.nickname.toLowerCase() ? -1 : 1,
	);
	return list;
}