<script setup lang="ts">
import { UserChangeNicknameDialog } from "@phisyx/flex-chat";

import { use_dialog } from "~/hooks/dialog";
import { use_chat_store } from "~/store";

import ChangeNickDialog from "#/sys/dialog_change_nick/ChangeNickDialog.template.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store();

let {
	layer_name,
	dialog,
	teleport_id,
	close_dialog,
} = use_dialog(UserChangeNicknameDialog);

// ------- //
// Handler //
// ------- //

/**
 * Envoie de la commande de changement de pseudo.
 */
function send_change_nick_command_handler(nickname: string)
{
	chat_store.change_nick(nickname);
	close_dialog();
}
</script>

<template>
	<Teleport v-if="dialog.exists()" :to="teleport_id">
		<ChangeNickDialog
			:layer-name="layer_name"
			@close="close_dialog"
			@submit="send_change_nick_command_handler"
		/>
	</Teleport>
</template>
