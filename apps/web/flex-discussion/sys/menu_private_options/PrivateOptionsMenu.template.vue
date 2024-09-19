<script setup lang="ts">
import type { PrivateParticipant } from "@phisyx/flex-chat/private/participant";
import type { PrivateRoom } from "@phisyx/flex-chat/private/room";

import { UiMenu, UiMenuItem } from "@phisyx/flex-vue-uikit";
import { computed } from "vue";

// ---- //
// Type //
// ---- //

interface Props {
	layerName: string;
	room: PrivateRoom;
	currentClient: PrivateParticipant;
	recipient: PrivateParticipant;
	isClientAuthenticated: boolean;
}

interface Emits {
	(event_name: "open-update-account"): void;
	(event_name: "close"): void;
}

// --------- //
// Composant //
// --------- //

const { room, currentClient, isClientAuthenticated } = defineProps<Props>();
const emit = defineEmits<Emits>();

let is_current_client_private_and_authenticated = computed(() => {
	return isClientAuthenticated && room.partial_eq(currentClient);
});
</script>

<template>
	<UiMenu class="menu/private-options">
		<UiMenuItem
			v-if="is_current_client_private_and_authenticated"
			icon="user"
			@click="emit('open-update-account')"
		>
			Mettre à jour mon profil
		</UiMenuItem>

		<UiMenuItem
			icon="close"
			style="background: var(--color-red500)"
			@click="emit('close')"
		>
			Fermer le privé
		</UiMenuItem>
	</UiMenu>
</template>

<style scoped>
hr {
	border-width: 2px;
	border-color: var(--dialog-bg);
	margin: 0px;
}
</style>
