<script setup lang="ts">
import { computed } from "vue";

import { ChannelSettingsDialog } from "~/channel/ChannelSettings";
import { useChatStore } from "~/store/ChatStore";
import { useOverlayerStore } from "~/store/OverlayerStore";

import ChannelSettingsDialogComponent from "#/sys/channel-settings-dialog/ChannelSettingsDialog.vue";

const chatStore = useChatStore();
const overlayerStore = useOverlayerStore();

const LAYER_NAME: string = ChannelSettingsDialog.ID;

const dialog = computed(() => new ChannelSettingsDialog(overlayerStore.store));
const hasLayer = computed(() => dialog.value.exists());
const layer = computed(() => dialog.value.getUnchecked());

/**
 * Soumission du formulaire.
 */
function submitFormData(modesSettings: Partial<Command<"MODE">["modes"]>) {
	if (!layer.value.data) return;

	chatStore.applyChannelSettings(
		layer.value.data.room.name,
		modesSettings as Command<"MODE">["modes"],
	);
}

/**
 * Mise à jour du sujet.
 */
function updateTopicHandler(topic?: string) {
	if (!layer.value.data || layer.value.data.room.topic.get() === topic) return;
	chatStore.updateTopic(layer.value.data.room.name, topic);
}
</script>

<template>
	<Teleport v-if="hasLayer && layer.data" :to="`#${LAYER_NAME}_teleport`">
		<ChannelSettingsDialogComponent
			:layer-name="LAYER_NAME"
			v-bind="layer.data"
			@close="dialog.destroy()"
			@submit="submitFormData"
			@update-topic="updateTopicHandler"
		/>
	</Teleport>
</template>
