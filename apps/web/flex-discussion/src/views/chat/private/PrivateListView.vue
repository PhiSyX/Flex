<script setup lang="ts">
import { computed, reactive } from "vue";

import {
	type ChatStoreInterface,
	type ChatStoreInterfaceExt,
	type PrivateListView,
	PrivateListWireframe,
} from "@phisyx/flex-chat";
import { use_chat_store } from "~/store";

import PrivatesWaiting from "#/sys/privates_waiting/PrivatesWaiting.template.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store().store;
let view = reactive(
	PrivateListWireframe.create(
		chat_store as unknown as ChatStoreInterface & ChatStoreInterfaceExt,
	),
) as PrivateListView;

let privates_waiting = computed(() => view.privates_waiting);
</script>

<template>
	<PrivatesWaiting
		:list="privates_waiting"
		@open-private="view.open_pending_private_handler"
	/>
</template>
