<script setup lang="ts">
import { ChannelSettingsDialog } from "@phisyx/flex-chat";
import { computed } from "vue";

import { useChatStore, useOverlayerStore } from "~/store";

import ChannelSettingsDialogComponent from "#/sys/channel_settings_dialog/ChannelSettingsDialog.template.vue";

// -------- //
// Constant //
// -------- //

const LAYER_NAME: string = ChannelSettingsDialog.ID;

// --------- //
// Composant //
// --------- //

let chatStore = useChatStore();
let overlayerStore = useOverlayerStore();

let dialog = computed(() => new ChannelSettingsDialog(overlayerStore.store));
let hasLayer = computed(() => dialog.value.exists());
let layer = computed(() => dialog.value.getUnchecked());

// ------- //
// Handler //
// ------- //

/**
 * Soumission du formulaire.
 */
function submit_form_data_handler(modesSettings: Partial<Command<"MODE">["modes"]>) 
{
	if (!layer.value.data) {
		return;
	}

	chatStore.applyChannelSettings(
		layer.value.data.room.name,
		modesSettings as Command<"MODE">["modes"],
	);
}

/**
 * Mise à jour du sujet.
 */
function update_topic_handler(topic?: string) 
{
	if (!layer.value.data || layer.value.data.room.topic.get() === topic) {
		return;
	}

	chatStore.updateTopic(layer.value.data.room.name, topic);
}
</script>

<template>
	<Teleport v-if="hasLayer && layer.data" :to="`#${LAYER_NAME}_teleport`">
		<ChannelSettingsDialogComponent
			:layer-name="LAYER_NAME"
			v-bind="layer.data"
			@close="dialog.destroy()"
			@submit="submit_form_data_handler"
			@update-topic="update_topic_handler"
		/>
	</Teleport>
</template>
