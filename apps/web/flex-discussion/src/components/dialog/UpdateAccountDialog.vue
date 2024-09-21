<script setup lang="ts">
import type { DialogView } from "@phisyx/flex-chat-ui/components/dialog";
import type { UpdateAccountRecordDialog } from "@phisyx/flex-chat/dialogs/update_account";
import type {
	ChatStoreInterface,
	ChatStoreInterfaceExt,
	OverlayerStore,
	SettingsStore,
	UserStore,
} from "@phisyx/flex-chat/store";
import type { ComputedRef } from "vue";

import { DialogWireframe } from "@phisyx/flex-chat-ui/components/dialog";
import { UpdateAccountDialog } from "@phisyx/flex-chat/dialogs/update_account";
import { computed, reactive, watch } from "vue";
import {
	use_chat_store,
	use_overlayer_store,
	use_settings_store,
	use_user_store,
} from "~/store";

import UpdateAccountDialogComponent from "#/sys/dialog_update_account/UpdateAccountDialog.template.vue";
import { useQuery } from "@tanstack/vue-query";

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

view.define_dialog(UpdateAccountDialog);

let layer_name = computed(() => view.layer_name);
let teleport_id = computed(() => view.teleport_id);
let has_data = computed(() => view.has_data);
let data: ComputedRef<UpdateAccountRecordDialog> = computed(() => view.data);

let countries_list = computed(() => view.countries_list);

// --------- //
// Lifecycle //
// --------- //

const { data: raw_countries_list, isError } = useQuery(
	view.query_api_countries(),
);

watch(
	raw_countries_list,
	(new_data) => {
		if (isError.value || !new_data) {
			return;
		}
		view.set_response_from_api_countries({ data: new_data });
	},
	{ immediate: true }
);
</script>

<template>
	<Teleport v-if="has_data" defer :to="teleport_id">
		<UpdateAccountDialogComponent
			:layer-name="layer_name"
			:countries-list="countries_list"
			:city="data.city || null"
			:country="data.country || null"
			:firstname="data.firstname || null"
			:lastname="data.lastname || null"
			:gender="data.gender || null"
			:user-id="data.id"
			:username="data.name"
			@close="view.close_dialog"
			@logout="view.logout_handler"
			@upload="view.upload_file_handler"
			@submit="view.update_account_submit_handler"
		/>
	</Teleport>
</template>
