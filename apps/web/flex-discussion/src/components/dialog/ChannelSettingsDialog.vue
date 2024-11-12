<script lang="ts" setup>
import type { DialogView } from "@phisyx/flex-chat-ui/components/dialog";
import type { ChannelSettingsRecordDialog } from "@phisyx/flex-chat/dialogs/channel_settings";
import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
} from "@phisyx/flex-chat/store/chat";
import type { OverlayerStore } from "@phisyx/flex-chat/store/overlayer";
import type { SettingsStore } from "@phisyx/flex-chat/store/settings";
import type { UserStore } from "@phisyx/flex-chat/store/user";
import type { ComputedRef } from "vue";

import { DialogWireframe } from "@phisyx/flex-chat-ui/components/dialog";
import { ChannelSettingsDialog } from "@phisyx/flex-chat/dialogs/channel_settings";
import { computed, reactive } from "vue";
import {
	use_chat_store,
	use_overlayer_store,
	use_settings_store,
	use_user_store,
} from "~/store";

import ChannelSettingsDialogComponent from "#/sys/dialog_channel_settings/ChannelSettingsDialog.template.vue";

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

view.define_dialog(ChannelSettingsDialog);

let layer_name = computed(() => view.layer_name);
let teleport_id = computed(() => view.teleport_id);
let has_data = computed(() => view.has_data);
let data: ComputedRef<ChannelSettingsRecordDialog> = computed(() => view.data);
</script>

<template>
	<Teleport v-if="has_data" :to="teleport_id" defer>
		<ChannelSettingsDialogComponent
			:layer-name="layer_name"
			v-bind="data"
			@close="view.close_dialog"
			@submit="view.submit_form_data_handler"
			@update-topic="view.update_topic_handler"
		/>
	</Teleport>
</template>
