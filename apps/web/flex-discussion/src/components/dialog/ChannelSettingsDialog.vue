<script setup lang="ts">
import type { ChannelSettingsRecordDialog } from "@phisyx/flex-chat";

import { ChannelSettingsDialog } from "@phisyx/flex-chat";

import { use_dialog } from "~/hooks/dialog";
import { use_chat_store } from "~/store";

import ChannelSettingsDialogComponent from "#/sys/dialog_channel_settings/ChannelSettingsDialog.template.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store();

let { dialog, close_dialog, teleport_id, layer_name, layer_unsafe } =
	use_dialog<ChannelSettingsDialog, ChannelSettingsRecordDialog>(
		ChannelSettingsDialog,
	);

// ------- //
// Handler //
// ------- //

/**
 * Soumission du formulaire.
 */
function submit_form_data_handler(
	modes_settings: Partial<Command<"MODE">["modes"]>,
) {
	if (!layer_unsafe.value.data) {
		return;
	}

	chat_store.apply_channel_settings(
		layer_unsafe.value.data.room.name,
		modes_settings as Command<"MODE">["modes"],
	);
}

/**
 * Mise à jour du sujet.
 */
function update_topic_handler(topic?: string) {
	if (
		!layer_unsafe.value.data ||
		layer_unsafe.value.data.room.topic.get() === topic
	) {
		return;
	}

	chat_store.update_topic(layer_unsafe.value.data.room.name, topic);
}
</script>

<template>
	<Teleport
		v-if="dialog.exists() && layer_unsafe.data"
		defer
		:to="teleport_id"
	>
		<ChannelSettingsDialogComponent
			v-bind="layer_unsafe.data"
			:layer-name="layer_name"
			@close="close_dialog"
			@submit="submit_form_data_handler"
			@update-topic="update_topic_handler"
		/>
	</Teleport>
</template>
