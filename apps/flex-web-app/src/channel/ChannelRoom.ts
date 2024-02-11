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

import { Room } from "~/room/Room";
import { Layer, OverlayerStore } from "~/store/OverlayerStore";
import { User, UserID } from "~/user/User";

import { ChannelAccessLevel } from "./ChannelAccessLevel";
import { ChannelMember } from "./ChannelMember";
import { ChannelMembers } from "./ChannelMembers";
import { ChannelTopic } from "./ChannelTopic";

// ---- //
// Type //
// ---- //

export type ChannelID = string;

// -------------- //
// Implémentation //
// -------------- //

export class ChannelJoinDialog {
	// ------ //
	// Static //
	// ------ //

	static ID = "channel-join-layer";

	static create(
		overlayerStore: OverlayerStore,
		payload: {
			event: Event;
		},
	) {
		overlayerStore.create({
			id: ChannelJoinDialog.ID,
			centered: true,
			event: payload.event,
		});

		return new ChannelJoinDialog(overlayerStore);
	}

	static destroy(overlayerStore: OverlayerStore) {
		overlayerStore.destroy(ChannelJoinDialog.ID);
	}

	// ----------- //
	// Constructor //
	// ----------- //
	constructor(private overlayerStore: OverlayerStore) {}

	// ------- //
	// Méthode //
	// ------- //

	destroy() {
		this.overlayerStore.destroy(ChannelJoinDialog.ID);
	}

	get(): Layer | undefined {
		return this.overlayerStore.get(ChannelJoinDialog.ID);
	}

	exists(): boolean {
		return this.overlayerStore.has(ChannelJoinDialog.ID);
	}
}

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
	users = new ChannelMembers();

	// ------- //
	// Méthode //
	// ------- //

	/**
	 * Ajoute une utilisateur à la liste des utilisateurs.
	 */
	addUser(nick: ChannelMember) {
		this.users.add(nick);
	}

	/**
	 * Est-ce que le pseudo PEUT éditer le topic en fonction de ses modes.
	 */
	canEditTopic(cnick: ChannelMember): boolean {
		return (
			this.topic.isEditable() ||
			this.isUserGlobalOperator(cnick.intoUser()) ||
			this.memberHasChannelOperatorAccessLevel(cnick)
		);
	}

	/**
	 * Est-ce que le pseudo a des droits d'opérateurs (HalfOperator min).
	 */
	memberHasChannelOperatorAccessLevel(cnick: ChannelMember): boolean {
		return cnick.highestAccessLevel.level >= ChannelAccessLevel.HalfOperator;
	}

	/**
	 * Récupère un utilisateur du salon.
	 */
	getUser(id: UserID): Option<ChannelMember> {
		return this.users.get(id);
	}

	/**
	 * Est-ce que l'utilisateur est un opérateur global.
	 */
	isUserGlobalOperator(user: User) {
		return user.isGlobalOperator();
	}

	/**
	 * Supprime un utilisateur du salon.
	 */
	removeUser(id: UserID): boolean {
		return this.users.remove(id).is_some();
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
		if (["q", "a", "o", "h", "v"].includes(mode)) {
			return;
		}
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
	upgradeUser(oldNick: ChannelMember, newNick: ChannelMember) {
		this.users.remove(oldNick.id);
		newNick.highestAccessLevel;
		this.users.add(newNick);
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
		this.addUser(new ChannelMember(user).withAccessLevel(ChannelAccessLevel.Owner));
		return this;
	}
}
