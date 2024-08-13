<script setup lang="ts">
import { computed } from "vue";

import { ChannelJoinDialog } from "@phisyx/flex-chat";

import { use_chat_store, use_overlayer_store } from "~/store";

import ChannelCreateDialog from "#/sys/dialog_channel_create/ChannelCreateDialog.template.vue";

// -------- //
// Constant //
// -------- //

const LAYER_NAME: string = ChannelJoinDialog.ID;

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store();
let overlayer_store = use_overlayer_store();

let dialog = computed(() => new ChannelJoinDialog(overlayer_store.store));
let has_layer = computed(() => dialog.value.exists());

// ------- //
// Handler //
// ------- //

function join_channel_handler(channels: ChannelID, keys: string)
{
	if (!channels) {
		return;
	}

	chat_store.join_channel(channels, keys);
	close_layer_handler();
}

function close_layer_handler()
{
	dialog.value.destroy();
}
</script>

<template>
	<Teleport v-if="has_layer" :to="`#${LAYER_NAME}_teleport`">
		<ChannelCreateDialog
			:layer-name="LAYER_NAME"
			@close="close_layer_handler"
			@submit="join_channel_handler"
		/>
	</Teleport>
</template>
