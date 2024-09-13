<script setup lang="ts">
import { use_chat_store } from "~/store";

import PrivatesWaiting from "#/sys/privates_waiting/PrivatesWaiting.template.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store();

// ------- //
// Handler //
// ------- //

function open_pending_private_handler(priv: Origin) {
	chat_store.open_pending_private(priv);
}
</script>

<template>
	<PrivatesWaiting 
		:list="chat_store.privates_waiting" 
		@open-private="open_pending_private_handler"
	/>
</template>

<style scoped>
</style>