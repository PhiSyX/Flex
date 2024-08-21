<script setup lang="ts">
import type { PrivatePendingRequestRecordDialog } from "@phisyx/flex-chat";

import { PrivatePendingRequestDialog } from "@phisyx/flex-chat";

import { use_dialog } from "~/hooks/dialog";
import { use_chat_store } from "~/store";

import PrivatePendingRequestDialogComponent from "#/sys/dialog_pending_request/PrivatePendingRequestDialog.template.vue";

// --------- //
// Composant //
// --------- //

let chat_store = use_chat_store();

let {
	layer_name,
	dialog,
	teleport_id,
	close_dialog,
	layer_unsafe,
} = use_dialog<PrivatePendingRequestDialog, PrivatePendingRequestRecordDialog>(
	PrivatePendingRequestDialog
);

// ------- //
// Handler //
// ------- //

/**
 * Envoie de la commande de changement de pseudo.
 */
function accept()
{
	if (!layer_unsafe.value.data) {
		return;
	}
	
	chat_store.accept_participant(layer_unsafe.value.data);
	close_dialog();
}

function decline()
{
	if (!layer_unsafe.value.data) {
		return;
	}

	chat_store.decline_participant(layer_unsafe.value.data);
	close_dialog();
}
</script>

<template>
	<Teleport v-if="dialog.exists() && layer_unsafe.data" :to="teleport_id">
		<PrivatePendingRequestDialogComponent
			:layer-name="layer_name"
			:participant="layer_unsafe.data"
			@submit="accept"
			@close="decline"
		/>
	</Teleport>
</template>
