<script setup lang="ts">
import type { PrivateListView } from "@phisyx/flex-chat-ui/views/private_list";
import type { ChatStoreInterface } from "@phisyx/flex-chat/store";

import { PrivateListWireframe } from "@phisyx/flex-chat-ui/views/private_list";
import { computed, reactive } from "vue";
import { use_chat_store } from "~/store";

import PrivatesWaiting from "#/sys/privates_waiting/PrivatesWaiting.template.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store().store;
let view = reactive(
	PrivateListWireframe.create(chat_store as unknown as ChatStoreInterface),
) as PrivateListView;

let privates_waiting = computed(() => view.privates_waiting);
</script>

<template>
	<PrivatesWaiting
		:list="privates_waiting"
		@open-private="view.open_pending_private_handler"
	/>
</template>
