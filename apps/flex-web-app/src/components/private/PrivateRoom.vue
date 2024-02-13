<script setup lang="ts">
import { computed } from "vue";

import { PrivateRoom } from "~/private/PrivateRoom";
import { useChatStore } from "~/store/ChatStore";
import { useOverlayerStore } from "~/store/OverlayerStore";
import { UserChangeNicknameDialog } from "~/user/User";

import PrivateRoomComponent from "#/sys/private-room/PrivateRoom.vue";

// ---- //
// Type //
// ---- //

interface Props {
	// Chambre privée.
	room: PrivateRoom;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();

const chatStore = useChatStore();
const overlayerStore = useOverlayerStore();

// Client courant.
const currentClient = computed(() => chatStore.store.me());
// Pseudo du client courant.
const currentClientNickname = computed(() => currentClient.value.nickname);

// Client courant, qui est un participant de la chambre privée.
const currentClientUser = computed(() =>
	props.room.getParticipant(currentClient.value.id).unwrap()
);

// Participant de la chambre.
const recipient = computed(() =>
	props.room.getParticipant(props.room.id()).unwrap()
);

// Est-ce que le participant est bloqué?
const isRecipientBlocked = computed(() =>
	chatStore.checkUserIsBlocked(recipient.value.intoUser())
);

// La liste de la complétion de la boite de saisie, il y contient:
//
// 1. Les participants.
// 2. Toutes les commandes.
const completionList = computed(() => [
	currentClientUser.value.nickname,
	recipient.value.nickname,
	...chatStore.allCommands(),
]);

/**
 * Ouvre la boite de dialogue de changement de pseudonyme.
 */
function openChangeNicknameDialog(event: MouseEvent) {
	// @ts-expect-error ?
	UserChangeNicknameDialog.create(overlayerStore.store, { event });
}

/**
 * Ferme la chambre privée.
 */
function closePrivate() {
	chatStore.closeRoom(recipient.value.id);
}

/**
 * Envoie du message au destinataire.
 */
function sendMessage(message: string) {
	chatStore.sendMessage(recipient.value.nickname, message);
}

/**
 * Envoie de la commande /SILENCE.
 */
const sendSilenceUserCommand = (applyState: "+" | "-") => (nickname: string) => {
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
		@change-nickname="openChangeNicknameDialog"
		@close="closePrivate"
		@ignore-user="(o) => sendSilenceUserCommand('+')(o)"
		@send-message="sendMessage"
		@unignore-user="(o) => sendSilenceUserCommand('-')(o)"
	/>
</template>
