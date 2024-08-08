// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type { User } from "../user";

import { Option } from "@phisyx/flex-safety";

import { is_user } from "../asserts/user";
import { Room } from "../room";
import { ChannelAccessControl } from "./access_control";
import { ChannelAccessLevelFlag } from "./access_level";
import { ChannelActivities } from "./activity";
import { ChannelMember } from "./member";
import { ChannelMembers } from "./member/list";
import { ChannelTopic } from "./topic";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelRoom extends Room<ChannelID, "channel">
{
	// ------ //
	// Static //
	// ------ //

	public static type: string = "channel" as string;

	/**
	 * Crée un salon avec un propriétaire.
	 */
	static create_with_owner(name: ChannelID, user: User | Origin): ChannelRoom
	{
		return new ChannelRoom(name).with_id(name).with_owner(user);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(name: ChannelID)
	{
		super("channel", name);
	}

	// --------- //
	// Propriété //
	// --------- //

	/**
	 * Control d'accès
	 */
	access_control = new ChannelAccessControl();

	/**
	 * Activités du salon
	 */
	activities = new ChannelActivities();

	/**
	 * Le salon rejoint est en état de sanction.
	 */
	kicked = false;

	/**
	 * Paramètres du salon.
	 */
	settings: Set<string> = new Set();

	/**
	 * Sujet du salon.
	 */
	topic = new ChannelTopic();

	/**
	 * Liste des utilisateurs d'un salon.
	 */
	members = new ChannelMembers();

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Ajoute un membre à la liste des membres.
	 */
	add_member(member: ChannelMember | User): ChannelMember
	{
		if (is_user(member)) {
			let new_member = new ChannelMember(member);
			this.members.add(new_member);
			return new_member;
		}

		this.members.add(member);
		return member;
	}

	/**
	 * Est-ce que le pseudo PEUT éditer le topic en fonction de ses modes.
	 */
	can_edit_topic(member: ChannelMember): boolean
	{
		return (
			this.topic.is_editable() ||
			member.is_global_operator() ||
			member.is_channel_operator()
		);
	}

	/**
	 * Cherche si membre se trouve dans la liste des bans.
	 */
	find_ban(member: ChannelMember): Option<[MaskAddr, AccessControlMode["mask"]]>
	{
		let ban_list = this.access_control.banlist;

		let get = (addr: MaskAddr): Option<[MaskAddr, AccessControlMode["mask"]]> => {
			return Option.from(ban_list.get(addr)).map((mode) => [
				addr,
				mode.flag.mask,
			]);
		};

		return get(member.address("nick!ident@hostname"))
			.or_else(() => get(member.address("*!*@*.hostname")))
			.or_else(() => get(member.address("*!*@hostname")))
			.or_else(() => get(member.address("*!*ident@*.hostname")))
			.or_else(() => get(member.address("*!*ident@hostname")))
			.or_else(() => get(member.address("*!ident@hostname")))
			.or_else(() => get(member.address("nick!*@*")))
			.or_else(() => get(member.address("nick!*@*.hostname")))
			.or_else(() => get(member.address("nick!*@hostname")))
			.or_else(() => get(member.address("nick!*ident@*.hostname")))
			.or_else(() => get(member.address("nick!*ident@hostname")))
			.or_else(() => get(member.address("*!*@*")));
	}

	/**
	 * Récupère un utilisateur du salon de son ID.
	 */
	get_member(id: UserID): Option<ChannelMember>
	{
		return this.members.get(id);
	}

	/**
	 * Récupère un utilisateur du salon en fonction de son pseudo.
	 */
	get_member_by_nickname(nickname: string): Option<ChannelMember>
	{
		return this.members.get_by_nickname(nickname);
	}

	/**
	 * Supprime un utilisateur du salon.
	 */
	remove_member(id: UserID): boolean
	{
		return this.members.remove(id).is_some();
	}

	/**
	 * Définit (ou non) le salon comme étant en sanctionné.
	 */
	set_kicked(bool: boolean)
	{
		this.kicked = bool;
	}

	/**
	 * Définit un paramètre de salon.
	 */
	set_setting_mode(mode: string)
	{
		this.settings.add(mode);
	}

	/**
	 * Définit le sujet d'un salon.
	 */
	set_topic(topic: string)
	{
		this.topic.set(topic, { force: true });
	}

	/**
	 * Définit un sujet vide pour le salon.
	 */
	unset_topic()
	{
		this.topic.unset({ force: true });
	}

	/**
	 * Met à jour un utilisateur.
	 */
	upgrade_member(old_member: ChannelMember, new_member: ChannelMember)
	{
		this.members.remove(old_member.id);
		new_member.access_level.highest; // NOTE: compute access level
		this.members.add(new_member);
	}

	/**
	 * Retire un paramètre de salon.
	 */
	unset_setting_mode(mode: string)
	{
		this.settings.delete(mode);
	}

	/**
	 * Méthode d'instanciation de classe avec un propriétaire.
	 */
	with_owner(user: User | Origin): this
	{
		this.add_member(
			new ChannelMember(user)
				.with_access_level(ChannelAccessLevelFlag.Owner),
		);
		return this;
	}
}
