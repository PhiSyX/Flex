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

import type { ChannelAccessLevelGroup } from "../access_level";
import type { ChannelMember } from "../member";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelMembers {
	// --------- //
	// Propriété //
	// --------- //

	/**
	 * Les membres du salon organisé par groupes de niveaux d'access.
	 */
	private members: Record<
		ChannelAccessLevelGroup,
		Map<UserID, ChannelMember>
	> = {
		owners: new Map(),
		adminOperators: new Map(),
		operators: new Map(),
		halfOperators: new Map(),
		vips: new Map(),
		users: new Map(),
	};

	/**
	 * Membre sélectionné d'un salon.
	 */
	private _selected: Option<UserID> = None();

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
	 * Tous les membres du salon.
	 */
	get all() {
		return [...this.moderators, ...this.vips, ...this.users];
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
	add(member: ChannelMember) {
		const group = this.members[member.accessLevel.highest.group];
		group.set(member.id, member);
	}

	/**
	 * Change le pseudonyme d'un membre par un nouveau pseudonyme.
	 */
	changeNickname(id: UserID, _oldNickname: string, newNickname: string) {
		this.get(id).then((oldChannelMember) => {
			oldChannelMember.setNickname(newNickname);
		});
	}

	/**
	 * Récupère le pseudo du salon en fonction d'un pseudonyme donné, s'il
	 * existe.
	 */
	get(id: UserID): Option<ChannelMember> {
		for (const map of Object.values(this.members)) {
			const member = map.get(id);
			if (member) return Some(member);
		}
		return None();
	}

	/**
	 * Est-ce que la liste des membres contient le pseudonyme donné.
	 */
	has(id: UserID): boolean {
		return Object.values(this.members).some((map) => map.has(id));
	}

	/**
	 * Supprime un pseudo de la liste des membres, en fonction d'un pseudonyme
	 * donné, s'il existe.
	 */
	remove(id: UserID): Option<ChannelMember> {
		const foundMember: Option<ChannelMember> = None();
		for (const map of Object.values(this.members)) {
			const member = map.get(id);
			if (member) {
				foundMember.replace(member);
				map.delete(id);
				break;
			}
		}
		return foundMember;
	}

	/**
	 * Définit un membre du salon comme étant sélectionné.
	 */
	select(userID: UserID) {
		this._selected.replace(userID);
	}

	/**
	 * Membre du salon sélectionné.
	 */
	selected(): Option<ChannelMember> {
		return this._selected.and_then((userID) => this.get(userID));
	}

	/**
	 * Désélectionne un membre du salon sélectionné.
	 */
	unselect(_userID: UserID) {
		this._selected = None();
	}
}

// -------- //
// Fonction //
// -------- //

function sort(list: Array<ChannelMember>): Array<ChannelMember> {
	list.sort((l, r) => {
		return l.nickname.toLowerCase() < r.nickname.toLowerCase() ? -1 : 1;
	});
	return list;
}
