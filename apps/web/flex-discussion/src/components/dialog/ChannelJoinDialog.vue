<script setup lang="ts">
import type { DialogView } from "@phisyx/flex-chat-ui/components/dialog";
import type { ChannelJoinRecordDialog } from "@phisyx/flex-chat/dialogs/channel_join";
import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
	OverlayerStore,
	SettingsStore,
	UserStore,
} from "@phisyx/flex-chat/store";
import type { ComputedRef } from "vue";

import { DialogWireframe } from "@phisyx/flex-chat-ui/components/dialog";
import { ChannelJoinDialog } from "@phisyx/flex-chat/dialogs/channel_join";
import { computed, reactive } from "vue";
import {
	use_chat_store,
	use_overlayer_store,
	use_settings_store,
	use_user_store,
} from "~/store";

import ChannelJoinDialogComponent from "#/sys/dialog_channel_join/ChannelJoinDialog.template.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store().store;
let overlayer_store = use_overlayer_store().store;
let settings_store = use_settings_store().store;
let user_store = use_user_store().store;

let view = reactive(
	DialogWireframe.create(
		chat_store as unknown as ChatStoreInterface & ChatStoreInterfaceExt,
		overlayer_store as OverlayerStore,
		settings_store as SettingsStore,
		user_store as UserStore,
	) as DialogView,
);

view.define_dialog(ChannelJoinDialog);

let layer_name = computed(() => view.layer_name);
let teleport_id = computed(() => view.teleport_id);
let data: ComputedRef<ChannelJoinRecordDialog> = computed(() => view.data);
</script>

<template>
	<Teleport defer :to="teleport_id">
		<ChannelJoinDialogComponent
			:layer-name="layer_name"
			v-bind="data"
			@close="view.close_dialog"
			@submit="view.join_channel_handler"
		/>
	</Teleport>
</template>
