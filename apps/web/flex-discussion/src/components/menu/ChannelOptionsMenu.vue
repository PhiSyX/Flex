<script setup lang="ts">
import type { ChannelOptionsRecordMenu, ChannelRoom, OverlayerStore } from "@phisyx/flex-chat";

import { ChannelOptionsMenu, ChannelSettingsDialog } from "@phisyx/flex-chat";

import { use_menu } from "~/hooks/menu";
import { use_chat_store, use_overlayer_store } from "~/store";

import ChannelOptionsMenuComponent from "#/sys/menu_channel_options/ChannelOptionsMenu.template.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store();
let overlayer_store = use_overlayer_store();

let {
	close_menu,
	menu,
	teleport_id,
	layer_name,
	layer_unsafe,
} = use_menu<ChannelOptionsMenu, ChannelOptionsRecordMenu>(
	ChannelOptionsMenu
);

// ------- //
// Handler //
// ------- //

/**
 * Ouvre la boite de dialogue des paramètres du salon.
 */
function open_channel_settings_handler()
{
	if (!layer_unsafe.value.data) {
		return;
	}

	ChannelSettingsDialog.create(
		overlayer_store.store as OverlayerStore,
		layer_unsafe.value.data,
	);

	close_menu();
}

function part_channel_handler()
{
	if (!layer_unsafe.value.data) {
		return;
	}

	let room: ChannelRoom = layer_unsafe.value.data.room;
	chat_store.close_room(room.name);
	close_menu();
}
</script>

<template>
	<Teleport v-if="menu.exists() && layer_unsafe.data" :to="teleport_id">
		<ChannelOptionsMenuComponent
			v-bind="layer_unsafe.data"
			:layer-name="layer_name"
			@open-channel-settings="open_channel_settings_handler"
			@part-channel="part_channel_handler"
		/>
	</Teleport>
</template>
