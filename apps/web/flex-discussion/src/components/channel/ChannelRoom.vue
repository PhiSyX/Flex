<script setup lang="ts">
import type {
	ChannelAccessLevelFlag,
	ChannelActivity,
	ChannelActivityRef,
	ChannelMember,
	ChannelMemberSelected,
	ChannelRoom,
	Room,
	RoomMessage,
} from "@phisyx/flex-chat";
import type { Option } from "@phisyx/flex-safety";

import { computed } from "vue";

import {
	ChangeFormatsColorsDialog,
	ChannelSettingsDialog,
	ChannelTopicLayer,
	NoticesCustomRoom,
	UserChangeNicknameDialog,
} from "@phisyx/flex-chat";
import { format_date } from "@phisyx/flex-date";

import { use_chat_store, use_overlayer_store, use_settings_store } from "~/store";

import ChannelRoomComponent from "#/sys/channel_room/ChannelRoom.template.vue";
import ChannelRoomKicked from "#/sys/channel_room/ChannelRoomKicked.vue";

// ---- //
// Type //
// ---- //

interface Props
{
	// Le salon actif.
	room: ChannelRoom;
}

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store();
let overlayer_store = use_overlayer_store();
let settings_store = use_settings_store();

const props = defineProps<Props>();

// Le client courant, qui est membre du salon.
//
// NOTE: l'utilisateur courant PEUT être sanctionné à tout moment, c'est
//       pourquoi l'on évitera de .unwrap() le retour de la fonction
//       `get_member`.
let current_client_member = computed(() =>
	props.room.get_member(chat_store.current_client.id),
);

// Membre du salon actuellement sélectionné par le client courant.
let selected_member = computed(() =>
	chat_store.get_current_selected_channel_member(props.room),
);

// Les activités liées au salon courant (room).
let channel_activities = computed(() => {
	function make_activity(
		room: Room,
		activity: Optional<ChannelActivityRef, "channel_id">,
	): ChannelActivity
	{
		let member = props.room.get_member_by_nickname(activity.nickname);

		// @ts-expect-error : type à corriger.
		let message: Option<RoomMessage<ChannelID, { text: string }>> =
			room.get_message<{ text: string }>(activity.message_id);

		let previous_messages = activity.previous_messages_ids.map((msgid) => {
			let message = room.get_message(msgid).unwrap();
			return make_activity(room, {
				message_id: msgid,
				nickname: message.nickname,
				previous_messages_ids: [],
			});
		});

		return {
			channel: props.room,
			member,
			message: message.unwrap(),
			previousMessages: previous_messages,
		};
	}

	return {
		groups: props.room.activities.groups.map(([name, groups]) => {
			let created_at = format_date("d.m.Y - H:i:s", groups.created_at);

			let updated_at = groups.updated_at.map((date) =>
				format_date("H:i:s", date),
			);

			let activities = groups.activities.map((activity) => {
				switch (name) {
					case "notice": {
						return make_activity(
							chat_store.store
								.room_manager()
								.get(NoticesCustomRoom.ID)
								.unwrap_or(props.room),
							activity,
						);
					}

					default: {
						return make_activity(props.room, activity);
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
});

// Liste de la complétion pour la boite de saisie.
let completion_list = computed(() => chat_store.all_commands(props.room));

let room_info_position = computed(
	() => settings_store.layout.channel_userlist_position === 'left'
		? 0 
		: 1
);

// ------- //
// Handler //
// ------- //

/**
 * Ferme le salon actif.
 */
function close_channel_handler()
{
	chat_store.close_room(props.room.name);
}

/**
 * Crée le layer du sujet.
 */
function create_topic_layer_handler(payload: {
	event: Event;
	linked_element: HTMLInputElement | undefined;
	mode: boolean;
})
{
	if (payload.mode) {
		ChannelTopicLayer.create(overlayer_store.store, payload);
	} else {
		ChannelTopicLayer.destroy(overlayer_store.store);
	}
}

/**
 * Envoie les commandes liées aux niveaux d'accès.
 */
const send_access_level_handler = (apply_state: "+" | "-") => (
	member: ChannelMember,
	access_level_flag: ChannelAccessLevelFlag
) => {
	if (apply_state === "+") {
		chat_store.send_set_access_level(props.room, member, access_level_flag);
	} else {
		chat_store.send_unset_access_level(props.room, member, access_level_flag);
	}
};

/**
 * Envoie de la commande /SILENCE.
 */
const send_silence_user_command_handler = (apply_state: "+" | "-") => (
	origin: Origin
) => {
	if (apply_state === "+") {
		chat_store.ignore_user(origin.nickname);
	} else {
		chat_store.unignore_user(origin.nickname);
	}
};

/**
 * Ouvre la boite de dialogue de changement de pseudonyme.
 */
function open_change_nickname_dialog_handler(event: MouseEvent)
{
	UserChangeNicknameDialog.create(overlayer_store.store, { event });
}

/**
 * Ouvre la boite de dialogue du centre de contrôle du salon actif.
 */
function open_channel_settings_dialog_handler(_: Event)
{
	ChannelSettingsDialog.create(overlayer_store.store, {
		room: props.room,
		current_client_channel_member: current_client_member.value.unwrap(),
	});
}

/**
 * Ouvre la boite de couleur du champ de saisie.
 */
function open_colors_box_handler(event: MouseEvent)
{
	overlayer_store.create({
		id: ChangeFormatsColorsDialog.ID,
		event,
	});
}

/**
 * Ouvre une chambre.
 */
function open_room_handler(room_id: RoomID)
{
	chat_store.open_room(room_id);
}

/**
 * Ouvre une chambre privé d'un utilisateur.
 */
function open_private_handler(origin: Origin)
{
	chat_store.open_private_or_create(origin);
}

/**
 * Le client courant, membre du salon et opérateur du salon, envoie la commande
 * de sanction BAN à un autre membre du salon.
 */
function send_ban_member_command(member: ChannelMember)
{
	chat_store.ban_channel_member_mask(
		props.room,
		member.address("*!ident@hostname"),
	);
}

/**
 * Le client courant, membre du salon et opérateur du salon, envoie la commande
 * de sanction BAN à un autre membre du salon.
 */
function send_ban_member_nick_command(member: ChannelMember)
{
	chat_store.ban_channel_member_mask(props.room, member.address("nick!*@*"));
}

/**
 * Le client courant, membre du salon et opérateur du salon, envoie la commande
 * de sanction KICK à un autre membre du salon.
 */
function send_kick_member_command(member: ChannelMember)
{
	chat_store.kick_channel_member(props.room, member);
}

/**
 * Envoie de la commande /JOIN.
 */
function send_join_channel_command()
{
	chat_store.join_channel(props.room.name);
}

/**
 * Envoie du message au salon actif.
 */
function send_message_handler(message: string)
{
	chat_store.send_message(props.room.name, message);
}

/**
 * Le client courant, membre du salon et opérateur du salon, envoie la commande
 * de sanction UNBAN à un autre membre du salon.
 */
function send_unban_member_command_handler(member: ChannelMemberSelected)
{
	let [mask] = member.banned.expect("Banmask du membre");
	chat_store.unban_channel_member_mask(props.room, mask);
}

/**
 * Le client courant, membre du salon et opérateur du salon, envoie la commande
 * de sanction UNBAN à un autre membre du salon.
 */
function send_unban_member_nick_command_handler(member: ChannelMemberSelected)
{
	let [mask] = member.banned.expect("Banmask du membre");
	chat_store.unban_channel_member_mask(props.room, mask);
}

/**
 * Envoie la commande de mise à jour du salon.
 */
function send_update_topic_handler(topic: string)
{
	chat_store.update_topic(props.room.name, topic);
}

/**
 * (Dé-)Sélectionne un membre du salon.
 */
function toggle_select_channel_member_handler(origin: Origin)
{
	chat_store.toggle_select_channel_member(props.room, origin);
}
</script>

<template>
	<ChannelRoomComponent
		:activities="channel_activities"
		:completion-list="completion_list"
		:current-client-member="current_client_member"
		:current-nickname="chat_store.current_client_nickname"
		:room="room"
		:selected-member="selected_member"
		:text-format-bold="settings_store.personalization.formats.bold"
		:text-format-italic="settings_store.personalization.formats.italic"
		:text-format-underline="settings_store.personalization.formats.underline"
		:text-color-background="settings_store.personalization.colors.background"
		:text-color-foreground="settings_store.personalization.colors.foreground"
		:userlist-displayed-by-default="settings_store.layout.channel_userlist_display ?? true"
		@ban-member="send_ban_member_command"
		@ban-nick="send_ban_member_nick_command"
		@change-nickname="open_change_nickname_dialog_handler"
		@create-topic-layer="create_topic_layer_handler"
		@close="close_channel_handler"
		@ignore-user="(o) => send_silence_user_command_handler('+')(o)"
		@kick-member="send_kick_member_command"
		@open-channel-settings="open_channel_settings_dialog_handler"
		@open-colors-box="open_colors_box_handler"
		@open-room="open_room_handler"
		@open-private="open_private_handler"
		@select-member="toggle_select_channel_member_handler"
		@send-message="send_message_handler"
		@set-access-level="(m, a) => send_access_level_handler('+')(m, a)"
		@unban-member="send_unban_member_command_handler"
		@unban-nick="send_unban_member_nick_command_handler"
		@unignore-user="(o) => send_silence_user_command_handler('-')(o)"
		@unset-access-level="(m, a) => send_access_level_handler('-')(m, a)"
		@update-topic="send_update_topic_handler"
		:style="{
			'--room-info-position': room_info_position,
		}"
	>
		<template v-if="room.kicked" #history>
			<ChannelRoomKicked
				:last-message="room.last_message.unwrap()"
				@join-channel="send_join_channel_command"
			/>
		</template>
	</ChannelRoomComponent>
</template>
