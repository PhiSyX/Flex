<script setup lang="ts">
import type { PrivateRoom } from "@phisyx/flex-chat";

import { computed } from "vue";

import { UserChangeNicknameDialog, roomID } from "@phisyx/flex-chat";

import { useChatStore, useOverlayerStore } from "~/store";

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

let chatStore = useChatStore();
let overlayerStore = useOverlayerStore();

const props = defineProps<Props>();

// Client courant.
let currentClient = computed(() => chatStore.store.client());
// Pseudo du client courant.
let currentClientNickname = computed(() => currentClient.value.nickname);

// Client courant, qui est un participant de la chambre privée.
let currentClientUser = computed(() =>
	props.room.getParticipant(currentClient.value.id).unwrap(),
);

// Participant de la chambre.
let recipient = computed(() =>
	props.room.getParticipant(props.room.id()).unwrap(),
);

// Est-ce que le participant est bloqué?
let isRecipientBlocked = computed(() =>
	chatStore.checkUserIsBlocked(recipient.value),
);

// La liste de la complétion de la boite de saisie, il y contient:
//
// 1. Les participants.
// 2. Toutes les commandes.
let completionList = computed(() => [
	currentClientUser.value.nickname,
	recipient.value.nickname,
	...chatStore.allCommands(),
]);

// ------- //
// Handler //
// ------- //

/**
 * Ouvre la boite de dialogue de changement de pseudonyme.
 */
function open_change_nickname_dialog_handler(event: MouseEvent) 
{
	UserChangeNicknameDialog.create(overlayerStore.store, { event });
}

/**
 * Ferme la chambre privée.
 */
function close_private_handler() 
{
	chatStore.closeRoom(recipient.value.id);
}

/**
 * Ouvre une chambre.
 */
function open_room_handler(roomName: RoomID) 
{
	chatStore.openRoom(roomName);
}

/**
 * Envoie du message au destinataire.
 */
function send_message_handler(message: string) 
{
	chatStore.sendMessage(roomID(recipient.value.nickname), message);
}

/**
 * Envoie de la commande /SILENCE.
 */
const send_silence_user_command_handler = (applyState: "+" | "-") => (
	nickname: string
) => {
	if (applyState === "+") {
		chatStore.ignoreUser(nickname);
	} else {
		chatStore.unignoreUser(nickname);
	}
};
</script>

<template>
	<PrivateRoomComponent
		:completion-list="completionList"
		:current-client-user="currentClientUser"
		:current-nickname="currentClientNickname"
		:is-recipient-blocked="isRecipientBlocked"
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
