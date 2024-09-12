<script setup lang="ts">
import type { UpdateAccountRecordDialog } from "@phisyx/flex-chat";

import { onMounted as on_mounted, shallowRef } from "vue";

import { UpdateAccountDialog } from "@phisyx/flex-chat";

import { use_dialog } from "~/hooks/dialog";
import { use_user_store } from "~/store";

import UpdateAccountDialogComponent from "#/sys/dialog_update_account/UpdateAccountDialog.template.vue";

// --------- //
// Composant //
// --------- //

let user_store = use_user_store();

let { layer_name, dialog, teleport_id, close_dialog, layer_unsafe } =
	use_dialog<UpdateAccountDialog, UpdateAccountRecordDialog>(
		UpdateAccountDialog
	);

let uploaded_file = shallowRef<File>();
let countriesList = shallowRef<Array<{ code: string; country: string }>>([]);

// --------- //
// Lifecycle //
// --------- //

on_mounted(() => {
	fetch("/public/geo/countries.json")
		.then((res) => res.json())
		.then((res) => {
			countriesList.value = res;
		});
});

// ------- //
// Handler //
// ------- //

function upload_file_handler(file: File)
{
	uploaded_file.value = file;
}

async function submit_handler(evt: Event)
{
	if (!layer_unsafe.value.data) {
		return;
	}

	let form = evt.target as HTMLFormElement;
	let form_data = new FormData(form);
	await user_store.patch(layer_unsafe.value.data.id, form_data);
	close_dialog();
}
</script>

<template>
	<Teleport v-if="dialog.exists() && layer_unsafe.data" defer :to="teleport_id">
		<UpdateAccountDialogComponent
			:layer-name="layer_name"
			:city="layer_unsafe.data.city || null"
			:country="layer_unsafe.data.country || null"
			:countries-list="countriesList"
			:firstname="layer_unsafe.data.firstname || null"
			:lastname="layer_unsafe.data.lastname || null"
			:gender="layer_unsafe.data.gender || null"
			:user-id="layer_unsafe.data.id"
			:username="layer_unsafe.data.name"
			@close="close_dialog"
			@upload="upload_file_handler"
			@submit="submit_handler"
		/>
	</Teleport>
</template>
