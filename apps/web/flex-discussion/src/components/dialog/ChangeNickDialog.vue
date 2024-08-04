<script setup lang="ts">
import { computed } from "vue";

import { UserChangeNicknameDialog } from "@phisyx/flex-chat";

import { use_chat_store, use_overlayer_store } from "~/store";

import ChangeNickDialog from "#/sys/change_nick_dialog/ChangeNickDialog.template.vue";

// -------- //
// Constant //
// -------- //

const LAYER_NAME: string = UserChangeNicknameDialog.ID;

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store();
let overlayer_store = use_overlayer_store();

let dialog = computed(
	() => new UserChangeNicknameDialog(overlayer_store.store),
);
let has_layer = computed(() => dialog.value.exists());

// ------- //
// Handler //
// ------- //

/**
 * Envoie de la commande de changement de pseudo.
 */
function send_change_nick_command_handler(nickname: string)
{
	chat_store.change_nick(nickname);
	dialog.value.destroy();
}

function close_layer_handler()
{
	dialog.value.destroy();
}
</script>

<template>
	<Teleport v-if="has_layer" :to="`#${LAYER_NAME}_teleport`">
		<ChangeNickDialog
			:layer-name="LAYER_NAME"
			@close="close_layer_handler"
			@submit="send_change_nick_command_handler"
		/>
	</Teleport>
</template>
