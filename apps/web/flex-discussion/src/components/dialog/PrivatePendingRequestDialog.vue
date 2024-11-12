<script setup lang="ts">
import type { DialogView } from "@phisyx/flex-chat-ui/components/dialog";
import type { PrivatePendingRequestRecordDialog } from "@phisyx/flex-chat/dialogs/private_pending_request";
import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
} from "@phisyx/flex-chat/store/chat";
import type { OverlayerStore } from "@phisyx/flex-chat/store/overlayer";
import type { SettingsStore } from "@phisyx/flex-chat/store/settings";
import type { UserStore } from "@phisyx/flex-chat/store/user";
import type { ComputedRef } from "vue";

import { DialogWireframe } from "@phisyx/flex-chat-ui/components/dialog";
import { PrivatePendingRequestDialog } from "@phisyx/flex-chat/dialogs/private_pending_request";
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
