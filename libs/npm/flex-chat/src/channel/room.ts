// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import { Option } from "@phisyx/flex-safety";

import { Room } from "../room";
import type { User } from "../user";

import { ChannelAccessControl } from "./access_control";
import { ChannelAccessLevelFlag } from "./access_level";
import { ChannelActivities } from "./activity";
import { ChannelMember } from "./member";
import { ChannelMembers } from "./member/list";
import { ChannelTopic } from "./topic";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelRoom extends Room<ChannelID, "channel"> {
	// ------ //
	// Static //
	// ------ //

	/**
	 * Crée un salon avec un propriétaire.
	 */
	static createWithOwner(name: ChannelID, user: User): ChannelRoom {
		return new ChannelRoom(name).withID(name).withOwner(user);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(name: ChannelID) {
		super("channel", name);
	}

	// --------- //
	// Propriété //
	// --------- //

	/**
	 * Control d'accès
	 */
	accessControl = new ChannelAccessControl();

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
	addMember(member: ChannelMember) {
		this.members.add(member);
	}

	/**
	 * Est-ce que le pseudo PEUT éditer le topic en fonction de ses modes.
	 */
	canEditTopic(member: ChannelMember): boolean {
		return (
			this.topic.isEditable() ||
			member.isGlobalOperator() ||
			member.isChanOperator()
		);
	}

	/**
	 * Cherche si membre se trouve dans la liste des bans.
	 */
	findBan(
		member: ChannelMember,
	): Option<[MaskAddr, AccessControlMode["mask"]]> {
		const banList = this.accessControl.banlist;

		const get = (
			addr: MaskAddr,
		): Option<[MaskAddr, AccessControlMode["mask"]]> => {
			return Option.from(banList.get(addr)).map((mode) => [
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
	getMember(id: UserID): Option<ChannelMember> {
		return this.members.get(id);
	}

	/**
	 * Récupère un utilisateur du salon en fonction de son pseudo.
	 */
	getMemberByNickname(nickname: string): Option<ChannelMember> {
		return this.members.getByNickname(nickname);
	}

	/**
	 * Supprime un utilisateur du salon.
	 */
	removeMember(id: UserID): boolean {
		return this.members.remove(id).is_some();
	}

	/**
	 * Définit (ou non) le salon comme étant en sanctionné.
	 */
	setKicked(bool: boolean) {
		this.kicked = bool;
	}

	/**
	 * Définit un paramètre de salon.
	 */
	setSettingMode(mode: string) {
		this.settings.add(mode);
	}

	/**
	 * Définit le sujet d'un salon.
	 */
	setTopic(topic: string) {
		this.topic.set(topic, { force: true });
	}

	/**
	 * Définit un sujet vide pour le salon.
	 */
	unsetTopic() {
		this.topic.unset({ force: true });
	}

	/**
	 * Met à jour un utilisateur.
	 */
	upgradeMember(oldNick: ChannelMember, newNick: ChannelMember) {
		this.members.remove(oldNick.id);
		newNick.accessLevel.highest;
		this.members.add(newNick);
	}

	/**
	 * Retire un paramètre de salon.
	 */
	unsetSettingMode(mode: string) {
		this.settings.delete(mode);
	}

	/**
	 * Méthode d'instanciation de classe avec un propriétaire.
	 */
	withOwner(user: User): this {
		this.addMember(
			new ChannelMember(user).withAccessLevel(
				ChannelAccessLevelFlag.Owner,
			),
		);
		return this;
	}
}
