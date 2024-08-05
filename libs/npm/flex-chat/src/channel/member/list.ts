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

import type { ChannelAccessLevelGroup } from "../access_level";
import type { ChannelMember } from "../member";

import { None } from "@phisyx/flex-safety";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelMembers
{
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
		admin_operators: new Map(),
		operators: new Map(),
		half_operators: new Map(),
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
	get size(): number
	{
		return (
			this.members.owners.size +
			this.members.admin_operators.size +
			this.members.operators.size +
			this.members.half_operators.size +
			this.members.vips.size +
			this.members.users.size
		);
	}

	/**
	 * Tous les membres du salon.
	 */
	get all()
	{
		return [...this.moderators, ...this.vips, ...this.users];
	}

	/**
	 * Les modérateurs de la liste des membres.
	 */
	get moderators()
	{
		let owners = sort(Array.from(this.members.owners.values()));
		let admin_operators = sort(Array.from(this.members.admin_operators.values()));
		let operators = Array.from(this.members.operators.values());
		let half_operators = sort(Array.from(this.members.half_operators.values()));
		return [...owners, ...admin_operators, ...operators, ...half_operators];
	}

	/**
	 * Les VIP's de la liste des membres.
	 */
	get vips()
	{
		let vips = sort(Array.from(this.members.vips.values()));
		return vips;
	}

	/**
	 * Les utilisateurs de la liste des membres.
	 */
	get users()
	{
		let users = sort(Array.from(this.members.users.values()));
		return users;
	}

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Ajoute un pseudo de salon dans la liste des membres du salon.
	 */
	add(member: ChannelMember)
	{
		let group = this.members[member.access_level.highest.group];
		group.set(member.id, member);
	}

	/**
	 * Change le pseudonyme d'un membre par un nouveau pseudonyme.
	 */
	change_nickname(id: UserID, _old_nickname: string, new_nickname: string)
	{
		this.get(id).then((old_channel_member) => {
			old_channel_member.set_nickname(new_nickname);
		});
	}

	/**
	 * Récupère le pseudo du salon en fonction d'un ID donné, s'il existe.
	 */
	get(id: UserID): Option<ChannelMember>
	{
		for (let map of Object.values(this.members)) {
			let member = map.get(id);
			if (member) {
				return member.into_some();
			}
		}
		return None();
	}

	/**
	 * Récupère le pseudo du salon en fonction d'un pseudonyme donné, s'il
	 * existe.
	 */
	get_by_nickname(nickname: string): Option<ChannelMember>
	{
		for (let map of Object.values(this.members)) {
			let members = new Set(map.values());
			for (let member of members) {
				if (member.eq(nickname)) {
					return member.into_some();
				}
			}
		}
		return None();
	}

	/**
	 * Est-ce que la liste des membres contient le pseudonyme donné.
	 */
	has(id: UserID): boolean
	{
		return Object.values(this.members).some((map) => map.has(id));
	}

	/**
	 * Supprime un pseudo de la liste des membres, en fonction d'un pseudonyme
	 * donné, s'il existe.
	 */
	remove(id: UserID): Option<ChannelMember>
	{
		let maybe_found_member: Option<ChannelMember> = None();
		for (let map of Object.values(this.members)) {
			let member = map.get(id);
			if (member) {
				maybe_found_member.replace(member);
				map.delete(id);
				break;
			}
		}
		return maybe_found_member;
	}

	/**
	 * Définit un membre du salon comme étant sélectionné.
	 */
	select(user_id: UserID)
	{
		this._selected.replace(user_id);
	}

	/**
	 * Membre du salon sélectionné.
	 */
	selected(): Option<ChannelMember>
	{
		return this._selected.and_then((user_id) => this.get(user_id));
	}

	/**
	 * Désélectionne un membre du salon sélectionné.
	 */
	unselect(_userID: UserID)
	{
		this._selected = None();
	}
}

// -------- //
// Fonction //
// -------- //

function sort(list: Array<ChannelMember>): Array<ChannelMember>
{
	list.sort((l, r) => {
		return l.nickname.toLowerCase() < r.nickname.toLowerCase() ? -1 : 1;
	});
	return list;
}
