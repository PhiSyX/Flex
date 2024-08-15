<script setup lang="ts">
import type { ServerCustomRoom } from "@phisyx/flex-chat";

import { UserChangeNicknameDialog } from "@phisyx/flex-chat";

import { use_chat_store, use_overlayer_store } from "~/store";

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

let chat_store = use_chat_store();
let overlayer_store = use_overlayer_store();

const props = defineProps<Props>();

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
	chat_store.open_room(room_id);
}

/**
 * Envoie un message à la chambre active.
 */
function send_message_handler(message: string)
{
	chat_store.send_message(props.room.id(), message);
}
</script>

<template>
	<CustomRoomServer
		v-if="room.is_active() && !room.is_closed()"
		:forum-url="forum_url"
		:vademecum-url="vademecum_url"
		:current-nickname="chat_store.current_client_nickname"
		:room="room"
		class="[ flex:full ]"
		@change-nickname="open_change_nickname_dialog_handler"
		@open-room="open_room_handler"
		@send-message="send_message_handler"
	/>
</template>
