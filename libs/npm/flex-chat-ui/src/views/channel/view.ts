// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃ Copyright: (c) 2024, Mike 'PhiSyX' S. (https://github.com/PhiSyX)         ┃
// ┃ SPDX-License-Identifier: MPL-2.0                                          ┃
// ┃ ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ ┃
// ┃                                                                           ┃
// ┃  This Source Code Form is subject to the terms of the Mozilla Public      ┃
// ┃  License, v. 2.0. If a copy of the MPL was not distributed with this      ┃
// ┃  file, You can obtain one at https://mozilla.org/MPL/2.0/.                ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

import type {
	ChannelAccessLevelFlag,
	ChannelActivitiesView,
	ChannelActivity,
	ChannelActivityRef,
	ChannelMember,
	ChannelMemberSelected,
	ChannelRoom,
	Layer,
	Room,
} from "@phisyx/flex-chat";
import type { Option } from "@phisyx/flex-safety";
import type { ChannelPresenter } from "./presenter";

import { format_date } from "@phisyx/flex-date";
import { None, assert_non_null } from "@phisyx/flex-safety";

// -------------- //
// Implémentation //
// -------------- //

export class ChannelView {
	// --------- //
	// Propriété //
	// --------- //

	private presenter_ref: Option<ChannelPresenter> = None();
	maybe_channel: Option<ChannelRoom> = None();

	// --------------- //
	// Getter | Setter //
	// --------------- //

	get presenter(): ChannelPresenter {
		return this.presenter_ref.unwrap();
	}
	set presenter($1: ChannelPresenter) {
		this.presenter_ref.replace($1);
	}

	// Les activités liées au salon courant (maybe_channel).
	get activities(): ChannelActivitiesView {
		return {
			groups: this.channel.activities.groups.map(([name, groups]) => {
				let created_at = format_date(
					"d.m.Y - H:i:s",
					groups.created_at,
				);

				let updated_at = groups.updated_at.map((date) =>
					format_date("H:i:s", date),
				);

				let activities = groups.activities.map((activity) => {
					switch (name) {
						case "notice": {
							let notice_or_active_room = this.presenter
								.notice_room()
								.unwrap_or(this.channel);
							return this.make_activity(
								notice_or_active_room,
								activity,
							);
						}

						default: {
							return this.make_activity(this.channel, activity);
						}
					}
				});

				return {
					name,
					createdAt: created_at,
					updatedAt: updated_at,
					activities,
				};
			}),
		};
	}

	get channel() {
		return this.maybe_channel.unwrap();
	}

	// Liste de la complétion pour la boite de saisie.
	get completion_list(): Array<string> {
		return this.presenter.completion_list();
	}

	// Le client courant, qui est membre du salon.
	//
	// NOTE: l'utilisateur courant PEUT être sanctionné à tout moment, c'est
	//       pourquoi on évitera de .unwrap() le retour de la fonction
	//       `get_current_member_from`.
	get current_client_channel_member(): Option<ChannelMember> {
		return this.presenter.get_current_member();
	}

	get current_client_user_nickname(): string {
		return this.presenter.get_current_user_nickname();
	}

	get is_userlist_displayed() {
		return (
			this.presenter.layout_settings().channel_userlist_display ?? true
		);
	}

	get position_userlist() {
		return this.presenter.layout_settings().channel_userlist_position ===
			"left"
			? 0
			: 1;
	}

	// Membre du salon actuellement sélectionné par le client courant.
	//
	// NOTE: l'utilisateur courant PEUT être sanctionné à tout moment, c'est
	//       pourquoi on évitera de .unwrap() le retour de la fonction
	//       `get_current_member_from`.
	get selected_member(): Option<ChannelMemberSelected> {
		assert_non_null(this.channel);
		return this.presenter.get_selected_member_from(this.channel);
	}

	get text_format() {
		return this.presenter.personalization_settings().formats;
	}

	get text_colors() {
		return this.presenter.personalization_settings().colors;
	}

	// ------- //
	// Méthode // -> Instance
	// ------- //

	// ------- //
	// Méthode // -> API Publique
	// ------- //

	set_channel_from_route_param() {
		this.maybe_channel = this.presenter.get_channel_from_route();
	}

	// ------- //
	// Méthode // -> Handler
	// ------- //

	/**
	 * Ferme le salon actif.
	 */
	close_handler = () => {
		this.presenter.close();
	};

	/**
	 * Crée le layer du sujet.
	 */
	create_topic_layer_handler = (payload: {
		event: Required<Layer["event"]>;
		linked_element: Required<Layer["dom_element"]>;
		mode: boolean;
	}) => {
		if (payload.mode) {
			this.presenter.create_topic_layer(payload);
		} else {
			this.presenter.destroy_topic_layer();
		}
	};

	/**
	 * Ouvre la boite de dialogue de changement de pseudonyme.
	 */
	open_change_nickname_dialog_handler = (evt: Required<Layer["event"]>) => {
		this.presenter.open_user_change_nickname_dialog(evt);
	};

	/**
	 * Le client courant, membre du salon et opérateur du salon, envoie la
	 * commande de sanction BAN à un autre membre du salon.
	 */
	send_ban_member_command_handler = (member: ChannelMember) => {
		this.presenter.ban_mask(member.address("*!ident@hostname"));
	};

	/**
	 * Le client courant, membre du salon et opérateur du salon, envoie la
	 * commande de sanction BANNICK à un autre membre du salon.
	 */
	send_bannick_member_command_handler = (member: ChannelMember) => {
		this.presenter.ban_mask(member.address("nick!*@*"));
	};

	/**
	 * Envoie les commandes liées aux niveaux d'accès.
	 */
	set_access_level_handler = (
		member: ChannelMember,
		access_level_flag: ChannelAccessLevelFlag,
	) => {
		assert_non_null(this.channel);
		this.presenter.set_access_level(
			this.channel,
			member,
			access_level_flag,
		);
	};

	/**
	 * Envoie les commandes liées aux niveaux d'accès.
	 */
	send_unset_access_level_handler = (
		member: ChannelMember,
		access_level_flag: ChannelAccessLevelFlag,
	) => {
		assert_non_null(this.channel);
		this.presenter.unset_access_level(
			this.channel,
			member,
			access_level_flag,
		);
	};

	/**
	 * Envoie de la commande `/SILENCE +<user>`.
	 */
	send_ignore_user_command_handler = (origin: Origin) => {
		this.presenter.ignore(origin.nickname);
	};

	/**
	 * Envoie de la commande `/SILENCE -<user>`.
	 */
	send_unignore_user_command_handler = (origin: Origin) => {
		this.presenter.unignore(origin.nickname);
	};

	/**
	 * Le client courant, membre du salon et opérateur du salon, envoie la commande
	 * de sanction KICK à un autre membre du salon.
	 */
	send_kick_member_command = (member: ChannelMember) => {
		this.presenter.kick(member, "Kick!");
	};

	/**
	 * Ouvre la boite de dialogue du centre de contrôle du salon actif.
	 */
	open_channel_settings_dialog_handler = (_: Event) => {
		this.presenter.open_channel_settings_dialog();
	};

	/**
	 * Ouvre le menu d'options du salon.
	 */
	open_channel_options_menu_handler = (evt: Event) => {
		this.presenter.open_channel_options_menu(evt);
	};

	/**
	 * Ouvre la boite de couleur du champ de saisie.
	 */
	open_colors_box_handler = (evt: MouseEvent) => {
		this.presenter.open_colors_box(evt);
	};

	/**
	 * Ouvre une chambre.
	 */
	open_room_handler = (room_id: RoomID) => {
		this.presenter.open_room(room_id);
	};

	/**
	 * Ouvre une chambre privé d'un utilisateur.
	 */
	open_private_handler = (origin: Origin) => {
		this.presenter.open_private_or_create(origin);
	};

	/**
	 * Envoie de la commande /JOIN sur le même salon (membre sanctionné d'un
	 * KICK).
	 */
	rejoin_channel_command = () => {
		this.presenter.join();
	};

	/**
	 * Envoie du message au salon actif.
	 */
	send_message_handler = (message: string) => {
		this.presenter.send(message);
	};

	/**
	 * Le client courant, membre du salon et opérateur du salon, envoie la commande
	 * de sanction UNBAN à un autre membre du salon.
	 */
	send_unban_member_command_handler = (member: ChannelMemberSelected) => {
		let [mask] = member.banned.expect("Banmask du membre");
		this.presenter.unban_mask(mask);
	};

	/**
	 * Le client courant, membre du salon et opérateur du salon, envoie la commande
	 * de sanction UNBANNICK à un autre membre du salon.
	 */
	send_unbannick_member_command_handler = (member: ChannelMemberSelected) => {
		let [mask] = member.banned.expect("Banmask du membre");
		this.presenter.unban_mask(mask);
	};

	/**
	 * Envoie la commande de mise à jour du salon.
	 */
	send_update_topic_handler = (topic: string) => {
		this.presenter.update_topic(topic);
	};

	/**
	 * (Dé-)Sélectionne un membre du salon.
	 */
	toggle_select_channel_member_handler = (origin: Origin) => {
		this.presenter.select_member(origin);
	};

	// ------- //
	// Méthode // -> Privée
	// ------- //

	private make_activity(
		room: Room,
		activity: Optional<ChannelActivityRef, "channel_id">,
	): ChannelActivity {
		let member = this.channel.get_member_by_nickname(activity.nickname);

		// @ts-expect-error : type à corriger.
		let message: Option<RoomMessage<ChannelID, { text: string }>> =
			room.get_message<{ text: string }>(activity.message_id);

		let previous_messages = activity.previous_messages_ids
			.map((msgid) => {
				let maybe_message = room.get_message(msgid);
				return maybe_message.map((message) =>
					this.make_activity(room, {
						message_id: msgid,
						nickname: message.nickname,
						previous_messages_ids: [],
					}),
				);
			})
			.filter((maybe) => maybe.is_some())
			.map((maybe) => maybe.unwrap());

		return {
			channel: this.channel,
			member,
			message: message,
			previousMessages: previous_messages,
		};
	}
}
