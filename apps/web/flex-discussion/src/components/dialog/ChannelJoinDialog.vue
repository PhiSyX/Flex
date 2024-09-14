<script setup lang="ts">
import type { ChannelJoinRecordDialog } from "@phisyx/flex-chat";

import { ChannelJoinDialog } from "@phisyx/flex-chat";
import { use_dialog } from "~/hooks/dialog";
import { use_chat_store } from "~/store";

import ChannelJoinDialogComponent from "#/sys/dialog_channel_join/ChannelJoinDialog.template.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store();

let { dialog, layer_name, layer_unsafe, teleport_id, close_dialog } =
	use_dialog<ChannelJoinDialog, ChannelJoinRecordDialog>(ChannelJoinDialog);

// ------- //
// Handler //
// ------- //

function join_channel_handler(channels: ChannelID, keys: string) {
	if (!channels) {
		return;
	}

	chat_store.join_channel(channels, keys);
	close_dialog();
}
</script>

<template>
	<Teleport v-if="dialog.exists()" defer :to="teleport_id">
		<ChannelJoinDialogComponent
			:layer-name="layer_name"
			v-bind="layer_unsafe.data || {}"
			@close="close_dialog"
			@submit="join_channel_handler"
		/>
	</Teleport>
</template>
