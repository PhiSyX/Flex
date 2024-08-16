<script setup lang="ts">
import { ChannelJoinDialog } from "@phisyx/flex-chat";

import { use_chat_store } from "~/store";
import { use_dialog } from "./hook";

import ChannelCreateDialog from "#/sys/dialog_channel_create/ChannelCreateDialog.template.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store();

let {
	dialog,
	layer_name,
	teleport_id,
	close_dialog
} = use_dialog(ChannelJoinDialog);

// ------- //
// Handler //
// ------- //

function join_channel_handler(channels: ChannelID, keys: string)
{
	if (!channels) {
		return;
	}

	chat_store.join_channel(channels, keys);
	close_dialog();
}
</script>

<template>
	<Teleport v-if="dialog.exists()" :to="teleport_id">
		<ChannelCreateDialog
			:layer-name="layer_name"
			@close="close_dialog"
			@submit="join_channel_handler"
		/>
	</Teleport>
</template>
