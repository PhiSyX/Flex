<script setup lang="ts">
import { computed } from "vue";

import { UserChangeNicknameDialog } from "~/dialogs";
import { useChatStore, useOverlayerStore } from "~/store";

import ChangeNickDialogComponent from "#/sys/change_nick_dialog/ChangeNickDialog.vue";

const chatStore = useChatStore();
const overlayerStore = useOverlayerStore();

const LAYER_NAME: string = UserChangeNicknameDialog.ID;

const dialog = computed(
	() => new UserChangeNicknameDialog(overlayerStore.store),
);
const hasLayer = computed(() => dialog.value.exists());

/**
 * Envoie de la commande de changement de pseudo.
 */
function sendChangeNickCommand(nickname: string) {
	chatStore.changeNick(nickname);
	dialog.value.destroy();
}
</script>

<template>
	<Teleport v-if="hasLayer" :to="`#${LAYER_NAME}_teleport`">
		<ChangeNickDialogComponent
			:layer-name="LAYER_NAME"
			@close="dialog.destroy()"
			@submit="sendChangeNickCommand"
		/>
	</Teleport>
</template>
