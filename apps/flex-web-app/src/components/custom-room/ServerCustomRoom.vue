<script setup lang="ts">
import { computed } from "vue";

import { ServerCustomRoom } from "~/custom-room/ServerCustomRoom";
import { UserChangeNicknameDialog } from "~/user/User";

import { useOverlayerStore } from "~/store/OverlayerStore";
import { useChatStore } from "~/store/ChatStore";

import CustomRoomServer from "#/sys/custom-room-server/CustomRoomServer.vue";

// ---- //
// Type //
// ---- //

interface Props {
	// La chambre du serveur.
	room: ServerCustomRoom;
}

// --------- //
// Composant //
// --------- //

const props = defineProps<Props>();

const chatStore = useChatStore();
const overlayerStore = useOverlayerStore();

// Le client courant.
const currentClient = computed(() => chatStore.store.me());

// Le pseudo du client courant.
const currentClientNickname = computed(() => currentClient.value.nickname);

// L'URL du forum.
const forumURL = import.meta.env.VITE_APP_FORUM_URL || "#";
// L'URL du vademecum.
const vademecumURL = import.meta.env.VITE_APP_VADEMECUM_URL || "#";

/**
 * Ouvre la boite de dialogue de changement de pseudonyme.
 */
function openChangeNicknameDialog(event: MouseEvent) {
	// @ts-expect-error ?
	UserChangeNicknameDialog.create(overlayerStore.store, { event });
}

/**
 * Envoie un message à la chambre active.
 */
function sendMessage(message: string) {
	chatStore.sendMessage(props.room.id(), message);
}
</script>

<template>
	<CustomRoomServer
		v-if="room.isActive() && !room.isClosed()"
		:forum-url="forumURL"
		:vademecum-url="vademecumURL"
		:current-nickname="currentClientNickname"
		:room="room"
		class="[ flex:full ]"
		@change-nickname="openChangeNicknameDialog"
		@send-message="sendMessage"
	/>
</template>
