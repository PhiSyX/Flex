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
import { ChannelNick } from "~/channel/ChannelNick";
import { ChannelUsers } from "~/channel/ChannelUsers";
import { User } from "~/user/User";
import { Room } from "../room/Room";
import { ChannelAccessLevel } from "./ChannelAccessLevel";
import { ChannelTopic } from "./ChannelTopic";

// ---- //
// Type //
// ---- //

export type ChannelID = string;

// -------------- //
// Implémentation //
// -------------- //

export class ChannelRoom extends Room<"channel"> {
	// ------ //
	// Static //
	// ------ //

	/**
	 * Crée un salon avec un propriétaire.
	 */
	static createWithOwner(name: string, user: User): ChannelRoom {
		return new ChannelRoom(name).withID(name).withOwner(user);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(name: string) {
		super("channel", name);
	}

	// --------- //
	// Propriété //
	// --------- //

	/**
	 * Le salon rejoint est en état de sanction.
	 */
	kicked = false;

	/**
	 * Sujet du salon.
	 */
	topic = new ChannelTopic();

	/**
	 * Liste des utilisateurs d'un salon.
	 */
	users = new ChannelUsers();

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Ajoute une utilisateur à la liste des utilisateurs.
	 */
	addUser(nick: ChannelNick) {
		this.users.add(nick);
	}

	/**
	 * Est-ce que le pseudo PEUT éditer le topic en fonction de ses modes.
	 */
	canEditTopic(cnick: ChannelNick): boolean {
		return (
			this.topic.isEditable() ||
			this.isUserGlobalOperator(cnick.intoUser()) ||
			this.cnickHasChannelOperatorAccessLevel(cnick)
		);
	}

	/**
	 * Est-ce que le pseudo a des droits d'opérateurs (HalfOperator min).
	 */
	cnickHasChannelOperatorAccessLevel(cnick: ChannelNick): boolean {
		return cnick.highestAccessLevel.level >= ChannelAccessLevel.HalfOperator;
	}

	/**
	 * Récupère un utilisateur du salon.
	 */
	getUser(id: string): Option<ChannelNick> {
		return this.users.get(id);
	}

	/**
	 * Supprime un utilisateur du salon.
	 */
	removeUser(id: string): boolean {
		return this.users.remove(id).is_some();
	}

	/**
	 * Définit (ou non) le salon comme étant en sanctionné.
	 */
	setKicked(bool: boolean) {
		this.kicked = bool;
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
	upgradeUser(oldNick: ChannelNick, newNick: ChannelNick) {
		this.users.remove(oldNick.id);
		newNick.highestAccessLevel;
		this.users.add(newNick);
	}

	/**
	 * Est-ce que l'utilisateur est un opérateur global.
	 */
	isUserGlobalOperator(user: User) {
		return user.isGlobalOperator();
	}

	/**
	 * Méthode d'instanciation de classe avec un propriétaire.
	 */
	withOwner(user: User): this {
		this.addUser(new ChannelNick(user).withAccessLevel(ChannelAccessLevel.Owner));
		return this;
	}
}
