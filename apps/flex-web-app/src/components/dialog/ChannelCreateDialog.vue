<script setup lang="ts">
import { useChatStore } from "~/store/ChatStore";

import { closeLayer } from "./Dialog.handlers";
import { hasLayer } from "./Dialog.state";
import ChannelCreateDialog from "#/sys/channel-create-dialog/ChannelCreateDialog.vue";

const chatStore = useChatStore();

const LAYER_NAME: string = "channel-create-request";
const hasRequestCreateChannelLayer = hasLayer(LAYER_NAME);
const closeRequestCreateChannelHandler = closeLayer(LAYER_NAME);

function joinChannelHandler(channels: string, keys: string) {
	if (!channels) return;
	chatStore.joinChannel(channels, keys);
	closeRequestCreateChannelHandler();
}
</script>

<template>
	<Teleport
		v-if="hasRequestCreateChannelLayer"
		:to="`#${LAYER_NAME}_teleport`"
	>
		<ChannelCreateDialog
			:layer-name="LAYER_NAME"
			@close="closeRequestCreateChannelHandler"
			@submit="joinChannelHandler"
		/>
	</Teleport>
</template>

