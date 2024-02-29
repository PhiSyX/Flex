<script setup lang="ts">
import { useChatStore } from "~/store/ChatStore";
import { useOverlayerStore } from "~/store/OverlayerStore";

import { ChannelJoinDialog } from "~/channel/ChannelRoom";

import ChannelCreateDialog from "#/sys/channel-create-dialog/ChannelCreateDialog.vue";
import { computed } from "vue";

const chatStore = useChatStore();
const overlayerStore = useOverlayerStore();

const LAYER_NAME: string = ChannelJoinDialog.ID;

const dialog = computed(() => new ChannelJoinDialog(overlayerStore.store));
const hasLayer = computed(() => dialog.value.exists());
const closeLayer = () => dialog.value.destroy();

function joinChannel(channels: ChannelID, keys: string) {
	if (!channels) return;
	chatStore.joinChannel(channels, keys);
	closeLayer();
}
</script>

<template>
	<Teleport v-if="hasLayer" :to="`#${LAYER_NAME}_teleport`">
		<ChannelCreateDialog
			:layer-name="LAYER_NAME"
			@close="closeLayer"
			@submit="joinChannel"
		/>
	</Teleport>
</template>
