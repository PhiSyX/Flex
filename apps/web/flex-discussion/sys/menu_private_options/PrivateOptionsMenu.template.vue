<script setup lang="ts">
import type { PrivateParticipant } from "@phisyx/flex-chat/private/participant";
import type { PrivateRoom } from "@phisyx/flex-chat/private/room";

import { computed } from "vue";

import Menu from "@phisyx/flex-uikit-vue/menu/Menu.vue";
import MenuItem from "@phisyx/flex-uikit-vue/menu/MenuItem.vue";

// ---- //
// Type //
// ---- //

interface Props {
	layerName: string;
	room: PrivateRoom;
	recipient: PrivateParticipant;
	currentClient: PrivateParticipant;
	isClientAuthenticated: boolean;
	isRecipientBlocked: boolean;
}

interface Emits {
	(event_name: "open-update-account"): void;
	(event_name: "ignore-user", r: PrivateParticipant): void;
	(event_name: "unignore-user", r: PrivateParticipant): void;
	(event_name: "close"): void;
}

// --------- //
// Composant //
// --------- //

const { room, currentClient, isClientAuthenticated, recipient } =
	defineProps<Props>();
const emit = defineEmits<Emits>();

let is_current_client_private = computed(() => {
	return room.partial_eq(currentClient);
});

let is_current_client_private_and_authenticated = computed(() => {
	return isClientAuthenticated && room.partial_eq(currentClient);
});

const ignore_user_handler = () => emit("ignore-user", recipient);
const unignore_user_handler = () => emit("unignore-user", recipient);
</script>

<template>
	<Menu class="menu/private-options">
		<MenuItem
			v-if="is_current_client_private_and_authenticated"
			icon="user"
			@click="emit('open-update-account')"
		>
			Mettre à jour mon profil
		</MenuItem>

		<MenuItem
			v-if="!is_current_client_private && !isRecipientBlocked"
			icon="user-block"
			@click="ignore_user_handler"
		>
			Ignorer
		</MenuItem>

		<MenuItem
			v-if="!is_current_client_private && isRecipientBlocked"
			icon="user-block"
			@click="unignore_user_handler"
		>
			Ne plus ignorer
		</MenuItem>

		<MenuItem
			icon="close"
			style="background: var(--color-red500)"
			@click="emit('close')"
		>
			Fermer le privé
		</MenuItem>
	</Menu>
</template>

<style scoped>
hr {
	border-width: 2px;
	border-color: var(--dialog-bg);
	margin: 0px;
}
</style>
