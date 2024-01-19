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
import { Room } from "../room/Room";
import { ChannelAccessLevel } from "./ChannelAccessLevel";

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
	static createWithOwner(name: string, origin: Origin): ChannelRoom {
		return new ChannelRoom(name).withOwner(origin);
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
	 * Récupère un utilisateur du salon.
	 */
	getUser(nickname: string): Option<ChannelNick> {
		return this.users.get(nickname);
	}

	/**
	 * Supprime un utilisateur du salon.
	 */
	removeUser(nickname: string): boolean {
		return this.users.remove(nickname).is_some();
	}

	/**
	 * Met à jour un utilisateur.
	 */
	upgradeUser(oldNick: ChannelNick, newNick: ChannelNick) {
		this.users.remove(oldNick.nickname);
		newNick.highestAccessLevel;
		this.users.add(newNick);
	}

	/**
	 * Méthode d'instanciation de classe avec un propriétaire.
	 */
	withOwner(origin: Origin): this {
		this.addUser(
			new ChannelNick(origin).withAccessLevel(ChannelAccessLevel.Owner),
		);
		return this;
	}
}
