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
	User,
} from "@phisyx/flex-chat";
import type { Option } from "@phisyx/flex-safety";

import { computed } from "vue";

import {
	ChannelSettingsDialog,
	ChannelTopicLayer,
	NoticeCustomRoom,
	UserChangeNicknameDialog,
} from "@phisyx/flex-chat";
import { format_date } from "@phisyx/flex-date";

import { useChatStore, useOverlayerStore, useSettingsStore } from "~/store";

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

let chat_store = useChatStore();
let overlayer_store = useOverlayerStore();
let settings_store = useSettingsStore();

const props = defineProps<Props>();

// Le client courant.
let current_client = computed(() => chat_store.store.client());

// Le pseudo du client courant.
let current_client_nickname = computed(() => current_client.value.nickname);

// Le client courant, qui est membre du salon.
//
// NOTE: l'utilisateur courant PEUT être sanctionné à tout moment, c'est
//       pourquoi l'on évitera de .unwrap() le retour de la fonction `getUser`.
let current_client_member = computed(() =>
	props.room.getMember(current_client.value.id),
);

// Membre du salon actuellement sélectionné par le client courant.
let selected_member = computed(() =>
	chat_store.getCurrentSelectedChannelMember(props.room),
);

// Les activités liées au salon courant (room).
let channel_activities = computed(() => {
	function make_activity(
		room: Room,
		activity: Optional<ChannelActivityRef, "channelID">,
	): ChannelActivity 
	{
		let member = props.room
			.getMemberByNickname(activity.nickname)
			.as<ChannelMember | User>()
			.or_else(() => {
				return chat_store.store
					.userManager()
					.findByNickname(activity.nickname);
			});

		// @ts-expect-error : type à corriger.
		let message: Option<RoomMessage<ChannelID, { text: string }>> =
			room.getMessageFrom<{ text: string }>(activity.messageID);

		let previous_messages = activity.previousMessageIDs.map((msgid) => {
			let message = room.getMessageFrom(msgid).unwrap();
			return make_activity(room, {
				messageID: msgid,
				nickname: message.nickname,
				previousMessageIDs: [],
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
			let createdAt = format_date("d.m.Y - H:i:s", groups.createdAt);

			let updatedAt = groups.updatedAt.map((date) =>
				format_date("H:i:s", date),
			);

			let activities = groups.activities.map((activity) => {
				switch (name) {
					case "notice": {
						return make_activity(
							chat_store.store
								.roomManager()
								.get(NoticeCustomRoom.ID)
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
				createdAt,
				updatedAt,
				activities,
			};
		}),
	};
});

// Liste de la complétion pour la boite de saisie, il y contient:
//
// 1. Les salons (TODO).
// 2. Les membres du salon.
// 3. Toutes les commandes.
let completion_list = computed(() => [
	props.room.name,
	...props.room.members.all.map((user) => user.nickname),
	...chat_store.allCommands(),
]);

/// Affichage de la liste des utilisateurs
let userlist_display = computed(
	() => settings_store.layout.channelUserlistDisplay as boolean,
);

/// Position de la liste des utilisateurs
let userlist_position = computed(
	() => settings_store.layout.channelUserlistPosition,
);

// ------- //
// Handler //
// ------- //

/**
 * Ferme le salon actif.
 */
function close_channel_handler() 
{
	chat_store.closeRoom(props.room.name);
}

/**
 * Crée le layer du sujet.
 */
function create_topic_layer_handler(payload: {
	event: Event;
	linkedElement: HTMLInputElement | undefined;
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
const send_access_level_handler = (applyState: "+" | "-") => (
	member: ChannelMember, 
	access_level_flag: ChannelAccessLevelFlag
) => {
	if (applyState === "+") {
		chat_store.sendSetAccessLevel(props.room, member, access_level_flag);
	} else {
		chat_store.sendUnsetAccessLevel(props.room, member, access_level_flag);
	}
};

/**
 * Envoie de la commande /SILENCE.
 */
const send_silence_user_command_handler = (applyState: "+" | "-") => (
	origin: Origin
) => {
	if (applyState === "+") {
		chat_store.ignoreUser(origin.nickname);
	} else {
		chat_store.unignoreUser(origin.nickname);
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
		currentClientChannelMember: current_client_member.value.unwrap(),
	});
}

/**
 * Ouvre une chambre.
 */
function open_room_handler(room_id: RoomID) 
{
	chat_store.openRoom(room_id);
}

/**
 * Ouvre une chambre privé d'un utilisateur.
 */
function open_private_handler(origin: Origin) 
{
	chat_store.openPrivateOrCreate(origin);
}

/**
 * Le client courant, membre du salon et opérateur du salon, envoie la commande
 * de sanction BAN à un autre membre du salon.
 */
function send_ban_member_command(member: ChannelMember) 
{
	chat_store.banChannelMemberMask(
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
	chat_store.banChannelMemberMask(props.room, member.address("nick!*@*"));
}

/**
 * Le client courant, membre du salon et opérateur du salon, envoie la commande
 * de sanction KICK à un autre membre du salon.
 */
function send_kick_member_command(member: ChannelMember) 
{
	chat_store.kickChannelMember(props.room, member);
}

/**
 * Envoie de la commande /JOIN.
 */
function send_join_channel_command() 
{
	chat_store.joinChannel(props.room.name);
}

/**
 * Envoie du message au salon actif.
 */
function send_message_handler(message: string) 
{
	chat_store.sendMessage(props.room.name, message);
}

/**
 * Le client courant, membre du salon et opérateur du salon, envoie la commande
 * de sanction UNBAN à un autre membre du salon.
 */
function send_unban_member_command_handler(member: ChannelMemberSelected) 
{
	let [mask] = member.banned.expect("Banmask du membre");
	chat_store.unbanChannelMemberMask(props.room, mask);
}

/**
 * Le client courant, membre du salon et opérateur du salon, envoie la commande
 * de sanction UNBAN à un autre membre du salon.
 */
function send_unban_member_nick_command_handler(member: ChannelMemberSelected) 
{
	let [mask] = member.banned.expect("Banmask du membre");
	chat_store.unbanChannelMemberMask(props.room, mask);
}

/**
 * Envoie la commande de mise à jour du salon.
 */
function send_update_topic_handler(topic: string) 
{
	chat_store.updateTopic(props.room.name, topic);
}

/**
 * (Dé-)Sélectionne un membre du salon.
 */
function toggle_select_channel_member_handler(origin: Origin) 
{
	chat_store.toggleSelectChannelMember(props.room, origin);
}
</script>

<template>
	<ChannelRoomComponent
		:activities="channel_activities"
		:completion-list="completion_list"
		:current-nickname="current_client_nickname"
		:current-client-member="current_client_member"
		:room="room"
		:selected-member="selected_member"
		:userlist-displayed-by-default="userlist_display"
		@ban-member="send_ban_member_command"
		@ban-nick="send_ban_member_nick_command"
		@change-nickname="open_change_nickname_dialog_handler"
		@create-topic-layer="create_topic_layer_handler"
		@close="close_channel_handler"
		@ignore-user="(o) => send_silence_user_command_handler('+')(o)"
		@kick-member="send_kick_member_command"
		@open-channel-settings="open_channel_settings_dialog_handler"
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
			'--room-info-position': userlist_position === 'left' ? 0 : 1,
		}"
	>
		<template v-if="room.kicked" #history>
			<ChannelRoomKicked
				:last-message="room.lastMessage.unwrap()"
				@join-channel="send_join_channel_command"
			/>
		</template>
	</ChannelRoomComponent>
</template>
