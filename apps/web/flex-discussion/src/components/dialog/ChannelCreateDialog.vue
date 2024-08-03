<script setup lang="ts">
import { computed } from "vue";

import { ChannelJoinDialog } from "@phisyx/flex-chat";

import { useChatStore, useOverlayerStore } from "~/store";

import ChannelCreateDialog from "#/sys/channel_create_dialog/ChannelCreateDialog.template.vue";

// -------- //
// Constant //
// -------- //

const LAYER_NAME: string = ChannelJoinDialog.ID;

// --------- //
// Composant //
// --------- //

let chatStore = useChatStore();
let overlayerStore = useOverlayerStore();

let dialog = computed(() => new ChannelJoinDialog(overlayerStore.store));
let hasLayer = computed(() => dialog.value.exists());

// ------- //
// Handler //
// ------- //

function join_channel_handler(channels: ChannelID, keys: string) 
{
	if (!channels) {
		return;
	}

	chatStore.joinChannel(channels, keys);
	close_layer_handler();
}

function close_layer_handler() 
{
	dialog.value.destroy();
}
</script>

<template>
	<Teleport v-if="hasLayer" :to="`#${LAYER_NAME}_teleport`">
		<ChannelCreateDialog
			:layer-name="LAYER_NAME"
			@close="close_layer_handler"
			@submit="join_channel_handler"
		/>
	</Teleport>
</template>
