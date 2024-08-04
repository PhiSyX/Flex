<script setup lang="ts">
import type { PrivateRoom } from "@phisyx/flex-chat";

import { computed } from "vue";

import { UserChangeNicknameDialog, cast_to_room_id } from "@phisyx/flex-chat";

import { use_chat_store, use_overlayer_store } from "~/store";

import PrivateRoomComponent from "#/sys/private_room/PrivateRoom.template.vue";

// ---- //
// Type //
// ---- //

interface Props
{
	// Chambre privée.
	room: PrivateRoom;
}

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store();
let overlayer_store = use_overlayer_store();

const props = defineProps<Props>();

// Client courant.
let current_client = computed(() => chat_store.store.client());
// Pseudo du client courant.
let current_client_nickname = computed(() => current_client.value.nickname);

// Client courant, qui est un participant de la chambre privée.
let current_client_user = computed(() =>
	props.room.get_participant(current_client.value.id).unwrap(),
);

// Participant de la chambre.
let recipient = computed(() =>
	props.room.get_participant(props.room.id()).unwrap(),
);

// Est-ce que le participant est bloqué?
let is_recipient_blocked = computed(() =>
	// @ts-expect-error : à corriger.
	chat_store.check_user_is_blocked(recipient.value),
);

// La liste de la complétion de la boite de saisie, il y contient:
//
// 1. Les participants.
// 2. Toutes les commandes.
let completion_list = computed(() => [
	current_client_user.value.nickname,
	recipient.value.nickname,
	...chat_store.all_commands(),
]);

// ------- //
// Handler //
// ------- //

/**
 * Ouvre la boite de dialogue de changement de pseudonyme.
 */
function open_change_nickname_dialog_handler(event: MouseEvent)
{
	UserChangeNicknameDialog.create(overlayer_store.store, { event });
}

/**
 * Ferme la chambre privée.
 */
function close_private_handler()
{
	chat_store.close_room(recipient.value.id);
}

/**
 * Ouvre une chambre.
 */
function open_room_handler(room_id: RoomID)
{
	chat_store.open_room(room_id);
}

/**
 * Envoie du message au destinataire.
 */
function send_message_handler(message: string)
{
	chat_store.send_message(cast_to_room_id(recipient.value.nickname), message);
}

/**
 * Envoie de la commande /SILENCE.
 */
const send_silence_user_command_handler = (apply_state: "+" | "-") => (
	nickname: string
) => {
	if (apply_state === "+") {
		chat_store.ignore_user(nickname);
	} else {
		chat_store.unignore_user(nickname);
	}
};
</script>

<template>
	<PrivateRoomComponent
		:completion-list="completion_list"
		:current-client-user="current_client_user"
		:current-nickname="current_client_nickname"
		:is-recipient-blocked="is_recipient_blocked"
		:recipient="recipient"
		:room="room"
		@change-nickname="open_change_nickname_dialog_handler"
		@close="close_private_handler"
		@open-room="open_room_handler"
		@ignore-user="(o) => send_silence_user_command_handler('+')(o)"
		@send-message="send_message_handler"
		@unignore-user="(o) => send_silence_user_command_handler('-')(o)"
	/>
</template>
