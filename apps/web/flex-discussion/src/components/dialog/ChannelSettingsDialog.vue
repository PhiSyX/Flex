<script setup lang="ts">
import { ChannelSettingsDialog } from "@phisyx/flex-chat";
import { computed } from "vue";

import { use_chat_store, use_overlayer_store } from "~/store";

import ChannelSettingsDialogComponent from "#/sys/channel_settings_dialog/ChannelSettingsDialog.template.vue";

// -------- //
// Constant //
// -------- //

const LAYER_NAME: string = ChannelSettingsDialog.ID;

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store();
let overlayer_store = use_overlayer_store();

let dialog = computed(() => new ChannelSettingsDialog(overlayer_store.store));
let has_layer = computed(() => dialog.value.exists());
let layer = computed(() => dialog.value.get_unchecked());

// ------- //
// Handler //
// ------- //

/**
 * Soumission du formulaire.
 */
function submit_form_data_handler(modes_settings: Partial<Command<"MODE">["modes"]>)
{
	if (!layer.value.data) {
		return;
	}

	chat_store.apply_channel_settings(
		layer.value.data.room.name,
		modes_settings as Command<"MODE">["modes"],
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

	chat_store.update_topic(layer.value.data.room.name, topic);
}

function close_layer_handler()
{
	dialog.value.destroy();
}
</script>

<template>
	<Teleport v-if="has_layer && layer.data" :to="`#${LAYER_NAME}_teleport`">
		<ChannelSettingsDialogComponent
			v-bind="layer.data"
			:layer-name="LAYER_NAME"
			:current-client-channel-member="layer.data.current_client_channel_member"
			@close="close_layer_handler"
			@submit="submit_form_data_handler"
			@update-topic="update_topic_handler"
		/>
	</Teleport>
</template>
