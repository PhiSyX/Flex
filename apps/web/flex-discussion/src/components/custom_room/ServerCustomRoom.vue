<script setup lang="ts">
import type { ServerCustomRoom } from "@phisyx/flex-chat";

import { computed } from "vue";

import { UserChangeNicknameDialog } from "@phisyx/flex-chat";

import { useChatStore, useOverlayerStore } from "~/store";

import CustomRoomServer from "#/sys/custom_room_server/CustomRoomServer.template.vue";

// ---- //
// Type //
// ---- //

interface Props 
{
	// La chambre du serveur.
	room: ServerCustomRoom;
}

// --------- //
// Composant //
// --------- //

let chat_store = useChatStore();
let overlayer_store = useOverlayerStore();

const props = defineProps<Props>();

// Le client courant.
let current_client = computed(() => chat_store.store.client());

// Le pseudo du client courant.
let current_client_nickname = computed(() => current_client.value.nickname);

// L'URL du forum.
let forum_url = import.meta.env.VITE_APP_FORUM_URL || "#";
// L'URL du vademecum.
let vademecum_url = import.meta.env.VITE_APP_VADEMECUM_URL || "#";

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
 * Ouvre une chambre.
 */
function open_room_handler(room_id: RoomID) 
{
	chat_store.openRoom(room_id);
}

/**
 * Envoie un message à la chambre active.
 */
function send_message_handler(message: string) 
{
	chat_store.sendMessage(props.room.id(), message);
}
</script>

<template>
	<CustomRoomServer
		v-if="room.isActive() && !room.isClosed()"
		:forum-url="forum_url"
		:vademecum-url="vademecum_url"
		:current-nickname="current_client_nickname"
		:room="room"
		class="[ flex:full ]"
		@change-nickname="open_change_nickname_dialog_handler"
		@open-room="open_room_handler"
		@send-message="send_message_handler"
	/>
</template>
