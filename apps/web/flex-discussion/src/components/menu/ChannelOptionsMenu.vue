<script setup lang="ts">
import type {
	ChannelOptionsRecordMenu,
	ChatStoreInterface,
	ChatStoreInterfaceExt,
	OverlayerStore,
	SettingsStore,
	UserStore,
} from "@phisyx/flex-chat";
import type { MenuView } from "@phisyx/flex-chat-ui/components/menu";
import type { ComputedRef } from "vue";

import { ChannelOptionsMenu } from "@phisyx/flex-chat";
import { MenuWireframe } from "@phisyx/flex-chat-ui/components/menu";
import { computed, reactive } from "vue";
import {
	use_chat_store,
	use_overlayer_store,
	use_settings_store,
	use_user_store,
} from "~/store";

import ChannelOptionsMenuComponent from "#/sys/menu_channel_options/ChannelOptionsMenu.template.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store().store;
let overlayer_store = use_overlayer_store().store;
let settings_store = use_settings_store().store;
let user_store = use_user_store().store;

let view = reactive(
	MenuWireframe.create(
		chat_store as unknown as ChatStoreInterface & ChatStoreInterfaceExt,
		overlayer_store as OverlayerStore,
		settings_store as SettingsStore,
		user_store as UserStore
	) as MenuView
);

view.define_menu(ChannelOptionsMenu);

let layer_name = computed(() => view.layer_name);
let teleport_id = computed(() => view.teleport_id);
let has_data = computed(() => view.has_data);
let data: ComputedRef<ChannelOptionsRecordMenu> = computed(() => view.data);
</script>

<template>
	<Teleport v-if="has_data" defer :to="teleport_id">
		<ChannelOptionsMenuComponent
			:layer-name="layer_name"
			v-bind="data"
			@open-channel-settings="view.open_channel_settings_handler"
			@part-channel="view.part_channel_handler"
		/>
	</Teleport>
</template>
