<script setup lang="ts">
import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
	OverlayerStore,
	PrivatePendingRequestRecordDialog,
	SettingsStore,
	UserStore,
} from "@phisyx/flex-chat";
import type { DialogView } from "@phisyx/flex-chat-ui";
import type { ComputedRef } from "vue";

import { PrivatePendingRequestDialog } from "@phisyx/flex-chat";
import { DialogWireframe } from "@phisyx/flex-chat-ui";
import { computed, reactive } from "vue";
import {
	use_chat_store,
	use_overlayer_store,
	use_settings_store,
	use_user_store,
} from "~/store";

import PrivatePendingRequestDialogComponent from "#/sys/dialog_pending_request/PrivatePendingRequestDialog.template.vue";

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

view.define_dialog(PrivatePendingRequestDialog);

let layer_name = computed(() => view.layer_name);
let teleport_id = computed(() => view.teleport_id);
let has_data = computed(() => view.has_data);
let data: ComputedRef<PrivatePendingRequestRecordDialog> = computed(
	() => view.data,
);
</script>

<template>
	<Teleport v-if="has_data" defer :to="teleport_id">
		<PrivatePendingRequestDialogComponent
			:layer-name="layer_name"
			:participant="data"
			@submit="view.accept"
			@close="view.decline"
		/>
	</Teleport>
</template>
